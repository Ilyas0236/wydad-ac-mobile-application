/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - SEED DATA
 * ===========================================
 * Script pour initialiser les données de base
 * ===========================================
 */

const bcrypt = require('bcryptjs');
const { run, get, all } = require('./database');

// ===========================================
// CRÉER L'ADMIN PAR DÉFAUT
// ===========================================
const seedAdmin = async () => {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await get('SELECT id FROM admins LIMIT 1');
    
    if (existingAdmin) {
      console.log('ℹ️  Un admin existe déjà');
      return;
    }

    // Créer l'admin par défaut
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await run(
      'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@wac.ma', hashedPassword, 'super_admin']
    );

    console.log('✅ Admin par défaut créé:');
    console.log('   📧 Email: admin@wac.ma');
    console.log('   🔑 Mot de passe: admin123');

  } catch (error) {
    console.error('❌ Erreur seed admin:', error);
  }
};

// ===========================================
// CRÉER LES JOUEURS WAC
// ===========================================
const seedPlayers = async () => {
  try {
    // Vérifier si des joueurs existent déjà
    const existingPlayers = await get('SELECT id FROM players LIMIT 1');
    
    if (existingPlayers) {
      console.log('ℹ️  Des joueurs existent déjà');
      return;
    }

    // Joueurs WAC (effectif exemple)
    const players = [
      // Gardiens
      { name: 'Ahmed Reda Tagnaouti', number: 1, position: 'goalkeeper', nationality: 'Maroc', height: 190, weight: 82 },
      { name: 'Anas Zniti', number: 30, position: 'goalkeeper', nationality: 'Maroc', height: 188, weight: 80 },
      
      // Défenseurs
      { name: 'Amine Aboulfath', number: 3, position: 'defender', nationality: 'Maroc', height: 183, weight: 76 },
      { name: 'Yahya Jabrane', number: 4, position: 'defender', nationality: 'Maroc', height: 180, weight: 74 },
      { name: 'Achraf Dari', number: 5, position: 'defender', nationality: 'Maroc', height: 185, weight: 78 },
      { name: 'Issa Kaboré', number: 2, position: 'defender', nationality: 'Burkina Faso', height: 176, weight: 70 },
      
      // Milieux
      { name: 'Yahya Attiyat Allah', number: 17, position: 'midfielder', nationality: 'Maroc', height: 178, weight: 72 },
      { name: 'Jalal Daoudi', number: 6, position: 'midfielder', nationality: 'Maroc', height: 175, weight: 70 },
      { name: 'Simon Msougar', number: 8, position: 'midfielder', nationality: 'Maroc', height: 180, weight: 75 },
      { name: 'Reda Slim', number: 14, position: 'midfielder', nationality: 'Maroc', height: 177, weight: 71 },
      
      // Attaquants
      { name: 'Ayoub El Kaabi', number: 9, position: 'forward', nationality: 'Maroc', height: 185, weight: 80, goals: 15 },
      { name: 'Zouhair El Moutaraji', number: 11, position: 'forward', nationality: 'Maroc', height: 175, weight: 70, goals: 8 },
      { name: 'Guy Mbenza', number: 7, position: 'forward', nationality: 'RD Congo', height: 182, weight: 77, goals: 5 },
      { name: 'Mohamed Ounajem', number: 10, position: 'forward', nationality: 'Maroc', height: 179, weight: 73, goals: 4 }
    ];

    for (const player of players) {
      await run(
        `INSERT INTO players (name, number, position, nationality, height, weight, goals) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [player.name, player.number, player.position, player.nationality, player.height, player.weight, player.goals || 0]
      );
    }

    console.log(`✅ ${players.length} joueurs WAC ajoutés`);

  } catch (error) {
    console.error('❌ Erreur seed joueurs:', error);
  }
};

// ===========================================
// CRÉER LES MATCHS WAC
// ===========================================
const seedMatches = async () => {
  try {
    // Vérifier si des matchs existent déjà
    const existingMatches = await get('SELECT id FROM matches LIMIT 1');
    
    if (existingMatches) {
      console.log('ℹ️  Des matchs existent déjà');
      return;
    }

    // Matchs WAC (calendrier exemple)
    const matches = [
      // Matchs à venir
      {
        opponent: 'Raja Club Athletic',
        competition: 'Botola Pro',
        match_date: '2026-01-15 20:00:00',
        venue: 'Stade Mohammed V',
        is_home: 1,
        ticket_price: 100.00,
        available_seats: 45000,
        status: 'upcoming'
      },
      {
        opponent: 'Al Ahly SC',
        competition: 'Ligue des Champions CAF',
        match_date: '2026-01-22 21:00:00',
        venue: 'Stade Mohammed V',
        is_home: 1,
        ticket_price: 150.00,
        available_seats: 45000,
        status: 'upcoming'
      },
      {
        opponent: 'AS FAR',
        competition: 'Botola Pro',
        match_date: '2026-01-29 18:00:00',
        venue: 'Stade Prince Moulay Abdellah',
        is_home: 0,
        ticket_price: 80.00,
        available_seats: 0,
        status: 'upcoming'
      },
      {
        opponent: 'Espérance Tunis',
        competition: 'Ligue des Champions CAF',
        match_date: '2026-02-05 20:00:00',
        venue: 'Stade Mohammed V',
        is_home: 1,
        ticket_price: 150.00,
        available_seats: 45000,
        status: 'upcoming'
      },
      // Matchs passés (résultats)
      {
        opponent: 'Maghreb Fès',
        competition: 'Botola Pro',
        match_date: '2026-01-05 18:00:00',
        venue: 'Stade Mohammed V',
        is_home: 1,
        score_wac: 3,
        score_opponent: 1,
        ticket_price: 50.00,
        available_seats: 0,
        status: 'finished'
      },
      {
        opponent: 'Mamelodi Sundowns',
        competition: 'Ligue des Champions CAF',
        match_date: '2025-12-20 20:00:00',
        venue: 'Stade Mohammed V',
        is_home: 1,
        score_wac: 2,
        score_opponent: 0,
        ticket_price: 120.00,
        available_seats: 0,
        status: 'finished'
      }
    ];

    for (const match of matches) {
      await run(
        `INSERT INTO matches (
          opponent, competition, match_date, venue, is_home,
          score_wac, score_opponent, ticket_price, available_seats, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          match.opponent, match.competition, match.match_date, match.venue,
          match.is_home, match.score_wac || null, match.score_opponent || null,
          match.ticket_price, match.available_seats, match.status
        ]
      );
    }

    console.log(`✅ ${matches.length} matchs WAC ajoutés`);

  } catch (error) {
    console.error('❌ Erreur seed matchs:', error);
  }
};

