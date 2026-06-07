/**
 * KomoreTransfert - script.js
 * Fonctionnalités :
 *   1. Calculateur de montant (recalcul en temps réel)
 *   2. Tri du tableau par colonne
 *   3. Tracking des clics affiliés
 *   4. Bandeau cookies RGPD
 */

/* ==========================================================================
   1. DONNÉES DES OPÉRATEURS
   ========================================================================== */

/**
 * TODO : Mettre à jour les données chaque semaine.
 * - "frais" : frais fixes en EUR
 * - "taux" : taux EUR/KMF proposé par l'opérateur
 * - "tauxMarche" : taux de change du marché (source : XE.com ou Wise mid-market)
 * - "affilLink" : remplacer [WISE_LINK] etc. par vos vrais liens affiliés
 */
const TAUX_MARCHE = 493.00; // TODO : Mettre à jour chaque semaine (taux mid-market EUR/KMF)

const OPERATORS = [
  {
    id: 'wise',
    name: 'Wise',
    type: 'Transfert en ligne',
    initials: 'W',
    color: '#4CAF50',
    frais: 0.00,         // TODO : vérifier sur wise.com/fr
    taux: 491.50,        // TODO : taux indicatif, à vérifier
    delai: 'Instantané',
    delaiClass: 'instant',
    affilLink: 'https://wise.com/fr/send-money/',
    hasAffil: true,
    note: ''
  },
  {
    id: 'remitly',
    name: 'Remitly',
    type: 'Transfert en ligne',
    initials: 'R',
    color: '#1A73E8',
    frais: 2.99,         // TODO : vérifier sur remitly.com
    taux: 491.97,        // TODO : taux indicatif
    delai: 'Instantané',
    delaiClass: 'instant',
    affilLink: 'https://www.remitly.com/fr/fr/comoros',
    hasAffil: true,
    note: ''
  },
  {
    id: 'worldremit',
    name: 'WorldRemit',
    type: 'Transfert en ligne',
    initials: 'WR',
    color: '#FF5722',
    frais: 3.99,         // TODO : vérifier sur worldremit.com
    taux: 489.00,        // TODO : taux indicatif
    delai: '1-2 heures',
    delaiClass: 'fast',
    affilLink: 'https://www.worldremit.com/fr/envoyer-de-largent/comores',
    hasAffil: true,
    note: ''
  },
  {
    id: 'sendwave',
    name: 'Sendwave',
    type: 'Transfert en ligne',
    initials: 'SW',
    color: '#9C27B0',
    frais: 0.00,         // TODO : vérifier sur sendwave.com
    taux: 488.50,        // TODO : taux indicatif
    delai: 'Instantané',
    delaiClass: 'instant',
    affilLink: 'https://www.sendwave.com/',
    hasAffil: true,
    note: ''
  },
  {
    id: 'western-union',
    name: 'Western Union',
    type: 'Agence physique',
    initials: 'WU',
    color: '#FFD700',
    textColor: '#333',
    frais: 9.00,         // TODO : vérifier sur westernunion.com
    taux: 480.00,        // TODO : taux indicatif
    delai: 'Instantané',
    delaiClass: 'instant',
    affilLink: null,
    hasAffil: false,
    note: 'Nécessite une agence physique'
  },
  {
    id: 'orange-money',
    name: 'Orange Money Europe',
    type: 'Mobile Money',
    initials: 'OM',
    color: '#FF6600',
    frais: 2.99,         // TODO : vérifier sur orangemoney.com
    taux: 491.97,        // TODO : taux indicatif
    delai: 'Instantané',
    delaiClass: 'instant',
    affilLink: null,
    hasAffil: false,
    note: 'Disponible sur Orange Money app'
  }
];

/* ==========================================================================
   2. ÉTAT GLOBAL
   ========================================================================== */

let currentAmount = 200; // montant par défaut
let sortColumn = null;
let sortDirection = 'asc';

/* ==========================================================================
   3. CALCULS
   ========================================================================== */

/**
 * Calcule le coût total "réel" pour un opérateur :
 * coût = frais + (taux_marche - taux_op) * montant_net / taux_op
 * = ce que vous perdez par rapport à un transfert au taux du marché sans frais
 */
function calcOperator(op, amount) {
  const netAmount = amount - op.frais; // argent converti après frais
  if (netAmount <= 0) return { received: 0, coutTotal: amount, coutPerte: amount };

  const received = Math.round(netAmount * op.taux);
  const receivedAtMarket = Math.round(netAmount * TAUX_MARCHE);
  const perteTaux = receivedAtMarket - received; // KMF perdus à cause du mauvais taux
  const perteTauxEUR = perteTaux / TAUX_MARCHE; // convertie en EUR pour comparaison
  const coutTotal = op.frais + perteTauxEUR; // coût total en EUR

  return {
    received,
    coutTotal: Math.round(coutTotal * 100) / 100,
    perteTaux,
    perteTauxEUR: Math.round(perteTauxEUR * 100) / 100
  };
}

