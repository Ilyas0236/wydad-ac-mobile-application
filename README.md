# 🔴⚪ Wydad Athletic Club - Application Mobile

Application mobile officielle du **Wydad Athletic Club (WAC)** - Le club de football le plus titré du Maroc.

---

## 📱 Description

Application mobile complète permettant aux supporters du WAC de :
- 📰 Suivre l'actualité du club en temps réel
- ⚽ Consulter l'effectif et les statistiques des joueurs
- 🏟️ Voir le calendrier des matchs et résultats
- 🎟️ Réserver et acheter des tickets de match avec QR code
- 🛒 Acheter des produits officiels de la boutique WAC
- 📍 Localiser les boutiques officielles sur une carte
- 👤 Gérer son profil et historique

---

## 🛠️ Stack Technique

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | 18+ | Runtime JavaScript |
| Express | 4.18 | Framework API REST |
| SQLite3 | 5.1 | Base de données légère |
| JWT | 9.0 | Authentification sécurisée |
| bcryptjs | 2.4 | Hashage mots de passe |
| pdfkit | 0.13 | Génération PDF |
| qrcode | 1.5 | Génération QR codes |
| cors | 2.8 | Cross-Origin Resource Sharing |

### Frontend (Complet ✅)
| Technologie | Version | Description |
|-------------|---------|-------------|
| React Native | 0.76+ | Framework mobile cross-platform |
| Expo | 54+ | Plateforme de développement |
| React Navigation | 6.x | Navigation Stack & Tabs |
| Axios | 1.x | Client HTTP |
| AsyncStorage | 2.x | Stockage local persistant |
| react-native-maps | 1.x | Cartes Google Maps |
| Expo Linear Gradient | 14.x | Dégradés visuels |
| React Native Gesture Handler | 2.x | Gestes tactiles |
| React Native Reanimated | 3.x | Animations fluides |

---

## 📁 Structure du Projet

```
wydadapplication/
├── README.md
├── backend/
│   ├── server.js              # Point d'entrée serveur
│   ├── database.js            # Configuration SQLite
│   ├── seed.js                # Données initiales
│   ├── package.json
│   ├── middleware/
│   │   ├── index.js
│   │   ├── authAdmin.js       # Auth administrateur
│   │   └── authUser.js        # Auth utilisateur
│   ├── routes/
│   │   ├── admin.js           # Routes admin
│   │   ├── auth.js            # Auth utilisateurs
│   │   ├── players.js         # Gestion joueurs
│   │   ├── matches.js         # Gestion matchs
│   │   ├── tickets.js         # Billetterie
│   │   ├── products.js        # Boutique produits
│   │   ├── orders.js          # Commandes
│   │   ├── news.js            # Actualités
│   │   └── stores.js          # Boutiques physiques
│   └── utils/
│       └── pdfGenerator.js    # Génération PDF
│
├── src/                       # Frontend React Native
│   ├── context/
│   │   ├── AuthContext.js     # Gestion authentification
│   │   └── CartContext.js     # Gestion panier
│   ├── navigation/
│   │   └── AppNavigator.js    # Navigation Tab + Stack
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── HomeScreen.js      # Accueil + actualités
│   │   ├── PlayersScreen.js   # Liste joueurs
│   │   ├── PlayerDetailScreen.js
│   │   ├── MatchesScreen.js   # Calendrier matchs
│   │   ├── TicketsScreen.js   # Achat billets
│   │   ├── MyTicketsScreen.js # Mes billets
│   │   ├── ShopScreen.js      # Boutique produits
│   │   ├── ProductDetailScreen.js
│   │   ├── CartScreen.js      # Panier
│   │   ├── MyOrdersScreen.js  # Historique commandes
│   │   ├── StoresScreen.js    # Carte magasins
│   │   ├── ProfileScreen.js   # Mon profil
│   │   └── NewsDetailScreen.js
│   ├── services/
│   │   └── api.js             # Service API Axios
│   └── theme/
│       └── colors.js          # Design system WAC
│
└── assets/                    # Ressources statiques
```

---

## 🗄️ Base de Données

### Tables SQLite

| Table | Description |
|-------|-------------|
| `admins` | Comptes administrateurs |
| `users` | Supporters inscrits |
| `players` | Effectif des joueurs WAC |
| `matches` | Calendrier des matchs |
| `tickets` | Billets réservés/achetés |
| `products` | Produits boutique |
| `orders` | Commandes boutique |
| `order_items` | Détails des commandes |
| `news` | Actualités du club |
| `stores` | Boutiques officielles |

---

## 🚀 API Endpoints

### 🔐 Authentification Admin
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/admin/login` | Connexion admin |
| GET | `/admin/me` | Profil admin connecté |
| GET | `/admin/stats` | Statistiques dashboard |

### 👤 Authentification Utilisateur
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| GET | `/auth/me` | Profil utilisateur |
| PUT | `/auth/profile` | Modifier profil |
| PUT | `/auth/password` | Changer mot de passe |

### ⚽ Joueurs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/players` | Liste des joueurs |
| GET | `/players/positions` | Groupés par poste |
| GET | `/players/:id` | Détail joueur |
| POST | `/players` | Ajouter (admin) |
| PUT | `/players/:id` | Modifier (admin) |
| DELETE | `/players/:id` | Supprimer (admin) |

