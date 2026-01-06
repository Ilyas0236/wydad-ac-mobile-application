# 🔴⚪ Wydad Athletic Club - Application Mobile

Application mobile officielle du **Wydad Athletic Club (WAC)** - Le club de football le plus titré du Maroc.

![WAC Logo](assets/logo.png)

---

## 📱 Description

Application mobile complète permettant aux supporters du WAC de :
- 📰 Suivre l'actualité du club
- ⚽ Consulter l'effectif et les statistiques des joueurs
- 🏟️ Voir le calendrier des matchs
- 🎟️ Réserver et acheter des tickets de match
- 🛒 Acheter des produits officiels WAC
- 📍 Localiser les boutiques officielles WAC
- 👤 Gérer son profil supporter

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| React Native | 0.73+ | Framework mobile cross-platform |
| Expo | 50+ | Plateforme de développement |
| React Navigation | 6.x | Navigation Stack & Tabs |
| Axios | 1.x | Client HTTP |
| AsyncStorage | 1.x | Stockage local |
| react-native-maps | 1.x | Cartes Google Maps |

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.x | Framework API REST |
| SQLite3 | 5.x | Base de données |
| JWT | 9.x | Authentification |
| bcryptjs | 2.x | Hashage mots de passe |
| pdfkit | 0.13 | Génération PDF |
| qrcode | 1.x | Génération QR codes |

---

## 📁 Structure du Projet

```
wydadapplication/
├── README.md
├── App.js
├── app.json
├── package.json
│
├── src/                         # Code source frontend
│   ├── screens/                 # Écrans de l'application
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── Dashboard.js
│   │   ├── MatchesScreen.js
│   │   ├── PlayersScreen.js
│   │   ├── TicketsScreen.js
│   │   ├── ShopScreen.js
│   │   ├── StoresMapScreen.js
│   │   └── Profile.js
│   │
│   ├── components/              # Composants réutilisables
│   │   ├── ui/
│   │   ├── cards/
│   │   ├── layout/
│   │   └── forms/
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useForm.js
│   │
│   ├── context/                 # Gestion d'état global
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   │
│   ├── services/                # Services API
│   │   ├── api.js
│   │   └── storage.js
│   │
│   ├── navigation/              # Configuration navigation
│   │   └── AppNavigator.js
│   │
│   ├── theme/                   # Design system
│   │   ├── colors.js
│   │   └── typography.js
│   │
│   └── utils/                   # Utilitaires
│       └── helpers.js
│
├── assets/                      # Ressources statiques
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── backend/                     # API REST
    ├── server.js
    ├── database.js
    ├── package.json
    ├── middleware/
    │   ├── authAdmin.js
    │   └── authUser.js
    └── routes/
        ├── auth.js
        ├── players.js
        ├── matches.js
        ├── tickets.js
        ├── products.js
        └── stores.js
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (pour émulateurs)

### Backend

```bash
# Accéder au dossier backend
cd backend

# Installer les dépendances
npm install

# Lancer le serveur (développement)
npm run dev

# Lancer le serveur (production)
npm start
```

Le serveur démarre sur `http://localhost:3000`

### Frontend

```bash
# À la racine du projet
npm install

# Lancer l'application
npx expo start

# Lancer sur Android
npx expo start --android

# Lancer sur iOS
npx expo start --ios
```

---

## 🔌 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription utilisateur |
| POST | `/auth/login` | Connexion utilisateur |
| POST | `/admin/login` | Connexion admin |

### Joueurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/players` | Liste des joueurs |
| POST | `/admin/players` | Ajouter un joueur |

### Matchs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/matches` | Liste des matchs |
| POST | `/admin/matches` | Ajouter un match |

### Tickets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/tickets` | Mes tickets |
| POST | `/tickets` | Réserver un ticket |
| POST | `/tickets/pay` | Payer un ticket |
| GET | `/tickets/:id/pdf` | Télécharger PDF |

### Boutique
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/products` | Liste des produits |
| POST | `/orders` | Passer commande |

### Stores
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/stores` | Liste des boutiques |

---

## 🎨 Design System

### Couleurs WAC
```javascript
primary:      '#BE1522'  // Rouge WAC
primaryDark:  '#8B0000'  // Rouge foncé
white:        '#FFFFFF'  // Blanc
background:   '#F5F5F5'  // Gris clair
text:         '#1A1A1A'  // Noir
```

---

## 👥 Équipe

- **Développeur** : [Votre nom]
- **Filière** : [Votre filière]
- **Encadrant** : Pr. Mostafa SAADI
- **Année universitaire** : 2025-2026

---

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique.

---

## 🔗 Liens

- **GitHub** : [Lien du repository]
- **Taiga** : [Lien du projet Taiga]

---

🔴⚪ **DIMA WYDAD** 🔴⚪
