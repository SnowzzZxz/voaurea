LEIA-ME
Abrigo Vó Áurea - Site e Dashboard
Sistema completo de captação de doações via Pix para o Abrigo Vó Áurea (Cubatão/SP).

Índice
1. Estrutura de arquivos
2. Como acessar o painel de controle
3. Como pausar ou ativar o site
4. Como editar textos
5. Como editar configurações
6. Como trocar a senha do admin
7. Textos padrão
8. Configurações padrão
9. Como funciona o fluxo de doação
10. Variáveis de ambiente
11. Como hospedar
12. Solução de problemas


1. ESTRUTURA DE ARQUIVOS

voaurea/
├── index.html                     -> Site público
├── config.json                    -> Configurações e textos
├── package.json                   -> Dependências (axios)
├── vercel.json                    -> Config da Vercel
│
├── admin/
│   └── index.html                 -> Dashboard admin
│
├── api/
│   ├── criar-pagamento.js         -> Gera Pix
│   ├── consultar-pagamento.js     -> Consulta status
│   ├── site-info.js               -> Site lê config e textos
│   ├── webhook.js                 -> Recebe notificação Z.PAY
│   │
│   └── admin/
│       ├── toggle-site.js         -> Pausar ou ativar site
│       ├── salvar-config.js       -> Salvar config
│       └── salvar-textos.js       -> Salvar textos
│
├── imgs/                          -> Imagens do site
│   ├── logo.png
│   ├── banner1-800.webp
│   ├── banner2.webp
│   ├── queme/
│   └── espaco/
│
└── video/
    └── voaurea.mp4                -> VSL


2. COMO ACESSAR O PAINEL DE CONTROLE

URL: https://voaureabrasil.vercel.app/admin/

Conecte-se:
- Usuário: admin (definido na env var ADMIN_USER)
- Senha: a que você define na env var ADMIN_PASS


3. COMO PAUSAR OU ATIVAR O SITE

1. Acesse o painel
2. Clique no toggle no banner do topo (canto direito)
3. Confirme
4. Aguarde ~30 segundos
5. Visitantes verão a tela de manutenção


4. COMO EDITAR TEXTOS

1. Acesse o painel
2. Clique em "Textos"
3. Edite os campos que quiser
4. Clique em "Salvar textos"
5. Aguarde ~30 segundos

Campos editáveis:
- Hero (título e botões)
- Quem é a Vó Áurea (título, 3 parágrafos e destaque)
- A realidade do abrigo (título e 4 parágrafos)
- Impacto (título)
- FAQ (4 perguntas e 4 respostas)


5. COMO EDITAR CONFIGURAÇÕES

1. Acesse o painel
2. Clique em "Config"
3. Edite os campos:
   - Valores sugeridos (botões do modal de doação)
   - Meta mensal (barra de progresso)
   - Mensagem de manutenção (tela de pausa)
   - Destacar doação a partir de (valor mínimo pra marcar com estrela)
4. Clique em "Salvar"
5. Aguarde ~30 segundos


6. COMO TROCAR A SENHA DO ADMIN

1. Na Vercel:
   - Settings -> Environment Variables -> ADMIN_PASS -> Edit
   - Troque o valor
   - Save

2. Redeploy:
   - Deployments -> último deploy -> menu de três pontos -> Redeploy

3. Aguarde ~30 segundos

Pronto. A senha antiga para de funcionar depois do deploy.
Se esquecer a senha: mesma coisa. Vai na Vercel, edite a env var, faça redeploy.


7. TEXTOS PADRÃO

Se algo der errado, cole isso no config.json e faça commit:

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
    "realidade_p1": "Manter mais de 50 animais protegidos tem um custo muito alto. Hoje, são necessários aproximadamente R$ 60 mil todos os meses para manter o abrigo funcionando...",
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

Para restaurar: cole esse bloco no config.json e faça commit.


8. CONFIGURAÇÕES PADRÃO

{
  "site_ativo": true,
  "valores_sugeridos": [20, 30, 50, 100, 150, 200, 250, 500, 1000],
  "meta_mensal": 60000,
  "contador_base": 0,
  "mensagem_manutencao": "Estamos atualizando o site. Voltamos em alguns minutos!",
  "destaque_doacao": 500
}