// ===========================================
// CRÉER LES PRODUITS BOUTIQUE WAC
// ===========================================
const seedProducts = async () => {
  try {
    // Vérifier si des produits existent déjà
    const existingProducts = await get('SELECT id FROM products LIMIT 1');
    
    if (existingProducts) {
      console.log('ℹ️  Des produits existent déjà');
      return;
    }

    // Produits boutique WAC
    const products = [
      // Maillots
      {
        name: 'Maillot Domicile WAC 2025/2026',
        description: 'Maillot officiel domicile rouge et blanc du Wydad AC pour la saison 2025/2026. Tissu respirant haute performance.',
        price: 450.00,
        category: 'maillots',
        stock: 100,
        sizes: 'S,M,L,XL,XXL',
        colors: 'Rouge/Blanc',
        is_featured: 1
      },
      {
        name: 'Maillot Extérieur WAC 2025/2026',
        description: 'Maillot officiel extérieur noir du Wydad AC. Design moderne avec détails dorés.',
        price: 450.00,
        category: 'maillots',
        stock: 80,
        sizes: 'S,M,L,XL,XXL',
        colors: 'Noir/Or',
        is_featured: 1
      },
      {
        name: 'Maillot Third WAC 2025/2026',
        description: 'Troisième maillot officiel blanc du Wydad AC. Édition spéciale.',
        price: 400.00,
        category: 'maillots',
        stock: 60,
        sizes: 'S,M,L,XL',
        colors: 'Blanc/Rouge',
        is_featured: 0
      },
      // Vêtements
      {
        name: 'Polo WAC Premium',
        description: 'Polo officiel du Wydad AC. Coton premium avec logo brodé.',
        price: 280.00,
        category: 'vetements',
        stock: 50,
        sizes: 'S,M,L,XL,XXL',
        colors: 'Rouge,Blanc,Noir',
        is_featured: 1
      },
      {
        name: 'Survêtement Complet WAC',
        description: 'Survêtement officiel d\'entraînement. Veste + Pantalon.',
        price: 650.00,
        category: 'vetements',
        stock: 40,
        sizes: 'S,M,L,XL',
        colors: 'Rouge/Noir',
        is_featured: 1
      },
      {
        name: 'Sweat à Capuche WAC',
        description: 'Hoodie confortable avec logo WAC brodé.',
        price: 320.00,
        category: 'vetements',
        stock: 45,
        sizes: 'S,M,L,XL,XXL',
        colors: 'Rouge,Gris,Noir',
        is_featured: 0
      },
      // Accessoires
      {
        name: 'Casquette WAC',
        description: 'Casquette officielle avec logo WAC brodé. Ajustable.',
        price: 120.00,
        category: 'accessoires',
        stock: 100,
        sizes: 'Unique',
        colors: 'Rouge,Blanc,Noir',
        is_featured: 1
      },
      {
        name: 'Bonnet WAC',
        description: 'Bonnet chaud avec pompon aux couleurs du WAC.',
        price: 90.00,
        category: 'accessoires',
        stock: 80,
        sizes: 'Unique',
        colors: 'Rouge/Blanc',
        is_featured: 0
      },
      // Écharpes
      {
        name: 'Écharpe Officielle WAC',
        description: 'Écharpe tissée aux couleurs du Wydad. "DIMA WYDAD"',
        price: 80.00,
        category: 'echarpes',
        stock: 200,
        sizes: 'Unique',
        colors: 'Rouge/Blanc',
        is_featured: 1
      },
      {
        name: 'Drapeau WAC Grande Taille',
        description: 'Drapeau officiel 150x90cm. Parfait pour le stade.',
        price: 150.00,
        category: 'echarpes',
        stock: 100,
        sizes: '150x90cm',
        colors: 'Rouge/Blanc',
        is_featured: 0
      },
      // Équipement
      {
        name: 'Ballon WAC Officiel',
        description: 'Ballon de football officiel du Wydad AC. Taille 5.',
        price: 180.00,
        category: 'equipement',
        stock: 50,
        sizes: 'Taille 5',
        colors: 'Rouge/Blanc',
        is_featured: 1
      },
      {
        name: 'Sac à Dos WAC',
        description: 'Sac à dos sportif avec compartiment laptop. Logo WAC.',
        price: 220.00,
        category: 'equipement',
        stock: 40,
        sizes: 'Unique',
        colors: 'Noir/Rouge',
        is_featured: 0
      },
      // Enfants
      {
        name: 'Kit Enfant WAC 2025/2026',
        description: 'Ensemble complet pour enfants: maillot + short + chaussettes.',
        price: 380.00,
        category: 'enfants',
        stock: 60,
        sizes: '4-6ans,6-8ans,8-10ans,10-12ans',
        colors: 'Rouge/Blanc',
        is_featured: 1
      }
    ];

    for (const product of products) {
      await run(
        `INSERT INTO products (
          name, description, price, category, stock, sizes, colors, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name, product.description, product.price, product.category,
          product.stock, product.sizes, product.colors, product.is_featured
        ]
      );
    }

    console.log(`✅ ${products.length} produits WAC ajoutés`);

  } catch (error) {
    console.error('❌ Erreur seed produits:', error);
  }
};

// ===========================================
// EXÉCUTER TOUS LES SEEDS
// ===========================================
const seedAll = async () => {
  console.log('===========================================');
  console.log('🌱 Initialisation des données...');
  console.log('===========================================');
  
  await seedAdmin();
  await seedPlayers();
  await seedMatches();
  await seedProducts();
  
  console.log('===========================================');
  console.log('✅ Seed terminé');
  console.log('===========================================');
};

module.exports = { seedAdmin, seedPlayers, seedMatches, seedProducts, seedAll };
