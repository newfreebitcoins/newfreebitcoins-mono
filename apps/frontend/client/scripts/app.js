import { getAppConfig } from "./api.js";
import { formatCoinAmount } from "./consts.js";

const ICON_SVGS = {
  menu:
    '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216A8,8,0,0,0,216,184Z"></path></svg>',
  info:
    '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path></svg>',
  home:
    '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M218.83,103.77l-80-75.48a15.91,15.91,0,0,0-21.91,0l-80,75.48A16,16,0,0,0,32,115.43V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.43A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.43l80-75.48,80,75.48Z"></path></svg>'
};

const initializerLoaders = {
  donate: async () =>
    (await import("./generated/donate.bundle.js")).initDonatePage,
  index: async () => (await import("./pages/index.js")).initIndexPage,
  "faucet-request": async () =>
    (await import("./pages/faucet-request.js")).initFaucetRequestPage,
  "recent-sends": async () =>
    (await import("./pages/recent-sends.js")).initRecentSendsPage,
  stats: async () =>
    (await import("./pages/stats.js")).initStatsPage,
  "active-wallets": async () =>
    (await import("./pages/stats.js")).initStatsPage,
  "pending-requests": async () =>
    (await import("./pages/pending-requests.js")).initPendingRequestsPage
};

async function hydrateSharedUi() {
  const result = await getAppConfig();

  if (!result.ok) {
    return;
  }

  window.__APP_CONFIG__ = result.data;

  const totalBtc = result.data?.faucet?.totalBtc ?? "0";
  const nodes = document.querySelectorAll("[data-total-btc]");

  for (const node of nodes) {
    node.textContent = `${formatCoinAmount(totalBtc)} available`;
  }
}

function ensureGlobalRefreshStyles() {
  if (document.getElementById("global-request-refresh-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "global-request-refresh-styles";
  style.textContent = `
    .request-note-icon svg,
    .mobile-nav-toggle svg,
    .mobile-nav-home-icon svg {
      width: 14px;
      height: 14px;
      display: block;
      fill: currentColor;
    }

    .mobile-nav-toggle {
      display: none;
    }

    .mobile-nav-home-link,
    .mobile-nav-home-icon {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 900px) {
      .mobile-nav {
        display: block !important;
        padding: 0 !important;
      }

      .mobile-nav-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 14px;
      }

      .mobile-nav-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .mobile-nav .btc-available {
        margin: 0;
      }

      .mobile-nav-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        margin: 0;
        border: 1px solid silver;
        background: #fff;
        color: #575757;
        cursor: pointer;
      }

      .mobile-nav .nav-left.mobile-nav-panel {
        display: none !important;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        padding: 0 14px 12px;
        border-top: 1px solid #e2e2e2;
      }

      .mobile-nav.is-open .nav-left.mobile-nav-panel {
        display: flex !important;
      }

      .mobile-nav .nav-left.mobile-nav-panel a {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 0;
        text-decoration: none;
      }
    }
  `;

  document.head.appendChild(style);
}

function enhanceRequestNoteIcons() {
  const icons = document.querySelectorAll(".request-note-icon");

  for (const icon of icons) {
    icon.innerHTML = ICON_SVGS.info;
  }
}

function enhanceMobileNavs() {
  const mobileNavs = document.querySelectorAll(".mobile-nav");

  for (const nav of mobileNavs) {
    if (nav.dataset.enhanced === "true") {
      continue;
    }

    const faucet = nav.querySelector(".mobile-faucet");
    const panel = nav.querySelector(".nav-left");
    const totalBtc = nav.querySelector("[data-total-btc]");

    if (!panel || !totalBtc) {
      continue;
    }

    panel.classList.add("mobile-nav-panel");

    if (!panel.querySelector('[data-mobile-home-link="true"]')) {
      const homeLink = document.createElement("a");
      const homeIcon = document.createElement("span");
      const homeText = document.createElement("span");

      homeLink.href = "/";
      homeLink.dataset.mobileHomeLink = "true";
      homeLink.className = "mobile-nav-home-link";
      homeIcon.className = "mobile-nav-home-icon";
      homeIcon.innerHTML = ICON_SVGS.home;
      homeText.textContent = "Homepage";
      homeLink.append(homeIcon, homeText);
      panel.insertBefore(homeLink, panel.firstChild);
    }

    const top = document.createElement("div");
    const brand = document.createElement("div");
    const toggle = document.createElement("button");

    top.className = "mobile-nav-top";
    brand.className = "mobile-nav-brand";
    toggle.className = "mobile-nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = ICON_SVGS.menu;

    if (faucet) {
      brand.appendChild(faucet);
    }

    brand.appendChild(totalBtc);
    top.append(brand, toggle);

    nav.insertBefore(top, panel);

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    for (const link of panel.querySelectorAll("a")) {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }

    nav.dataset.enhanced = "true";
  }
}


async function initPage() {
  const page = document.body.dataset.page;
  const loadInitializer = initializerLoaders[page];

  await hydrateSharedUi();
  ensureGlobalRefreshStyles();
  enhanceRequestNoteIcons();
  enhanceMobileNavs();

  if (!loadInitializer) {
    return;
  }

  const initialize = await loadInitializer();
  await initialize();
}

void initPage();