### 🏟️ Matchs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/matches` | Liste des matchs |
| GET | `/matches/upcoming` | Matchs à venir |
| GET | `/matches/results` | Résultats |
| GET | `/matches/:id` | Détail match |
| POST | `/matches` | Ajouter (admin) |
| PUT | `/matches/:id` | Modifier (admin) |

### 🎟️ Billetterie
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/tickets` | Mes tickets |
| GET | `/tickets/sections` | Sections du stade |
| GET | `/tickets/:id` | Détail ticket |
| GET | `/tickets/:id/pdf` | **Télécharger PDF** |
| POST | `/tickets/reserve` | Réserver ticket |
| POST | `/tickets/:id/pay` | Payer ticket |
| POST | `/tickets/:id/cancel` | Annuler |
| POST | `/tickets/verify` | Vérifier QR (admin) |

### 🛒 Produits Boutique
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/products` | Liste produits |
| GET | `/products/categories` | Catégories |
| GET | `/products/featured` | Produits vedettes |
| GET | `/products/:id` | Détail produit |
| POST | `/products` | Ajouter (admin) |
| PUT | `/products/:id` | Modifier (admin) |
| DELETE | `/products/:id` | Supprimer (admin) |

### 📦 Commandes
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/orders/my` | Mes commandes |
| GET | `/orders/:id` | Détail commande |
| GET | `/orders/:id/invoice` | **Télécharger facture PDF** |
| POST | `/orders` | Créer commande |
| POST | `/orders/:id/pay` | Payer commande |
| POST | `/orders/:id/cancel` | Annuler |
| GET | `/orders/admin/all` | Toutes (admin) |
| PUT | `/orders/admin/:id/status` | Changer statut (admin) |

### 📰 Actualités
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/news` | Liste actualités |
| GET | `/news/featured` | À la une |
| GET | `/news/categories` | Catégories |
| GET | `/news/:id` | Détail article |
| POST | `/news` | Ajouter (admin) |
| PUT | `/news/:id` | Modifier (admin) |
| DELETE | `/news/:id` | Supprimer (admin) |

### 📍 Boutiques
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/stores` | Liste boutiques |
| GET | `/stores/cities` | Par ville |
| GET | `/stores/nearby` | Proches (GPS) |
| GET | `/stores/:id` | Détail boutique |
| POST | `/stores` | Ajouter (admin) |
| PUT | `/stores/:id` | Modifier (admin) |

---

## 🔧 Installation & Lancement

### Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Lancer le serveur
npm start

# Ou en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Frontend (React Native / Expo)

```bash
# À la racine du projet
cd wydadapplication

# Installer les dépendances
npm install

# Lancer l'application Expo
npx expo start

# Options de lancement:
# - Appuyer sur 'a' pour Android
# - Appuyer sur 'i' pour iOS (Mac uniquement)
# - Appuyer sur 'w' pour Web
# - Scanner le QR code avec Expo Go (mobile)
```

### Compte Admin par défaut
```
📧 Email: admin@wac.ma
🔑 Mot de passe: admin123
```

---

## 📊 Données de Test

Le système inclut des données de test pré-configurées :

| Données | Quantité |
|---------|----------|
| Admin | 1 |
| Joueurs | 14 |
| Matchs | 6 |
| Produits | 13 |
| Actualités | 8 |
| Boutiques | 10 |

---

## 🎨 Design System

### Couleurs WAC
```css
--wac-red: #BE1522      /* Rouge principal */
--wac-white: #FFFFFF    /* Blanc */
--wac-black: #1A1A1A    /* Noir texte */
--wac-gray: #666666     /* Gris secondaire */
```

---

## 📱 Fonctionnalités Clés

### 🎟️ Système de Billetterie
- Réservation par section du stade
- Paiement simulé (card, cash_on_delivery, bank_transfer)
- Génération QR code unique
- **Téléchargement PDF du billet**
- Vérification QR à l'entrée

### 🛒 Boutique en Ligne
- Catégories: maillots, vêtements, accessoires, écharpes, équipement, enfants
- Gestion du stock en temps réel
- Panier et commandes
- **Factures PDF téléchargeables**
- Frais de livraison (gratuit > 500 MAD)

### 📍 Localisateur de Boutiques
- 10 boutiques dans 6 villes marocaines
- Coordonnées GPS pour intégration carte
- Types: stadium, official, partner

---

## 👨‍💻 Auteur

Projet réalisé pour le cours de développement mobile.

**Club:** Wydad Athletic Club (WAC) 🔴⚪

---

## 📝 License

Ce projet est à but éducatif.

---

🔴⚪ **DIMA WYDAD** 🔴⚪
