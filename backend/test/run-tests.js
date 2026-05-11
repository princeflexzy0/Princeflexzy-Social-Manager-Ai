// Lightweight test runner for verificationService
process.env.NODE_ENV = 'test';
const assert = require('assert');
const path = require('path');

function mockTwilioSends() {
  // Replace smsService and whatsappService with mocks unless RUN_REAL_TWILIO is set
  if (process.env.RUN_REAL_TWILIO === 'true') return;
  try {
    const sms = require('../utils/smsService');
    const wa = require('../utils/whatsappService');
    sms.sendSMS = async (to, message) => ({ success: true, sid: 'MOCK-SMS' });
    wa.sendWhatsApp = async (to, message) => ({ success: true, sid: 'MOCK-WA' });
  } catch (err) {
    // ignore if modules cannot be required yet
  }
}

async function run() {
  mockTwilioSends();

  const vs = require('../utils/verificationService');

  // helpers
  function resetAll(to, via) {
    vs._resetAttemptsForTest(via, to);
    vs._clearStoreForTest();
  }

  const testNumber = '+61424332428';

  console.log('Test: start verification success');
  resetAll(testNumber, 'sms');
  const r1 = await vs.sendVerification({ to: testNumber, via: 'sms', ttlSeconds: 60 });
  assert(r1 && r1.code, 'should return code');

  console.log('Test: verify code success');
  const r2 = vs.verifyCode({ to: testNumber, via: 'sms', code: r1.code });
  assert(r2.success === true, 'should verify successfully');

  console.log('Test: rate limiting');
  resetAll(testNumber, 'sms');
  // set low limits for test
  process.env.VERIF_MAX_ATTEMPTS = '3';
  process.env.VERIF_WINDOW_SEC = '60';
  // reload module to pick up env changes
  delete require.cache[require.resolve('../utils/verificationService')];
  const vs2 = require('../utils/verificationService');

  await vs2.sendVerification({ to: testNumber, via: 'sms', ttlSeconds: 60 });
  await vs2.sendVerification({ to: testNumber, via: 'sms', ttlSeconds: 60 });
  await vs2.sendVerification({ to: testNumber, via: 'sms', ttlSeconds: 60 });
  let rateErr = null;
  try {
    await vs2.sendVerification({ to: testNumber, via: 'sms', ttlSeconds: 60 });
  } catch (err) {
    rateErr = err;
  }
  assert(rateErr && rateErr.code === 'rate_limited', 'should be rate limited');

  console.log('All tests passed');
}

run().then(() => process.exit(0)).catch(err => { console.error('Tests failed', err); process.exit(1); });
