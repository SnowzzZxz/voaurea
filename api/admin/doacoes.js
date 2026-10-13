const axios = require('axios');

// 🔑 Credenciais Z.PAY
const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';
const BASE_URLS = [
  'https://zpayapi.app/api/v2',
  'https://zpaysolution.com/api/v1',
];

// 🔐 Login
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'voaurea2026';

function checkAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    res.status(401).send('Auth required');
    return false;
  }
  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    res.status(401).send('Auth failed');
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  if (!checkAuth(req, res)) return;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
      'client-secret': CLIENT_SECRET,
    };

    // Tenta a Z.PAY v2 primeiro, cai pra v1
    let pagamentos = [];
    let erroFinal = null;

    for (const base of BASE_URLS) {
      try {
        const resp = await axios.get(`${base}/payments`, { headers, timeout: 10000 });
        pagamentos = resp.data.payments || resp.data.data || resp.data || [];
        if (!Array.isArray(pagamentos)) pagamentos = [];
        break;
      } catch (e) {
        erroFinal = e.response?.data?.error || e.message;
      }
    }

    // Normaliza os dados
    const doacoes = pagamentos.map(p => ({
      id: p.id || p.paymentId,
      nome: p.payer?.name || p.payerName || p.donorName || '—',
      email: p.email || null,
      valor: Number(p.amount || 0),
      status: p.status || 'pending',
      metodo: p.paymentMethod || 'pix',
      created_at: p.createdAt || p.created_at,
      paid_at: p.paidAt || p.paid_at,
    }));

    // Calcula totais
    const pagas = doacoes.filter(d => d.status === 'paid');
    const totalBruto = pagas.reduce((s, d) => s + d.valor, 0);
    const taxaZPay = (v) => v <= 1000 ? 0.50 : 0.50 + (v - 1000) * 0.01;
    const totalLiquido = pagas.reduce((s, d) => s + (d.valor - taxaZPay(d.valor)), 0);

    // Últimos 7 dias
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentes = pagas.filter(d => new Date(d.created_at || d.paid_at) >= seteDiasAtras);

    // Filtros opcionais
    const { periodo, status, busca } = req.query;
    let filtradas = doacoes;

    if (status && status !== 'todos') filtradas = filtradas.filter(d => d.status === status);
    if (busca) {
      const b = busca.toLowerCase();
      filtradas = filtradas.filter(d =>
        (d.nome || '').toLowerCase().includes(b) ||
        (d.email || '').toLowerCase().includes(b)
      );
    }
    if (periodo === 'hoje') {
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      filtradas = filtradas.filter(d => new Date(d.created_at) >= hoje);
    } else if (periodo === '7dias') {
      filtradas = filtradas.filter(d => new Date(d.created_at) >= seteDiasAtras);
    } else if (periodo === '30dias') {
      const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filtradas = filtradas.filter(d => new Date(d.created_at) >= d30);
    }

    return res.status(200).json({
      success: true,
      doacoes: filtradas,
      stats: {
        totalBruto,
        totalLiquido,
        totalCount: pagas.length,
        ticketMedio: pagas.length ? totalBruto / pagas.length : 0,
        seteDiasBruto: recentes.reduce((s, d) => s + d.valor, 0),
        seteDiasCount: recentes.length,
      },
    });

  } catch (err) {
    console.error('Erro:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
