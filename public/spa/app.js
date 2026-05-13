const app = document.querySelector('#app');
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
let currentUserName = app?.dataset.userName || 'User';
let currentUserEmail = app?.dataset.userEmail || '';
let currentUserPhotoUrl = app?.dataset.userPhotoUrl || '';

const state = {
    transactions: [],
    editingId: null,
    isProfileModalOpen: false,
    exchangeRates: null,
    exchangeDate: '',
    exchangePromise: null,
    conversionCurrencyById: {},
};
let chart = null;
const supportedCurrencies = [
    { code: 'USD', symbol: '$', key: 'usd' },
    { code: 'EUR', symbol: '€', key: 'eur' },
    { code: 'GBP', symbol: '£', key: 'gbp' },
    { code: 'SAR', symbol: 'ر.س', key: 'sar' },
    { code: 'AED', symbol: 'د.إ', key: 'aed' },
];

function formatEGP(value) {
    return `${Number(value).toFixed(2)} EGP`;
}

function formatRateDate(rawDate) {
    return new Date(rawDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function getRateByCode(code) {
    if (!state.exchangeRates) return null;

    const key = code.toLowerCase();
    return state.exchangeRates[key] ?? null;
}

function convertFromEGP(amount, code) {
    const rate = getRateByCode(code);
    if (!rate) return '--';

    return `${(Number(amount) * Number(rate)).toFixed(2)} ${code}`;
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

function renderAvatar() {
    if (currentUserPhotoUrl) {
        return `<img src="${currentUserPhotoUrl}" alt="Profile" class="avatar-image">`;
    }

    return `<span class="avatar-text">${currentUserName.slice(0, 2).toUpperCase()}</span>`;
}

function renderProfileModal() {
    if (!state.isProfileModalOpen) {
        return '';
    }

    return `
        <div class="modal-backdrop" id="profile-modal-backdrop">
            <div class="modal-card">
                <h3>Edit Profile</h3>
                <form id="profile-form" class="form-grid">
                    <input name="name" value="${currentUserName}" placeholder="Name" required />
                    <input name="email" type="email" value="${currentUserEmail}" placeholder="Email" required />
                    <label class="file-label">Profile Picture</label>
                    <input name="profile_photo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" />
                    <p class="muted small">Allowed: JPG, PNG, WEBP. Max size: 2MB.</p>
                    <p id="profile-message" class="error"></p>
                    <div class="form-actions modal-actions">
                        <button class="btn btn-secondary" type="button" id="profile-cancel">Cancel</button>
                        <button class="btn btn-primary" type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function updateProfile(form) {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const file = form.elements.profile_photo.files?.[0];

    if (!name || !email) {
        throw new Error('Name and email are required.');
    }

    if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address.');
    }

    if (file) {
        validateProfileFile(file);
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (file) formData.append('profile_photo', file);

    const response = await fetch('/profile', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        if (data?.errors && typeof data.errors === 'object') {
            const messages = Object.values(data.errors).flat();
            const first = messages.find((m) => typeof m === 'string' && m.length);
            throw new Error(first || data.message || 'Please check the form and try again.');
        }
        throw new Error(data?.message || 'Failed to update profile.');
    }

    currentUserName = data.name;
    currentUserEmail = data.email;
    currentUserPhotoUrl = data.photo_url || '';
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
        if (data?.errors && typeof data.errors === 'object') {
            const messages = Object.values(data.errors).flat();
            const first = messages.find((m) => typeof m === 'string' && m.length);
            throw new Error(first || data.message || 'Please check the form and try again.');
        }
        const message = data?.message || 'Request failed.';
        throw new Error(message);
    }

    return data;
}

function fetchExchangeDataFromServer() {
    return fetch('/exchange-rates/data', {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message =
                typeof data?.message === 'string' && data.message.length > 0
                    ? data.message
                    : 'Unable to load exchange rates at this time.';
            throw new Error(message);
        }

        return data;
    });
}

function renderExchangeRatesIntoPage() {
    const container = document.getElementById('currency-container');
    const updated = document.getElementById('last-updated');
    if (!container || !updated) return;

    if (!state.exchangeRates) {
        container.innerHTML = `
            <div class="col-span-all muted">
                Loading exchange rates...
            </div>
        `;
        updated.innerText = '';
        return;
    }

    const cards = supportedCurrencies
        .map((currency) => {
            const rate = state.exchangeRates[currency.key];
            const inverseRate = rate ? (1 / Number(rate)).toFixed(2) : '--';

            return `
                <div class="rate-card">
                    <div class="rate-card-head">
                        <span>${currency.code} / EGP</span>
                        <span class="rate-symbol">${currency.symbol}</span>
                    </div>
                    <div class="rate-value">${inverseRate} <span class="rate-unit">EGP</span></div>
                </div>
            `;
        })
        .join('');

    container.innerHTML = cards;
    updated.innerText = state.exchangeDate ? `Last updated: ${state.exchangeDate}` : '';
}

function initExchangeRates() {
    if (state.exchangePromise) {
        return state.exchangePromise;
    }

    state.exchangePromise = fetchExchangeDataFromServer()
        .then((data) => {
            state.exchangeRates = data.egp || null;
            state.exchangeDate = data.date ? formatRateDate(data.date) : '';
            renderExchangeRatesIntoPage();
            state.exchangePromise = null;
        })
        .catch((error) => {
            console.error('Error fetching currency data:', error);
            const container = document.getElementById('currency-container');
            const updated = document.getElementById('last-updated');
            if (container) {
                container.replaceChildren();
                const row = document.createElement('div');
                row.className = 'col-span-all error';
                row.textContent = error.message || 'Unable to load exchange rates at this time.';
                container.appendChild(row);
            }
            if (updated) updated.innerText = '';
            state.exchangePromise = null;
        });

    return state.exchangePromise;
}

async function navigate(path) {
    if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
    }

    if (path === '/dashboard') {
        await loadTransactions();
        await initExchangeRates();
    }

    if (path === '/exchange-rates') {
        await initExchangeRates();
    }

    render();
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
                                <th>Converted</th>
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
                                        <td>
                                            <div class="convert-box">
                                                <select class="convert-select" data-convert-id="${item.id}">
                                                    ${supportedCurrencies
                                                        .map((currency) => {
                                                            const selected =
                                                                (state.conversionCurrencyById[item.id] || 'USD') === currency.code
                                                                    ? 'selected'
                                                                    : '';
                                                            return `<option value="${currency.code}" ${selected}>${currency.code}</option>`;
                                                        })
                                                        .join('')}
                                                </select>
                                                <span class="converted-value">${convertFromEGP(
                                                    item.amount,
                                                    state.conversionCurrencyById[item.id] || 'USD'
                                                )}</span>
                                            </div>
                                        </td>
                                        <td class="table-actions">
                                            <button class="btn-icon" data-edit-id="${item.id}" title="Edit">Edit</button>
                                            <button class="btn-icon danger" data-delete-id="${item.id}" title="Delete">Delete</button>
                                        </td>
                                    </tr>
                                `
                                          )
                                          .join('')
                                    : '<tr><td colspan="7" class="muted">No transactions yet.</td></tr>'
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
            <p class="muted">Live Exchange Rates (Base: EGP)</p>
            <div id="currency-container" class="rates-grid">
                <div class="col-span-all muted">Loading rates...</div>
            </div>
            <p id="last-updated" class="muted"></p>
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

function updateNavActive() {
    const path = window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
    document.querySelectorAll('a.nav-link[data-link]').forEach((anchor) => {
        const href = anchor.getAttribute('href') || '';
        const active = href === path;
        anchor.classList.toggle('active', active);
    });
}

function updateHeaderUserLabels() {
    const nameEl = document.querySelector('.user-menu .user-name');
    if (nameEl) {
        nameEl.textContent = `Hello, ${currentUserName}`;
    }

    const trigger = document.querySelector('#avatar-upload-trigger');
    if (trigger) {
        trigger.innerHTML = renderAvatar();
    }
}

function render() {
    if (!app) return;

    app.innerHTML = `
        ${renderPage()}
        ${renderProfileModal()}
    `;

    updateHeaderUserLabels();
    updateNavActive();

    if (window.location.pathname === '/exchange-rates') {
        renderExchangeRatesIntoPage();
        initExchangeRates();
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

    bindProfileModalEvents();
}

function validateProfileFile(file) {
    if (!file) {
        throw new Error('Please choose a file.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Use JPG, PNG, or WEBP.');
    }

    if (file.size > maxSize) {
        throw new Error('File too large. Max size is 2MB.');
    }
}

function initShellListeners() {
    document.addEventListener('click', (event) => {
        if (event.target.closest('#avatar-upload-trigger')) {
            state.isProfileModalOpen = true;
            render();
        }
    });
}

function bindProfileModalEvents() {
    const modalBackdrop = document.querySelector('#profile-modal-backdrop');
    const cancelButton = document.querySelector('#profile-cancel');
    const profileForm = document.querySelector('#profile-form');
    const messageEl = document.querySelector('#profile-message');

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (event) => {
            if (event.target.id === 'profile-modal-backdrop') {
                state.isProfileModalOpen = false;
                render();
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            state.isProfileModalOpen = false;
            render();
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (messageEl) messageEl.textContent = '';

            try {
                await updateProfile(profileForm);
                state.isProfileModalOpen = false;
                render();
            } catch (error) {
                if (messageEl) messageEl.textContent = error.message;
            }
        });
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

function validateTransactionForm(form) {
    const title = form.elements.title.value.trim();
    const amountRaw = form.elements.amount.value;
    const type = form.elements.type.value;
    const date = form.elements.date.value;

    if (!title) {
        return 'Please enter a title for this transaction.';
    }

    if (amountRaw === '' || Number.isNaN(Number(amountRaw))) {
        return 'Please enter a valid amount.';
    }

    if (Number(amountRaw) < 0) {
        return 'The amount cannot be negative.';
    }

    if (!type || (type !== 'income' && type !== 'expense')) {
        return 'Please select either income or expense.';
    }

    if (!date) {
        return 'Please choose a date for this transaction.';
    }

    return null;
}

async function submitTransaction(form) {
    const clientError = validateTransactionForm(form);
    if (clientError) {
        throw new Error(clientError);
    }

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
            if (messageEl) {
                messageEl.textContent = error.message;
                messageEl.className = 'error';
            }
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

    document.querySelectorAll('[data-convert-id]').forEach((select) => {
        select.addEventListener('change', () => {
            const id = Number(select.getAttribute('data-convert-id'));
            state.conversionCurrencyById[id] = select.value;
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
    await initExchangeRates();
    render();
});

initShellListeners();

async function boot() {
    if (window.location.pathname === '/') {
        window.history.replaceState({}, '', '/dashboard');
    }

    await loadTransactions();
    await initExchangeRates();
    render();
}

boot();
