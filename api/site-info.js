const fs = require('fs');
const path = require('path');
const axios = require('axios');

const GITHUB_REPO = process.env.GITHUB_REPO || 'SnowzzZxz/voaurea';

// Lê o config.json do próprio deploy
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
      textos: {},
    };
  }
}

// Lê o doacoes-log.json do GitHub (raw)
async function lerDoacoes() {
  try {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/doacoes-log.json?t=${Date.now()}`;
    const resp = await axios.get(url, { timeout: 8000 });
    return resp.data.doacoes || [];
  } catch (e) {
    console.warn('Erro ao ler doacoes-log:', e.message);
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const config = lerConfig();

  // Se site pausado, retorna só isso
  if (!config.site_ativo) {
    return res.status(200).json({
      success: true,
      ativo: false,
      mensagem: config.mensagem_manutencao,
    });
  }

  // Lê as doações do GitHub
  const doacoes = await lerDoacoes();

  // Filtra só as pagas
  const pagas = doacoes.filter(d => d.status === 'paid');

  // Total geral (todas as pagas, do mês ou não)
  const totalGeral = pagas.reduce((s, d) => s + Number(d.valor || 0), 0);

  // Total do mês atual
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const mesPagas = pagas.filter(d => {
    const dt = new Date(d.paid_at || d.created_at);
    return dt >= inicioMes;
  });
  const totalMes = mesPagas.reduce((s, d) => s + Number(d.valor || 0), 0);

  // Contador de pessoas (todas as doações pagas + base)
  const totalPessoas = pagas.length + (config.contador_base || 0);

  // Últimas 5 doações (só primeiro nome + valor + quando)
  const ultimas = pagas
    .sort((a, b) => new Date(b.paid_at || b.created_at) - new Date(a.paid_at || a.created_at))
    .slice(0, 5)
    .map(d => {
      const nomeCompleto = d.nome || 'Anônimo';
      const primeiroNome = nomeCompleto.split(' ')[0];
      return {
        nome: primeiroNome,
        valor: Number(d.valor || 0),
        quando: d.paid_at || d.created_at,
      };
    });

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
      total_bruto: totalGeral,
      doacoes_pagas: pagas.length,
    },
    ultimas_doacoes: ultimas,
  });
};
