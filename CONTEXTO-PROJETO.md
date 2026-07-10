# Contexto do projeto N2 — para retomar em outra máquina

Este arquivo resume o que foi feito numa sessão com o Claude Code, pra
poder colar/mostrar pra ele continuar do mesmo ponto em outro computador.
Atualizado pela última vez depois de colocar o site no ar em `n2.seg.br`.

## Os dois projetos envolvidos

- **`n2-site`** (este repositório) — site institucional estático
  (HTML/CSS/JS puro, sem build) da **N2 Veículos Salvados**. Só
  **vende** veículos do próprio estoque (não faz recompra do cliente
  final). Páginas: `index.html`, `estoque.html`, `sobre.html`,
  `contato.html`. Repositório: github.com/Gembarowski/n2-site
  **No ar em: https://n2.seg.br** (GitHub Pages, domínio próprio,
  HTTPS ativo).
- **`n2autosys-backend`** — backend SaaS multi-tenant (Node/Express +
  PostgreSQL no Neon + fotos no Cloudinary, deploy automático no
  Render a cada push na `main`) que o Eduardo está desenvolvendo para
  gestão de veículos batidos/sinistrados. É o sistema que o time de
  vendas usa pra cadastrar os carros de verdade — o `n2-site` puxa o
  estoque dele ao vivo. Repositório:
  github.com/Gembarowski/n2autosys-backend — URL em produção:
  https://n2autosys-backend.onrender.com

Nesta máquina os dois estão clonados lado a lado:
`c:\Projetos Edu\n2-site` e `c:\Projetos Edu\n2autosys-backend`.

## Como o estoque dinâmico funciona

- Rota pública sem autenticação: `GET /api/publico/estoque?empresa=n2autosys_nickel`
  (arquivo `src/routes/publico.js` no backend). Só funciona pra
  empresas com `vitrine_publica = TRUE` em `public.empresas` (só a
  N2 real tem; o tenant de teste `autocenter_cwb` não).
- Retorna só campos seguros pra exibição pública (marca, modelo, ano,
  cor, km, local, tipo, grau do dano, preço de venda, fotos) —
  **nunca** `valor_compra`, `placa`, `chassi`, `renavam` ou `obs`.
- `js/script.js` no site busca essa API e monta os cards
  dinamicamente em `index.html` (seção "Destaques", só os 3
  primeiros) e `estoque.html` (todos). Nada de veículo é mais
  hardcoded no HTML.
- **Selo do card** (`.tag-grade`) mostra o valor exato de
  `nivel_dano` vindo do app (`"Pequena Monta"`, `"Média Monta"`,
  etc.) — não é mais uma categoria traduzida.
- **Filtros do estoque** (`Todos/Pequeno/Médio/Grande/Sucata/Implemento`)
  usam a função `mapGrade()` em `js/script.js`, que confere primeiro o
  `tipo` do veículo (se for Implemento/carroceria/baú, cai na
  categoria "Implemento" com selo verde, independente do grau de
  dano) e só depois olha `nivel_dano` pra decidir pequeno/médio/grande.
  O mapeamento é **direto** (Pequena→pequeno, Média→médio, Grande→grande) —
  já corrigimos uma versão anterior que estava deslocada.
- Cor de fundo do selo é decidida por `grade.className`
  (`grade-pequeno`, `grade-medio`, `grade-grande`, `grade-sucata`,
  `grade-implemento`), separado do texto exibido.
- `ALLOWED_ORIGINS` no Render já está travado pra
  `https://n2.seg.br,https://www.n2.seg.br` + localhost pra testes
  locais (não é mais `*` aberto).

## Contato real do site

- Telefone/WhatsApp: `(41) 99679-4080` (constante `WHATSAPP_NUMBER`
  em `js/script.js`, e nos `tel:`/`mailto:` do HTML).
- E-mail: `n2veiculos@gmail.com`
- O botão "Falar no WhatsApp" do header (todas as páginas) é só ícone
  (círculo verde), sem texto — antes o texto ficava escondido no
  mobile via CSS e sobrava um botão verde vazio.

## Modelo de negócio (importante pra qualquer texto novo)

A N2 **só vende** veículos do próprio estoque — não compra/recompra
carro batido de cliente final. Toda a linguagem do site foi revisada
pra refletir isso (hero, "como funciona", Sobre, formulário de
contato). O único lugar que ainda fala em "compra" é a timeline da
página Sobre (2017: "Primeiras compras... de seguradoras parceiras")
— isso ficou de propósito, é sobre fornecimento/aquisição de estoque
via seguradoras/leilão, não recompra de cliente.

## Hospedagem e deploy

- **`n2-site`**: GitHub Pages, direto do branch `main`, domínio
  customizado `n2.seg.br` (arquivo `CNAME` no repo). DNS configurado
  no Registro.br (4 registros A pro GitHub Pages + CNAME de `www`).
  HTTPS com certificado automático do GitHub, "Enforce HTTPS" ativo.
  **Deploy é automático a cada `git push origin main`** (~1 min).
- **`n2autosys-backend`**: Render.com, deploy automático a cada push
  na `main` (~30-60s). Plano free — "dorme" depois de 15 min sem uso
  (~50s pra acordar no primeiro acesso depois disso).
- **Cache-busting**: os links de `css/style.css` e `js/script.js` em
  todas as páginas usam `?v=2` no final. **Sempre que alterar
  `style.css` ou `script.js`, incrementar esse número** (`?v=3`,
  `?v=4`...) nos 4 HTMLs — sem isso, navegadores (principalmente
  celular) podem continuar servindo a versão antiga em cache mesmo
  depois do deploy, o que já causou confusão mais de uma vez.

## Coisas úteis de lembrar

- Testes de integração do backend exigem `DATABASE_URL_TEST` (branch
  de teste do Neon) no `.env` local — nunca rodar contra produção
  (o próprio `tests/helpers/setup.js` já bloqueia isso).
- Node.js não vinha instalado nesta máquina; foi instalado via
  `winget install OpenJS.NodeJS.LTS`.
- `.env` nunca é commitado (está no `.gitignore`) — se precisar
  recriar num ambiente novo, usar `.env.example` como base.
- Pra testar mudanças de HTML/CSS/JS localmente antes de subir, sobe
  um servidor estático simples com Node (não precisa de build) e usa
  Chrome headless (`--headless=new`) pra tirar screenshot ou o
  `puppeteer-core` (apontando pro Chrome já instalado, sem precisar
  baixar navegador extra) pra testar clique em filtro/botão de verdade.

## Pendências conhecidas

- Nenhuma bloqueante no momento. Possíveis próximos passos: revisar
  textos que ainda não foram tocados (ex: horário de atendimento,
  endereço exato), adicionar mais categorias de filtro se surgirem
  novos tipos de veículo, considerar upgrade do plano Render se o
  "dormir" incomodar.
