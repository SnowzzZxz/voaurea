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

    // 🔑 Credenciais Z.PAY
    const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
    const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';
    const ZPAY_API_URL  = 'https://zpaysolution.com/api/v1';

    const headers = {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
      'client-secret': CLIENT_SECRET,
    };

    // 1️⃣ Primeiro tenta o approve (força reconciliação com o banco)
    let approveData = null;
    try {
      const approveResp = await axios.post(
        `${ZPAY_API_URL}/payments/${transactionId}/approve`,
        {},
        { headers, timeout: 10000, validateStatus: () => true }
      );

      if (approveResp.status === 200 && approveResp.data.status === 'paid') {
        return res.status(200).json({
          success: true,
          status: 'paid',
          transactionId,
          amount: approveResp.data.amount,
        });
      }

      if (approveResp.status === 409) {
        // Ainda pendente, cai pro GET abaixo pra confirmar
        approveData = approveResp.data;
      }
    } catch (e) {
      // Se o approve falhar, ignora e tenta o GET
      console.warn('Approve falhou, tentando GET:', e.message);
    }

    // 2️⃣ Consulta o status real via GET /payments/{id}
    const getResp = await axios.get(
      `${ZPAY_API_URL}/payments/${transactionId}`,
      { headers, timeout: 10000, validateStatus: () => true }
    );

    if (getResp.status === 404) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Pagamento não encontrado',
      });
    }

    if (getResp.status !== 200) {
      return res.status(getResp.status).json({
        success: false,
        message: getResp.data?.error || 'Erro ao consultar pagamento',
      });
    }

    const data = getResp.data;

    // Status pode ser: pending, paid, expired, failed
    return res.status(200).json({
      success: true,
      status: data.status || 'pending',
      transactionId,
      amount: data.amount,
      paidAt: data.paidAt,
      payer: data.payer || null,
    });

  } catch (error) {
    console.error('Erro consultar:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error || 'Erro ao consultar pagamento',
    });
  }
};
