# 🚀 Guide de Déploiement - CaisseManager

Ce guide vous explique comment déployer CaisseManager en production.

## 📋 Prérequis

- Node.js 18+ et npm
- Docker et Docker Compose (pour le déploiement containerisé)
- Un serveur avec accès SSH (pour déploiement manuel)
- Variables d'environnement configurées

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.production` avec les variables suivantes :

```env
REACT_APP_API_URL=https://api.caisse-manager.com
REACT_APP_APP_NAME=CaisseManager
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
REACT_APP_ENABLE_ANALYTICS=true
```

### Variables optionnelles

```env
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_GA_MEASUREMENT_ID=your-ga-id
```

## 🐳 Déploiement avec Docker

### 1. Build de l'image

```bash
docker build \
  --build-arg REACT_APP_API_URL=https://api.caisse-manager.com \
  --build-arg REACT_APP_APP_NAME=CaisseManager \
  --build-arg REACT_APP_VERSION=1.0.0 \
  --build-arg REACT_APP_ENV=production \
  -t caisse-manager:latest .
```

### 2. Lancement avec Docker Compose

```bash
# Créer un fichier .env pour docker-compose
echo "REACT_APP_API_URL=https://api.caisse-manager.com" > .env

# Lancer le conteneur
docker-compose up -d
```

L'application sera accessible sur `http://localhost:3000`

### 3. Vérification

```bash
# Vérifier les logs
docker-compose logs -f frontend

# Vérifier le health check
curl http://localhost:3000/health
```

## ☁️ Déploiement Cloud

### Vercel

1. Installer Vercel CLI : `npm i -g vercel`
2. Se connecter : `vercel login`
3. Déployer : `vercel --prod`

Les variables d'environnement peuvent être configurées dans le dashboard Vercel.

### Netlify

1. Installer Netlify CLI : `npm i -g netlify-cli`
2. Build : `npm run build`
3. Déployer : `netlify deploy --prod --dir=build`

### AWS (S3 + CloudFront)

1. Build : `npm run build`
2. Upload vers S3 :
```bash
aws s3 sync build/ s3://your-bucket-name --delete
```
3. Configurer CloudFront pour servir depuis S3

### Google Cloud Platform

1. Build : `npm run build`
2. Utiliser Cloud Run ou App Engine
3. Configurer les variables d'environnement dans la console GCP

### Azure

1. Build : `npm run build`
2. Utiliser Azure Static Web Apps ou App Service
3. Configurer les variables d'environnement dans Azure Portal

## 🔄 CI/CD avec GitHub Actions

Le pipeline CI/CD est déjà configuré dans `.github/workflows/deploy.yml`.

### Configuration requise

Ajoutez ces secrets dans GitHub :
- `REACT_APP_API_URL` : URL de l'API backend
- `REACT_APP_APP_NAME` : Nom de l'application

### Déploiement automatique

Le pipeline se déclenche automatiquement sur :
- Push sur `main` → Déploiement production
- Push sur `develop` → Déploiement staging
- Pull Request → Build et tests uniquement

## 📦 Build de production

### Build local

```bash
# Installer les dépendances
npm ci

# Build de production
npm run build
```

Les fichiers seront générés dans le dossier `build/`.

### Optimisations

Le build inclut automatiquement :
- Minification CSS/JS
- Tree shaking
- Code splitting
- Compression Gzip (via nginx)

## 🔍 Vérification post-déploiement

### Checklist

- [ ] L'application se charge correctement
- [ ] Le login fonctionne
- [ ] Les appels API sont corrects (vérifier la console)
- [ ] Le dark mode fonctionne
- [ ] Le responsive fonctionne sur mobile
- [ ] Les performances sont bonnes (Lighthouse > 90)
- [ ] Les health checks répondent

### Tests de performance

```bash
# Lighthouse CLI
npm install -g @lhci/cli
lhci autorun --collect.url=https://your-app-url.com
```

## 🔄 Rollback

### Docker

```bash
# Revenir à une version précédente
docker-compose down
docker pull caisse-manager:previous-version
docker-compose up -d
```

### Vercel/Netlify

Utilisez l'interface web pour revenir à un déploiement précédent.

## 🐛 Troubleshooting

### L'application ne se charge pas

1. Vérifier les logs : `docker-compose logs frontend`
2. Vérifier les variables d'environnement
3. Vérifier que l'API backend est accessible

### Erreurs 404 sur les routes

Vérifier que nginx est configuré pour rediriger toutes les routes vers `index.html` (déjà fait dans `nginx.conf`).

### Problèmes de CORS

Vérifier que le backend autorise les requêtes depuis votre domaine.

### Performance lente

1. Vérifier la compression Gzip
2. Vérifier le cache des assets statiques
3. Optimiser les images
4. Vérifier le code splitting

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Nginx](https://nginx.org/en/docs/)

## 🆘 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.






