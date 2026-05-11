const app = document.querySelector('#app');

const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Exchange Rates', path: '/exchange-rates' },
];

function navigate(path) {
    if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
    }

    render();
}

function renderNav() {
    return navItems
        .map((item) => {
            const active = window.location.pathname === item.path;

            return `
                <a href="${item.path}" data-link class="nav-link${active ? ' active' : ''}">
                    ${item.label}
                </a>
            `;
        })
        .join('');
}

function dashboardPage() {
    return `
        <section class="card">
            <h2>Dashboard</h2>
            <p>Welcome to your SPA dashboard in Laravel.</p>
            <p class="muted">Use the navigation in the header to switch pages.</p>
        </section>
    `;
}

function exchangeRatesPage() {
    return `
        <section class="card">
            <h2>Exchange Rates</h2>
            <p>Latest rates based on EUR.</p>
            <div id="rates-content" class="rates-loading">Loading rates...</div>
        </section>
    `;
}

function notFoundPage() {
    return `
        <section class="card">
            <h2>Page Not Found</h2>
            <p>The requested page does not exist.</p>
        </section>
    `;
}

async function loadRates() {
    const target = document.querySelector('#rates-content');
    if (!target) return;

    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,JPY,SAR');
        if (!response.ok) throw new Error('Unable to load exchange rates.');

        const data = await response.json();
        const rows = Object.entries(data.rates)
            .map(([currency, value]) => `<li><strong>${currency}</strong>: ${value}</li>`)
            .join('');

        target.innerHTML = `
            <p class="muted">Date: ${data.date}</p>
            <ul class="rates-list">${rows}</ul>
        `;
    } catch (error) {
        target.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function renderPage() {
    switch (window.location.pathname) {
        case '/':
        case '/dashboard':
            return dashboardPage();
        case '/exchange-rates':
            return exchangeRatesPage();
        default:
            return notFoundPage();
    }
}

function render() {
    if (!app) return;

    app.innerHTML = `
        <div class="page-shell">
            <header class="topbar">
                <div class="brand">Fin<span>Track</span></div>
                <nav class="nav">${renderNav()}</nav>
                <div class="user-menu">
                    <span class="user-name">Hello, amrk49</span>
                    <span class="avatar">AM</span>
                    <a href="#" class="logout">Logout</a>
                </div>
            </header>
            <main class="layout">${renderPage()}</main>
        </div>
    `;

    if (window.location.pathname === '/exchange-rates') {
        loadRates();
    }
}

document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[data-link]');
    if (!anchor) return;

    event.preventDefault();
    navigate(anchor.getAttribute('href'));
});

window.addEventListener('popstate', render);

if (window.location.pathname === '/') {
    window.history.replaceState({}, '', '/dashboard');
}

render();
