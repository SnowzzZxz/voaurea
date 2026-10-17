markdown
# 🐾 Abrigo Vó Áurea — Site, Dashboard e Integrações

Sistema completo de captação de doações via Pix para o Abrigo Vó Áurea (Cubatão/SP). O projeto inclui site institucional, integração com gateway de pagamento, webhook de confirmação, dashboard administrativo e controle de textos/configurações via GitHub.

---

## 📋 Índice

- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Como acessar o dashboard](#como-acessar-o-dashboard)
- [Pausar ou ativar o site](#pausar-ou-ativar-o-site)
- [Editar textos e configurações](#editar-textos-e-configurações)
- [Como trocar a senha do admin](#como-trocar-a-senha-do-admin)
- [Textos padrão (backup)](#textos-padrão-backup)
- [Configurações padrão](#configurações-padrão)
- [Fluxo de doação (Pix)](#fluxo-de-doação-pix)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Onde ficam as doações](#onde-ficam-as-doações)
- [Como hospedar](#como-hospedar)
- [Solução de problemas](#solução-de-problemas)

---

## 📁 Estrutura de arquivos

```text
📦 voaurea/
├── index.html                     → Site público (landing page + VSL)
├── config.json                    → Configurações e textos (editável)
├── package.json                   → Dependências (axios)
├── vercel.json                    → Config da Vercel
├── doacoes-log.json               → Banco de dados de doações (gerado pelo webhook)
│
├── admin/
│   └── index.html                 → Dashboard administrativo
│
├── api/
│   ├── criar-pagamento.js         → Gera Pix no gateway
│   ├── consultar-pagamento.js     → Consulta status do Pix
│   ├── site-info.js               → Fornece config e textos para o site
│   ├── webhook.js                 → Recebe notificações do gateway
│   │
│   └── admin/
│       ├── doacoes.js             → Lista doações (lê do GitHub)
│       ├── salvar-doacao.js       → Salva doações no GitHub
│       ├── toggle-site.js         → Pausa/ativa o site
│       ├── salvar-config.js       → Salva config.json
│       └── salvar-textos.js       → Salva textos no config.json
│
├── imgs/                          → Imagens do site (logos, carrosséis, resgates)
└── video/
    └── voaurea.mp4                → Vídeo VSL (hospedado localmente)
🔐 Como acessar o dashboard
URL: https://voaureabrasil.vercel.app/admin/

Login:

Usuário: Definido na variável de ambiente ADMIN_USER (padrão: admin)

Senha: Definida na variável de ambiente ADMIN_PASS

⚠️ A senha não fica exposta no código. Ela é validada diretamente no servidor via Vercel.

⏸️ Pausar ou ativar o site
Acesse o dashboard (/admin/).

No topo, localize o banner verde (Site ativo).

Clique no toggle à direita.

Confirme a ação.

Aguarde ~30 segundos (a Vercel fará o deploy automático do config.json).

Visitantes verão a tela de manutenção.

✏️ Editar textos e configurações
Tudo é salvo no config.json via API do GitHub.

Editar Textos
No dashboard, clique em ✏️ Textos.

Altere os campos desejados (Hero, Sobre, Realidade, FAQ, etc.).

Clique em "💾 Salvar textos".

Aguarde ~30 segundos para o site atualizar.

Editar Configurações
No dashboard, clique em ⚙️ Config.

Altere:

Valores sugeridos (ex: 20, 30, 50...)

Meta mensal (ex: 60000)

Mensagem de manutenção

Destaque de doação (valor mínimo para marcação ⭐)

Clique em "Salvar".

Aguarde ~30 segundos.

🔑 Como trocar a senha do admin
A senha é gerenciada pela Vercel (Environment Variables).

Acesse o painel da Vercel → seu projeto.

Vá em Settings → Environment Variables.

Encontre a variável ADMIN_PASS e clique em Edit.

Digite a nova senha e clique em Save.

Vá em Deployments → último deploy → ⋯ → Redeploy.

Aguarde ~30 segundos.

Se esquecer a senha: repita o processo acima definindo uma nova.

📝 Textos padrão (backup)
Se algo der errado, cole este bloco no config.json para restaurar os textos originais:

json
{
  "textos": {
    "hero_titulo": "Eles já foram abandonados uma vez. Hoje, sua ajuda pode ser a esperança que os mantém lutando.",
    "hero_botao_mensal": "QUERO AJUDAR TODO MÊS",
    "hero_botao_unica": "QUERO AJUDAR AGORA",
    "sobre_titulo": "Quem é a Vó Áurea?",
    "sobre_p1": "Me chamo Áurea, tenho 64 anos e dedico os meus dias a cuidar de mais de 50 animais que um dia não tinham para onde ir.",
    "sobre_p2": "São cães que resgatei do abandono, da fome e de situações muito difíceis. Hoje, eles dependem de mim para praticamente tudo: comida, abrigo, medicamentos, cuidados veterinários e, principalmente, proteção.",
    "sobre_p3": "Mesmo com a minha idade e todas as dificuldades que enfrento, eu não consigo desistir deles. Porque sei que, se eu parar, muitos desses animais simplesmente não terão para onde ir.",
    "sobre_callout": "As doações diminuíram e eu preciso da sua ajuda para continuar alimentando, cuidando e protegendo.",
    "realidade_titulo": "A realidade do abrigo",
    "realidade_p1": "Manter mais de 50 animais protegidos tem um custo muito alto. Hoje, são necessários aproximadamente R$ 60 mil todos os meses para manter o abrigo funcionando…",
    "realidade_p2": "São gastos com ração, aluguel, medicamentos, tratamentos veterinários, contas básicas, manutenção e necessidades que surgem a cada novo resgate.",
    "realidade_p3": "E essa é a maior preocupação da Vó Áurea: como conseguir manter tudo isso no próximo mês?",
    "realidade_p4": "Ela consegue oferecer amor e dedicação todos os dias, mas não consegue carregar sozinha uma despesa de R$ 60 mil. É por isso que cada doação importa.",
    "impacto_titulo": "O impacto da sua doação",
    "faq_q1": "A doação é segura?",
    "faq_a1": "Sim. Toda contribuição vai para ração, medicamentos e manutenção do abrigo.",
    "faq_q2": "Existe valor mínimo?",
    "faq_a2": "Não. Qualquer valor ajuda. Você escolhe o quanto pode contribuir.",
    "faq_q3": "Para onde vai a minha doação?",
    "faq_a3": "Ração, medicamentos, tratamentos veterinários, contas básicas, aluguel e necessidades urgentes de cada novo resgate.",
    "faq_q4": "Posso visitar o abrigo?",
    "faq_a4": "Sim. Estamos em Cubatão/SP. Entre em contato para agendar uma visita."
  }
}
⚙️ Configurações padrão
json
{
  "site_ativo": true,
  "valores_sugeridos": [20, 30, 50, 100, 150, 200, 250, 500, 1000],
  "meta_mensal": 60000,
  "contador_base": 0,
  "mensagem_manutencao": "Estamos atualizando o site. Voltamos em alguns minutos! 🐾",
  "destaque_doacao": 500
}
Campo	O que faz
site_ativo	true = site no ar / false = tela de manutenção
valores_sugeridos	Botões de valor no modal de doação
meta_mensal	Meta da barra de progresso no site
contador_base	Número inicial para o contador de doações
mensagem_manutencao	Texto exibido na tela de pausa
destaque_doacao	Valor mínimo para marcar uma doação com ⭐ no dashboard
💰 Fluxo de doação (Pix)
text
1. Visitante preenche o formulário no site.
2. Site chama /api/criar-pagamento.
3. API cria a cobrança no gateway de pagamento e retorna o QR Code + Copia e Cola.
4. Site exibe o QR Code e inicia o polling a cada 5s.
5. Visitante paga no banco.
6. O gateway detecta o pagamento e dispara o webhook (/api/webhook).
7. Webhook salva a doação no arquivo doacoes-log.json via GitHub.
8. Site detecta o pagamento pelo polling e exibe a tela verde de sucesso.
Limites do gateway:

Valor mínimo: R$ 2,00

Valor máximo: R$ 2.000,00

Nota: As taxas e limites podem variar conforme o gateway utilizado no arquivo api/criar-pagamento.js.

🔧 Variáveis de ambiente
Configure na Vercel em Settings > Environment Variables.

Variável	Exemplo	Para que serve
ADMIN_USER	admin	Login do dashboard
ADMIN_PASS	SuaSenhaSegura	Senha do dashboard
GITHUB_TOKEN	ghp_...	Token clássico do GitHub (escopo repo) para salvar dados
GITHUB_REPO	SnowzzZxz/voaurea	Nome do repositório (usuário/repo)
WEBHOOK_SECRET	whsec_...	Segredo HMAC do webhook do gateway
⚠️ Sempre marque os 3 ambientes (Production, Preview, Development) ao criar a variável.

📂 Onde ficam as doações
O arquivo doacoes-log.json é o "banco de dados" do projeto. Ele é atualizado automaticamente pelo webhook sempre que um Pix é pago.

Você pode visualizar a versão mais recente a qualquer momento acessando:

text
https://raw.githubusercontent.com/SnowzzZxz/voaurea/main/doacoes-log.json
O dashboard admin (/admin/) lê desse arquivo para montar a lista, gráficos e estatísticas.
