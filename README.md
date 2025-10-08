# Mon Profil Spotify

Une application web interactive permettant de visualiser votre profil Spotify, vos artistes suivis et de rechercher des morceaux de musique en utilisant l'API Spotify.

## Fonctionnalités

- **Authentification OAuth 2.0** : Connexion sécurisée via Spotify avec le flux PKCE (Proof Key for Code Exchange)
- **Artistes suivis** : Liste de tous les artistes que vous suivez avec leurs images
- **Recherche de musique** : Recherche de morceaux par titre ou artiste
- **Lecteur intégré** : Écoute directe des morceaux via le lecteur Spotify embarqué
- **Gestion des tokens** : Rafraîchissement automatique des tokens d'accès pour une session continue

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, JavaScript, Tailwind CSS
- **Build Tool** : Vite
- **API** : Spotify Web API
- **Authentification** : OAuth 2.0 avec PKCE

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement installé avec Node.js)
- Un compte Spotify Developer(gratuit ou premium)
- Un client ID Spotify (voir Configuration)

## 🚀 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/AllanDe9/API-SPOTIFY.git
   cd API-SPOTIFY
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'application Spotify** (voir section Configuration ci-dessous)

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   
   Ouvrir votre navigateur et aller sur `http://127.0.0.1:5173`

## ⚙️ Configuration

### Créer une application Spotify

1. Allez sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Connectez-vous avec votre compte Spotify
3. Cliquez sur "Create app"
4. Remplissez les informations :
   - **App name** : Mon Profil Spotify (ou le nom de votre choix)
   - **App description** : Application web pour visualiser mon profil Spotify
   - **Redirect URI** : `http://127.0.0.1:5173`
   - Acceptez les conditions d'utilisation
5. Cliquez sur "Save"
6. Dans les paramètres de l'application, copiez le **Client ID**

### Configurer le Client ID

Ouvrez le fichier `src/script.js` et remplacez la valeur du `clientId` à la ligne 1 :

```javascript
const clientId = "VOTRE_CLIENT_ID_ICI";
```

**⚠️ Important** : Ne partagez jamais votre Client ID publiquement dans un dépôt public.

## 📖 Utilisation

1. **Première connexion**
   - Lancez l'application avec `npm run dev`
   - Vous serez automatiquement redirigé vers la page d'autorisation Spotify
   - Autorisez l'application à accéder à vos informations Spotify
   - Vous serez redirigé vers l'application

2. **Visualiser votre profil**
   - Votre nom d'utilisateur s'affiche en haut de la page
   - La liste de vos artistes suivis apparaît avec leurs images

3. **Rechercher de la musique**
   - Utilisez la barre de recherche pour trouver des morceaux
   - Entrez un titre ou un nom d'artiste
   - Cliquez sur "Rechercher"
   - Les résultats s'affichent dans un tableau avec :
     - Image de l'album
     - Titre du morceau
     - Artiste(s)
     - Album
     - Bouton "Écouter" pour lire le morceau
     - Bouton "Lien" pour ouvrir le morceau sur Spotify

4. **Écouter un morceau**
   - Cliquez sur le bouton "Écouter" dans les résultats de recherche
   - Le lecteur Spotify embarqué apparaît en bas de page
   - Vous pouvez écouter un extrait du morceau (30 secondes pour les comptes gratuits)

## 🏗️ Structure du projet

```
API-SPOTIFY/
├── index.html              # Page HTML principale
├── package.json            # Dépendances et scripts npm
├── vite.config.js          # Configuration Vite
├── src/
│   ├── script.js           # Logique principale de l'application
│   ├── main.js             # Fichier principal Vite (non utilisé)
│   ├── style.css           # Styles CSS (non utilisés, Tailwind utilisé)
│   └── counter.js          # Fichier exemple Vite (non utilisé)
└── public/
    └── vite.svg            # Logo Vite
```

## 📜 Scripts disponibles

- `npm run dev` : Lance le serveur de développement sur `http://127.0.0.1:5173`
- `npm run build` : Compile l'application pour la production dans le dossier `dist/`
- `npm run preview` : Prévisualise la version de production

## 🔒 Sécurité et confidentialité

- L'application utilise le flux OAuth 2.0 PKCE qui est sécurisé et recommandé pour les applications frontend
- Les tokens d'accès sont stockés dans le `localStorage` du navigateur
- Aucune donnée n'est envoyée à un serveur tiers
- Le Client ID est visible dans le code source, mais cela est normal pour les applications publiques utilisant PKCE

## 🐛 Résolution des problèmes

### L'application ne se connecte pas
- Vérifiez que le Client ID est correctement configuré dans `src/script.js`
- Assurez-vous que l'URI de redirection `http://127.0.0.1:5173` est bien configurée dans votre application Spotify

### Les artistes ou la recherche ne s'affichent pas
- Vérifiez votre connexion internet
- Ouvrez la console du navigateur (F12) pour voir les éventuelles erreurs

### Le token expire
- L'application rafraîchit automatiquement le token
- Si le problème persiste, supprimez le `localStorage` du navigateur et reconnectez-vous
