(function () {
    'use strict';

    const cfg = window.TS1_CONFIG || {};
    const hashType = (location.hash.match(/[#&]type=(\w+)/) || [])[1] || '';
    const keysOk = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !/VOTRE/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY);
    const configured = !!(keysOk && window.supabase);
    const TS1 = { configured };

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
    TS1.safeHttps = url => {
        try { const u = new URL(url); return u.protocol === 'https:' ? u.href : ''; } catch (e) { return ''; }
    };
    TS1.safeImage = url => {
        if (!url) return '';
        if (/^[\w\-\/\.]+$/.test(url) && url.indexOf('..') === -1) return url;
        return TS1.safeHttps(url);
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

    if (configured) {
        TS1.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
    }

    TS1.signOut = async () => {
        if (TS1.sb) await TS1.sb.auth.signOut();
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

    function passwordForm(done) {
        const msg = el('p', { class: 'msg', 'aria-live': 'polite' });
        const p1 = el('input', { type: 'password', autocomplete: 'new-password', required: true, minlength: 10 });
        const p2 = el('input', { type: 'password', autocomplete: 'new-password', required: true, minlength: 10 });
        const btn = el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer le mot de passe' });
        const form = el('form', { class: 'stack' },
            field('Nouveau mot de passe (10 caractères minimum)', p1),
            field('Confirmer le mot de passe', p2),
            msg, btn);
        form.addEventListener('submit', async e => {
            e.preventDefault();
            msg.className = 'msg err';
            if (p1.value.length < 10) { msg.textContent = '10 caractères minimum.'; return; }
            if (p1.value !== p2.value) { msg.textContent = 'Les deux mots de passe sont différents.'; return; }
            btn.disabled = true;
            const r = await TS1.sb.auth.updateUser({ password: p1.value });
            btn.disabled = false;
            if (r.error) { msg.textContent = 'Modification impossible : ' + r.error.message; return; }
            TS1.toast('Mot de passe mis à jour.', 'ok');
            done();
        });
        return form;
    }

    TS1.openPasswordDialog = () => {
        let dlg;
        dlg = TS1.dialog('Changer le mot de passe', passwordForm(() => dlg.close()));
    };

    function card(title, ...content) {
        return el('div', { class: 'auth-wrap' },
            el('div', { class: 'auth-card' },
                el('div', { class: 'brand' },
                    el('img', { src: 'logo.svg', alt: '', width: '38', height: '38' }),
                    el('strong', { text: title })),
                ...content));
    }

    TS1.authGate = async opts => {
        const root = opts.root;
        if (!configured) {
            root.replaceChildren(card('Configuration requise',
                el('p', { text: 'Ouvrez le fichier config.js et renseignez SUPABASE_URL et SUPABASE_ANON_KEY.' }),
                el('p', { class: 'dim', text: 'Vérifiez aussi que la bibliothèque Supabase est chargée.' })));
            return;
        }
        const sb = TS1.sb;

        function deny(message) {
            root.replaceChildren(card('Accès refusé',
                el('p', { text: message }),
                opts.denyLink ? el('a', { class: 'btn ghost', href: opts.denyLink.href, text: opts.denyLink.text }) : null,
                el('button', { type: 'button', class: 'btn', text: 'Se déconnecter', onclick: TS1.signOut })));
        }

        async function proceed(user) {
            const r = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (r.error || !r.data) return deny('Profil introuvable. Contactez la direction.');
            if (!r.data.active) return deny('Ce compte est désactivé.');
            if (opts.roles && opts.roles.indexOf(r.data.role) === -1) return deny(opts.denyMessage || 'Accès non autorisé.');
            root.replaceChildren();
            opts.onReady({ profile: r.data, user });
        }

        function showSetPassword(user) {
            root.replaceChildren(card('Nouveau mot de passe',
                el('p', { class: 'dim', text: 'Choisissez un nouveau mot de passe pour votre compte.' }),
                passwordForm(() => {
                    history.replaceState(null, '', location.pathname);
                    proceed(user);
                })));
        }

        function showLogin() {
            let fails = 0;
            let lockUntil = 0;
            const msg = el('p', { class: 'msg', 'aria-live': 'polite' });
            const email = el('input', { type: 'email', autocomplete: 'username', required: true, maxlength: 150 });
            const pass = el('input', { type: 'password', autocomplete: 'current-password', required: true, maxlength: 200 });
            const btn = el('button', { type: 'submit', class: 'btn primary', text: 'Se connecter' });
            const reset = el('button', { type: 'button', class: 'link-btn', text: 'Mot de passe oublié ?' });
            const form = el('form', { class: 'stack' }, field('Adresse e-mail', email), field('Mot de passe', pass), msg, btn, reset);

            form.addEventListener('submit', async e => {
                e.preventDefault();
                msg.className = 'msg err';
                if (Date.now() < lockUntil) { msg.textContent = 'Trop de tentatives. Patientez quelques secondes.'; return; }
                btn.disabled = true;
                const r = await sb.auth.signInWithPassword({ email: email.value.trim(), password: pass.value });
                btn.disabled = false;
                if (r.error) {
                    fails++;
                    if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; }
                    msg.textContent = 'E-mail ou mot de passe incorrect.';
                    return;
                }
                proceed(r.data.user);
            });

            reset.addEventListener('click', async () => {
                if (!email.value.trim()) { msg.className = 'msg err'; msg.textContent = 'Saisissez d\'abord votre e-mail.'; return; }
                await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: location.origin + location.pathname });
                msg.className = 'msg ok';
                msg.textContent = 'Si ce compte existe, un e-mail de réinitialisation a été envoyé.';
            });

            root.replaceChildren(card(opts.title || 'Connexion',
                opts.subtitle ? el('p', { class: 'dim', text: opts.subtitle }) : null,
                form,
                el('a', { href: 'index.html', text: '← Retour au site' })));
        }

        const res = await sb.auth.getSession();
        const session = res.data.session;
        if (session && hashType === 'recovery') return showSetPassword(session.user);
        if (session) return proceed(session.user);
        showLogin();
    };

    window.TS1 = TS1;
})();