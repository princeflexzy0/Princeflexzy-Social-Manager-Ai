async function retry(fn, attempts = 3, delayMs = 200) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

module.exports = retry;
