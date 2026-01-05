import crypto from 'crypto';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function hmacSha256Hex(secret, raw) {
  return crypto.createHmac('sha256', secret).update(raw).digest('hex');
}

export function getMomoConfig() {
  return {
    partnerCode: requireEnv('MOMO_PARTNER_CODE'),
    accessKey: requireEnv('MOMO_ACCESS_KEY'),
    secretKey: requireEnv('MOMO_SECRET_KEY'),
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    returnUrl: requireEnv('MOMO_RETURN_URL'),
    ipnUrl: requireEnv('MOMO_IPN_URL'),
    requestType: process.env.MOMO_REQUEST_TYPE || 'captureWallet',
    lang: process.env.MOMO_LANG || 'vi',
  };
}

export function buildCreatePaymentPayload({
  amount,
  orderId,
  orderInfo,
  extraData = '',
}) {
  const cfg = getMomoConfig();
  const requestId = `${cfg.partnerCode}${Date.now()}`;

  // Lưu ý: rawSignature phải đúng thứ tự theo MoMo docs
  const rawSignature =
    `accessKey=${cfg.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${cfg.ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${cfg.partnerCode}` +
    `&redirectUrl=${cfg.returnUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${cfg.requestType}`;

  const signature = hmacSha256Hex(cfg.secretKey, rawSignature);

  return {
    endpoint: cfg.endpoint,
    requestId,
    payload: {
      partnerCode: cfg.partnerCode,
      accessKey: cfg.accessKey,
      requestId,
      amount: String(amount),
      orderId,
      orderInfo,
      redirectUrl: cfg.returnUrl,
      ipnUrl: cfg.ipnUrl,
      extraData,
      requestType: cfg.requestType,
      signature,
      lang: cfg.lang,
    },
  };
}

export function verifyMomoIpnSignature(ipnBody) {
  const cfg = getMomoConfig();
  const body = ipnBody || {};

  // Ví dụ fields IPN MoMo thường trả về: accessKey, amount, extraData, message, orderId,
  // orderInfo, orderType, partnerCode, payType, requestId, responseTime, resultCode, signature
  // rawSignature phải đúng thứ tự theo docs (demo Class-Payment-MOMO đang dùng thứ tự này)
  const rawSignature =
    `accessKey=${body.accessKey || cfg.accessKey}` +
    `&amount=${body.amount || ''}` +
    `&extraData=${body.extraData || ''}` +
    `&message=${body.message || ''}` +
    `&orderId=${body.orderId || ''}` +
    `&orderInfo=${body.orderInfo || ''}` +
    `&orderType=${body.orderType || ''}` +
    `&partnerCode=${body.partnerCode || ''}` +
    `&payType=${body.payType || ''}` +
    `&requestId=${body.requestId || ''}` +
    `&responseTime=${body.responseTime || ''}` +
    `&resultCode=${body.resultCode ?? ''}`;

  const expected = hmacSha256Hex(cfg.secretKey, rawSignature);
  const actual = body.signature || '';

  return {
    ok: expected === actual,
    expected,
    actual,
    rawSignature,
  };
}


