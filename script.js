// ---------- Dados (troque por uma chamada de API real) ----------
const accounts = [
  { label: "Cliente · Emilly Máximo Quintiliano", balance: 7853.0, currency: "BRL", locale: "pt-BR", symbol: "R$" },
  { label: "Conta poupança · BRL", balance: 1250.0, currency: "BRL", locale: "pt-BR", symbol: "R$" },
  { label: "Conta dólar · USD", balance: 42.1, currency: "USD", locale: "en-US", symbol: "US$" },
  { label: "Conta euro · EUR", balance: 0, currency: "EUR", locale: "de-DE", symbol: "€" },
  { label: "Cofrinho · BRL", balance: 320.55, currency: "BRL", locale: "pt-BR", symbol: "R$" },
];

const transactions = [
  { id: 1, title: "Pão de Açúcar Morumbi", sub: "29/09 • Supermercado", value: -248.6, icon: "cart", green: true },
  { id: 2, title: "McDonald's Aricanduva", sub: "30/09 • Manhã", value: -76.9, icon: "cart", green: true },
  { id: 3, title: "Transferência Pix", sub: "Ontem, 18:20", value: 120.0, icon: "pix" },
  { id: 4, title: "Café da Esquina", sub: "Ontem, 08:12", value: -14.5, icon: "cart", green: true },
];

const icons = {
  gem: '<svg viewBox="0 0 24 24" class="fill"><path d="M12 2 3 9l9 13 9-13z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" class="fill"><path d="M4 9h16l-1.6 10a2 2 0 0 1-2 1.7H7.6a2 2 0 0 1-2-1.7zM8 9l3-5h2l3 5z"/></svg>',
  pix: '<svg viewBox="0 0 24 24"><path d="m12 3 4 4-4 4-4-4zM12 13l4 4-4 4-4-4z"/></svg>',
};

const tabContent = {
  Home: {
    label: "Visão geral",
    badge: "Hoje",
    title: "Sua conta está saudável",
    desc: "Você está com saldo disponível e movimentações recentes dentro do esperado para o mês.",
    stats: [
      { label: "Receitas", value: "R$ 1.420" },
      { label: "Gastos", value: "R$ 324" },
      { label: "Investido", value: "R$ 2.100" },
      { label: "Pontos", value: "1.280" }
    ]
  },
  Investir: {
    label: "Investimentos",
    badge: "Portfolio",
    title: "Você pode crescer mais",
    desc: "Seu portfólio está diversificado com foco em renda fixa e fundos de baixo risco.",
    stats: [
      { label: "Rentabilidade", value: "+4,2%" },
      { label: "Aplicado", value: "R$ 5.300" },
      { label: "Meta", value: "R$ 8.000" },
      { label: "Prazo", value: "12 meses" }
    ]
  },
  Pagar: {
    label: "Pagamentos",
    badge: "A pagar",
    title: "Contas em dia",
    desc: "Você ainda tem pagamentos pendentes, mas a maior parte está organizada e sem atraso.",
    stats: [
      { label: "Vencem hoje", value: "R$ 680" },
      { label: "Agendados", value: "3" },
      { label: "Boleto", value: "R$ 210" },
      { label: "Pix", value: "R$ 90" }
    ]
  },
  Cripto: {
    label: "Cripto",
    badge: "Mercado",
    title: "Carteira digital ativa",
    desc: "Sua carteira de cripto está equilibrada com exposição moderada em ativos digitais.",
    stats: [
      { label: "BTC", value: "0,12" },
      { label: "ETH", value: "1,8" },
      { label: "Lucro", value: "+12,4%" },
      { label: "Valor", value: "R$ 14.000" }
    ]
  },
  Pontos: {
    label: "Benefícios",
    badge: "Club",
    title: "Você está acumulando pontos",
    desc: "Você vem aproveitando cashback e benefícios com bons índices de resgate para o mês.",
    stats: [
      { label: "Pontos", value: "1.280" },
      { label: "Cashback", value: "R$ 240" },
      { label: "Resgates", value: "2" },
      { label: "Próximo", value: "R$ 50" }
    ]
  }
};

// ---------- Estado ----------
const state = { current: 0, hidden: false, query: "" };

// ---------- Elementos ----------
const $ = (id) => document.getElementById(id);
const amountEl = $("amount");
const labelEl = $("accountLabel");
const dotsEl = $("dots");
const listEl = $("txList");
const emptyEl = $("empty");
const toastEl = $("toast");
const accountDetailsEl = $("accountDetails");
const detailBalanceEl = $("detailBalance");
const accountDetailsTitleEl = $("accountDetailsTitle");
const toggleBalanceDetailEl = $("toggleBalanceDetail");
const closeAccountDetailsEl = $("closeAccountDetails");
const tabPanelEl = $("tabPanel");

