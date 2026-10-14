const crypto = require('crypto');
const { commitDoacao } = require('./admin/salvar-doacao');

const ZPAY_WEBHOOK_SECRET = process.env.ZPAY_WEBHOOK_SECRET || '';

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rawBody = await getRawBody(req);
    const event = req.headers['x-zpay-event'];
    const timestamp = req.headers['x-zpay-timestamp'];
    const signature = req.headers['x-zpay-signature'];

    if (ZPAY_WEBHOOK_SECRET && timestamp && signature) {
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - Number(timestamp)) > 300) {
        return res.status(401).json({ error: 'Timestamp expirado' });
      }
      const expected = crypto
        .createHmac('sha256', ZPAY_WEBHOOK_SECRET)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');
      if (expected !== signature) {
        return res.status(401).json({ error: 'Assinatura inválida' });
      }
    }

    const payload = JSON.parse(rawBody);
    const data = payload.data || {};

    console.log('Webhook:', event, '| ID:', data.id);

    if (['payment.created', 'payment.paid', 'payment.expired', 'payment.failed'].includes(event)) {
      const doacao = {
        id: data.id,
        nome: data.payer?.name || data.donorName || '—',
        email: data.payer?.email || null,
        whatsapp: null,
        valor: Number(data.amount || 0),
        status: data.status || 'pending',
        metodo: data.paymentMethod || 'pix',
        created_at: data.createdAt || new Date().toISOString(),
        paid_at: data.paidAt || null,
      };

      try {
        await commitDoacao(doacao);
        console.log('✅ Doação salva:', doacao.id, doacao.status);
      } catch (e) {
        console.error('❌ Erro ao salvar:', e.message);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Erro webhook:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
};
