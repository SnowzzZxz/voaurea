// api/webhook.js
// Recebe webhook da Z.PAY (payment.paid, etc)

import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false, // precisamos do raw body pra validar assinatura
  },
};

// Lê o corpo cru da requisição
async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Valida a assinatura HMAC-SHA256
function validateSignature(rawBody, timestamp, signature, secret) {
  // Rejeita se timestamp > 5 minutos
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > 300) {
    return { valid: false, reason: 'timestamp_expired' };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  // Comparação segura contra timing attacks
  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );

  return { valid, reason: valid ? 'ok' : 'invalid_signature' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const rawBody = await readRawBody(req);
    const event = req.headers['x-zpay-event'];
    const timestamp = req.headers['x-zpay-timestamp'];
    const signature = req.headers['x-zpay-signature'];

    // Valida assinatura (se tiver o segredo configurado)
    const webhookSecret = process.env.ZPAY_WEBHOOK_SECRET;
    if (webhookSecret && timestamp && signature) {
      const { valid, reason } = validateSignature(rawBody, timestamp, signature, webhookSecret);
      if (!valid) {
        console.warn('Webhook inválido:', reason);
        return res.status(401).json({ error: 'Assinatura inválida' });
      }
    }

    // Parse do JSON
    const payload = JSON.parse(rawBody);
    const data = payload.data || {};

    console.log('Webhook recebido:', event, 'ID:', data.id);

    // Trata cada evento
    switch (event) {
      case 'payment.paid':
      case 'checkout.paid':
        // ✅ Pagamento confirmado
        // Aqui você pode:
        // - Salvar em banco (Supabase, Firebase, etc)
        // - Enviar email de agradecimento
        // - Notificar no WhatsApp
        // - Atualizar Google Sheets
        console.log('Pagamento confirmado:', {
          id: data.id,
          amount: data.amount,
          method: data.paymentMethod,
          payerName: data.payer?.name,
          payerDocument: data.payer?.document,
          donorName: data.donorName,
          paidAt: data.paidAt,
        });

        // Exemplo: salvar em log (trocar por banco real depois)
        // await salvarDoacao(data);
        break;

      case 'payment.created':
        console.log('Pix criado:', data.id);
        break;

      case 'payment.expired':
        console.log('Pix expirado:', data.id);
        break;

      case 'payment.failed':
        console.log('Pix falhou:', data.id);
        break;

      default:
        console.log('Evento ignorado:', event);
    }

    // Sempre responde 200 rápido
    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Erro webhook:', err);
    // Mesmo com erro, responde 200 pra evitar reenvios desnecessários
    return res.status(200).json({ received: true, error: err.message });
  }
}
