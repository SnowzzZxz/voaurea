// api/consultar-pagamento.js
// Consulta o status de um pagamento na Z.PAY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const paymentId = req.method === 'GET'
      ? req.query.id
      : req.body?.paymentId;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'paymentId obrigatório' });
    }

    // Tenta forçar reconciliação (approve) — a doc recomenda pra confirmar pagamentos
    const approveResp = await fetch(
      `https://zpaysolution.com/api/v1/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          'client-id': process.env.ZPAY_CLIENT_ID,
          'client-secret': process.env.ZPAY_CLIENT_SECRET,
        },
      }
    );

    const approveData = await approveResp.json();

    // Se aprovado (200), retorna sucesso
    if (approveResp.ok && approveData.status === 'paid') {
      return res.status(200).json({
        success: true,
        status: 'paid',
        transactionId: paymentId,
        amount: approveData.amount,
      });
    }

    // 409 = ainda pending
    if (approveResp.status === 409) {
      return res.status(200).json({
        success: true,
        status: 'pending',
        transactionId: paymentId,
        message: 'Pagamento ainda não confirmado',
      });
    }

    // 404 = não encontrado
    if (approveResp.status === 404) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Pagamento não encontrado',
      });
    }

    // Outros erros
    return res.status(200).json({
      success: true,
      status: approveData.status || 'unknown',
      transactionId: paymentId,
    });

  } catch (err) {
    console.error('Erro consultar-pagamento:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Erro ao consultar pagamento',
    });
  }
}
