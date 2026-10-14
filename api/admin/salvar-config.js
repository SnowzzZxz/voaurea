const axios = require('axios');

const ADMIN_USER = 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'voaurea2026';

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
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método não permitido' });

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO || 'SnowzzZxz/voaurea';

    if (!GITHUB_TOKEN) {
      return res.status(500).json({ success: false, message: 'GITHUB_TOKEN não configurado' });
    }

    const { valores_sugeridos, meta_mensal, mensagem_manutencao, destaque_doacao } = req.body || {};

    const ghHeaders = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'voaurea-admin',
    };

    const fileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/config.json`;
    const fileResp = await axios.get(fileUrl, { headers: ghHeaders });
    const sha = fileResp.data.sha;
    const config = JSON.parse(Buffer.from(fileResp.data.content, 'base64').toString('utf8'));

    if (Array.isArray(valores_sugeridos)) config.valores_sugeridos = valores_sugeridos;
    if (meta_mensal !== undefined) config.meta_mensal = Number(meta_mensal);
    if (mensagem_manutencao !== undefined) config.mensagem_manutencao = mensagem_manutencao;
    if (destaque_doacao !== undefined) config.destaque_doacao = Number(destaque_doacao);

    const novoConteudo = Buffer.from(JSON.stringify(config, null, 2)).toString('base64');

    await axios.put(fileUrl, {
      message: `[admin] Atualiza config — ${new Date().toLocaleString('pt-BR')}`,
      content: novoConteudo,
      sha: sha,
    }, { headers: ghHeaders });

    return res.status(200).json({
      success: true,
      message: 'Configurações salvas! Aguarde ~30s.',
    });

  } catch (err) {
    console.error('Erro salvar-config:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || err.message,
    });
  }
};
