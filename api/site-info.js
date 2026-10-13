const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CLIENT_ID     = 'zpk_541f4b2f71855fb26e1201a7';
const CLIENT_SECRET = 'zsk_87b13fb23ba5eed5d6d9f0f9e6153d20dfeac10e24a66dd6';
const BASE_URLS = [
  'https://zpayapi.app/api/v2',
  'https://zpaysolution.com/api/v1',
];

function lerConfig() {
  try {
    const file = path.join(process.cwd(), 'config.json');
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      site_ativo: true,
      valores_sugeridos: [20, 30, 50, 100, 150, 200, 250, 500, 1000],
      meta_mensal: 60000,
      contador_base: 0,
      mensagem_manutencao: 'Voltamos em alguns minutos!',
      destaque_doacao: 500,
    };
  }
}

async function fetchZPay() {
  const headers = {
    'Content-Type': 'application/json',
    'client-id': CLIENT_ID,
    'client-secret': CLIENT_SECRET,
  };
  for (const base of BASE_URLS) {
    try {
      const resp = await axios.get(`${base}/payments`, { headers, timeout: 8000 });
      let p = resp.data.payments || resp.data.data || resp.data || [];
      if (!Array.isArray(p)) p = [];
      return p;
    } catch (e) { /* tenta próximo */ }
  }
  return [];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');

  const config = lerConfig();

  if (!config.site_ativo) {
    return res.status(200).json({
      success: true,
      ativo: false,
      mensagem: config.mensagem_manutencao || 'Voltamos em breve!',
    });
  }

  try {
    const pagamentos = await fetchZPay();
    const pagas = pagamentos.filter(p => (p.status || '') === 'paid');

    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const mesPagas = pagas.filter(p => {
      const d = new Date(p.createdAt || p.created_at || p.paidAt);
      return d >= inicioMes;
    });

    const totalMes = mesPagas.reduce((s, p) => s + Number(p.amount || 0), 0);
    const totalGeral = pagas.length + (config.contador_base || 0);

    // Últimas 5 doações (só primeiro nome + valor)
    const ultimas = pagas
      .sort((a, b) => new Date(b.createdAt || b.paidAt) - new Date(a.createdAt || a.paidAt))
      .slice(0, 5)
      .map(p => {
        const nomeCompleto = p.payer?.name || p.payerName || 'Anônimo';
        const primeiroNome = nomeCompleto.split(' ')[0];
        return {
          nome: primeiroNome,
          valor: Number(p.amount || 0),
          quando: p.paidAt || p.createdAt,
        };
      });

    return res.status(200).json({
      success: true,
      ativo: true,
      config: {
        valores_sugeridos: config.valores_sugeridos,
        meta_mensal: config.meta_mensal,
        destaque_doacao: config.destaque_doacao,
      },
      stats: {
        total_mes: totalMes,
        total_geral: totalGeral,
        doacoes_pagas: pagas.length,
      },
      ultimas_doacoes: ultimas,
    });

  } catch (err) {
    console.error('Erro site-info:', err.message);
    return res.status(200).json({
      success: true,
      ativo: true,
      config: {
        valores_sugeridos: config.valores_sugeridos,
        meta_mensal: config.meta_mensal,
        destaque_doacao: config.destaque_doacao,
      },
      stats: { total_mes: 0, total_geral: 0, doacoes_pagas: 0 },
      ultimas_doacoes: [],
    });
  }
};
