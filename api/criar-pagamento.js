const axios = require('axios');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    // Aceita tanto o formato novo (do index.html) quanto o antigo
    const { amount, total, type, donor, valor, descricao, nome_cliente } = req.body || {};

    // Normaliza os campos (compatível com os dois formatos)
    const valorFinal = Number(total || amount || valor);
    const nomeCliente = donor?.name || nome_cliente || 'Doador';
    const descricaoFinal = descricao || (type === 'mensal'
      ? 'Doação mensal - Abrigo Vó Áurea'
      : 'Doação - Abrigo Vó Áurea');

    // Validação
    if (!valorFinal || valorFinal < 2) {
      return res.status(400).json({ success: false, message: 'Valor mínimo é R$ 2,00' });
    }
    if (valorFinal > 2000) {
      return res.status(400).json({ success: false, message: 'Valor máximo é R$ 2.000,00' });
    }

    // Credenciais vêm das variáveis de ambiente
    const CLIENT_ID     = process.env.ZPAY_CLIENT_ID;
    const CLIENT_SECRET = process.env.ZPAY_CLIENT_SECRET;
    const ZPAY_API_URL  = process.env.ZPAY_API_URL || 'https://zpaysolution.com/api/v1';

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ Credenciais ZPay não configuradas');
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração do servidor',
      });
    }

    // Chama a Z.PAY
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

    // ✅ CORRIGIDO: a Z.PAY retorna o Pix em data.pix.copyPaste e data.pix.qrCodeBase64
    const paymentId = data.id || data.paymentId || data.transactionId;
    const pixObj    = data.pix || data.data?.pix || {};
    const codigoPix = pixObj.copyPaste || '';
    const qrCode    = pixObj.qrCodeBase64
                   || pixObj.qrcodeUrl
                   || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(codigoPix)}`;

    // ✅ CORRIGIDO: resposta no formato que o index.html espera
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
    console.error('❌ Erro ao criar Pix:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error
            || error.response?.data?.message
            || 'Erro ao gerar Pix',
    });
  }
};