Tabela de campos:
- site_ativo: true = site no ar / false = manutenção
- valores_sugeridos: Botões de valor no modal
- meta_mensal: Meta da barra de progresso
- contador_base: Número inicial do contador de pessoas
- mensagem_manutencao: Texto da tela de pausa
- destaque_doacao: Valor mínimo para marcar com estrela no dashboard

Para restaurar: cole esse bloco no config.json e faça commit.


9. COMO FUNCIONA O FLUXO DE DOAÇÃO

1. Visitante abre o site
2. Clica em "QUERO AJUDAR AGORA"
3. Escolhe valor (R$ 20 a R$ 1.000) e preenche nome
4. Clica em "GERAR PIX AGORA"
5. Backend chama Z.PAY e recebe QR Code
6. Site mostra o QR Code e o aviso "Aguardando pagamento"
7. Site pergunta pra Z.PAY a cada 5 segundos: "foi pago?"
8. Visitante paga no banco
9. Em até 5 segundos, o site detecta e mostra a tela verde "Recebido com sucesso"
10. 2 segundos depois, o modal fecha sozinho

Limitações:
- Valor mínimo: R$ 2,00 (limite da Z.PAY)
- Valor máximo: R$ 2.000,00 (limite da Z.PAY)

Taxa Z.PAY:
- Até R$ 1.000: R$ 0,50
- Acima de R$ 1.000: R$ 0,50 + 1% do valor bruto


10. VARIÁVEIS DE AMBIENTE

Configure na Vercel em Settings -> Environment Variables:

- ADMIN_USER: admin (login do painel)
- ADMIN_PASS: voaurea2026 (senha do dashboard)
- GITHUB_TOKEN: ghp_xxx (token do GitHub para salvar config)
- GITHUB_REPO: SnowzzZxz/voaurea (repositório do projeto)

Sempre marque os 3 ambientes: Production, Preview e Development.


11. COMO HOSPEDAR

O site já está hospedado na Vercel. Para atualizar:

Deploy automático (recomendado):
1. Faça o commit no GitHub
2. Vercel detecta e faz deploy em ~30 segundos
3. Site atualizado sozinho

Deploy manual:
vercel --prod


12. SOLUÇÃO DE PROBLEMAS

- Login não funciona:
  Confirme as env vars ADMIN_USER e ADMIN_PASS na Vercel.
  Faça redeploy depois de mexer nas env vars.
  Teste em aba anônima (Ctrl+Shift+N).

- Salvar textos ou config dá erro:
  Confirme que GITHUB_TOKEN e GITHUB_REPO estão configurados.
  Verifique se o token tem permissão repo.
  Veja os logs em Vercel -> Deployments -> Functions.

- Site não atualiza depois de editar:
  Espere 30 segundos (deploy automático).
  Recarregue com Ctrl+F5 (limpar cache).
  Confira se apareceu commit novo em github.com/SnowzzZxz/voaurea/commits/main.

- Pix não gera:
  Confira se a Z.PAY está online.
  Verifique se as credenciais (zpk_, zsk_) estão certas.
  Veja os logs: Vercel -> Deployments -> Functions -> criar-pagamento.

- Tela de manutenção não sai:
  Vá em /admin/ -> toggle -> ative o site.
  Ou edite config.json no GitHub -> "site_ativo": true.

- F12 mostra a senha:
  Não deveria mais. Se aparecer, confira se substituiu o admin/index.html.
  A senha agora só existe na Vercel.


CONTATO
Abrigo Vó Áurea
- CNPJ: 66.916.269/0001-20
- WhatsApp: (13) 98113-3912
- E-mail: SUPORTE@VOAUREA.COM.BR
- Instagram: @netinhosdavoaurea
- YouTube: @abrigovoaurea
- TikTok: @abrigovoaurea
- Facebook: /abrigovoaurea


CHANGELOG (Outubro 2026)
- Login seguro com env vars (sem senha no código)
- Editor de textos pelo painel
- Pausar ou ativar site pelo dashboard
- Polling automático de pagamento (a cada 5 segundos)
- Tela verde "Recebido com sucesso"
- QR Code com zoom
- Contador de pessoas que já doaram
- Barra de meta mensal
- Dashboard com estatísticas e gráficos
- Exportar CSV de doações
