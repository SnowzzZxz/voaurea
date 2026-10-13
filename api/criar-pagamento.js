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
    const { amount, total, type, donor } = req.body || {};
    const valorFinal = Number(total || amount);

    if (!valorFinal || valorFinal < 2) {
      return res.status(400).json({ success: false, message: 'Valor mínimo R$ 2,00' });
    }
    if (valorFinal > 2000) {
      return res.status(400).json({ success: false, message: 'Valor máximo R$ 2.000,00' });
    }

    const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
    const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';

    const response = await axios.post(
      'https://zpaysolution.com/api/v1/payments',
      {
        amount: valorFinal,
        payerName: donor?.name || 'Doador',
        description: type === 'mensal' ? 'Doação mensal - Abrigo Vó Áurea' : 'Doação - Abrigo Vó Áurea',
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
    const pix = data.pix || {};

    return res.status(200).json({
      success: true,
      transactionId: data.id || data.paymentId,
      pixCode: pix.copyPaste || '',
      qrCodeImage: pix.qrCodeBase64 || pix.qrcodeUrl || '',
      total: valorFinal,
      status: data.status || 'pending',
    });

  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || 'Erro ao gerar Pix',
    });
  }
};
