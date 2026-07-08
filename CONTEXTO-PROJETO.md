# Contexto do projeto N2 — para retomar em outra máquina

Este arquivo resume o que foi feito numa sessão com o Claude Code, pra
poder colar/mostrar pra ele continuar do mesmo ponto em outro computador.

## Os dois projetos envolvidos

- **`n2-site`** (este repositório) — site institucional estático
  (HTML/CSS/JS puro, sem build) da N2 Carros Salvados, compra e venda
  de veículos salvados. Páginas: `index.html`, `estoque.html`,
  `sobre.html`, `contato.html`. Repositório:
  github.com/Gembarowski/n2-site
- **`n2autosys-backend`** — backend SaaS multi-tenant (Node/Express +
  PostgreSQL no Neon + fotos no Cloudinary, deploy automático no
  Render a cada push na `main`) que o Eduardo está desenvolvendo para
  gestão de veículos batidos/sinistrados. É o sistema que o time de
  vendas usa pra cadastrar os carros de verdade. Repositório:
  github.com/Gembarowski/n2autosys-backend — URL em produção:
  https://n2autosys-backend.onrender.com

Nesta máquina os dois estão clonados lado a lado:
`c:\Projetos Edu\n2-site` e `c:\Projetos Edu\n2autosys-backend`.

## O que foi feito, em ordem

1. **`js/script.js` estava quebrado** — continha uma cópia colada do
   CSS em vez de JavaScript. Nada interativo funcionava (menu mobile,
   botões de WhatsApp, filtros do estoque, formulário de contato).
   Foi reescrito do zero com a lógica real.

2. **Decisão de arquitetura**: em vez de criar um painel/CMS novo pra
   o time de vendas atualizar o estoque do site, decidimos integrar
   com o `n2autosys-backend`, que já é o sistema real usado por eles.

3. **Nova rota pública no backend**: `GET /api/publico/estoque?empresa=slug`
   (arquivo `src/routes/publico.js`), **sem autenticação**, mas com
   duas travas de segurança:
   - só funciona para empresas com a coluna `vitrine_publica = TRUE`
     (adicionada em `public.empresas`, default `FALSE`)
   - só retorna campos seguros pra exibição pública (marca, modelo,
     ano, cor, km, local, grau do dano, preço de venda, fotos) —
     **nunca** `valor_compra`, `placa`, `chassi`, `renavam` ou `obs`.

4. **Tenant da N2 real**: slug `n2autosys_nickel` (o outro tenant
   existente, `autocenter_cwb`, é só teste e continua com a vitrine
   desligada).

5. **Testado de verdade**: criamos uma branch de teste no Neon,
   escrevemos `tests/integration/publico-estoque.test.js` (4 testes,
   todos passando, incluindo a checagem explícita de que nenhum campo
   sensível vaza). Rodamos a suíte completa também (15/18 — as 3
   falhas são de um teste pré-existente não relacionado, por causa de
   credencial de super admin não configurada na branch de teste).

6. **Migração rodada em produção** (Neon, branch `production`):
   coluna `vitrine_publica` criada e habilitada só para
   `n2autosys_nickel`.

7. **Backend commitado e no ar**: commit `d52f67e`, testado ao vivo
   com `curl` contra `https://n2autosys-backend.onrender.com/api/publico/estoque?empresa=n2autosys_nickel`
   — retornando os veículos reais.

8. **Site (`n2-site`) atualizado**: `index.html` (seção "Destaques") e
   `estoque.html` agora buscam os veículos direto dessa API e montam
   os cards dinamicamente via `js/script.js` — nada mais hardcoded.
   Isso inclui:
   - mapeamento do grau de dano do app pro selo do site (valores reais
     observados: `"Pequena Monta"`, `"Média Monta"` — provavelmente
     também `"Sem Monta"` e `"Grande Monta"`). Mapeamento escolhido
     pelo Eduardo: **Sem Monta → Sinistro pequeno, Pequena → Sinistro
     médio, Média → Sinistro grande, Grande → Sucata/peças**.
   - foto de capa real (Cloudinary) quando existe, ícone genérico de
     carro quando o veículo ainda não tem foto cadastrada.
   - filtros do estoque (`Todos/Pequeno/Médio/Grande/Sucata`)
     funcionando sobre os cards gerados dinamicamente.
   - estado de carregamento e mensagem amigável se a API falhar.
   - commit `7c992ef`, testado com Chrome headless + Puppeteer
     (cliques nos filtros, contagem de cards, sem erros de console).

9. **Bug pré-existente corrigido de brinde**: o selo colorido de grau
   de sinistro nunca aparecia por cima do card em nenhuma página
   (bug de empilhamento CSS, existia desde antes desta sessão). Uma
   linha de `z-index` em `.tag-grade` no `css/style.css` resolveu.

10. Os dois repositórios foram commitados e enviados (`git push`) pro
    GitHub — nada pendente localmente em nenhum dos dois.

## O que ainda falta (pendências conhecidas)

- **CORS em produção**: a variável `ALLOWED_ORIGINS` no Render (painel
  do serviço `n2autosys-backend` → Environment) ainda está no padrão
  aberto — falta travar pro domínio real do site quando ele estiver
  hospedado (hoje o Eduardo já tem o domínio, mas o site ainda não
  está publicado nele).
- **Hospedagem do `n2-site`**: ainda não decidida/configurada.
- **Número de WhatsApp e contatos**: `WHATSAPP_NUMBER` em
  `js/script.js`, e os `tel:`/`mailto:` no HTML de todas as páginas,
  ainda usam os dados placeholder (`(41) 99999-9999` /
  `contato@n2carros.com.br`) — precisam ser trocados pelos reais.
- **Textos do site**: foi montada uma lista organizada por página e
  seção (1.1 a 4.6, cobrindo `index.html`, `estoque.html`,
  `sobre.html`, `contato.html`) pro Eduardo revisar e mandar as
  mudanças de texto. Ainda não foi respondida/aplicada.
- **Render free tier "dorme"** após 15 min sem uso (~50s pra acordar
  de novo) — o site já tem loading state, mas vale considerar upgrade
  do plano do Render se isso incomodar.

## Coisas úteis de lembrar

- Testes de integração do backend exigem `DATABASE_URL_TEST` (branch
  de teste do Neon) no `.env` local — nunca rodar contra produção
  (o próprio `tests/helpers/setup.js` já bloqueia isso).
- Node.js não vinha instalado nesta máquina; foi instalado via
  `winget install OpenJS.NodeJS.LTS`.
- `.env` nunca é commitado (está no `.gitignore`) — se precisar
  recriar num ambiente novo, usar `.env.example` como base.
