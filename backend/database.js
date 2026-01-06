/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - DATABASE
 * ===========================================
 * Configuration et initialisation SQLite
 * Toutes les tables de l'application
 * ===========================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin de la base de données
const DB_PATH = path.join(__dirname, 'wac_database.db');

// Création de la connexion à la base de données
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erreur connexion SQLite:', err.message);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
  }
});

// ===========================================
// INITIALISATION DES TABLES
// ===========================================

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      
      // -----------------------------------------
      // TABLE: ADMINS
      // Administrateurs de l'application
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table admins:', err.message);
        else console.log('📋 Table admins créée');
      });

      // -----------------------------------------
      // TABLE: USERS
      // Utilisateurs / Supporters
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          avatar VARCHAR(255),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table users:', err.message);
        else console.log('📋 Table users créée');
      });

      // -----------------------------------------
      // TABLE: NEWS
      // Actualités du club
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS news (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          image VARCHAR(255),
          category VARCHAR(50) DEFAULT 'general',
          is_featured BOOLEAN DEFAULT 0,
          published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table news:', err.message);
        else console.log('📋 Table news créée');
      });

      // -----------------------------------------
      // TABLE: PLAYERS
      // Joueurs de l'équipe WAC
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS players (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          number INTEGER,
          position VARCHAR(50) NOT NULL,
          nationality VARCHAR(50) DEFAULT 'Maroc',
          birth_date DATE,
          height INTEGER,
          weight INTEGER,
          image VARCHAR(255),
          bio TEXT,
          goals INTEGER DEFAULT 0,
          assists INTEGER DEFAULT 0,
          matches_played INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table players:', err.message);
        else console.log('📋 Table players créée');
      });

      // -----------------------------------------
      // TABLE: MATCHES
      // Matchs de l'équipe
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          opponent VARCHAR(100) NOT NULL,
          opponent_logo VARCHAR(255),
          competition VARCHAR(100) NOT NULL,
          match_date DATETIME NOT NULL,
          venue VARCHAR(100) DEFAULT 'Stade Mohammed V',
          is_home BOOLEAN DEFAULT 1,
          score_wac INTEGER,
          score_opponent INTEGER,
          status VARCHAR(20) DEFAULT 'upcoming',
          ticket_price DECIMAL(10,2) DEFAULT 50.00,
          available_seats INTEGER DEFAULT 45000,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table matches:', err.message);
        else console.log('📋 Table matches créée');
      });

      // -----------------------------------------
      // TABLE: TICKETS
      // Billets de match réservés
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          match_id INTEGER NOT NULL,
          seat_section VARCHAR(50) NOT NULL,
          seat_number VARCHAR(20),
          price DECIMAL(10,2) NOT NULL,
          quantity INTEGER DEFAULT 1,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_date DATETIME,
          qr_code VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (match_id) REFERENCES matches(id)
        )
      `, (err) => {
        if (err) console.error('Erreur création table tickets:', err.message);
        else console.log('📋 Table tickets créée');
      });

      // -----------------------------------------
      // TABLE: PRODUCTS
      // Produits de la boutique WAC
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(50) NOT NULL,
          image VARCHAR(255),
          stock INTEGER DEFAULT 0,
          sizes VARCHAR(100),
          colors VARCHAR(100),
          is_featured BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table products:', err.message);
        else console.log('📋 Table products créée');
      });

      // -----------------------------------------
      // TABLE: ORDERS
      // Commandes de produits
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          shipping_address TEXT,
          shipping_city VARCHAR(100),
          shipping_phone VARCHAR(20),
          payment_method VARCHAR(50),
          payment_status VARCHAR(20) DEFAULT 'pending',
          payment_date DATETIME,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Erreur création table orders:', err.message);
        else console.log('📋 Table orders créée');
      });

      // -----------------------------------------
      // TABLE: ORDER_ITEMS
      // Détails des commandes
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          size VARCHAR(20),
          color VARCHAR(30),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err) console.error('Erreur création table order_items:', err.message);
        else console.log('📋 Table order_items créée');
      });

      // -----------------------------------------
      // TABLE: STORES
      // Boutiques officielles WAC
      // -----------------------------------------
      db.run(`
        CREATE TABLE IF NOT EXISTS stores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          address TEXT NOT NULL,
          city VARCHAR(50) DEFAULT 'Casablanca',
          latitude DECIMAL(10,8) NOT NULL,
          longitude DECIMAL(11,8) NOT NULL,
          phone VARCHAR(20),
          opening_hours VARCHAR(100),
          image VARCHAR(255),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Erreur création table stores:', err.message);
        else console.log('📋 Table stores créée');
      });

      // Résolution après création de toutes les tables
      setTimeout(() => {
        console.log('===========================================');
        console.log('✅ Toutes les tables ont été initialisées');
        console.log('===========================================');
        resolve();
      }, 100);

    });
  });
};

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

/**
 * Exécuter une requête SQL (INSERT, UPDATE, DELETE)
 */
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Récupérer une seule ligne
 */
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Récupérer toutes les lignes
 */
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// ===========================================
// EXPORTS
// ===========================================

module.exports = {
  db,
  initDatabase,
  run,
  get,
  all
};
