# 🧪 Tests API WAC Backend

## Prérequis
Serveur démarré sur `http://localhost:3000`

---

## 1. Test Santé API
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

---

## 2. Authentification Admin
```bash
# Login Admin
curl -X POST http://localhost:3000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wac.ma","password":"admin123"}'
```
Réponse attendue: `{ "success": true, "token": "..." }`

---

## 3. Authentification Utilisateur
```bash
# Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Connexion
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 4. Joueurs
```bash
# Liste des joueurs
curl http://localhost:3000/players

# Joueurs par position
curl http://localhost:3000/players/positions

# Détail joueur
curl http://localhost:3000/players/1
```

---

## 5. Matchs
```bash
# Liste des matchs
curl http://localhost:3000/matches

# Matchs à venir
curl http://localhost:3000/matches/upcoming

# Résultats
curl http://localhost:3000/matches/results
```

---

## 6. Produits Boutique
```bash
# Liste des produits
curl http://localhost:3000/products

# Catégories
curl http://localhost:3000/products/categories

# Produits en vedette
curl http://localhost:3000/products/featured

# Par catégorie
curl "http://localhost:3000/products?category=maillots"
```

---

## 7. Actualités
```bash
# Liste des news
curl http://localhost:3000/news

# News en vedette
curl http://localhost:3000/news/featured

# Catégories
curl http://localhost:3000/news/categories
```

---

## 8. Boutiques
```bash
# Liste des boutiques
curl http://localhost:3000/stores

# Villes disponibles
curl http://localhost:3000/stores/cities

# Par ville
curl "http://localhost:3000/stores?city=Casablanca"
```

---

## 9. Test Complet avec Token

```bash
# 1. Obtenir un token utilisateur
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}' | jq -r '.token')

# 2. Réserver un ticket
curl -X POST http://localhost:3000/tickets/reserve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"match_id":1,"section":"virage_nord","quantity":2}'

# 3. Créer une commande
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [{"product_id":1,"quantity":1,"size":"M"}],
    "shipping_address": "123 Rue Test",
    "shipping_city": "Casablanca",
    "shipping_phone": "0600000000"
  }'
```

---

## 📊 Résumé des Endpoints

| Route | Méthodes | Auth |
|-------|----------|------|
| `/admin/*` | POST, GET | Admin |
| `/auth/*` | POST, GET, PUT | User |
| `/players` | GET, POST, PUT, DELETE | Public/Admin |
| `/matches` | GET, POST, PUT | Public/Admin |
| `/tickets` | GET, POST | User |
| `/products` | GET, POST, PUT, DELETE | Public/Admin |
| `/orders` | GET, POST | User/Admin |
| `/news` | GET, POST, PUT, DELETE | Public/Admin |
| `/stores` | GET, POST, PUT | Public/Admin |

---

🔴⚪ **WYDAD AC API** 🔴⚪
