(function () {
    'use strict';

    const { el, fmtDate, toast } = TS1;
    const app = document.getElementById('app');
    const POLES = { web: 'Web Dev', design: 'Design', elec: 'Électronique', market: 'Marketing' };

    function section(title, content) {
        return el('section', {}, el('h2', { class: 'section-title', text: title }), content);
    }

    function emptyBox(text) { return el('div', { class: 'empty', text }); }

    function liveView(live) {
        if (!live || !live.active) return null;
        const url = TS1.safeHttps(live.url);
        if (!url || !live.title) return null;
        return el('section', { class: 'live', 'aria-label': 'Formation en direct' },
            el('span', { class: 'tag', text: 'FORMATION EN DIRECT' }),
            el('h2', { text: live.title }),
            live.description ? el('p', { class: 'dim', text: live.description }) : null,
            el('a', { class: 'btn primary', href: url, target: '_blank', rel: 'noopener noreferrer', text: 'Rejoindre la formation' }));
    }

    function linksView(links) {
        const valid = links.filter(l => TS1.safeHttps(l.url));
        if (!valid.length) return emptyBox('Aucun lien interne pour le moment.');
        return el('div', { class: 'links' }, valid.map(l =>
            el('a', { class: 'btn', href: TS1.safeHttps(l.url), target: '_blank', rel: 'noopener noreferrer', text: l.label })));
    }

    function manualView(sections, user) {
        if (!sections.length) return emptyBox('Le manuel n\'est pas encore publié.');
        const wm = Array(16).fill('CONFIDENTIEL TS1 · ' + user.email + '        CONFIDENTIEL TS1 · ' + user.email).join('\n');
        return el('div', { class: 'paper', 'data-wm': wm },
            sections.map(s => el('div', { class: 'rule' }, el('h3', { text: s.title }), el('p', { text: s.body }))),
            el('p', { style: 'font-size:.8rem;color:#64748b;position:relative;z-index:1', text: 'Document à usage exclusif des membres de Tech-Stone One. Diffusion strictement interdite.' }));
    }

    function videosView(videos) {
        if (!videos.length) return emptyBox('Aucun replay disponible pour le moment.');
        return el('div', { class: 'videos' }, videos.map(v => {
            const thumb = TS1.safeImage(v.thumb_url);
            const link = TS1.safeHttps(v.video_url);
            const meta = [v.recorded_on ? 'Enregistré le ' + fmtDate(v.recorded_on) : '', v.duration || ''].filter(Boolean).join(' • ');
            return el('article', { class: 'video' },
                el('div', { class: 'thumb' }, thumb ? el('img', { src: thumb, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' }) : null),
                el('div', { class: 'video-body' },
                    v.tag ? el('span', { class: 'badge info', text: v.tag }) : null,
                    el('h3', { text: v.title }),
                    meta ? el('p', { class: 'dim', text: meta }) : null,
                    link ? el('a', { href: link, target: '_blank', rel: 'noopener noreferrer', text: 'Visionner le replay →' }) : null));
        }));
    }

    function statsView(stats) {
        if (!stats.length) return null;
        return el('div', { class: 'stats' }, stats.map(s => el('div', { class: 'stat' }, el('b', { text: s.value }), el('span', { class: 'dim', text: s.label }))));
    }

    async function start({ profile, user }) {
        TS1.idleLogout(60);
        const sb = TS1.sb;

        const tools = el('div', { class: 'tools' },
            profile.role === 'direction' ? el('a', { class: 'btn primary sm', href: 'admin.html', text: 'Contrôle' }) : null,
            el('a', { class: 'btn ghost sm', href: 'index.html', text: 'Site' }),
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Mot de passe', onclick: () => TS1.openPasswordDialog() }),
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Déconnexion', onclick: () => TS1.signOut() }));

        const header = el('header', { class: 'top' },
            el('div', { class: 'brand' }, el('img', { src: 'logo.svg', alt: '', width: '34', height: '34' }), el('strong', { text: 'TS1 · Espace membre' })),
            tools);

        const content = el('main', { class: 'wrap', id: 'main' }, el('p', { class: 'dim', text: 'Chargement…' }));
        app.replaceChildren(header, content);

        const [live, links, manual, videos, stats] = await Promise.all([
            sb.from('academy_live').select('*').eq('id', 1).maybeSingle(),
            sb.from('internal_links').select('*').order('position'),
            sb.from('manual_sections').select('*').order('position'),
            sb.from('academy_videos').select('*').order('recorded_on', { ascending: false }),
            sb.from('academy_stats').select('*').order('position')
        ]);

        [live, links, manual, videos, stats].forEach(r => { if (r.error) toast('Chargement partiel : ' + r.error.message, 'err'); });

        const hello = el('div', { class: 'hello' },
            el('h1', { text: 'Bonjour ' + (profile.full_name || user.email) }),
            profile.title ? el('span', { class: 'badge info', text: profile.title }) : null,
            profile.pole ? el('span', { class: 'badge', text: POLES[profile.pole] || profile.pole }) : null,
            el('span', { class: 'badge ' + (profile.role === 'direction' ? 'ok' : ''), text: profile.role === 'direction' ? 'Direction' : 'Membre' }));

        content.replaceChildren(
            hello,
            liveView(live.data),
            section('Liens internes', linksView(links.data || [])),
            section('Manuel opérationnel interne', manualView(manual.data || [], user)),
            section('TS1 Academy · Replays', videosView(videos.data || [])),
            statsView(stats.data || []));
    }

    TS1.authGate({
        root: app,
        title: 'Espace membre',
        subtitle: 'Connectez-vous avec votre compte Tech-Stone One.',
        roles: ['membre', 'direction'],
        denyMessage: 'Votre compte n\'a pas accès à cet espace.',
        onReady: start
    });
})();