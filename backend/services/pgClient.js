const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('[pgClient] Unexpected pool error', err.message);
});

// Test connectivity on startup (best-effort)
(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('[pgClient] Database connection successful.');
  } catch (err) {
    console.error('[pgClient] Database connection failed:', err.message);
  }
})();

/**
 * Thin compatibility shim that mirrors the supabase.from(table) chaining API
 * used throughout the existing controllers and bots, minimising changes needed elsewhere.
 *
 * Supported chain: .select() .insert() .update() .delete()
 *                  .eq() .neq() .gt() .gte() .lt() .lte() .is() .in() .like() .ilike()
 *                  .order() .limit() .range() .single() .maybeSingle()
 */
function from(rawTableName) {
  // All automation tables live in the public schema (created by Alembic migration
  // a1b2c3d4e5f6 with schema='public'). Use the table name directly; PostgreSQL's
  // default search_path resolves to public.
  const schemaTable = rawTableName.includes('.')
    ? rawTableName
    : rawTableName;

  let selectCols = '*';
  let insertData = null;
  let updateData = null;
  let isDelete = false;
  const whereClauses = [];
  const params = [];
  let orderClause = '';
  let limitClause = '';
  let offsetClause = '';

  const nextParam = () => {
    params.push(null); // placeholder, replaced below
    return `$${params.length}`;
  };

  const addParam = (val) => {
    params.push(val);
    return `$${params.length}`;
  };

  const builder = {
    eq: (col, val) => { whereClauses.push(`${col} = ${addParam(val)}`); return builder; },
    neq: (col, val) => { whereClauses.push(`${col} != ${addParam(val)}`); return builder; },
    gt: (col, val) => { whereClauses.push(`${col} > ${addParam(val)}`); return builder; },
    gte: (col, val) => { whereClauses.push(`${col} >= ${addParam(val)}`); return builder; },
    lt: (col, val) => { whereClauses.push(`${col} < ${addParam(val)}`); return builder; },
    lte: (col, val) => { whereClauses.push(`${col} <= ${addParam(val)}`); return builder; },
    is: (col, val) => {
      if (val === null) whereClauses.push(`${col} IS NULL`);
      else whereClauses.push(`${col} = ${addParam(val)}`);
      return builder;
    },
    in: (col, vals) => { whereClauses.push(`${col} = ANY(${addParam(vals)})`); return builder; },
    like: (col, val) => { whereClauses.push(`${col} LIKE ${addParam(val)}`); return builder; },
    ilike: (col, val) => { whereClauses.push(`${col} ILIKE ${addParam(val)}`); return builder; },
    not: () => builder,
    or: () => builder,
    and: () => builder,
    filter: () => builder,
    match: () => builder,
    order: (col, opts = {}) => {
      orderClause = ` ORDER BY ${col} ${opts.ascending === false ? 'DESC' : 'ASC'}`;
      return builder;
    },
    limit: (n) => { limitClause = ` LIMIT ${parseInt(n, 10)}`; return builder; },
    range: (from, to) => {
      limitClause = ` LIMIT ${to - from + 1}`;
      offsetClause = ` OFFSET ${from}`;
      return builder;
    },
    select: (cols) => { if (cols) selectCols = cols; return builder; },

    single: async () => {
      try {
        const whereStr = whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : '';
        const sql = `SELECT ${selectCols} FROM ${schemaTable}${whereStr}${orderClause} LIMIT 1`;
        const result = await pool.query(sql, params);
        return { data: result.rows[0] || null, error: null };
      } catch (err) {
        console.error(`[pgClient] single() error on ${schemaTable}:`, err.message);
        return { data: null, error: err };
      }
    },

    maybeSingle: async () => {
      return builder.single();
    },

    then: (resolve, reject) => {
      (async () => {
        try {
          let sql, result;
          const whereStr = whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : '';

          if (insertData !== null) {
            const rows = Array.isArray(insertData) ? insertData : [insertData];
            const results = [];
            for (const row of rows) {
              const cols = Object.keys(row);
              const vals = cols.map((c) => addParam(row[c]));
              const insertSql = `INSERT INTO ${schemaTable} (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`;
              const r = await pool.query(insertSql, params.slice(params.length - vals.length));
              results.push(r.rows[0]);
            }
            resolve({ data: rows.length === 1 ? results[0] : results, error: null });
          } else if (updateData !== null) {
            const cols = Object.keys(updateData);
            const sets = cols.map((c) => `${c} = ${addParam(updateData[c])}`);
            sql = `UPDATE ${schemaTable} SET ${sets.join(', ')}${whereStr} RETURNING *`;
            result = await pool.query(sql, params);
            resolve({ data: result.rows, error: null });
          } else if (isDelete) {
            sql = `DELETE FROM ${schemaTable}${whereStr}`;
            result = await pool.query(sql, params);
            resolve({ data: null, error: null });
          } else {
            sql = `SELECT ${selectCols} FROM ${schemaTable}${whereStr}${orderClause}${limitClause}${offsetClause}`;
            result = await pool.query(sql, params);
            resolve({ data: result.rows, error: null });
          }
        } catch (err) {
          console.error(`[pgClient] query error on ${schemaTable}:`, err.message);
          resolve({ data: null, error: err });
        }
      })();
      return { catch: (fn) => fn };
    },
  };

  return {
    select: (cols) => { if (cols) selectCols = cols; return builder; },

    insert: (data) => {
      insertData = data;
      return {
        select: (cols) => { if (cols) selectCols = cols; return builder; },
        single: async () => {
          try {
            const row = Array.isArray(data) ? data[0] : data;
            const cols = Object.keys(row);
            const vals = cols.map((c) => addParam(row[c]));
            const sql = `INSERT INTO ${schemaTable} (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`;
            const result = await pool.query(sql, params);
            return { data: result.rows[0] || null, error: null };
          } catch (err) {
            console.error(`[pgClient] insert().single() error on ${schemaTable}:`, err.message);
            return { data: null, error: err };
          }
        },
        then: builder.then,
      };
    },

    update: (data) => {
      updateData = data;
      return builder;
    },

    delete: () => {
      isDelete = true;
      return builder;
    },

    upsert: async (data, options = {}) => {
      try {
        const rows = Array.isArray(data) ? data : [data];
        // onConflict can be an array of column names or a comma-separated string
        const conflictCols = options.onConflict
          ? (Array.isArray(options.onConflict) ? options.onConflict : [options.onConflict])
          : ['id'];
        const conflictStr = conflictCols.join(', ');
        const results = [];
        for (const row of rows) {
          const localParams = [];
          const addLocalParam = (val) => { localParams.push(val); return `$${localParams.length}`; };
          const cols = Object.keys(row);
          const vals = cols.map((c) => addLocalParam(row[c]));
          const sets = cols.filter(c => !conflictCols.includes(c)).map((c) => `${c} = EXCLUDED.${c}`);
          const sql = `INSERT INTO ${schemaTable} (${cols.join(', ')}) VALUES (${vals.join(', ')})
            ON CONFLICT (${conflictStr}) DO UPDATE SET ${sets.join(', ')} RETURNING *`;
          const r = await pool.query(sql, localParams);
          results.push(r.rows[0]);
        }
        return { data: results, error: null };
      } catch (err) {
        console.error(`[pgClient] upsert() error on ${schemaTable}:`, err.message);
        return { data: null, error: err };
      }
    },
  };
}

async function rpc(fnName, args = {}) {
  try {
    const cols = Object.keys(args);
    const vals = Object.values(args);
    const paramStr = cols.map((c, i) => `${c} => $${i + 1}`).join(', ');
    const sql = `SELECT * FROM automation.${fnName}(${paramStr})`;
    const result = await pool.query(sql, vals);
    return { data: result.rows, error: null };
  } catch (err) {
    console.error(`[pgClient] rpc() error calling ${fnName}:`, err.message);
    return { data: null, error: err };
  }
}

const supabase = { from, rpc };

module.exports = { supabase, pool };
