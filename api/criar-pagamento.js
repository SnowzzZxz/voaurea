const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';

// A Z.PAY tem 2 bases — tentamos a v2 primeiro
const BASE_URLS = [
  'https://zpayapi.app/api/v2',
  'https://zpaysolution.com/api/v1',
];

async function tentarCriarPix(baseUrl, body) {
  const resp = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
      'client-secret': CLIENT_SECRET,
    },
    body: JSON.stringify(body),
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
    const { amount, total, type, donor } = req.body || {};
    const valorFinal = Number(total || amount);

    // Validação: R$ 2 a R$ 2.000 (regra da Z.PAY)
    if (!valorFinal || valorFinal < 2) {
      return res.status(400).json({ success: false, message: 'Valor mínimo R$ 2,00' });
    }
    if (valorFinal > 2000) {
      return res.status(400).json({ success: false, message: 'Valor máximo R$ 2.000,00' });
    }

    const body = {
      amount: valorFinal,
      payerName: donor?.name || 'Doador',
      description: type === 'mensal' ? 'Doação mensal - Abrigo Vó Áurea' : 'Doação - Abrigo Vó Áurea',
    };

    // Tenta cada base URL até uma funcionar
    let resultado = null;
    let ultimoErro = null;

    for (const baseUrl of BASE_URLS) {
      try {
        console.log('Tentando:', baseUrl);
        const r = await tentarCriarPix(baseUrl, body);

        if (r.ok) {
          resultado = r.data;
          console.log('✅ Sucesso em:', baseUrl, '| Resposta:', JSON.stringify(r.data));
          break;
        } else {
          console.warn('❌ Falhou em:', baseUrl, '| Status:', r.status, '| Erro:', JSON.stringify(r.data));
          ultimoErro = r.data?.error || r.data?.message || `Status ${r.status}`;

          // Se for erro de credencial, não tenta outra base
          if (r.status === 401) break;
        }
      } catch (e) {
        console.warn('❌ Erro de rede em:', baseUrl, '|', e.message);
        ultimoErro = e.message;
      }
    }

    if (!resultado) {
      return res.status(500).json({
        success: false,
        message: ultimoErro || 'Erro ao criar Pix em todas as bases',
      });
    }

    // ✅ A Z.PAY devolve na RAIZ: paymentId, copyPaste, qrCodeBase64, qrcodeUrl
    const paymentId  = resultado.paymentId || resultado.id;
    const pixCode    = resultado.copyPaste || '';
    let   qrCodeImg  = resultado.qrCodeBase64 || resultado.qrcodeUrl || '';

    // Se não tiver QR mas tiver o código, gera via qrserver
    if (!qrCodeImg && pixCode) {
      qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`;
    }

    return res.status(200).json({
      success: true,
      transactionId: paymentId,
      pixCode: pixCode,
      qrCodeImage: qrCodeImg,
      total: valorFinal,
      status: resultado.status || 'pending',
    });

  } catch (error) {
    console.error('Erro geral:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao gerar Pix',
    });
  }
}
