(function () {
    'use strict';

    const TS1 = {};

    function append(node, child) {
        if (child === null || child === undefined || child === false) return;
        if (Array.isArray(child)) { child.forEach(c => append(node, c)); return; }
        node.append(child.nodeType ? child : document.createTextNode(String(child)));
    }

    function el(tag, attrs, ...kids) {
        const n = document.createElement(tag);
        Object.keys(attrs || {}).forEach(k => {
            const v = attrs[k];
            if (v === null || v === undefined || v === false) return;
            if (k === 'class') n.className = v;
            else if (k === 'text') n.textContent = v;
            else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
            else n.setAttribute(k, v === true ? '' : v);
        });
        kids.forEach(c => append(n, c));
        return n;
    }

    function field(label, input) {
        return el('label', { class: 'field' }, el('span', { text: label }), input);
    }

    TS1.el = el;
    TS1.field = field;

    TS1.fmtDate = iso => {
        if (!iso) return '';
        const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
        return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    TS1.fmtDateTime = ts => {
        if (!ts) return '';
        const d = new Date(ts);
        return isNaN(d) ? '' : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    };

    TS1.toast = (message, type) => {
        let box = document.getElementById('toasts');
        if (!box) { box = el('div', { id: 'toasts', class: 'toasts' }); document.body.append(box); }
        const t = el('div', { class: 'toast ' + (type || ''), role: 'status', text: message });
        box.append(t);
        setTimeout(() => t.remove(), 5000);
    };

    TS1.dialog = (title, body) => {
        const d = el('dialog', { 'aria-label': title });
        d.append(
            el('div', { class: 'dlg-head' },
                el('h2', { text: title }),
                el('button', { type: 'button', class: 'btn ghost sm', 'aria-label': 'Fermer', text: '✕', onclick: () => d.close() })),
            el('div', { class: 'dlg-body' }, body)
        );
        d.addEventListener('close', () => d.remove());
        document.body.append(d);
        d.showModal();
        return d;
    };

    TS1.signOut = () => {
        localStorage.removeItem('ts1_admin_auth');
        location.reload();
    };

    TS1.idleLogout = minutes => {
        let timer;
        const reset = () => {
            clearTimeout(timer);
            timer = setTimeout(() => TS1.signOut(), minutes * 60 * 1000);
        };
        ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(ev =>
            window.addEventListener(ev, reset, { passive: true }));
        reset();
    };

    function card(title, ...content) {
        return el('div', { class: 'auth-wrap' },
            el('div', { class: 'auth-card' },
                el('div', { class: 'brand' },
                    el('img', { src: 'logo.svg', alt: '', width: '38', height: '38' }),
                    el('strong', { text: title })),
                ...content));
    }

    TS1.authGate = opts => {
        const root = opts.root;

        function showLogin() {
            const msg = el('p', { class: 'msg', 'aria-live': 'polite' });
            const email = el('input', { type: 'email', autocomplete: 'username', required: true, maxlength: 150 });
            const pass = el('input', { type: 'password', autocomplete: 'current-password', required: true, maxlength: 200 });
            const btn = el('button', { type: 'submit', class: 'btn primary', text: 'Se connecter' });
            const form = el('form', { class: 'stack' }, field('Adresse e-mail', email), field('Mot de passe', pass), msg, btn);

            form.addEventListener('submit', e => {
                e.preventDefault();
                msg.className = 'msg err';

                const enteredEmail = email.value.trim();
                const enteredPass = pass.value;

                // --- IDENTIFIANTS EN DUR DANS LE CODE ---
                const ADMIN_EMAIL = 'CEO2705@gmail.com';
                const ADMIN_PASS = 'TechStone2026!'; // Remplacez ici par le mot de passe de votre choix

                if (enteredEmail === ADMIN_EMAIL && enteredPass === ADMIN_PASS) {
                    // Sauvegarde de la session en local pour éviter de se reconnecter à chaque fois
                    localStorage.setItem('ts1_admin_auth', JSON.stringify({ email: enteredEmail }));
                    
                    const profile = { id: 'ceo-local-id', role: 'direction', active: true, full_name: 'CEO Tech-Stone One' };
                    root.replaceChildren();
                    opts.onReady({ profile, user: { email: enteredEmail } });
                } else {
                    msg.textContent = 'E-mail ou mot de passe incorrect.';
                }
            });

            root.replaceChildren(card(opts.title || 'Connexion',
                opts.subtitle ? el('p', { class: 'dim', text: opts.subtitle }) : null,
                form,
                el('a', { href: 'index.html', text: '← Retour au site' })));
        }

        // Vérification si déjà connecté via localStorage
        const savedAuth = localStorage.getItem('ts1_admin_auth');
        if (savedAuth) {
            try {
                const data = JSON.parse(savedAuth);
                const profile = { id: 'ceo-local-id', role: 'direction', active: true, full_name: 'CEO Tech-Stone One' };
                root.replaceChildren();
                opts.onReady({ profile, user: { email: data.email } });
                return;
            } catch (e) {
                localStorage.removeItem('ts1_admin_auth');
            }
        }

        showLogin();
    };

    window.TS1 = TS1;
})();