const fs = require('fs');
const path = require('path');
const axios = require('axios');

const GITHUB_REPO = process.env.GITHUB_REPO || 'SnowzzZxz/voaurea';

function lerConfig() {
  try {
    const file = path.join(process.cwd(), 'config.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return {
      site_ativo: true,
      valores_sugeridos: [20, 30, 50, 100, 150, 200, 250, 500, 1000],
      meta_mensal: 60000,
      mensagem_manutencao: 'Voltamos em alguns minutos! 🐾',
      destaque_doacao: 500,
      contador_base: 0,
      textos: {},
    };
  }
}

async function lerDoacoes() {
  try {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/doacoes-log.json?t=${Date.now()}`;
    const resp = await axios.get(url, { timeout: 8000 });
    return resp.data.doacoes || [];
  } catch (e) {
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const config = lerConfig();

  if (!config.site_ativo) {
    return res.status(200).json({
      success: true,
      ativo: false,
      mensagem: config.mensagem_manutencao,
    });
  }

  const doacoes = await lerDoacoes();
  const pagas = doacoes.filter(d => d.status === 'paid');

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const mesPagas = pagas.filter(d => {
    const dt = new Date(d.paid_at || d.created_at);
    return dt >= inicioMes;
  });
  const totalMes = mesPagas.reduce((s, d) => s + Number(d.valor || 0), 0);
  const totalPessoas = pagas.length + (config.contador_base || 0);

  return res.status(200).json({
    success: true,
    ativo: true,
    mensagem: config.mensagem_manutencao,
    config: {
      valores_sugeridos: config.valores_sugeridos,
      meta_mensal: config.meta_mensal,
      destaque_doacao: config.destaque_doacao,
    },
    textos: config.textos || {},
    stats: {
      total_mes: totalMes,
      total_geral: totalPessoas,
      doacoes_pagas: pagas.length,
    },
  });
};
