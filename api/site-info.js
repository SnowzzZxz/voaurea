const fs = require('fs');
const path = require('path');

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
      textos: {},
    };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const config = lerConfig();

  return res.status(200).json({
    success: true,
    ativo: config.site_ativo,
    mensagem: config.mensagem_manutencao,
    config: {
      valores_sugeridos: config.valores_sugeridos,
      meta_mensal: config.meta_mensal,
      destaque_doacao: config.destaque_doacao,
    },
    textos: config.textos || {},
  });
};
