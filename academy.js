(function () {
        'use strict';

        function esc(value) {
            return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        function formatDate(iso) {
            var d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
            if (isNaN(d)) return '';
            return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        }

        function renderLive(live) {
            var section = document.getElementById('live-section');
            var url = live && live.active ? TS1.safeHttps(live.url) : '';
            if (!live || !live.title || !url) { section.hidden = true; return; }

            document.getElementById('live-title').textContent = live.title;
            var desc = document.getElementById('live-desc');
            if (live.description) { desc.textContent = live.description; desc.hidden = false; }
            else { desc.hidden = true; }
            document.getElementById('live-link').href = url;
            section.hidden = false;
        }

        function renderVideos(videos) {
            var grid = document.getElementById('video-grid');
            var empty = document.getElementById('video-empty');
            var list = Array.isArray(videos) ? videos.filter(function (v) { return v && v.title; }) : [];

            if (!list.length) { grid.innerHTML = ''; empty.hidden = false; return; }
            empty.hidden = true;

            grid.innerHTML = list.map(function (v) {
                var thumb = TS1.safeImage(v.thumb_url);
                var link = TS1.safeHttps(v.video_url);
                var meta = [];
                if (v.recorded_on) { var f = formatDate(v.recorded_on); if (f) meta.push('Enregistré le ' + f); }
                if (v.duration) meta.push(v.duration);

                return '<article class="video-card">' +
                    '<div class="video-thumb">' +
                        (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '') +
                        '<i class="fas fa-play-circle play-overlay" aria-hidden="true"></i>' +
                    '</div>' +
                    '<div class="video-info">' +
                        (v.tag ? '<span class="video-tag">' + esc(v.tag) + '</span>' : '') +
                        '<h3>' + esc(v.title) + '</h3>' +
                        (meta.length ? '<p class="video-meta">' + esc(meta.join(' • ')) + '</p>' : '') +
                        (link ? '<a class="video-link" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Visionner le Replay →</a>' : '') +
                    '</div></article>';
            }).join('');
        }

        function renderStats(stats) {
            var panel = document.getElementById('stats-panel');
            var list = Array.isArray(stats) ? stats.filter(function (s) { return s && s.label && s.value !== undefined && s.value !== null && s.value !== ''; }) : [];
            if (!list.length) { panel.hidden = true; panel.innerHTML = ''; return; }

            panel.innerHTML = list.map(function (s) {
                return '<div class="perf-card"><span class="value">' + esc(s.value) + '</span><p class="label">' + esc(s.label) + '</p></div>';
            }).join('');
            panel.hidden = false;
        }

        function loadAll(sb) {
            return Promise.all([
                sb.from('academy_live').select('*').eq('id', 1).maybeSingle(),
                sb.from('academy_videos').select('*').order('recorded_on', { ascending: false }),
                sb.from('academy_stats').select('*').order('position')
            ]).then(function (r) {
                var err = r[0].error || r[1].error || r[2].error;
                if (err) throw err;
                return { live: r[0].data, videos: r[1].data || [], stats: r[2].data || [] };
            });
        }

        function start() {
            var sb = TS1.sb;
            var loadError = document.getElementById('load-error');

            document.getElementById('gate').hidden = true;
            document.getElementById('academy').hidden = false;
            document.getElementById('nav-auth').hidden = false;
            document.getElementById('btn-logout').addEventListener('click', function () { TS1.signOut(); });
            TS1.idleLogout(60);

            loadAll(sb)
                .then(function (data) {
                    loadError.hidden = true;
                    renderLive(data.live);
                    renderVideos(data.videos);
                    renderStats(data.stats);
                })
                .catch(function () {
                    document.getElementById('video-empty').hidden = true;
                    loadError.hidden = false;
                });

            setInterval(function () {
                if (document.hidden) return;
                sb.from('academy_live').select('*').eq('id', 1).maybeSingle()
                    .then(function (r) { if (!r.error) renderLive(r.data); });
            }, 60000);
        }

        document.getElementById('skip-link').addEventListener('click', function (e) {
            e.preventDefault();
            var main = document.getElementById('main');
            main.setAttribute('tabindex', '-1');
            main.focus();
        });

        TS1.authGate({
            root: document.getElementById('gate'),
            title: 'TS1 Academy',
            subtitle: 'Les formations en direct et les replays sont réservés aux membres. Connectez-vous avec votre compte Tech-Stone One.',
            roles: ['membre', 'direction'],
            denyMessage: 'Votre compte n\'a pas accès à TS1 Academy.',
            onReady: start
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(function (err) { console.log(err); });
        }
    })();