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
    const { transactionId } = req.body || {};
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'transactionId obrigatório' });
    }

    const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
    const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';
    const ZPAY_API_URL  = 'https://zpaysolution.com/api/v1';

    const response = await axios.post(
      `${ZPAY_API_URL}/payments/${transactionId}/approve`,
      {},
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

    if (data.status === 'paid') {
      return res.status(200).json({
        success: true,
        status: 'paid',
        transactionId,
        amount: data.amount,
      });
    }

    return res.status(200).json({
      success: true,
      status: data.status || 'pending',
      transactionId,
    });

  } catch (error) {
    if (error.response?.status === 409) {
      return res.status(200).json({
        success: true,
        status: 'pending',
        message: 'Pagamento ainda não confirmado',
      });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Pagamento não encontrado',
      });
    }
    console.error('Erro consultar:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error || 'Erro ao consultar pagamento',
    });
  }
};