/**
 * Trie et retourne les opérateurs enrichis de leurs calculs
 */
function getEnrichedOperators(amount) {
  const enriched = OPERATORS.map(op => ({
    ...op,
    calc: calcOperator(op, amount)
  }));

  if (sortColumn) {
    enriched.sort((a, b) => {
      let valA, valB;
      switch (sortColumn) {
        case 'frais':     valA = a.frais;           valB = b.frais;           break;
        case 'taux':      valA = a.taux;             valB = b.taux;             break;
        case 'received':  valA = a.calc.received;    valB = b.calc.received;    break;
        case 'cout':      valA = a.calc.coutTotal;   valB = b.calc.coutTotal;   break;
        case 'delai':     valA = a.delaiClass;       valB = b.delaiClass;       break;
        default:          valA = a.calc.coutTotal;   valB = b.calc.coutTotal;
      }
      if (typeof valA === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  } else {
    // Tri par défaut : coût total croissant
    enriched.sort((a, b) => a.calc.coutTotal - b.calc.coutTotal);
  }

  return enriched;
}

/* ==========================================================================
   4. RENDU DU TABLEAU
   ========================================================================== */

function formatEUR(val) {
  return val === 0 ? '<span class="frais-free">0,00 €</span>'
    : `<span class="frais-paid">+${val.toFixed(2).replace('.', ',')} €</span>`;
}

function formatKMF(val) {
  return new Intl.NumberFormat('fr-FR').format(val) + ' KMF';
}

function getDelaiLabel(op) {
  const map = { instant: 'badge-instant', fast: 'badge-fast', slow: 'badge-slow' };
  return `<span class="badge ${map[op.delaiClass] || 'badge-instant'}">${op.delai}</span>`;
}

function renderTable() {
  const tbody = document.getElementById('comparison-tbody');
  if (!tbody) return;

  const ops = getEnrichedOperators(currentAmount);
  const bestCout = ops[0].calc.coutTotal; // après tri, le 1er est le moins cher

  tbody.innerHTML = '';

  ops.forEach((op, index) => {
    const isBest = op.calc.coutTotal === bestCout;
    const tr = document.createElement('tr');
    if (isBest) tr.classList.add('best-row');

    // Couleur de l'icône
    const iconBg = op.color || '#003366';
    const iconColor = op.textColor || '#FFFFFF';

    // Lien ou bouton NA
    let ctaHtml;
    if (op.hasAffil && op.affilLink && !op.affilLink.startsWith('[')) {
      ctaHtml = `<a href="${op.affilLink}" target="_blank" rel="noopener sponsored"
        class="btn-table" onclick="trackAffil('${op.id}', '${currentAmount}')">
        Envoyer →</a>`;
    } else if (op.hasAffil) {
      ctaHtml = `<a href="#" class="btn-table btn-table-placeholder"
        onclick="trackAffil('${op.id}', '${currentAmount}'); return false;">
        Envoyer →</a>`;
      // TODO : remplacer href="#" par le vrai lien affilié
    } else {
      ctaHtml = `<span class="btn-table-na">Hors ligne</span>`;
    }

    // Classe couleur coût total
    const coutClass = isBest ? 'best' : (index === ops.length - 1 ? 'worst' : '');

    tr.innerHTML = `
      <td>
        <div class="operator-cell">
          <div class="operator-icon" style="background:${iconBg};color:${iconColor}">
            ${op.initials}
          </div>
          <div>
            <div class="operator-name">
              ${op.name}
              ${isBest ? '<span class="badge badge-best" style="margin-left:6px">Meilleur</span>' : ''}
            </div>
            <div class="operator-type">${op.type}</div>
          </div>
        </div>
      </td>
      <td>${formatEUR(op.frais)}</td>
      <td class="fw-700">${op.taux.toFixed(2)}</td>
      <td>
        <span class="amount-received ${isBest ? 'best' : ''}">
          ${formatKMF(op.calc.received)}
        </span>
      </td>
      <td>
        <span class="cout-total ${coutClass}">
          ${op.calc.coutTotal.toFixed(2).replace('.', ',')} €
        </span>
      </td>
      <td>${getDelaiLabel(op)}</td>
      <td>${ctaHtml}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ==========================================================================
   5. CALCULATEUR INTERACTIF
   ========================================================================== */

function initCalculator() {
  const input = document.getElementById('montant-input');
  if (!input) return;

  input.addEventListener('input', function () {
    const val = parseFloat(this.value.replace(',', '.'));
    if (!isNaN(val) && val > 0 && val <= 50000) {
      currentAmount = val;
      renderTable();
      updateCalcNote();
    }
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') this.blur();
  });
}

function updateCalcNote() {
  const note = document.getElementById('calc-note');
  if (!note) return;
  const ops = getEnrichedOperators(currentAmount);
  const best = ops[0];
  const worst = ops[ops.length - 1];
  const diff = worst.calc.received - best.calc.received;
  note.innerHTML = `Pour <strong>${currentAmount.toLocaleString('fr-FR')} €</strong> envoyés,
    l'écart entre le meilleur et le moins bon opérateur est de
    <strong class="text-green">${new Intl.NumberFormat('fr-FR').format(diff)} KMF</strong>
    (environ <strong class="text-green">${(worst.calc.coutTotal - best.calc.coutTotal).toFixed(2).replace('.', ',')} €</strong> de différence de coût réel).`;
}

/* ==========================================================================
   6. TRI DES COLONNES
   ========================================================================== */

function initTableSort() {
  const headers = document.querySelectorAll('.comparison-table thead th[data-sort]');
  headers.forEach(th => {
    th.addEventListener('click', function () {
      const col = this.dataset.sort;
      if (sortColumn === col) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = col;
        sortDirection = 'asc';
      }
      // Mise à jour visuelle des icônes
      headers.forEach(h => {
        h.classList.remove('sorted');
        h.querySelector('.sort-icon').textContent = '↕';
      });
      this.classList.add('sorted');
      this.querySelector('.sort-icon').textContent = sortDirection === 'asc' ? '↑' : '↓';
      renderTable();
    });
  });
}

/* ==========================================================================
   7. TRACKING AFFILIÉS
   ========================================================================== */

/**
 * TODO : Remplacer console.log par votre solution analytics (Google Analytics 4,
 * Plausible, Fathom, etc.) une fois le compte créé.
 *
 * Exemple avec GA4 :
 *   gtag('event', 'affil_click', { operator: operatorId, amount: amount });
 */
function trackAffil(operatorId, amount) {
  console.log(`[KomoreTransfert] Clic affilié : ${operatorId} | Montant : ${amount} EUR`);

  // TODO : Décommenter et adapter quand GA4 est installé
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', 'affil_click', {
  //     event_category: 'Affiliation',
  //     event_label: operatorId,
  //     value: parseFloat(amount)
  //   });
  // }

  // TODO : Décommenter pour Plausible
  // if (typeof plausible !== 'undefined') {
  //   plausible('Affil Click', { props: { operator: operatorId } });
  // }
}

/* ==========================================================================
   8. BANDEAU COOKIES RGPD
   ========================================================================== */

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const consent = localStorage.getItem('kmt_cookie_consent');
  if (!consent) {
    banner.style.display = 'block';
  }

  const btnAccept = banner.querySelector('.btn-accept');
  const btnDecline = banner.querySelector('.btn-decline');

  if (btnAccept) {
    btnAccept.addEventListener('click', function () {
      localStorage.setItem('kmt_cookie_consent', 'accepted');
      banner.style.display = 'none';
      // TODO : Initialiser vos outils analytics ici
      console.log('[KomoreTransfert] Consentement cookies : accepté');
    });
  }

  if (btnDecline) {
    btnDecline.addEventListener('click', function () {
      localStorage.setItem('kmt_cookie_consent', 'declined');
      banner.style.display = 'none';
      console.log('[KomoreTransfert] Consentement cookies : refusé');
    });
  }
}

/* ==========================================================================
   9. MENU MOBILE
   ========================================================================== */

function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('header nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Fermer si clic à l'extérieur
  document.addEventListener('click', function (e) {
    if (!e.target.closest('header')) {
      nav.classList.remove('open');
    }
  });
}

/* ==========================================================================
   10. FAQ ACCORDÉON (page guide)
   ========================================================================== */

function initFAQ() {
  const questions = document.querySelectorAll('.faq-question');
  questions.forEach(btn => {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const isOpen = answer.classList.contains('open');

      // Fermer toutes les autres
      document.querySelectorAll('.faq-answer.open').forEach(el => el.classList.remove('open'));
      document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        answer.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   11. NEWSLETTER (simulation)
   ========================================================================== */

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    if (!email) return;

    // TODO : Remplacer par votre intégration Mailchimp / Brevo / Convertkit
    // Exemple Brevo (SendinBlue) :
    // fetch('https://api.brevo.com/v3/contacts', { method: 'POST', ... })

    console.log(`[KomoreTransfert] Inscription newsletter : ${email}`);
    this.innerHTML = `<p style="color:var(--green);font-weight:700;font-size:1rem;">
      ✓ Merci ! Vous recevrez les mises à jour des taux par email.</p>`;
  });
}

/* ==========================================================================
   12. INITIALISATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initCookieBanner();
  initMobileMenu();
  initCalculator();
  initTableSort();
  renderTable();
  updateCalcNote();
  initFAQ();
  initNewsletter();

  console.log('[KomoreTransfert] Site initialisé. Taux de marché :', TAUX_MARCHE, 'EUR/KMF');
  console.log('[KomoreTransfert] TODO : Remplacer les [XXXX_LINK] par vos vrais liens affiliés dans script.js');
});
