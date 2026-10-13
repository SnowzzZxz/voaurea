const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';

const BASE_URLS = [
  'https://zpayapi.app/api/v2',
  'https://zpaysolution.com/api/v1',
];

// Faz o GET do pagamento em uma base
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Aceita paymentId via query string (GET) ou body (POST)
    const paymentId = req.method === 'GET'
      ? req.query.id
      : req.body?.transactionId || req.body?.paymentId;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId obrigatório',
      });
    }

    let resultado = null;
    let ultimoErro = null;

    // Tenta v2 primeiro, depois v1
    for (const baseUrl of BASE_URLS) {
      try {
        const r = await consultarPix(baseUrl, paymentId);
        console.log(`GET ${baseUrl}/payments/${paymentId} → ${r.status}`);

        if (r.ok) {
          resultado = r.data;
          console.log('✅ Resposta:', JSON.stringify(r.data));
          break;
        } else {
          ultimoErro = r.data?.error || `Status ${r.status}`;

          // 404 = paymentId não existe, não faz sentido tentar outra base
          if (r.status === 404) {
            return res.status(404).json({
              success: false,
              status: 'not_found',
              message: 'Pagamento não encontrado',
            });
          }

          // 401 = credenciais erradas, não faz sentido tentar outra base
          if (r.status === 401) {
            return res.status(401).json({
              success: false,
              status: 'unauthorized',
              message: 'Credenciais Z.PAY inválidas',
            });
          }

          // 429 = rate limit, tenta outra base
          // 503 = gateway fora, tenta outra base
          if (r.status === 429 || r.status === 503) {
            continue;
          }
        }
      } catch (e) {
        ultimoErro = e.message;
        console.warn(`❌ Erro de rede em ${baseUrl}:`, e.message);
      }
    }

    // Se nenhuma base respondeu
    if (!resultado) {
      return res.status(500).json({
        success: false,
        status: 'error',
        message: ultimoErro || 'Erro ao consultar pagamento',
      });
    }

    // A Z.PAY retorna: paymentId, status, amount, payerName, description, paidAt, createdAt
    const status = resultado.status || 'pending';

    // Monta resposta compatível com o index.html
    return res.status(200).json({
      success: true,
      status: status,                    // pending | paid | failed | expired
      transactionId: resultado.paymentId || paymentId,
      amount: resultado.amount,
      payerName: resultado.payerName,
      description: resultado.description,
      paidAt: resultado.paidAt,
      createdAt: resultado.createdAt,
      // Só marca como pago se REALMENTE for paid
      isPaid: status === 'paid',
      // Inclui o Pix caso ainda esteja pendente (útil pro front reexibir)
      pixCode: resultado.copyPaste || '',
      qrCodeImage: resultado.qrCodeBase64 || resultado.qrcodeUrl || '',
    });

  } catch (error) {
    console.error('Erro geral:', error.message);
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Erro ao consultar pagamento',
    });
  }
}
