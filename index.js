(function () {
            'use strict';

            var PAGES = ['home', 'news', 'agenda', 'team', 'projects', 'manual', 'contact'];
            var pageLoadedAt = Date.now();

            function esc(value) {
                return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
                });
            }

            function safeHttps(url) {
                try { var u = new URL(url); return u.protocol === 'https:' ? u.href : ''; } catch (e) { return ''; }
            }

            function safeImage(url) {
                if (!url) return '';
                if (/^[\w\-\/\.]+$/.test(url) && url.indexOf('..') === -1) return url;
                return safeHttps(url);
            }

            /* ---------- BASE DE DONNÉES (lecture publique + dépôt de demandes) ---------- */
            var CFG = window.TS1_CONFIG || {};
            var API = (/^https:\/\//.test(CFG.SUPABASE_URL || '') && CFG.SUPABASE_ANON_KEY &&
                !/VOTRE/.test(CFG.SUPABASE_URL + CFG.SUPABASE_ANON_KEY)) ? CFG : null;

            function rest(path, init) {
                if (!API) return Promise.reject(new Error('non configuré'));
                init = init || {};
                var key = API.SUPABASE_ANON_KEY;
                var headers = { apikey: key };
                if (key.indexOf('eyJ') === 0) headers.Authorization = 'Bearer ' + key;
                if (init.body) { headers['Content-Type'] = 'application/json'; headers.Prefer = 'return=minimal'; }
                return fetch(API.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + path, {
                    method: init.method || 'GET',
                    headers: headers,
                    body: init.body ? JSON.stringify(init.body) : undefined
                }).then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return init.body ? null : r.json();
                });
            }

            var memo = {};
            function loadOnce(key, path, fallback) {
                if (!memo[key]) {
                    memo[key] = !API
                        ? Promise.resolve({ rows: fallback, live: false })
                        : rest(path)
                            .then(function (rows) { return { rows: rows, live: true }; })
                            .catch(function () { delete memo[key]; return { rows: fallback, live: false }; });
                }
                return memo[key];
            }

            /* Contenu de secours : affiché si la base n'est pas configurée ou injoignable */
            var NEWS_FALLBACK = [
                { title: 'Succès FilmsAll', description: 'Déploiement sur Netlify OK[cite: 10].', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', source: 'TS NEWS' },
                { title: 'FilmsAll v2', description: 'Sécurité renforcée[cite: 10].', image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', source: 'TS NEWS' }
            ];
            var AGENDA_FALLBACK = [
                { starts_on: '2026-04-18', title: 'Réunion Stratégique TS1', description: 'Déploiement des terminaux NFC[cite: 10].' },
                { starts_on: '2026-04-22', title: 'Audit de Sécurité', description: 'Revue des protocoles du manuel opérationnel[cite: 10].' },
                { starts_on: '2026-04-30', title: 'Lancement Beta "FilmsAll"', description: 'Phase de test public de la plateforme[cite: 10].' }
            ];

            /* ---------- MENU ---------- */
            var sidebar = document.getElementById('sidebar');
            var overlay = document.getElementById('overlay');
            var burger = document.getElementById('hamburger');

            function openSidebar() {
                sidebar.classList.add('open');
                overlay.classList.add('open');
                sidebar.setAttribute('aria-hidden', 'false');
                burger.setAttribute('aria-expanded', 'true');
                document.getElementById('drawer-close').focus();
            }
            function closeSidebar() {
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
                sidebar.setAttribute('aria-hidden', 'true');
                burger.setAttribute('aria-expanded', 'false');
            }
            burger.addEventListener('click', openSidebar);
            overlay.addEventListener('click', closeSidebar);
            document.getElementById('drawer-close').addEventListener('click', closeSidebar);
            sidebar.addEventListener('click', function (e) { if (e.target.closest('a')) closeSidebar(); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSidebar(); });

            document.getElementById('skip-link').addEventListener('click', function (e) {
                e.preventDefault();
                var main = document.getElementById('main');
                main.setAttribute('tabindex', '-1');
                main.focus();
            });

            /* ---------- NAVIGATION PAR HASH ---------- */
            function route() {
                var id = location.hash.replace('#', '');
                if (PAGES.indexOf(id) === -1) id = 'home';

                document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
                document.querySelectorAll('.desktop-nav a').forEach(function (a) {
                    a.classList.remove('active');
                    a.removeAttribute('aria-current');
                });

                document.getElementById('page-' + id).classList.add('active');
                var link = document.getElementById('d-' + id);
                if (link) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }

                document.title = (id === 'home' ? '' : link ? link.textContent + ' | ' : '') + 'Tech-Stone One | Innovation, IoT & Leadership';
                window.scrollTo(0, 0);

                if (id === 'news') loadInternalNews();
                if (id === 'agenda') loadAgenda();
                if (id === 'projects') loadProjects();
            }
            window.addEventListener('hashchange', route);

            /* ---------- ACTUALITÉS INTERNES ---------- */
            function loadInternalNews() {
                var container = document.getElementById('internal-news-container');
                loadOnce('news', 'news?select=title,description,image_url,source&order=created_at.desc&limit=24', NEWS_FALLBACK)
                    .then(function (res) {
                        if (!res.rows.length) {
                            container.innerHTML = '<p class="empty-note">Aucune actualité interne pour le moment[cite: 10].</p>';
                            return;
                        }
                        container.innerHTML = res.rows.map(function (n) {
                            var img = safeImage(n.image_url);
                            return '<div class="card">' +
                                (img ? '<img src="' + esc(img) + '" class="news-img" alt="' + esc(n.title) + '" loading="lazy" referrerpolicy="no-referrer">' : '') +
                                '<span class="news-source">' + esc(n.source || 'TS NEWS') + '</span>' +
                                '<h4>' + esc(n.title) + '</h4>' +
                                (n.description ? '<p class="muted-sm">' + esc(n.description) + '</p>' : '') + '</div>';
                        }).join('');
                    });
            }

            /* ---------- AGENDA ---------- */
            function agendaItem(ev, past) {
                var d = new Date(String(ev.starts_on).slice(0, 10) + 'T00:00:00');
                var month = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase();
                return '<div class="agenda-item' + (past ? ' past' : '') + '">' +
                    '<div class="agenda-date"><span style="font-size:1.2rem; font-weight:700;">' + d.getDate() + '</span><span>' + esc(month) + '</span><span style="font-size:0.7rem;">' + d.getFullYear() + '</span></div>' +
                    '<div><h4>' + esc(ev.title) + (past ? ' <small>(terminé)</small>' : '') + '</h4>' +
                    (ev.description ? '<p class="muted-sm">' + esc(ev.description) + '</p>' : '') + '</div></div>';
            }

            function renderAgenda(rows) {
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                function when(e) { return new Date(String(e.starts_on).slice(0, 10) + 'T00:00:00'); }
                var valid = rows.filter(function (e) { return e && e.title && e.starts_on && !isNaN(when(e)); });
                var sorted = valid.slice().sort(function (a, b) { return when(a) - when(b); });
                var upcoming = sorted.filter(function (e) { return when(e) >= today; });
                var past = sorted.filter(function (e) { return when(e) < today; }).reverse();

                var html = '<p class="agenda-sub">À venir</p>';
                html += upcoming.length
                    ? upcoming.map(function (e) { return agendaItem(e, false); }).join('')
                    : '<p class="agenda-empty">Aucun événement à venir pour le moment[cite: 10].</p>';
                if (past.length) {
                    html += '<p class="agenda-sub">Événements passés</p>' + past.map(function (e) { return agendaItem(e, true); }).join('');
                }
                document.getElementById('agenda-container').innerHTML = html;
            }

            function loadAgenda() {
                loadOnce('agenda', 'agenda_events?select=title,description,starts_on&order=starts_on.asc&limit=200', AGENDA_FALLBACK)
                    .then(function (res) { renderAgenda(res.rows); });
            }

            /* ---------- RÉALISATIONS ---------- */
            function projectCard(p) {
                var img = safeImage(p.image_url);
                var live = safeHttps(p.live_url);
                var src = safeHttps(p.source_url);
                return '<div class="card">' +
                    (img ? '<img src="' + esc(img) + '" style="width:100%; border-radius:12px; margin-bottom:15px;" alt="Capture de ' + esc(p.title) + '" loading="lazy" referrerpolicy="no-referrer">' : '') +
                    '<h3>' + esc(p.title) + '</h3>' +
                    (p.description ? '<p class="muted-sm">' + esc(p.description) + '</p>' : '') +
                    '<div class="project-actions">' +
                    (live ? '<a href="' + esc(live) + '" class="btn-mini" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Live</a>' : '<span></span>') +
                    (src ? '<a href="' + esc(src) + '" style="color:var(--text-dim);" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> Source</a>' : '') +
                    '</div></div>';
            }

            function loadProjects() {
                if (!API) return;
                var grid = document.getElementById('projects-grid');
                loadOnce('projects', 'projects?select=title,description,image_url,live_url,source_url&order=created_at.desc&limit=60', null)
                    .then(function (res) {
                        if (!res.live) return;
                        grid.innerHTML = res.rows.length
                            ? res.rows.map(projectCard).join('')
                            : '<p class="empty-note">Aucune réalisation publiée pour le moment[cite: 10].</p>';
                    });
            }

            /* ---------- FILTRE ÉQUIPE ---------- */
            function filterTeam(role) {
                var shown = 0;
                document.querySelectorAll('.filter-btn').forEach(function (b) {
                    var on = b.getAttribute('data-filter') === role;
                    b.classList.toggle('active', on);
                    b.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
                document.querySelectorAll('.member-card').forEach(function (m) {
                    var ok = role === 'all' || m.getAttribute('data-role') === role;
                    m.style.display = ok ? 'block' : 'none';
                    if (ok) shown++;
                });
                document.getElementById('team-empty').hidden = shown !== 0;
            }
            document.querySelectorAll('.filter-btn').forEach(function (b) {
                b.addEventListener('click', function () { filterTeam(b.getAttribute('data-filter')); });
            });

            /* ---------- FORMULAIRE ---------- */
            var SERVICES = { 
                web: 'Développement Web & Logiciel', 
                design: 'Design & Print NFC', 
                repair: 'Systèmes IoT & Maintenance', 
                academy: 'Formation & Leadership' 
            };
            var note = document.getElementById('form-note');
            var lastSaved = '';

            function setNote(text, ok) {
                note.className = 'form-note' + (ok ? ' ok' : '');
                note.textContent = text;
            }

            function saveRequest(payload) {
                if (!API) return;
                var sig = JSON.stringify(payload);
                if (sig === lastSaved) return;
                lastSaved = sig;
                rest('client_requests', { method: 'POST', body: payload })
                    .then(function () { setNote('Demande enregistrée. Nous reviendrons vers vous rapidement[cite: 10].', true); })
                    .catch(function () { lastSaved = ''; });
            }

            function sendReq(type) {
                if (document.getElementById('c_site').value) return;

                var name = document.getElementById('c_name').value.trim().slice(0, 100);
                var contact = document.getElementById('c_contact').value.trim().slice(0, 150);
                var service = document.getElementById('c_service').value;
                var msg = document.getElementById('c_msg').value.trim().slice(0, 1500);

                if (!name || !msg) { setNote('Merci de remplir le nom et le message[cite: 10].', false); return; }
                if (Date.now() - pageLoadedAt < 3000) { setNote('Patientez un instant avant l\'envoi[cite: 10].', false); return; }
                if (!SERVICES[service]) return;
                setNote('', false);

                saveRequest({ name: name, service: service, contact: contact || null, message: msg });

                var label = SERVICES[service];
                var fullText = 'Tech-Stone One : ' + name + ' | ' + label + (contact ? ' | Contact : ' + contact : '') + '. Projet : ' + msg;

                if (type === 'wa') {
                    window.open('https://wa.me/243856178369?text=' + encodeURIComponent(fullText), '_blank', 'noopener,noreferrer');
                } else {
                    window.location.href = 'mailto:techstoneone@gmail.com?subject=' + encodeURIComponent('Demande ' + label) + '&body=' + encodeURIComponent(fullText);
                }
            }
            document.getElementById('requestForm').addEventListener('submit', function (e) { e.preventDefault(); sendReq('mail'); });
            document.getElementById('btn-wa').addEventListener('click', function () { sendReq('wa'); });

            /* ---------- STATUT RÉEL DU SITE ---------- */
            var statusBox = document.getElementById('system-status');
            var statusDot = document.getElementById('status-dot');
            var statusText = document.getElementById('system-latency');

            function setOffline() {
                statusDot.classList.add('off');
                statusText.textContent = 'TS1 Core : hors ligne';
                statusBox.title = 'Connexion indisponible';
            }
            function ping() {
                if (!navigator.onLine) { setOffline(); return; }
                var t = performance.now();
                fetch('manifest.json?_=' + Date.now(), { cache: 'no-store' })
                    .then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        statusDot.classList.remove('off');
                        statusText.textContent = 'TS1 Core : ' + Math.round(performance.now() - t) + 'ms';
                        statusBox.title = 'Site accessible';
                    })
                    .catch(setOffline);
            }
            window.addEventListener('online', ping);
            window.addEventListener('offline', setOffline);
            ping();
            setInterval(ping, 20000);

            /* ---------- INSTALLATION PWA ---------- */
            var deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault();
                deferredPrompt = e;
                document.querySelectorAll('.install-btn').forEach(function (b) { b.hidden = false; });
            });
            document.querySelectorAll('.install-btn').forEach(function (b) {
                b.addEventListener('click', function () {
                    if (!deferredPrompt) return;
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function () {
                        deferredPrompt = null;
                        document.querySelectorAll('.install-btn').forEach(function (x) { x.hidden = true; });
                    });
                });
            });
            window.addEventListener('appinstalled', function () {
                document.querySelectorAll('.install-btn').forEach(function (x) { x.hidden = true; });
            });

            /* ---------- SERVICE WORKER ---------- */
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js').catch(function (err) { console.log(err); });
            }

            /* ---------- PHOTOS : image de secours si la photo est absente ---------- */
            document.querySelectorAll('.member-photo').forEach(function (img) {
                img.addEventListener('error', function () {
                    if (img.getAttribute('data-fallback')) return;
                    img.setAttribute('data-fallback', '1');
                    img.src = 'Tech-StoneOne.png';
                });
            });

            filterTeam('all');
            route();
        })();