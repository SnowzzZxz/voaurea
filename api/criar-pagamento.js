const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { amount, total, type, donor, valor, descricao, nome_cliente } = req.body || {};

    const valorFinal = Number(total || amount || valor);
    const nomeCliente = donor?.name || nome_cliente || 'Doador';
    const descricaoFinal = descricao || (type === 'mensal'
      ? 'Doação mensal - Abrigo Vó Áurea'
      : 'Doação - Abrigo Vó Áurea');

    // Validação conforme doc Z.PAY (R$ 2 a R$ 2.000)
    if (!valorFinal || valorFinal < 2) {
      return res.status(400).json({ success: false, message: 'Valor mínimo é R$ 2,00' });
    }
    if (valorFinal > 2000) {
      return res.status(400).json({ success: false, message: 'Valor máximo é R$ 2.000,00' });
    }

    // 🔑 Credenciais Z.PAY
    const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
    const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';
    const ZPAY_API_URL  = 'https://zpaysolution.com/api/v1';

    // POST /payments
    const response = await axios.post(
      `${ZPAY_API_URL}/payments`,
      {
        amount: valorFinal,
        payerName: nomeCliente,
        description: descricaoFinal,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'client-id': CLIENT_ID,
          'client-secret': CLIENT_SECRET,
        },
        timeout: 10000,
      }
    );

    const data = response.data;
    const paymentId = data.id || data.paymentId || data.transactionId;

    // A doc diz que o Pix vem em data.pix.copyPaste e data.pix.qrCodeBase64
    const pixObj = data.pix || {};
    const codigoPix = pixObj.copyPaste || '';
    const qrCode = pixObj.qrCodeBase64
                || pixObj.qrcodeUrl
                || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(codigoPix)}`;

    return res.status(200).json({
      success: true,
      transactionId: paymentId,
      pixCode: codigoPix,
      qrCodeImage: qrCode,
      total: valorFinal,
      type: type || 'unica',
      status: data.status || 'pending',
    });

  } catch (error) {
    console.error('Erro ao criar Pix:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error
            || error.response?.data?.message
            || 'Erro ao gerar Pix',
    });
  }
};
