(() => {
  'use strict';

  const { el, toast, fmtDate } = TS1;
  const app = document.getElementById('app');

  // --- SOURCE DE VÉRITÉ SYNCHRONISÉE AVEC LE SITE OFFICIEL ---
  const STORAGE_KEY = 'ts1_admin_data_v1';

  function getAppData() {
    const defaultData = {
      live: { 
        active: true, 
        title: 'Session Live Academy', 
        description: 'Cours interactif en direct sur les architectures web.', 
        url: 'https://meet.google.com/' 
      },
      videos: [
        { id: 'v1', title: 'Maîtriser les Progressive Web Apps', tag: 'Code', recorded_on: '2026-06-01', video_url: '', description: 'Formation complète PWA' }
      ],
      expertises: [
        { id: 'e1', title: 'Développement Web & Mobile', description: 'Création d\'applications sur-mesure et PWA.', icon: 'fa-code' },
        { id: 'e2', title: 'Design & UI/UX', description: 'Conception de maquettes, logos et chartes graphiques.', icon: 'fa-pen-nib' }
      ],
      events: [
        { id: 'ev1', title: 'Conférence UDBL Lubumbashi', badge: 'Présentiel', description: 'Séminaire sur le génie logiciel.' }
      ],
      news: [
        { id: 'n1', title: 'Lancement de la plateforme TS-Translater', source: 'TS NEWS', description: 'Traduction pour les langues nationales de la RDC.' }
      ],
      projects: [
        { id: 'p1', title: 'EduSearch AI', description: 'Moteur de recherche éducatif avec synthèse vocale.', live_url: '#', source_url: '#' },
        { id: 'p2', title: 'DEV-DIC', description: 'Dictionnaire interactif pour développeurs.', live_url: '#', source_url: '#' }
      ],
      agenda: [
        { id: 'a1', title: 'Soutenance de projet UDBL', starts_on: '2026-06-15', description: 'Présentation des prototypes smart campus.' }
      ],
      team: [
        { id: 't1', full_name: 'Pierre Ngoy', email: 'CEO2705@gmail.com', role: 'Lead Developer', pole: 'Développement Web & PWA', motivation: 'Innover par le code en Afrique', github: 'https://github.com', portfolio: '#', active: true }
      ],
      manual: `# Manuel Interne & Leadership - Tech-Stone One\n\n## 1. Vision\nTech-Stone One a pour mission de révolutionner le développement logiciel en République Démocratique du Congo.\n\n## 2. Pôles & Organisation\n- Pôle Développement\n- Pôle Design\n- Pôle IoT & Électronique\n- Pôle Marketing`,
      links: [
        { label: 'Site Principal', url: 'index.html' },
        { label: 'Dépôt GitHub', url: 'https://github.com' }
      ]
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    try { return JSON.parse(saved); } catch (e) { return defaultData; }
  }

  function saveAppData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('ts1_data_updated'));
  }

  async function adminView({ profile, user }) {
    TS1.idleLogout(30);
    let appData = getAppData();

    const tabs = [
      { id: 'live', label: '🔴 Direct Academy' },
      { id: 'videos', label: '📺 Replays & Formations' },
      { id: 'expertises', label: '⚙️ Domaines d\'Expertise' },
      { id: 'events', label: '🌟 Événements à la Une' },
      { id: 'news', label: '📰 Actualités & Infos' },
      { id: 'projects', label: '🚀 Réalisations & Projets' },
      { id: 'agenda', label: '📅 Agenda & Notifications' },
      { id: 'team', label: '👥 Équipe & Rôles' },
      { id: 'manual', label: '📖 Manuel Interne & Leadership' },
      { id: 'links', label: '🔗 Liens Internes' }
    ];

    let currentTab = 'live';

    const navBtns = tabs.map(t => {
      const btn = el('button', { type: 'button', class: 'nav-btn', text: t.label, onclick: () => switchTab(t.id) });
      if (t.id === currentTab) btn.classList.add('active');
      btn.dataset.id = t.id;
      return btn;
    });

    const sidebar = el('aside', { class: 'side' },
      el('div', { class: 'brand' },
        el('div', { class: 'brand-badge', text: 'T' }),
        el('div', { class: 'brand-name', text: 'TS1 · Contrôle Total' })
      ),
      el('div', { class: 'nav-title', text: 'Pilotage du Site Principal' }),
      el('nav', { class: 'side-nav' }, navBtns),
      el('div', { class: 'side-foot' },
        el('div', { class: 'nav-title', text: 'Session' }),
        el('div', { class: 'who', text: user.email }),
        el('a', { class: 'nav-btn', href: 'index.html', target: '_blank', text: '🌐 Voir le site public' }),
        el('button', { type: 'button', class: 'nav-btn', text: 'Se déconnecter', onclick: () => TS1.signOut() })
      )
    );

    const hamburgerBtn = el('button', { type: 'button', class: 'hamburger-btn', 'aria-label': 'Menu' },
      el('i', { class: 'fa-solid fa-bars' })
    );

    hamburgerBtn.onclick = () => sidebar.classList.toggle('open');

    navBtns.forEach(btn => {
      const originalOnClick = btn.onclick;
      btn.onclick = () => {
        originalOnClick();
        sidebar.classList.remove('open');
      };
    });

    const mainContent = el('main', { class: 'content' });
    const layout = el('div', { class: 'shell' }, hamburgerBtn, sidebar, mainContent);

    app.replaceChildren(layout);

    function switchTab(id) {
      currentTab = id;
      navBtns.forEach(b => b.classList.toggle('active', b.dataset.id === id));
      loadTabData(id);
    }

    function loadTabData(id) {
      appData = getAppData();

      // 1. DIRECT ACADEMY
      if (id === 'live') {
        const data = appData.live;
        const activeChk = el('input', { type: 'checkbox', checked: data.active });
        const titleIn = el('input', { type: 'text', value: data.title || '', maxlength: 150 });
        const descIn = el('textarea', { rows: 3, maxlength: 500 }, data.description || '');
        const urlIn = el('input', { type: 'url', value: data.url || '' });
        const msg = el('p', { class: 'msg' });

        const form = el('form', { class: 'stack panel' },
          el('h2', { text: 'Gestion du Flux en Direct (Academy)' }),
          el('p', { class: 'dim', text: 'Pilotez la session en direct affichée sur l\'espace académique.' }),
          el('label', { class: 'check' }, activeChk, el('span', { text: 'Activer le direct sur le site' })),
          TS1.field('Titre de la session', titleIn),
          TS1.field('Description', descIn),
          TS1.field('Lien de visioconférence (Meet, Zoom...)', urlIn),
          msg,
          el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer et synchroniser' })
        );

        form.onsubmit = e => {
          e.preventDefault();
          appData.live = { active: activeChk.checked, title: titleIn.value.trim(), description: descIn.value.trim(), url: urlIn.value.trim() };
          saveAppData(appData);
          toast('Direct mis à jour sur le site en temps réel !', 'ok');
        };
        mainContent.replaceChildren(form);
      }
      // 2. REPLAYS & FORMATIONS
      else if (id === 'videos') {
        const items = appData.videos;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion des Replays & Formations' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Publier une formation', onclick: () => openVideoModal() })
        );

        const rows = items.map(v => el('tr', {},
          el('td', { 'data-label': 'Titre', text: v.title }),
          el('td', { 'data-label': 'Tag', text: v.tag || '-' }),
          el('td', { 'data-label': 'Date', text: fmtDate(v.recorded_on) }),
          el('td', { 'data-label': 'Source Vidéo', text: v.video_url ? (v.video_url.startsWith('data:') ? 'Fichier importé' : 'Lien externe') : 'Aucune' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openVideoModal(v) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('videos', v.id, () => loadTabData('videos')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Titre' }), el('th', { text: 'Tag' }), el('th', { text: 'Date' }), el('th', { text: 'Vidéo' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '5', class: 'empty', text: 'Aucune formation disponible.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 3. DOMAINES D'EXPERTISE
      else if (id === 'expertises') {
        const items = appData.expertises;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion des Domaines d\'Expertise' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Ajouter une expertise', onclick: () => openExpertiseModal() })
        );

        const rows = items.map(item => el('tr', {},
          el('td', { 'data-label': 'Titre', text: item.title }),
          el('td', { 'data-label': 'Description', text: item.description || '-' }),
          el('td', { 'data-label': 'Icône', text: item.icon || '-' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openExpertiseModal(item) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('expertises', item.id, () => loadTabData('expertises')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Titre' }), el('th', { text: 'Description' }), el('th', { text: 'Icône' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '4', class: 'empty', text: 'Aucune expertise.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 4. ÉVÉNEMENTS À LA UNE
      else if (id === 'events') {
        const items = appData.events;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion des Événements à la Une' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Ajouter un événement', onclick: () => openEventModal() })
        );

        const rows = items.map(ev => el('tr', {},
          el('td', { 'data-label': 'Titre', text: ev.title }),
          el('td', { 'data-label': 'Badge', text: ev.badge || '-' }),
          el('td', { 'data-label': 'Description', text: ev.description || '-' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openEventModal(ev) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('events', ev.id, () => loadTabData('events')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Titre' }), el('th', { text: 'Badge' }), el('th', { text: 'Description' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '4', class: 'empty', text: 'Aucun événement.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 5. ACTUALITÉS & INFOS
      else if (id === 'news') {
        const items = appData.news;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion des Actualités & Infos' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Publier une actualité', onclick: () => openNewsModal() })
        );

        const rows = items.map(n => el('tr', {},
          el('td', { 'data-label': 'Titre', text: n.title }),
          el('td', { 'data-label': 'Source', text: n.source || '-' }),
          el('td', { 'data-label': 'Description', text: n.description || '-' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openNewsModal(n) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('news', n.id, () => loadTabData('news')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Titre' }), el('th', { text: 'Source' }), el('th', { text: 'Description' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '4', class: 'empty', text: 'Aucune actualité.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 6. RÉALISATIONS & PROJETS
      else if (id === 'projects') {
        const items = appData.projects;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion des Réalisations & Projets' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Ajouter un projet', onclick: () => openProjectModal() })
        );

        const rows = items.map(p => el('tr', {},
          el('td', { 'data-label': 'Titre', text: p.title }),
          el('td', { 'data-label': 'Description', text: p.description || '-' }),
          el('td', { 'data-label': 'Live URL', text: p.live_url || '-' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openProjectModal(p) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('projects', p.id, () => loadTabData('projects')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Titre' }), el('th', { text: 'Description' }), el('th', { text: 'Live URL' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '4', class: 'empty', text: 'Aucun projet.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 7. AGENDA & NOTIFICATIONS
      else if (id === 'agenda') {
        const items = appData.agenda;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion de l\'Agenda & Notifications' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Nouvel événement', onclick: () => openAgendaModal() })
        );

        const rows = items.map(ev => el('tr', {},
          el('td', { 'data-label': 'Titre', text: ev.title }),
          el('td', { 'data-label': 'Date', text: fmtDate(ev.starts_on) }),
          el('td', { 'data-label': 'Description', text: ev.description || '-' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openAgendaModal(ev) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('agenda', ev.id, () => loadTabData('agenda')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Titre' }), el('th', { text: 'Date' }), el('th', { text: 'Description' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '4', class: 'empty', text: 'Aucun événement.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 8. ÉQUIPE & RÔLES
      else if (id === 'team') {
        const items = appData.team;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion de l\'Équipe & Rôles' }),
          el('button', { type: 'button', class: 'btn primary sm', text: '+ Ajouter un membre', onclick: () => openTeamModal() })
        );

        const rows = items.map(m => el('tr', {},
          el('td', { 'data-label': 'Nom', text: m.full_name }),
          el('td', { 'data-label': 'Rôle', text: m.role }),
          el('td', { 'data-label': 'Pôle', text: m.pole || '-' }),
          el('td', { 'data-label': 'GitHub', text: m.github ? 'Oui' : '-' }),
          el('td', { 'data-label': 'Actions', class: 'actions' },
            el('button', { type: 'button', class: 'btn ghost sm', text: 'Modifier', onclick: () => openTeamModal(m) }),
            el('button', { type: 'button', class: 'btn danger sm', text: 'Supprimer', onclick: () => deleteItem('team', m.id, () => loadTabData('team')) })
          )
        ));

        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Nom' }), el('th', { text: 'Rôle' }), el('th', { text: 'Pôle' }), el('th', { text: 'GitHub' }), el('th', { text: 'Actions' }))),
            el('tbody', {}, rows.length ? rows : el('tr', {}, el('td', { colspan: '5', class: 'empty', text: 'Aucun membre enregistré.' })))
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
      // 9. MANUEL INTERNE & LEADERSHIP
      else if (id === 'manual') {
        const manualText = el('textarea', { rows: 15, style: 'font-family: monospace; font-size: 0.9rem;' }, appData.manual || '');
        const msg = el('p', { class: 'msg' });

        const form = el('form', { class: 'stack panel' },
          el('h2', { text: 'Édition du Manuel Interne & Leadership' }),
          el('p', { class: 'dim', text: 'Modifiez directement le contenu du manuel. Il se met à jour instantanément sur la page dédiée du site officiel.' }),
          manualText,
          msg,
          el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer le manuel' })
        );

        form.onsubmit = e => {
          e.preventDefault();
          appData.manual = manualText.value;
          saveAppData(appData);
          toast('Manuel mis à jour et synchronisé en direct !', 'ok');
        };
        mainContent.replaceChildren(form);
      }
      // 10. LIENS INTERNES
      else if (id === 'links') {
        const items = appData.links;
        const toolbar = el('div', { class: 'toolbar' },
          el('h2', { text: 'Gestion des Liens Internes' })
        );
        const rows = items.map(l => el('tr', {},
          el('td', { 'data-label': 'Libellé', text: l.label }),
          el('td', { 'data-label': 'URL', text: l.url })
        ));
        const table = el('div', { class: 'table-wrap' },
          el('table', {},
            el('thead', {}, el('tr', {}, el('th', { text: 'Libellé' }), el('th', { text: 'URL' }))),
            el('tbody', {}, rows)
          )
        );
        mainContent.replaceChildren(toolbar, table);
      }
    }

    function deleteItem(category, id, onSuccess) {
      if (!confirm('Voulez-vous vraiment supprimer cet élément ? Cette action est immédiate.')) return;
      appData = getAppData();
      appData[category] = appData[category].filter(x => x.id !== id);
      saveAppData(appData);
      toast('Supprimé avec succès', 'ok');
      onSuccess();
    }

    // --- MODALES D'AJOUT / MODIFICATION PROFESSIONNELLES ---

    function openVideoModal(item = null) {
      const titleIn = el('input', { type: 'text', required: true, value: item ? item.title : '', maxlength: 150 });
      const tagIn = el('input', { type: 'text', value: item ? item.tag || '' : '', placeholder: 'Code, IoT, Design' });
      const dateIn = el('input', { type: 'date', value: item ? item.recorded_on || '' : '' });
      const descIn = el('textarea', { rows: 2 }, item ? item.description || '' : '');
      const urlIn = el('input', { type: 'url', value: item && !item.video_url?.startsWith('data:') ? item.video_url : '', placeholder: 'https://youtube.com/... (ou importer un fichier ci-dessous)' });
      
      const fileIn = el('input', { type: 'file', accept: 'video/*' });
      let videoBase64 = item?.video_url?.startsWith('data:') ? item.video_url : '';

      fileIn.onchange = e => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = event => {
            videoBase64 = event.target.result;
            toast('Vidéo importée avec succès !', 'ok');
          };
          reader.readAsDataURL(file);
        }
      };

      const form = el('form', { class: 'stack' },
        TS1.field('Titre de la formation', titleIn),
        TS1.field('Tag / Catégorie', tagIn),
        TS1.field('Date de publication', dateIn),
        TS1.field('Description', descIn),
        TS1.field('Lien URL de la vidéo (YouTube, etc.)', urlIn),
        TS1.field('Ou importer le fichier vidéo directement (.mp4)', fileIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer la formation' })
      );

      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const finalVideoUrl = videoBase64 || urlIn.value.trim();
        const payload = { 
          id: item ? item.id : 'v_' + Date.now(), 
          title: titleIn.value.trim(), 
          tag: tagIn.value.trim(), 
          recorded_on: dateIn.value, 
          description: descIn.value.trim(),
          video_url: finalVideoUrl 
        };
        if (item) {
          appData.videos = appData.videos.map(v => v.id === item.id ? payload : v);
        } else {
          appData.videos.unshift(payload);
        }
        saveAppData(appData);
        toast('Formation enregistrée et synchronisée !', 'ok');
        dlg.close();
        loadTabData('videos');
      };
      dlg = TS1.dialog(item ? 'Modifier la formation' : 'Nouvelle formation & vidéo', form);
    }

    function openTeamModal(item = null) {
      const nameIn = el('input', { type: 'text', required: true, value: item ? item.full_name : '' });
      const emailIn = el('input', { type: 'email', required: true, value: item ? item.email : '' });
      const roleIn = el('input', { type: 'text', required: true, value: item ? item.role : '', placeholder: 'Lead Developer, Designer...' });
      const poleIn = el('input', { type: 'text', value: item ? item.pole || '' : '', placeholder: 'Développement Web, IoT...' });
      const motiIn = el('textarea', { rows: 2 }, item ? item.motivation || '' : '');
      const ghIn = el('input', { type: 'url', value: item ? item.github || '' : '', placeholder: 'https://github.com/moncompte' });
      const portIn = el('input', { type: 'url', value: item ? item.portfolio || '' : '', placeholder: 'https://monportfolio.netlify.app' });

      const form = el('form', { class: 'stack' },
        TS1.field('Nom complet', nameIn),
        TS1.field('Adresse Email', emailIn),
        TS1.field('Rôle principal', roleIn),
        TS1.field('Pôle / Section', poleIn),
        TS1.field('Motivations / Bio', motiIn),
        TS1.field('Lien GitHub', ghIn),
        TS1.field('Lien Portfolio / Projet personnel', portIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer le membre' })
      );

      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const payload = {
          id: item ? item.id : 't_' + Date.now(),
          full_name: nameIn.value.trim(),
          email: emailIn.value.trim(),
          role: roleIn.value.trim(),
          pole: poleIn.value.trim(),
          motivation: motiIn.value.trim(),
          github: ghIn.value.trim(),
          portfolio: portIn.value.trim(),
          active: true
        };
        if (item) {
          appData.team = appData.team.map(m => m.id === item.id ? payload : m);
        } else {
          appData.team.unshift(payload);
        }
        saveAppData(appData);
        toast('Membre de l\'équipe enregistré !', 'ok');
        dlg.close();
        loadTabData('team');
      };
      dlg = TS1.dialog(item ? 'Modifier le membre' : 'Ajouter un membre à l\'équipe', form);
    }

    function openExpertiseModal(item = null) {
      const titleIn = el('input', { type: 'text', required: true, value: item ? item.title : '' });
      const descIn = el('textarea', { rows: 2 }, item ? item.description || '' : '');
      const iconIn = el('input', { type: 'text', value: item ? item.icon || '' : '', placeholder: 'fa-code' });
      const form = el('form', { class: 'stack' },
        TS1.field('Titre', titleIn), TS1.field('Description', descIn), TS1.field('Icône FontAwesome', iconIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer' })
      );
      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const payload = { id: item ? item.id : 'e_' + Date.now(), title: titleIn.value.trim(), description: descIn.value.trim(), icon: iconIn.value.trim() };
        if (item) appData.expertises = appData.expertises.map(x => x.id === item.id ? payload : x);
        else appData.expertises.unshift(payload);
        saveAppData(appData);
        toast('Expertise enregistrée', 'ok');
        dlg.close();
        loadTabData('expertises');
      };
      dlg = TS1.dialog(item ? 'Modifier l\'expertise' : 'Nouvelle expertise', form);
    }

    function openEventModal(item = null) {
      const titleIn = el('input', { type: 'text', required: true, value: item ? item.title : '' });
      const badgeIn = el('input', { type: 'text', value: item ? item.badge || '' : '' });
      const descIn = el('textarea', { rows: 2 }, item ? item.description || '' : '');
      const form = el('form', { class: 'stack' },
        TS1.field('Titre', titleIn), TS1.field('Badge', badgeIn), TS1.field('Description', descIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer' })
      );
      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const payload = { id: item ? item.id : 'ev_' + Date.now(), title: titleIn.value.trim(), badge: badgeIn.value.trim(), description: descIn.value.trim() };
        if (item) appData.events = appData.events.map(x => x.id === item.id ? payload : x);
        else appData.events.unshift(payload);
        saveAppData(appData);
        toast('Événement enregistré', 'ok');
        dlg.close();
        loadTabData('events');
      };
      dlg = TS1.dialog(item ? 'Modifier l\'événement' : 'Nouvel événement', form);
    }

    function openNewsModal(item = null) {
      const titleIn = el('input', { type: 'text', required: true, value: item ? item.title : '' });
      const sourceIn = el('input', { type: 'text', value: item ? item.source || 'TS NEWS' : 'TS NEWS' });
      const descIn = el('textarea', { rows: 2 }, item ? item.description || '' : '');
      const form = el('form', { class: 'stack' },
        TS1.field('Titre', titleIn), TS1.field('Source', sourceIn), TS1.field('Description', descIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer' })
      );
      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const payload = { id: item ? item.id : 'n_' + Date.now(), title: titleIn.value.trim(), source: sourceIn.value.trim(), description: descIn.value.trim() };
        if (item) appData.news = appData.news.map(x => x.id === item.id ? payload : x);
        else appData.news.unshift(payload);
        saveAppData(appData);
        toast('Actualité enregistrée', 'ok');
        dlg.close();
        loadTabData('news');
      };
      dlg = TS1.dialog(item ? 'Modifier l\'actualité' : 'Nouvelle actualité', form);
    }

    function openProjectModal(item = null) {
      const titleIn = el('input', { type: 'text', required: true, value: item ? item.title : '' });
      const descIn = el('textarea', { rows: 2 }, item ? item.description || '' : '');
      const liveIn = el('input', { type: 'url', value: item ? item.live_url || '' : '', placeholder: 'https://...' });
      const form = el('form', { class: 'stack' },
        TS1.field('Titre', titleIn), TS1.field('Description', descIn), TS1.field('Lien Live', liveIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer' })
      );
      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const payload = { id: item ? item.id : 'p_' + Date.now(), title: titleIn.value.trim(), description: descIn.value.trim(), live_url: liveIn.value.trim() };
        if (item) appData.projects = appData.projects.map(x => x.id === item.id ? payload : x);
        else appData.projects.unshift(payload);
        saveAppData(appData);
        toast('Projet enregistré', 'ok');
        dlg.close();
        loadTabData('projects');
      };
      dlg = TS1.dialog(item ? 'Modifier le projet' : 'Nouveau projet', form);
    }

    function openAgendaModal(item = null) {
      const titleIn = el('input', { type: 'text', required: true, value: item ? item.title : '' });
      const dateIn = el('input', { type: 'date', required: true, value: item ? item.starts_on : '' });
      const descIn = el('textarea', { rows: 2 }, item ? item.description || '' : '');
      const form = el('form', { class: 'stack' },
        TS1.field('Titre', titleIn), TS1.field('Date', dateIn), TS1.field('Description', descIn),
        el('button', { type: 'submit', class: 'btn primary', text: 'Enregistrer' })
      );
      let dlg;
      form.onsubmit = e => {
        e.preventDefault();
        appData = getAppData();
        const payload = { id: item ? item.id : 'ag_' + Date.now(), title: titleIn.value.trim(), starts_on: dateIn.value, description: descIn.value.trim() };
        if (item) appData.agenda = appData.agenda.map(x => x.id === item.id ? payload : x);
        else appData.agenda.unshift(payload);
        saveAppData(appData);
        toast('Agenda enregistré', 'ok');
        dlg.close();
        loadTabData('agenda');
      };
      dlg = TS1.dialog(item ? 'Modifier l\'agenda' : 'Nouvel événement agenda', form);
    }

    switchTab('live');
  }

  const mount = () => {
    let appEl = document.getElementById('app');
    if (!appEl) {
      appEl = document.createElement('div');
      appEl.id = 'app';
      document.body.appendChild(appEl);
    }

    TS1.authGate({
      root: app,
      title: 'Centre de contrôle Admin',
      subtitle: 'Pilotage complet, réel et synchronisé de Tech-Stone One.',
      onReady: adminView
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();