const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'SnowzzZxz/voaurea';

async function commitDoacao(doacao) {
  const ghHeaders = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'voaurea-webhook',
  };

  const fileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/doacoes-log.json`;
  let sha = null;
  let log = { doacoes: [] };

  try {
    const resp = await axios.get(fileUrl, { headers: ghHeaders });
    sha = resp.data.sha;
    log = JSON.parse(Buffer.from(resp.data.content, 'base64').toString('utf8'));
  } catch (e) {
    if (e.response?.status !== 404) throw e;
  }

  const ids = new Set((log.doacoes || []).map(d => d.id));
  if (!ids.has(doacao.id)) {
    log.doacoes = [...(log.doacoes || []), doacao];
  } else {
    log.doacoes = log.doacoes.map(d => d.id === doacao.id ? { ...d, ...doacao } : d);
  }

  if (log.doacoes.length > 5000) {
    log.doacoes = log.doacoes.slice(-5000);
  }

  const conteudo = Buffer.from(JSON.stringify(log, null, 2)).toString('base64');
  const body = {
    message: `[doacao] ${doacao.nome || 'Doador'} — R$ ${doacao.valor}`,
    content: conteudo,
  };
  if (sha) body.sha = sha;

  await axios.put(fileUrl, body, { headers: ghHeaders });
  return true;
}

module.exports = async (req, res) => {
  try {
    const doacao = req.body || {};
    if (!doacao.id) return res.status(400).json({ success: false, message: 'id obrigatório' });
    await commitDoacao(doacao);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro salvar-doacao:', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.commitDoacao = commitDoacao;
