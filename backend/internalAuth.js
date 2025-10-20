/**
 * internalAuth middleware
 *
 * All requests to the automation service must arrive via the Canadian Spirit AI Manager.
 * The proxy validates the user's JWT and then forwards requests with these headers:
 *   X-CS-User-Id      — authenticated user's UUID
 *   X-CS-Workspace-Id — active workspace UUID
 *   X-Internal-Secret     — shared secret to prove the call came from the proxy
 *
 * Direct external calls (without the shared secret) are rejected with 401.
 */
function internalAuth(req, res, next) {
  const userId = req.headers['x-cs-user-id'];
  const workspaceId = req.headers['x-cs-workspace-id'];
  const secret = req.headers['x-internal-secret'];

  if (!userId || !workspaceId || secret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — internal calls only' });
  }

  req.userId = userId;
  req.workspaceId = workspaceId;
  next();
}

module.exports = internalAuth;
