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

async function fetchZPay() {
  const headers = {
    'Content-Type': 'application/json',
    'client-id': CLIENT_ID,
    'client-secret': CLIENT_SECRET,
  };

  for (const base of BASE_URLS) {
    try {
      const resp = await axios.get(`${base}/payments`, { headers, timeout: 10000 });
      let pagamentos = resp.data.payments || resp.data.data || resp.data || [];
      if (!Array.isArray(pagamentos)) pagamentos = [];
      if (pagamentos.length > 0 || resp.status === 200) return pagamentos;
    } catch (e) {
      console.warn(`Falha em ${base}:`, e.message);
    }
  }
  return [];
}

function calcTaxa(v) {
  return v <= 1000 ? 0.50 : 0.50 + (v - 1000) * 0.01;
}

module.exports = async (req, res) => {
  if (!checkAuth(req, res)) return;

  try {
    const pagamentos = await fetchZPay();

    const doacoes = pagamentos.map(p => ({
      id: p.id || p.paymentId,
      nome: p.payer?.name || p.payerName || p.donorName || '—',
      email: p.email || p.payer?.email || null,
      valor: Number(p.amount || 0),
      status: p.status || 'pending',
      metodo: p.paymentMethod || 'pix',
      created_at: p.createdAt || p.created_at,
      paid_at: p.paidAt || p.paid_at,
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const pagas = doacoes.filter(d => d.status === 'paid');
    const totalBruto = pagas.reduce((s, d) => s + d.valor, 0);
    const totalLiquido = pagas.reduce((s, d) => s + (d.valor - calcTaxa(d.valor)), 0);

    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const seteDias = new Date(Date.now() - 7*24*60*60*1000);
    const quinzeDias = new Date(Date.now() - 15*24*60*60*1000);
    const trintaDias = new Date(Date.now() - 30*24*60*60*1000);

    const filtrar = (arr, desde) => arr.filter(d => new Date(d.created_at || d.paid_at) >= desde);

    const hojeP = filtrar(pagas, hoje);
    const seteP = filtrar(pagas, seteDias);
    const trintaP = filtrar(pagas, trintaDias);
    const quinzeAntes = filtrar(pagas, quinzeDias).filter(d => new Date(d.created_at || d.paid_at) < seteDias);

    const totalHoje = hojeP.reduce((s, d) => s + d.valor, 0);
    const total7 = seteP.reduce((s, d) => s + d.valor, 0);
    const total30 = trintaP.reduce((s, d) => s + d.valor, 0);
    const totalSemanaAnterior = quinzeAntes.reduce((s, d) => s + d.valor, 0);

    const doacoesGrandes = pagas.filter(d => d.valor >= 500).slice(0, 10);

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
    if (periodo === 'hoje') filtradas = filtrar(filtradas, hoje);
    else if (periodo === '7dias') filtradas = filtrar(filtradas, seteDias);
    else if (periodo === '30dias') filtradas = filtrar(filtradas, trintaDias);

    return res.status(200).json({
      success: true,
      doacoes: filtradas.slice(0, 500),
      stats: {
        totalBruto,
        totalLiquido,
        totalCount: pagas.length,
        ticketMedio: pagas.length ? totalBruto / pagas.length : 0,
        hojeBruto: totalHoje,
        hojeCount: hojeP.length,
        seteDiasBruto: total7,
        seteDiasCount: seteP.length,
        trintaDiasBruto: total30,
        trintaDiasCount: trintaP.length,
        semanaAnterior: totalSemanaAnterior,
        variacao: totalSemanaAnterior ? ((total7 - totalSemanaAnterior) / totalSemanaAnterior) * 100 : 0,
      },
      doacoesGrandes,
      todasPagas: pagas.slice(0, 30),
    });

  } catch (err) {
    console.error('Erro:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
