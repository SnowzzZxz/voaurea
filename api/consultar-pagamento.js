const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';

const BASE_URLS = [
  'https://zpayapi.app/api/v2',
  'https://zpaysolution.com/api/v1',
];

async function consultarPix(baseUrl, paymentId) {
  const resp = await fetch(`${baseUrl}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
      'client-secret': CLIENT_SECRET,
    },
  });

  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

  return { ok: resp.ok, status: resp.status, data };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { transactionId } = req.body || {};
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'transactionId obrigatório' });
    }

    let resultado = null;
    let ultimoErro = null;

    for (const baseUrl of BASE_URLS) {
      try {
        const r = await consultarPix(baseUrl, transactionId);
        if (r.ok) {
          resultado = r.data;
          console.log('✅ Status de:', baseUrl, '| Resposta:', JSON.stringify(r.data));
          break;
        } else {
          ultimoErro = r.data?.error || `Status ${r.status}`;
          if (r.status === 404) break; // não existe, não tenta outra base
        }
      } catch (e) {
        ultimoErro = e.message;
      }
    }

    if (!resultado) {
      return res.status(500).json({
        success: false,
        message: ultimoErro || 'Erro ao consultar pagamento',
      });
    }

    // A Z.PAY retorna: pending | paid | failed | expired
    const status = resultado.status || 'pending';

    return res.status(200).json({
      success: true,
      status: status,
      transactionId: transactionId,
      amount: resultado.amount,
      paidAt: resultado.paidAt,
      // Repassa o Pix se ainda estiver pending (útil pra mostrar de novo)
      pixCode: resultado.copyPaste || '',
      qrCodeImage: resultado.qrCodeBase64 || resultado.qrcodeUrl || '',
    });

  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao consultar',
    });
  }
}
