# 🛒 CaisseManager - Solution de Gestion de Caisse

Application web moderne de gestion de caisse pour restaurants et snacks, avec interface intuitive et fonctionnalités complètes.

## ✨ Fonctionnalités

### Pour les Caissiers
- ✅ Interface de caisse intuitive et rapide
- ✅ Gestion du panier en temps réel
- ✅ Paiement par carte ou espèces
- ✅ Gestion des remises (montant ou pourcentage)
- ✅ Impression de tickets
- ✅ Recherche rapide de produits

### Pour les Managers
- ✅ Gestion complète du menu (produits, catégories)
- ✅ Gestion des ingrédients
- ✅ Affichage cuisine (commandes en préparation)
- ✅ Rapports et statistiques détaillés
- ✅ Gestion des utilisateurs
- ✅ Gestion des promotions
- ✅ Gestion des imprimantes

### Pour les Super Admins
- ✅ Dashboard d'administration SaaS
- ✅ Gestion multi-tenant (multi-snacks)
- ✅ Gestion des plans et abonnements
- ✅ Statistiques globales

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Backend API en cours d'exécution (voir [backend repository](../caisse))

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd caisse-manager-ui

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.development

# Modifier les variables d'environnement si nécessaire
# REACT_APP_API_URL=http://localhost:8081
```

### Développement

```bash
# Lancer le serveur de développement
npm start

# L'application sera accessible sur http://localhost:3000
```

### Build de Production

```bash
# Créer un build optimisé
npm run build

# Les fichiers seront dans le dossier build/
```

### Tests

```bash
# Lancer les tests
npm test

# Tests avec coverage
npm test -- --coverage
```

## 🐳 Déploiement avec Docker

### Build et Lancement

```bash
# Build de l'image
docker build -t caisse-manager:latest .

# Ou avec docker-compose
docker-compose up -d
```

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails.

## 🏗️ Architecture

### Structure du Projet

```
src/
├── components/          # Composants React
│   ├── common/         # Composants réutilisables (Button, Input, Card, etc.)
│   └── ...            # Composants métier
├── contexts/           # Contextes React (Auth, Theme, Snack)
├── hooks/              # Hooks personnalisés
├── services/           # Services API
├── utils/              # Utilitaires (formatters, validators, etc.)
├── config/             # Configuration (API, thème, constantes)
└── styles/             # Styles globaux
```

### Technologies

- **React 19** - Bibliothèque UI
- **Tailwind CSS** - Framework CSS
- **Framer Motion** - Animations
- **React Query** - Gestion des données
- **Axios** - Client HTTP
- **Sonner** - Notifications toast
- **Lucide React** - Icônes

## 🎨 Design System

L'application utilise un système de design cohérent avec :

- **Couleurs** : Palette bleu/violet professionnelle
- **Typographie** : Inter (principale) et Poppins
- **Composants** : Button, Input, Card, Modal, Badge standardisés
- **Dark Mode** : Support complet du mode sombre
- **Responsive** : Mobile-first, breakpoints cohérents

## 🔐 Authentification

L'application utilise JWT pour l'authentification :

1. Login avec pseudo/mot de passe
2. Token stocké dans localStorage
3. Validation automatique du token
4. Déconnexion automatique si token invalide

## 📱 PWA

L'application est une Progressive Web App (PWA) :

- Installable sur mobile/desktop
- Fonctionne hors ligne (avec service worker)
- Notifications push (à venir)

## 🔧 Configuration

### Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `REACT_APP_API_URL` | URL de l'API backend | `http://localhost:8081` |
| `REACT_APP_APP_NAME` | Nom de l'application | `CaisseManager` |
| `REACT_APP_VERSION` | Version de l'application | `1.0.0` |
| `REACT_APP_ENV` | Environnement | `development` |
| `REACT_APP_ENABLE_ANALYTICS` | Activer analytics | `false` |

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 📦 Build et Optimisation

Le build de production inclut :

- ✅ Minification CSS/JS
- ✅ Tree shaking
- ✅ Code splitting automatique
- ✅ Lazy loading des composants
- ✅ Compression Gzip (via nginx)

## 🚢 CI/CD

Le pipeline CI/CD est configuré avec GitHub Actions :

- Build automatique sur push
- Tests automatiques
- Déploiement automatique (selon la branche)
- Docker image push vers GitHub Container Registry

## 📚 Documentation

- [Guide de Déploiement](./DEPLOYMENT.md)
- [Prompt de Refonte](./PROMPT_REFONTE_COMPLETE.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence propriétaire.

## 👥 Équipe

Développé avec ❤️ par l'équipe CaisseManager

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024






