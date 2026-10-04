(() => {
  const styles = `
    :root {
      --bg: #060b13;
      --panel: #0d1726;
      --panel-2: #101d30;
      --border: rgba(255,255,255,0.08);
      --text: #edf4ff;
      --dim: #9ab0c8;
      --accent: #5aa3ff;
      --accent-text: #dfeeff;
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: "Inter", sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    body {
      min-height: 100vh;
    }

    .shell {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }

    .side {
      background: var(--panel);
      border-right: 1px solid var(--border);
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 6px;
    }

    .brand-badge {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: linear-gradient(135deg, #5aa3ff, #6ed6ff);
      color: #08111d;
      font-weight: 800;
    }

    .brand-name {
      font-weight: 800;
      letter-spacing: 0.04em;
    }

    .nav-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--dim);
      margin: 14px 8px 6px;
    }

    .nav-btn {
      display: block;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      color: var(--text);
      padding: 9px 12px;
      border-radius: 10px;
      cursor: pointer;
      font: inherit;
      font-size: 0.92rem;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .nav-btn.active {
      background: #0b3a6e;
      font-weight: 600;
    }

    .side-foot {
      margin-top: auto;
      display: grid;
      gap: 8px;
      padding: 6px;
    }

    .who {
      font-weight: 700;
      word-break: break-word;
    }

    .content {
      padding: 30px clamp(16px, 4vw, 40px) 60px;
      width: 100%;
      max-width: 1150px;
    }

    .intro {
      margin-bottom: 18px;
      max-width: 760px;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 16px 0;
    }

    .toolbar select {
      width: auto;
      min-width: 190px;
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th, td {
      text-align: left;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    th {
      color: var(--dim);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(255,255,255,0.03);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .actions {
      display: flex;
      gap: 8px;
      white-space: nowrap;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin: 20px 0;
    }

    .stat {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      text-align: left;
      color: var(--text);
      cursor: pointer;
      font: inherit;
      display: grid;
      gap: 4px;
      transition: 0.2s;
    }

    .stat:hover {
      border-color: var(--accent);
      transform: translateY(-3px);
    }

    .stat-n {
      font-size: 2rem;
      font-weight: 800;
      color: var(--accent-text);
    }

    .stat-l {
      color: var(--dim);
      font-size: 0.85rem;
    }

    .live-box {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    @media (max-width: 800px) {
      .shell {
        grid-template-columns: 1fr;
      }

      .side {
        position: static;
        height: auto;
      }

      .side-nav {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 6px;
      }

      .nav-title {
        display: none;
      }

      .nav-btn {
        white-space: nowrap;
        width: auto;
        background: rgba(255,255,255,0.05);
      }

      .side-foot {
        grid-auto-flow: row;
        margin-top: 0;
      }

      table, thead, tbody, tr, td {
        display: block;
      }

      thead {
        display: none;
      }

      tr {
        padding: 12px 14px;
        border-bottom: 1px solid var(--border);
      }

      td {
        border: none;
        padding: 4px 0;
      }

      td::before {
        content: attr(data-label) ' : ';
        color: var(--dim);
        font-size: 0.8rem;
      }
    }
  `;

  const pageMarkup = `
    <style>${styles}</style>
    <div class="shell">
      <aside class="side">
        <div class="brand">
          <div class="brand-badge">T</div>
          <div class="brand-name">Tech-Stone One</div>
        </div>

        <div class="side-nav">
          <div class="nav-title">Navigation</div>
          <button class="nav-btn active" type="button">Tableau de bord</button>
          <button class="nav-btn" type="button">Commandes</button>
          <button class="nav-btn" type="button">Produits</button>
          <button class="nav-btn" type="button">Clients</button>
          <button class="nav-btn" type="button">Livraisons</button>
          <button class="nav-btn" type="button">Paramètres</button>
        </div>

        <div class="side-foot">
          <div class="nav-title">Session</div>
          <div class="who">admin@techstone.one</div>
          <button class="nav-btn" type="button">Se déconnecter</button>
        </div>
      </aside>

      <main class="content">
        <section class="intro">
          <h1>Contrôle</h1>
          <p>Suivez les performances de la boutique et gérez les opérations en temps réel.</p>
        </section>

        <div class="live-box">
          <span class="dot"></span>
          <strong>Live</strong>
          <span class="muted">Dernière mise à jour : maintenant</span>
        </div>

        <div class="cards">
          <div class="stat">
            <div class="stat-n">1 248</div>
            <div class="stat-l">Ventes</div>
          </div>
          <div class="stat">
            <div class="stat-n">96</div>
            <div class="stat-l">Commandes en cours</div>
          </div>
          <div class="stat">
            <div class="stat-n">€18.4k</div>
            <div class="stat-l">Revenu</div>
          </div>
          <div class="stat">
            <div class="stat-n">4.8%</div>
            <div class="stat-l">Taux de conversion</div>
          </div>
        </div>

        <div class="toolbar">
          <label>
            <span class="sr-only">Période</span>
            <select>
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>90 derniers jours</option>
            </select>
          </label>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Commande">#TS1-2048</td>
                <td data-label="Client">Sarah L.</td>
                <td data-label="Statut">En cours</td>
                <td data-label="Montant">€240.00</td>
                <td data-label="Actions"><div class="actions"><button type="button">Voir</button><button type="button">Valider</button></div></td>
              </tr>
              <tr>
                <td data-label="Commande">#TS1-2051</td>
                <td data-label="Client">Noah B.</td>
                <td data-label="Statut">Livré</td>
                <td data-label="Montant">€185.50</td>
                <td data-label="Actions"><div class="actions"><button type="button">Voir</button><button type="button">Détails</button></div></td>
              </tr>
              <tr>
                <td data-label="Commande">#TS1-2060</td>
                <td data-label="Client">Claire M.</td>
                <td data-label="Statut">À préparer</td>
                <td data-label="Montant">€310.00</td>
                <td data-label="Actions"><div class="actions"><button type="button">Voir</button><button type="button">Mettre à jour</button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  const mount = () => {
    let app = document.getElementById('app');
    if (!app) {
      app = document.createElement('div');
      app.id = 'app';
      document.body.appendChild(app);
    }
    app.innerHTML = pageMarkup;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();