const app = document.querySelector('#app');
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
const currentUserName = app?.dataset.userName || 'User';

const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Exchange Rates', path: '/exchange-rates' },
];

const state = {
    transactions: [],
    editingId: null,
};
let chart = null;

function formatEGP(value) {
    return `${Number(value).toFixed(2)} EGP`;
}

function renderIncomeExpenseChart() {
    return `
        <article class="card chart-card">
            <h2>Income vs Expense</h2>
            <div class="chart-wrap">
                <canvas id="financeChart"></canvas>
            </div>
        </article>
    `;
}

function renderChart(income, expense) {
    const canvas = document.getElementById('financeChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (chart) {
        chart.destroy();
    }

    const incomeValue = Number(income) || 0;
    const expenseValue = Number(expense) || 0;
    const isEmpty = incomeValue === 0 && expenseValue === 0;

    chart = new Chart(canvas, {
        type: 'doughnut',
        data: isEmpty
            ? {
                  labels: ['No Data'],
                  datasets: [{ data: [1], backgroundColor: ['#ddd'] }],
              }
            : {
                  labels: ['Income', 'Expense'],
                  datasets: [{ data: [incomeValue, expenseValue], backgroundColor: ['#2ecc71', '#e74c3c'] }],
              },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: isEmpty
                    ? { display: false }
                    : {
                          position: 'bottom',
                      },
            },
        },
    });
}

async function requestJson(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = {
        Accept: 'application/json',
        ...options.headers,
    };

    if (method !== 'GET' && method !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
        headers['X-CSRF-TOKEN'] = csrfToken;
    }

    const response = await fetch(url, {
        headers,
        ...options,
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        const message = data?.message || 'Request failed.';
        throw new Error(message);
    }

    return data;
}

async function navigate(path) {
    if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
    }

    if (path === '/dashboard') {
        await loadTransactions();
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
    const income = state.transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0);
    const expense = state.transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0);
    const balance = income - expense;

    return `
        <section class="stats-grid">
            <article class="stat-card stat-card-balance">
                <h3>Total Balance</h3>
                <p>${formatEGP(balance)}</p>
            </article>
            <article class="stat-card">
                <h3>Income</h3>
                <p class="income">${formatEGP(income)}</p>
            </article>
            <article class="stat-card">
                <h3>Expense</h3>
                <p class="expense">${formatEGP(expense)}</p>
            </article>
        </section>

        <section class="dashboard-grid">
            <div class="dashboard-left">
                <article class="card">
                    <h2>${state.editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <form id="transaction-form" class="form-grid">
                        <input name="title" placeholder="Title" required />
                        <input name="amount" placeholder="Amount" type="number" min="0" step="0.01" required />
                        <select name="type" required>
                            <option value="">Select Type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <input name="category" placeholder="Category" />
                        <input name="date" type="date" required />
                        <div class="form-actions">
                            <button class="btn btn-primary" type="submit">${state.editingId ? 'Update' : 'Add'} Transaction</button>
                            ${state.editingId ? '<button class="btn btn-secondary" type="button" id="cancel-edit">Cancel</button>' : ''}
                        </div>
                    </form>
                    <p id="form-message" class="muted"></p>
                </article>
                ${renderIncomeExpenseChart(income, expense)}
            </div>

            <article class="card">
                <h2>Transactions</h2>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                state.transactions.length
                                    ? state.transactions
                                          .map(
                                              (item) => `
                                    <tr>
                                        <td>${item.title}</td>
                                        <td>${formatEGP(item.amount)}</td>
                                        <td class="${item.type === 'income' ? 'income' : 'expense'}">${item.type}</td>
                                        <td>${item.category || '-'}</td>
                                        <td>${item.date}</td>
                                        <td class="table-actions">
                                            <button class="btn-icon" data-edit-id="${item.id}" title="Edit">Edit</button>
                                            <button class="btn-icon danger" data-delete-id="${item.id}" title="Delete">Delete</button>
                                        </td>
                                    </tr>
                                `
                                          )
                                          .join('')
                                    : '<tr><td colspan="6" class="muted">No transactions yet.</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </article>
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
                    <span class="user-name">Hello, ${currentUserName}</span>
                    <span class="avatar">${currentUserName.slice(0, 2).toUpperCase()}</span>
                    <form method="POST" action="/logout" class="logout-form">
                        <input type="hidden" name="_token" value="${csrfToken}">
                        <button type="submit" class="logout">Logout</button>
                    </form>
                </div>
            </header>
            <main class="layout">${renderPage()}</main>
        </div>
    `;

    if (window.location.pathname === '/exchange-rates') {
        loadRates();
    }

    if (window.location.pathname === '/dashboard') {
        bindDashboardEvents();
        const income = state.transactions
            .filter((item) => item.type === 'income')
            .reduce((sum, item) => sum + Number(item.amount), 0);
        const expense = state.transactions
            .filter((item) => item.type === 'expense')
            .reduce((sum, item) => sum + Number(item.amount), 0);
        renderChart(income, expense);
    } else if (chart) {
        chart.destroy();
        chart = null;
    }
}

function fillFormFromTransaction(transaction) {
    const form = document.querySelector('#transaction-form');
    if (!form) return;

    form.elements.title.value = transaction.title || '';
    form.elements.amount.value = transaction.amount || '';
    form.elements.type.value = transaction.type || '';
    form.elements.category.value = transaction.category || '';
    form.elements.date.value = transaction.date || '';
}

async function loadTransactions() {
    try {
        state.transactions = await requestJson('/transactions');
    } catch (error) {
        state.transactions = [];
        console.error(error);
    }
}

async function submitTransaction(form) {
    const payload = {
        title: form.elements.title.value.trim(),
        amount: Number(form.elements.amount.value),
        type: form.elements.type.value,
        category: form.elements.category.value.trim() || null,
        date: form.elements.date.value,
    };

    if (state.editingId) {
        await requestJson(`/transactions/${state.editingId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    } else {
        await requestJson('/transactions', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
}

function bindDashboardEvents() {
    const form = document.querySelector('#transaction-form');
    if (!form) return;

    if (state.editingId) {
        const current = state.transactions.find((item) => item.id === state.editingId);
        if (current) fillFormFromTransaction(current);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const messageEl = document.querySelector('#form-message');

        try {
            await submitTransaction(form);
            state.editingId = null;
            await loadTransactions();
            render();
        } catch (error) {
            if (messageEl) messageEl.textContent = error.message;
        }
    });

    const cancelButton = document.querySelector('#cancel-edit');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            state.editingId = null;
            render();
        });
    }

    document.querySelectorAll('[data-edit-id]').forEach((button) => {
        button.addEventListener('click', () => {
            state.editingId = Number(button.getAttribute('data-edit-id'));
            render();
        });
    });

    document.querySelectorAll('[data-delete-id]').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = Number(button.getAttribute('data-delete-id'));
            const ok = window.confirm('Delete this transaction?');
            if (!ok) return;

            await requestJson(`/transactions/${id}`, { method: 'DELETE' });

            if (state.editingId === id) state.editingId = null;
            await loadTransactions();
            render();
        });
    });
}

document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[data-link]');
    if (!anchor) return;

    event.preventDefault();
    navigate(anchor.getAttribute('href'));
});

window.addEventListener('popstate', async () => {
    await loadTransactions();
    render();
});

async function boot() {
    if (window.location.pathname === '/') {
        window.history.replaceState({}, '', '/dashboard');
    }

    await loadTransactions();
    render();
}

boot();
