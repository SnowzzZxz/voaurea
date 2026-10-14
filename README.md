# Abrigo Vo Aurea - Site e Dashboard

Sistema completo de captacao de doacoes via Pix para o Abrigo Vo Aurea (Cubatao/SP).

---

## Indice

- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Como acessar o dashboard](#como-acessar-o-dashboard)
- [Como pausar ou ativar o site](#como-pausar-ou-ativar-o-site)
- [Como editar textos](#como-editar-textos)
- [Como editar configuracoes](#como-editar-configuracoes)
- [Como trocar a senha do admin](#como-trocar-a-senha-do-admin)
- [Textos padrao](#textos-padrao)
- [Configuracoes padrao](#configuracoes-padrao)
- [Como funciona o fluxo de doacao](#como-funciona-o-fluxo-de-doacao)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Como hospedar](#como-hospedar)
- [Solucao de problemas](#solucao-de-problemas)

---

## Estrutura de arquivos

```
voaurea/
├── index.html                     -> Site publico
├── config.json                    -> Configuracoes e textos
├── package.json                   -> Dependencias (axios)
├── vercel.json                    -> Config da Vercel
│
├── admin/
│   └── index.html                 -> Dashboard admin
│
├── api/
│   ├── criar-pagamento.js         -> Gera Pix
│   ├── consultar-pagamento.js     -> Consulta status
│   ├── site-info.js               -> Site le config e textos
│   ├── webhook.js                 -> Recebe notificacao Z.PAY
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
```

---

## Como acessar o dashboard

**URL:** `https://voaureabrasil.vercel.app/admin/`

**Login:**
- Usuario: `admin` (definido na env var `ADMIN_USER`)
- Senha: a que voce definiu na env var `ADMIN_PASS`

---

## Como pausar ou ativar o site

1. Acessa o dashboard
2. Clica no toggle no banner do topo (canto direito)
3. Confirma
4. Aguarda ~30 segundos
5. Visitantes verao a tela de manutencao

---

## Como editar textos

1. Acessa o dashboard
2. Clica em **Textos**
3. Edita os campos que quiser
4. Clica em **Salvar textos**
5. Aguarda ~30 segundos

**Campos editaveis:**

- Hero (titulo e botoes)
- Quem e a Vo Aurea (titulo, 3 paragrafos e destaque)
- A realidade do abrigo (titulo e 4 paragrafos)
- Impacto (titulo)
- FAQ (4 perguntas e 4 respostas)

---

## Como editar configuracoes

1. Acessa o dashboard
2. Clica em **Config**
3. Edita os campos:
   - Valores sugeridos (botoes do modal de doacao)
   - Meta mensal (barra de progresso)
   - Mensagem de manutencao (tela de pausa)
   - Destacar doacao a partir de (valor minimo pra marcar com estrela)
4. Clica em **Salvar**
5. Aguarda ~30 segundos

---

## Como trocar a senha do admin

### 1. Na Vercel

- Settings -> Environment Variables -> `ADMIN_PASS` -> Edit
- Troca o valor
- Save

### 2. Redeploy

- Deployments -> ultimo deploy -> menu de tres pontos -> Redeploy

### 3. Aguarda ~30 segundos

Pronto. A senha antiga para de funcionar depois do deploy.

**Se esquecer a senha:** mesma coisa. Vai na Vercel, edita a env var, faz redeploy.

---

## Textos padrao

Se algo der errado, cola isso no `config.json` e faz commit:

```json
{
  "textos": {
    "hero_titulo": "Eles ja foram abandonados uma vez. Hoje, sua ajuda pode ser a esperanca que os mantem lutando.",
    "hero_botao_mensal": "QUERO AJUDAR TODO MES",
    "hero_botao_unica": "QUERO AJUDAR AGORA",
    "sobre_titulo": "Quem e a Vo Aurea?",
    "sobre_p1": "Me chamo Aurea, tenho 64 anos e dedico os meus dias a cuidar de mais de 50 animais que um dia nao tinham para onde ir.",
    "sobre_p2": "Sao caes que resgatei do abandono, da fome e de situacoes muito dificeis. Hoje, eles dependem de mim para praticamente tudo: comida, abrigo, medicamentos, cuidados veterinarios e, principalmente, protecao.",
    "sobre_p3": "Mesmo com a minha idade e todas as dificuldades que enfrento, eu nao consigo desistir deles. Porque sei que, se eu parar, muitos desses animais simplesmente nao terao para onde ir.",
    "sobre_callout": "As doacoes diminuíram e eu preciso da sua ajuda para continuar alimentando, cuidando e protegendo.",
    "realidade_titulo": "A realidade do abrigo",
    "realidade_p1": "Manter mais de 50 animais protegidos tem um custo muito alto. Hoje, sao necessarios aproximadamente R$ 60 mil todos os meses para manter o abrigo funcionando...",
    "realidade_p2": "Sao gastos com racao, aluguel, medicamentos, tratamentos veterinarios, contas basicas, manutencao e necessidades que surgem a cada novo resgate.",
    "realidade_p3": "E essa e a maior preocupacao da Vo Aurea: como conseguir manter tudo isso no proximo mes?",
    "realidade_p4": "Ela consegue oferecer amor e dedicacao todos os dias, mas nao consegue carregar sozinha uma despesa de R$ 60 mil. E por isso que cada doacao importa.",
    "impacto_titulo": "O impacto da sua doacao",
    "faq_q1": "A doacao e segura?",
    "faq_a1": "Sim. Toda contribuicao vai para racao, medicamentos e manutencao do abrigo.",
    "faq_q2": "Existe valor minimo?",
    "faq_a2": "Nao. Qualquer valor ajuda. Voce escolhe o quanto pode contribuir.",
    "faq_q3": "Para onde vai a minha doacao?",
    "faq_a3": "Racao, medicamentos, tratamentos veterinarios, contas basicas, aluguel e necessidades urgentes de cada novo resgate.",
    "faq_q4": "Posso visitar o abrigo?",
    "faq_a4": "Sim. Estamos em Cubatao/SP. Entre em contato para agendar uma visita."
  }
}
```

**Para restaurar:** cola esse bloco no `config.json` e faz commit.

---

## Configuracoes padrao

```json
{
  "site_ativo": true,
  "valores_sugeridos": [20, 30, 50, 100, 150, 200, 250, 500, 1000],
  "meta_mensal": 60000,
  "contador_base": 0,
  "mensagem_manutencao": "Estamos atualizando o site. Voltamos em alguns minutos!",
  "destaque_doacao": 500
}
```

| Campo | O que faz |
|---|---|
| site_ativo | true = site no ar / false = manutencao |
| valores_sugeridos | Botoes de valor no modal |
| meta_mensal | Meta da barra de progresso |
| contador_base | Numero inicial do contador de pessoas |
| mensagem_manutencao | Texto da tela de pausa |
| destaque_doacao | Valor minimo pra marcar com estrela no dashboard |

**Para restaurar:** cola esse bloco no `config.json` e faz commit.

---

## Como funciona o fluxo de doacao

```
1. Visitante abre o site
2. Clica em QUERO AJUDAR AGORA
3. Escolhe valor (R$ 20 a R$ 1.000) e preenche nome
4. Clica em GERAR PIX AGORA
5. Backend chama Z.PAY e recebe QR Code
6. Site mostra o QR Code e o aviso Aguardando pagamento
7. Site pergunta pra Z.PAY a cada 5 segundos: foi pago?
8. Visitante paga no banco
9. Em ate 5 segundos, o site detecta e mostra a tela verde Recebido com sucesso
10. 2 segundos depois, o modal fecha sozinho
```

**Limites:**
- Valor minimo: R$ 2,00 (limite da Z.PAY)
- Valor maximo: R$ 2.000,00 (limite da Z.PAY)

**Taxa Z.PAY:**
- Ate R$ 1.000: R$ 0,50
- Acima de R$ 1.000: R$ 0,50 + 1% do valor bruto

---

## Variaveis de ambiente

Configure na Vercel em **Settings -> Environment Variables**:

| Variavel | Exemplo | Para que serve |
|---|---|---|
| ADMIN_USER | admin | Login do dashboard |
| ADMIN_PASS | voaurea2026 | Senha do dashboard |
| GITHUB_TOKEN | ghp_xxx | Token do GitHub pra salvar config |
| GITHUB_REPO | SnowzzZxz/voaurea | Repositorio do projeto |

Sempre marque os 3 ambientes: Production, Preview e Development.

---

## Como hospedar

O site ja esta hospedado na Vercel. Para atualizar:

### Deploy automatico (recomendado)

1. Faz o commit no GitHub
2. Vercel detecta e faz deploy em ~30 segundos
3. Site atualiza sozinho

### Deploy manual

```bash
vercel --prod
```

---

## Solucao de problemas

### Login nao funciona

- Confirma as env vars `ADMIN_USER` e `ADMIN_PASS` na Vercel
- Faz redeploy depois de mexer nas env vars
- Testa em aba anonima (Ctrl+Shift+N)

### Salvar textos ou config da erro

- Confirma que `GITHUB_TOKEN` e `GITHUB_REPO` estao configurados
- Verifica se o token tem permissao `repo`
- Ve os logs em Vercel -> Deployments -> Functions

### Site nao atualiza depois de editar

- Espera 30 segundos (deploy automatico)
- Recarrega com Ctrl+F5 (limpa cache)
- Confere se apareceu commit novo em github.com/SnowzzZxz/voaurea/commits/main

### Pix nao gera

- Confere se a Z.PAY esta online
- Verifica se as credenciais (zpk_, zsk_) estao certas
- Ve os logs: Vercel -> Deployments -> Functions -> criar-pagamento

### Tela de manutencao nao sai

- Vai no /admin/ -> toggle -> ativa o site
- Ou edita o config.json no GitHub -> "site_ativo": true

### F12 mostra a senha

- Nao deveria mais. Se aparecer, confere se substituiu o admin/index.html
- A senha agora so existe na Vercel

---

## Contato

**Abrigo Vo Aurea**

- CNPJ: 66.916.269/0001-20
- WhatsApp: (13) 98113-3912
- Email: SUPORTE@VOAUREA.COM.BR
- Instagram: @netinhosdavoaurea
- YouTube: @abrigovoaurea
- TikTok: @abrigovoaurea
- Facebook: /abrigovoaurea

---

## Changelog

### Outubro 2026

- Login seguro com env vars (sem senha no codigo)
- Editor de textos pelo dashboard
- Pausar ou ativar site pelo dashboard
- Polling automatico de pagamento (a cada 5 segundos)
- Tela verde Recebido com sucesso
- QR Code com zoom
- Contador de pessoas que ja doaram
- Barra de meta mensal
- Feed de ultimas doacoes
- Dashboard com stats e grafico
- Export CSV de doacoes
