(function () {
    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function showClientError(el, message) {
        if (!el) return;
        if (message) {
            el.textContent = message;
            el.hidden = false;
        } else {
            el.textContent = '';
            el.hidden = true;
        }
    }

    function initLoginForm() {
        const form = document.getElementById('login-form');
        const clientError = document.getElementById('login-client-error');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            showClientError(clientError, '');

            const email = form.elements.email.value.trim();
            const password = form.elements.password.value;

            if (!email) {
                event.preventDefault();
                showClientError(clientError, 'Please enter your email address.');
                return;
            }

            if (!isValidEmail(email)) {
                event.preventDefault();
                showClientError(clientError, 'Please enter a valid email address.');
                return;
            }

            if (!password) {
                event.preventDefault();
                showClientError(clientError, 'Please enter your password.');
            }
        });
    }

    function initRegisterForm() {
        const form = document.getElementById('register-form');
        const clientError = document.getElementById('register-client-error');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            showClientError(clientError, '');

            const name = form.elements.name.value.trim();
            const email = form.elements.email.value.trim();
            const password = form.elements.password.value;
            const confirmation = form.elements.password_confirmation.value;

            if (!name) {
                event.preventDefault();
                showClientError(clientError, 'Please enter your name.');
                return;
            }

            if (!email) {
                event.preventDefault();
                showClientError(clientError, 'Please enter your email address.');
                return;
            }

            if (!isValidEmail(email)) {
                event.preventDefault();
                showClientError(clientError, 'Please enter a valid email address.');
                return;
            }

            if (password.length < 8) {
                event.preventDefault();
                showClientError(clientError, 'Your password must be at least 8 characters.');
                return;
            }

            if (password !== confirmation) {
                event.preventDefault();
                showClientError(clientError, 'The password confirmation does not match.');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLoginForm();
            initRegisterForm();
        });
    } else {
        initLoginForm();
        initRegisterForm();
    }
})();
