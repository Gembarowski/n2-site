const WHATSAPP_NUMBER = '5541999999999';

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

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initNavToggle();
  initStockFilters();
  initContactForm();
});
