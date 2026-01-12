# 🔴⚪ Wydad Athletic Club - Application Mobile

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

**Application mobile officielle du Wydad Athletic Club**

*Projet de Développement Mobile - EMSI*

</div>

---

## 📱 Description

Application mobile complète pour les supporters du **Wydad Athletic Club (WAC)**, le club de football le plus titré du Maroc. Elle permet de :

- 📰 Suivre l'actualité du club en temps réel
- ⚽ Consulter l'effectif et les statistiques des joueurs
- 🏟️ Voir le calendrier des matchs et résultats
- 🎟️ Réserver et acheter des tickets avec QR code
- 🛒 Acheter des produits officiels de la boutique
- 📍 Localiser les boutiques officielles sur une carte

---

## 🛠️ Technologies Utilisées

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| React Native | 0.81 | Framework mobile cross-platform |
| Expo | 54 | Plateforme de développement |
| React Navigation | 6.x | Navigation Stack & Tab |
| Axios | 1.6 | Client HTTP |
| AsyncStorage | 2.x | Stockage local |

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.18 | Framework API REST |
| SQLite3 | 5.1 | Base de données |
| JWT | 9.0 | Authentification |
| PDFKit | 0.13 | Génération PDF |

---

## 📁 Structure du Projet

```
wydadapplication/
├── src/                    # Frontend React Native
│   ├── components/         # Composants réutilisables
│   ├── context/            # AuthContext, CartContext
│   ├── navigation/         # AppNavigator
│   ├── screens/            # 25+ écrans
│   │   ├── auth/           # Login, Register
│   │   └── admin/          # 8 écrans admin
│   ├── services/           # api.js (Axios)
│   └── theme/              # Design system WAC
│
├── backend/                # API Express
│   ├── routes/             # 11 fichiers de routes
│   ├── middleware/         # Auth JWT
│   └── utils/              # PDF Generator
│
├── assets/                 # Images et ressources
└── rapport_technique.tex   # Rapport LaTeX
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Application Expo Go sur smartphone

### 1. Cloner le projet

```bash
git clone https://github.com/Ilyas0236/wydad-ac-mobile-application.git
cd wydad-ac-mobile-application
```

### 2. Lancer le Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:3000`

### 3. Lancer le Frontend

Dans un nouveau terminal :

```bash
npm install
npx expo start
```

Scanner le QR code avec **Expo Go** sur votre smartphone.

---

## 🔐 Comptes de Test

### Administrateur
```
📧 Email: admin@wac.ma
🔑 Mot de passe: admin123
```

### Utilisateur
Créer un compte via l'écran d'inscription.

---

## 📊 Fonctionnalités

### Interface Utilisateur (15+ écrans)

| Module | Fonctionnalités |
|--------|-----------------|
| **Authentification** | Inscription, connexion, profil |
| **Accueil** | Actualités, prochain match |
| **Effectif** | Liste joueurs, fiches détaillées |
| **Matchs** | Calendrier, résultats |
| **Billetterie** | Réservation, QR code, PDF |
| **Boutique** | Catalogue, panier, commandes |
| **Magasins** | Carte interactive GPS |

### Interface Admin (8 écrans)

- Dashboard avec statistiques
- CRUD Joueurs, Matchs, Produits
- CRUD Actualités, Boutiques
- Gestion des tickets et réclamations

---

## 🔗 API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/login` | Connexion |
| POST | `/auth/register` | Inscription |
| GET | `/players` | Liste joueurs |
| GET | `/matches` | Liste matchs |
| POST | `/tickets/reserve` | Réserver ticket |
| GET | `/products` | Liste produits |
| POST | `/orders` | Créer commande |

---

## 📝 Rapport Technique

Le rapport technique complet est disponible en format LaTeX :
- **Fichier** : `rapport_technique.tex`
- **Compiler sur** : [Overleaf](https://www.overleaf.com/)

---

## ⚠️ Résolution de Problèmes

### Le backend ne démarre pas
```bash
cd backend && rm -rf node_modules && npm install && npm start
```

### Expo ne trouve pas le backend
Modifier l'IP dans `src/services/api.js` avec votre IP locale.

### QR code ne fonctionne pas
Vérifier que PC et téléphone sont sur le même réseau WiFi.

---

## 👨‍💻 Auteur

**ILYAS AIT MAINA**

Projet réalisé dans le cadre du cours de Développement Mobile à l'**EMSI**.

**Encadrant** : Pr. MOSTAFA SAADI

**Année Universitaire** : 2025-2026

---

<div align="center">

🔴⚪ **DIMA WYDAD** 🔴⚪

</div>
