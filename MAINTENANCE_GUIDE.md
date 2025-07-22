# Mode Maintenance - NLIVRILIK

## Description
Le mode maintenance permet de rediriger automatiquement toutes les requêtes vers une page de maintenance personnalisée, tout en conservant l'accès aux API et ressources nécessaires.

## Configuration

### Activation du mode maintenance
Dans le fichier `next.config.mjs`, modifiez la variable `isMaintenanceMode` :

```javascript
const isMaintenanceMode = true; // Active le mode maintenance
```

### Désactivation du mode maintenance
```javascript
const isMaintenanceMode = false; // Désactive le mode maintenance
```

## Fonctionnalités de la page de maintenance

### ✨ Caractéristiques
- **Design responsive** : Adaptation automatique à tous les appareils
- **Animation Lottie** : Animation interactive depuis le dossier public
- **Branding complet** : Logo, couleurs et identité NLIVRILIK
- **Informations de contact** : Liens directs vers yelmouss devt
- **Animations fluides** : Transitions Framer Motion
- **SEO optimisé** : Meta tags spécifiques pour la maintenance

### 🎨 Éléments visuels
- Logo NLIVRILIK avec animation pulse
- Animation Lottie services
- Dégradés de couleurs brandés
- Effets d'hover interactifs
- Icônes et émojis expressifs

### 📞 Contacts disponibles
- **Email** : yelmouss@nlivrilik.ma
- **WhatsApp** : +212 612 865 681 (avec message pré-rempli)
- **Téléphone direct** : +212 612 865 681

## Structure des fichiers

```
src/app/maintenance/
├── page.js              # Page principale de maintenance
├── layout.js            # Layout spécifique (évite le layout principal)
└── maintenance.css      # Styles CSS personnalisés
```

## Redirection automatique

Le système redirige automatiquement :
- ✅ Toutes les pages vers `/maintenance`
- ❌ Exclut : `/maintenance`, `/_next/*`, `/api/*`

## Personnalisation

### Modifier l'animation
Changez le fichier d'animation dans `page.js` :
```javascript
fetch('/VotreAnimation.json') // Remplacez par votre fichier
```

### Modifier les contacts
Ajustez les liens dans la section contact :
```javascript
href="mailto:votre-email@domaine.com"
href="https://wa.me/VOTRE_NUMERO"
```

### Styles personnalisés
Modifiez `maintenance.css` pour ajuster :
- Couleurs de brand
- Animations
- Responsive design
- Effets visuels

## Déploiement

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Notes importantes

⚠️ **Attention** : 
- Pensez à désactiver le mode maintenance après les travaux
- Testez la page avant activation en production
- Gardez les API actives si nécessaire pour les applications mobiles
- Informez les utilisateurs à l'avance via les réseaux sociaux

## Support technique

Pour toute question technique sur la configuration :
- **Développeur** : yelmouss devt
- **Email** : yelmouss@nlivrilik.ma
- **WhatsApp** : +212 612 865 681
