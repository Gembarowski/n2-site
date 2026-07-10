const WHATSAPP_NUMBER = '5541996794080';
const ESTOQUE_API = 'https://n2autosys-backend.onrender.com/api/publico/estoque?empresa=n2autosys_nickel';

function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function initWhatsAppLinks() {
  document.querySelectorAll('[data-wa]').forEach((el) => {
    el.setAttribute('href', buildWhatsAppLink(el.getAttribute('data-wa')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initStockFilters() {
  const buttons = document.querySelectorAll('.filter-btn[data-filter]');
  const cards = document.querySelectorAll('.tag-card[data-grade]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      cards.forEach((card) => {
        const matches = filter === 'todos' || card.getAttribute('data-grade') === filter;
        card.style.display = matches ? '' : 'none';
      });
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = document.getElementById('f-nome').value.trim();
    const assunto = document.getElementById('f-assunto').value;
    const veiculo = document.getElementById('f-veiculo').value.trim();
    const mensagem = document.getElementById('f-mensagem').value.trim();

    const linhas = [
      `Olá! Meu nome é ${nome}.`,
      `Assunto: ${assunto}`,
    ];
    if (veiculo) linhas.push(`Veículo: ${veiculo}`);
    linhas.push(mensagem);

    window.open(buildWhatsAppLink(linhas.join('\n')), '_blank', 'noopener');
  });
}

// ── Estoque dinâmico (dados reais vindos do N2 AutoSYS) ─────────────

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function mapGrade(nivelDano) {
  const v = (nivelDano || '').toLowerCase();
  if (v.includes('grande')) return { key: 'sucata', className: 'grade-sucata', label: 'Sucata / peças' };
  if (v.includes('média') || v.includes('media')) return { key: 'grande', className: 'grade-grande', label: 'Sinistro grande' };
  if (v.includes('pequena')) return { key: 'medio', className: 'grade-medio', label: 'Sinistro médio' };
  return { key: 'pequeno', className: 'grade-pequeno', label: 'Sinistro pequeno' };
}

function formatPrice(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 'Sob consulta';
  return `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

const PLACEHOLDER_CAR_SVG = `
  <svg viewBox="0 0 64 64" fill="none" stroke="#f7f4ec" stroke-width="2.2">
    <path d="M6 40 L10 26 Q12 22 17 22 L47 22 Q52 22 54 26 L58 40" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 22 L19 12 Q20.5 10 23 10 L41 10 Q43.5 10 45 12 L50 22" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="4" y="40" width="56" height="10" rx="3"/>
    <circle cx="16" cy="52" r="5"/><circle cx="48" cy="52" r="5"/>
  </svg>
`;

function renderVehicleCard(veiculo) {
  const grade = mapGrade(veiculo.nivel_dano);
  const foto = Array.isArray(veiculo.fotos) ? veiculo.fotos[0] : null;
  const codigo = String(veiculo.id || '').slice(0, 8).toUpperCase();
  const nomeVeiculo = `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim();
  const waMsg = `Olá! Tenho interesse no ${nomeVeiculo} ${veiculo.ano || ''} - Cód. ${codigo}.`.replace(/\s+/g, ' ').trim();

  const media = foto
    ? `<img src="${escapeHtml(foto)}" alt="${escapeHtml(nomeVeiculo)}" loading="lazy">`
    : PLACEHOLDER_CAR_SVG;

  return `
    <div class="tag-card" data-grade="${grade.key}">
      <div class="tag-punch"></div>
      <div class="tag-grade ${grade.className}">${escapeHtml(veiculo.nivel_dano || grade.label)}</div>
      <div class="tag-media">${media}</div>
      <div class="tag-body">
        <div class="tag-model">${escapeHtml(nomeVeiculo)}</div>
        <div class="tag-year">${escapeHtml(veiculo.ano || '—')}${veiculo.cor ? ' · ' + escapeHtml(veiculo.cor) : ''}</div>
        <div class="tag-specs">
          <div>Km <b>${escapeHtml(veiculo.km || '—')}</b></div>
          <div>Local <b>${escapeHtml(veiculo.local_patio || 'Curitiba/PR')}</b></div>
          <div>Tipo <b>${escapeHtml(veiculo.tipo || '—')}</b></div>
          <div>Cód. <b>${codigo}</b></div>
        </div>
        <div class="tag-price-row">
          <div class="tag-price">${formatPrice(veiculo.valor_venda)}<span>à vista</span></div>
          <a href="#" class="tag-link" data-wa="${escapeHtml(waMsg)}">Tenho interesse</a>
        </div>
      </div>
    </div>
  `;
}

async function fetchEstoque() {
  const resp = await fetch(ESTOQUE_API);
  if (!resp.ok) throw new Error(`Estoque respondeu ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data.veiculos) ? data.veiculos : [];
}

function renderGrid(container, veiculos) {
  if (!veiculos.length) {
    container.innerHTML = '<p style="color:var(--steel);grid-column:1/-1;">Nenhum veículo disponível no momento — fale com a gente pelo WhatsApp.</p>';
    return;
  }
  container.innerHTML = veiculos.map(renderVehicleCard).join('');
}

async function initEstoqueDinamico() {
  const destaque = document.getElementById('tag-grid-destaque');
  const completo = document.getElementById('tag-grid-estoque');
  if (!destaque && !completo) return;

  try {
    const veiculos = await fetchEstoque();
    if (destaque) renderGrid(destaque, veiculos.slice(0, 3));
    if (completo) renderGrid(completo, veiculos);
    initWhatsAppLinks();
    if (completo) initStockFilters();
  } catch (err) {
    const mensagemErro = '<p style="color:var(--steel);grid-column:1/-1;">Não foi possível carregar o estoque agora. Tente recarregar a página ou fale com a gente pelo WhatsApp.</p>';
    if (destaque) destaque.innerHTML = mensagemErro;
    if (completo) completo.innerHTML = mensagemErro;
    console.error('[Estoque]', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initNavToggle();
  initContactForm();
  initEstoqueDinamico();
});
