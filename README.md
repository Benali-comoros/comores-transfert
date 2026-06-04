# KomoreTransfert — Guide de déploiement sur GitHub Pages

Déploiement gratuit, sans serveur, sans domaine payant.  
URL finale : `https://[votre-username].github.io/comores-transfert/`

---

## Table des matières

1. [Créer un compte GitHub](#1-créer-un-compte-github)
2. [Créer le dépôt](#2-créer-le-dépôt)
3. [Upload des fichiers](#3-upload-des-fichiers)
4. [Activer GitHub Pages](#4-activer-github-pages)
5. [Vérifier le déploiement](#5-vérifier-le-déploiement)
6. [Mettre à jour les taux chaque semaine](#6-mettre-à-jour-les-taux-chaque-semaine)
7. [Remplacer les liens affiliés](#7-remplacer-les-liens-affiliés)
8. [Checklist avant lancement](#8-checklist-avant-lancement)

---

## 1. Créer un compte GitHub

> Si vous avez déjà un compte GitHub, passez à l'étape 2.

1. Allez sur [github.com](https://github.com) et cliquez **Sign up**.
2. Choisissez un nom d'utilisateur — il sera visible dans l'URL du site.  
   Exemple : `diaspora-comorienne` → URL = `diaspora-comorienne.github.io/comores-transfert/`
3. Vérifiez votre adresse email.
4. Choisissez le plan **Free** (gratuit).

---

## 2. Créer le dépôt

1. Connectez-vous sur GitHub.
2. Cliquez sur le bouton vert **New** (haut gauche) ou allez sur  
   `github.com/new`
3. Configurez le dépôt :
   - **Repository name** : `comores-transfert` (exactement ce nom)
   - **Visibility** : cochez **Public** (obligatoire pour GitHub Pages gratuit)
   - **Description** : `Comparateur de transfert d'argent France → Comores`
   - Ne cochez **pas** "Add a README file" (vous allez importer les vôtres)
4. Cliquez **Create repository**.

---

## 3. Upload des fichiers

### Option A — Via l'interface web (sans Git, plus simple)

1. Sur la page de votre dépôt vide, cliquez **uploading an existing file**.
2. Glissez-déposez les 5 fichiers suivants depuis le dossier `site/` :
   - `index.html`
   - `guide.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. En bas de page, dans "Commit changes" :
   - Message : `Lancement initial KomoreTransfert`
4. Cliquez **Commit changes**.

### Option B — Via Git en ligne de commande

```bash
# Cloner le dépôt vide
git clone https://github.com/[votre-username]/comores-transfert.git
cd comores-transfert

# Copier les fichiers du dossier site/
cp /chemin/vers/site/* .

# Commit et push
git add .
git commit -m "Lancement initial KomoreTransfert"
git push origin main
```

---

## 4. Activer GitHub Pages

1. Dans votre dépôt, cliquez sur l'onglet **Settings** (engrenage).
2. Dans le menu gauche, cliquez **Pages**.
3. Sous **Source**, sélectionnez :
   - **Deploy from a branch**
   - Branch : **main**
   - Folder : **/ (root)**
4. Cliquez **Save**.
5. GitHub affiche le message :  
   _"Your site is live at https://[votre-username].github.io/comores-transfert/"_

> Le déploiement prend entre 1 et 5 minutes la première fois.

---

## 5. Vérifier le déploiement

1. Attendez 2-3 minutes puis ouvrez l'URL :  
   `https://[votre-username].github.io/comores-transfert/`
2. Vérifiez que :
   - La page d'accueil s'affiche correctement
   - Le comparateur se charge (tableau visible)
   - Le calculateur fonctionne (changez le montant)
   - La page guide est accessible via le menu
   - Le site est responsive (testez sur mobile)

---

## 6. Mettre à jour les taux chaque semaine

Les taux de change changent tous les jours. Il est recommandé de les vérifier
**chaque semaine** (par exemple chaque lundi matin).

### Où trouver les taux actuels

1. **Taux mid-market EUR/KMF** : rendez-vous sur [wise.com/tools/exchange-rate-calculator](https://wise.com/tools/exchange-rate-calculator), entrez EUR → KMF. C'est le `TAUX_MARCHE` de référence.
2. **Taux par opérateur** : simulez un envoi de 200 € sur chaque site (Wise, Remitly, WorldRemit, Sendwave) et notez le taux affiché.

### Comment modifier script.js

Dans le fichier `script.js`, trouvez le bloc `OPERATORS` en début de fichier.  
Mettez à jour les valeurs `frais` et `taux` pour chaque opérateur :

```javascript
const TAUX_MARCHE = 493.00; // ← Mettre à jour avec le taux du jour

const OPERATORS = [
  {
    id: 'wise',
    frais: 0.00,     // ← Frais affichés sur wise.com pour 200 €
    taux: 491.50,    // ← Taux EUR/KMF proposé par Wise
    // ...
  },
  // etc.
];
```

Mettez également à jour la date dans `index.html` (section hero et footer) :

```html
<!-- Dans index.html, repérez et changez : -->
<span class="stat-number" id="update-date">05/06</span>
<!-- et -->
<small>Dernière mise à jour du tableau : <span id="footer-update">05 juin 2026</span></small>
```

### Déployer la mise à jour

**Via l'interface web GitHub :**
1. Ouvrez votre dépôt sur GitHub.
2. Cliquez sur `script.js` dans la liste des fichiers.
3. Cliquez sur l'icône crayon (Edit this file).
4. Modifiez les taux directement dans l'éditeur.
5. Cliquez **Commit changes** avec un message type :  
   `Mise à jour taux 10 juin 2026`
6. Le site se met à jour automatiquement en 1-2 minutes.

---

## 7. Remplacer les liens affiliés

Une fois approuvé par les programmes d'affiliation, remplacez les placeholders
dans `script.js` et dans les deux fichiers HTML.

### Dans script.js

```javascript
// Ligne à trouver dans chaque opérateur :
affilLink: '[WISE_LINK]',

// Remplacer par :
affilLink: 'https://wise.prf.hn/click/camref:VOTRE_REF_ICI',
```

### Dans guide.html et index.html

Recherchez (`Ctrl+F` sur le fichier) toutes les occurrences de :
- `[WISE_LINK]` → remplacer par votre lien Wise
- `[REMITLY_LINK]` → remplacer par votre lien Remitly
- `[WORLDREMIT_LINK]` → remplacer par votre lien WorldRemit
- `[SENDWAVE_LINK]` → remplacer par votre lien Sendwave

### Comment obtenir les liens affiliés

| Programme | Lien pour postuler |
|-----------|-------------------|
| Wise | [transferwise.com/affiliate](https://transferwise.com/affiliate) |
| Remitly | Via Impact Radius ou Partnerize |
| WorldRemit | Via Commission Junction (CJ) |
| Sendwave | Via leur programme affilié direct |

> Conseil : Postulez en mentionnant que votre audience est la diaspora comorienne
> en France, avec un site comparateur. Cela augmente vos chances d'approbation.

---

## 8. Checklist avant lancement

Avant de partager l'URL publiquement, vérifiez :

### SEO et technique
- [ ] Remplacer `[VOTRE_USERNAME]` par votre vrai nom dans les balises `<link rel="canonical">` et `<meta property="og:url">` dans les deux fichiers HTML
- [ ] Taux mis à jour (vérifier `TAUX_MARCHE` dans script.js)
- [ ] Dates de mise à jour affichées correctement
- [ ] Tester sur mobile (Chrome DevTools → Mode responsive)
- [ ] Tester sur Firefox et Safari

### Liens
- [ ] Les liens `[WISE_LINK]` etc. sont remplacés OU vous avez prévu de le faire rapidement
- [ ] Le lien "Comparer maintenant" du hero pointe vers `#comparateur`
- [ ] Le menu fonctionne sur mobile (bouton hamburger)

### Contenu
- [ ] Mentions légales vérifiées avec un avocat ou un template conforme RGPD
- [ ] Disclaimer affiliation visible dans le footer
- [ ] Date de mise à jour dans le header et le footer

### Optionnel mais recommandé
- [ ] Google Search Console configuré (pour suivre le référencement)
- [ ] Google Analytics 4 ou Plausible installé (pour les statistiques)
- [ ] Formulaire newsletter connecté à Brevo / Mailchimp

---

## Structure des fichiers

```
comores-transfert/
├── index.html      ← Page d'accueil + comparateur
├── guide.html      ← Guide SEO
├── style.css       ← Styles (mobile-first)
├── script.js       ← Logique JS + données des taux
└── README.md       ← Ce fichier
```

---

## Support

Des questions ? Ouvrez une **Issue** sur le dépôt GitHub ou contactez-nous
à l'adresse configurée dans vos mentions légales.
