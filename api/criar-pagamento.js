// api/criar-pagamento.js
// Cria cobrança Pix na Z.PAY Solution

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { type, amount, coverFee, total, donor } = req.body || {};

    // Validação
    if (!amount || amount < 2) {
      return res.status(400).json({ success: false, message: 'Valor mínimo é R$ 2,00' });
    }
    if (amount > 2000) {
      return res.status(400).json({ success: false, message: 'Valor máximo é R$ 2.000,00' });
    }

    // Monta valor final (com taxa se o doador aceitou cobrir)
    const valorFinal = Number(total || amount);
    if (valorFinal < 2 || valorFinal > 2000) {
      return res.status(400).json({ success: false, message: 'Valor total fora do limite (R$ 2 a R$ 2.000)' });
    }

    // Nome do pagador (obrigatório)
    const payerName = donor?.name && donor.name !== 'Anônimo' ? donor.name : 'Doador';

    // Description
    const description = type === 'mensal'
      ? `Doação mensal - Abrigo Vó Áurea`
      : `Doação - Abrigo Vó Áurea`;

    // Chama a Z.PAY
    const resp = await fetch('https://zpaysolution.com/api/v1/payments', {
      method: 'POST',
      headers: {
        'client-id': process.env.ZPAY_CLIENT_ID,
        'client-secret': process.env.ZPAY_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: valorFinal,
        payerName: payerName,
        description: description,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('ZPAY erro:', data);
      return res.status(resp.status).json({
        success: false,
        message: data?.error || 'Erro ao gerar Pix',
      });
    }

    // Resposta da Z.PAY deve trazer: id, status, pix.copyPaste, pix.qrCodeBase64
    const pix = data.pix || data.data?.pix || {};
    const paymentId = data.id || data.paymentId || data.data?.id;

    return res.status(200).json({
      success: true,
      transactionId: paymentId,
      pixCode: pix.copyPaste || '',
      qrCodeImage: pix.qrCodeBase64 || pix.qrcodeUrl || '',
      total: valorFinal,
      type: type || 'unica',
      status: data.status || 'pending',
    });

  } catch (err) {
    console.error('Erro criar-pagamento:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Erro interno',
    });
  }
}