// ---------- Formatação ----------
const money = (value, { locale, currency }) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(Math.abs(value));

// Divide "R$ 8,43" em parte inteira + centavos (para o estilo do design)
function splitBalance(acc) {
  const parts = new Intl.NumberFormat(acc.locale, { style: "currency", currency: acc.currency }).formatToParts(acc.balance);
  const dec = parts.find((p) => p.type === "decimal")?.value ?? ",";
  const frac = parts.find((p) => p.type === "fraction")?.value ?? "00";
  const main = parts.filter((p) => !["decimal", "fraction"].includes(p.type)).map((p) => p.value).join("");
  return { main, cents: dec + frac };
}

// ---------- Render ----------
function renderBalance() {
  const acc = accounts[state.current];
  labelEl.textContent = acc.label;
  const visibleBalance = state.hidden ? `${acc.symbol} ••••` : `${splitBalance(acc).main}<small>${splitBalance(acc).cents}</small>`;
  amountEl.innerHTML = visibleBalance;
  detailBalanceEl.textContent = state.hidden ? `${acc.symbol} ••••` : new Intl.NumberFormat(acc.locale, { style: "currency", currency: acc.currency }).format(acc.balance);
  accountDetailsTitleEl.textContent = acc.label.replace("Cliente · ", "");
  toggleBalanceDetailEl.textContent = state.hidden ? "Mostrar saldo" : "Ocultar saldo";
  amountEl.setAttribute("aria-pressed", String(state.hidden));
  [...dotsEl.children].forEach((d, i) => d.setAttribute("aria-selected", String(i === state.current)));
}

function renderDots() {
  dotsEl.innerHTML = accounts
    .map((a, i) => `<button role="tab" aria-label="${a.label}" data-i="${i}"></button>`)
    .join("");
}

function renderTransactions() {
  const q = state.query.trim().toLowerCase();
  const items = transactions.filter((t) => t.title.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q));
  listEl.innerHTML = items
    .map((t) => {
      const brl = { locale: "pt-BR", currency: "BRL" };
      const sign = t.value < 0 ? "-" : "+";
      return `<li class="tx" data-title="${t.title}" tabindex="0">
        <div class="ico ${t.green ? "green" : ""}">${icons[t.icon]}</div>
        <div class="info"><strong>${t.title}</strong><span>${t.sub}</span></div>
        <div class="val">${sign}${money(t.value, brl)}</div>
      </li>`;
    })
    .join("");
  emptyEl.hidden = items.length > 0;
}

function renderTabPanel(tabName = "Home") {
  const panel = tabContent[tabName] || tabContent.Home;
  tabPanelEl.innerHTML = `
    <div class="tab-panel__header">
      <span class="tab-panel__label">${panel.label}</span>
      <span class="tab-panel__pill">${panel.badge}</span>
    </div>
    <div class="tab-panel__content">
      <h3>${panel.title}</h3>
      <p>${panel.desc}</p>
      <div class="tab-panel__stats">
        ${panel.stats.map((item) => `<div><span>${item.label}</span><strong>${item.value}</strong></div>`).join("")}
      </div>
    </div>
  `;
}

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// ---------- Eventos ----------
amountEl.addEventListener("click", () => {
  state.hidden = !state.hidden;
  renderBalance();
  accountDetailsEl.classList.remove("hidden");
});

labelEl.addEventListener("click", () => {
  accountDetailsEl.classList.toggle("hidden");
});

closeAccountDetailsEl.addEventListener("click", () => {
  accountDetailsEl.classList.add("hidden");
});

toggleBalanceDetailEl.addEventListener("click", () => {
  state.hidden = !state.hidden;
  renderBalance();
});

dotsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-i]");
  if (!btn) return;
  state.current = Number(btn.dataset.i);
  renderBalance();
});

$("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  renderTransactions();
});

$("closePromo").addEventListener("click", () => $("promo").remove());

$("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  [...$("tabs").children].forEach((b) => {
    b.classList.toggle("on", b === btn);
    b.toggleAttribute("aria-current", b === btn);
  });

  const tabName = btn.textContent.trim();
  renderTabPanel(tabName);
  toast(`${tabName} selecionado`);
});

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-toast]");
  if (el) toast(el.dataset.toast);

  const tx = e.target.closest(".tx");
  if (tx) toast(`${tx.dataset.title} selecionado`);
});

listEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const tx = e.target.closest(".tx");
    if (tx) {
      e.preventDefault();
      toast(`${tx.dataset.title} selecionado`);
    }
  }
});

// ---------- Início ----------
renderDots();
renderBalance();
renderTransactions();
renderTabPanel("Home");
accountDetailsEl.classList.add("hidden");
