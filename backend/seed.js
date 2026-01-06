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
// CRÉER LES ACTUALITÉS WAC
// ===========================================
const seedNews = async () => {
  try {
    // Vérifier si des news existent déjà
    const existingNews = await get('SELECT id FROM news LIMIT 1');
    
    if (existingNews) {
      console.log('ℹ️  Des actualités existent déjà');
      return;
    }

    // Actualités WAC
    const newsItems = [
      {
        title: 'Le Wydad remporte le derby casablancais !',
        content: `Le Wydad Athletic Club a remporté une victoire éclatante face au Raja lors du derby casablancais. 
        
Un match intense qui s'est soldé par un score de 2-1 en faveur des Rouge et Blanc. Les buts ont été inscrits par Ayoub El Kaabi (35') et Zouhair El Moutaraji (78').

Le stade Mohammed V était comble avec plus de 45 000 supporters qui ont créé une ambiance exceptionnelle. Les Winners ont une fois de plus montré leur soutien indéfectible au club.

Cette victoire permet au Wydad de consolider sa place de leader au classement de la Botola Pro.`,
        summary: 'Victoire 2-1 du WAC face au Raja dans un stade Mohammed V en fusion. El Kaabi et El Moutaraji buteurs.',
        category: 'match',
        is_featured: 1,
        is_published: 1
      },
      {
        title: 'Transfert: Un nouveau renfort pour l\'attaque wydadie',
        content: `Le Wydad Athletic Club officialise l'arrivée d'un nouveau renfort offensif pour la seconde partie de saison.

Le joueur international rejoint le club pour un contrat de 3 ans. Il apportera son expérience et sa qualité technique à l'effectif de l'entraîneur.

"Je suis très heureux de rejoindre un club aussi prestigieux que le Wydad. C'est un honneur de porter ce maillot historique", a déclaré le nouveau joueur lors de sa présentation.

Le président du club s'est félicité de cette recrue: "C'est un joueur de qualité qui va nous aider à atteindre nos objectifs cette saison."`,
        summary: 'Le WAC officialise l\'arrivée d\'un nouveau renfort offensif pour la seconde partie de saison.',
        category: 'transfer',
        is_featured: 1,
        is_published: 1
      },
      {
        title: 'Ligue des Champions CAF: Le WAC qualifié pour les quarts !',
        content: `Excellente nouvelle pour les supporters wydadis ! Le Wydad Athletic Club s'est qualifié pour les quarts de finale de la Ligue des Champions de la CAF.

Après une phase de groupes maîtrisée avec 4 victoires et 2 nuls, les Rouge et Blanc terminent premiers de leur groupe avec 14 points.

Le prochain adversaire sera connu après le tirage au sort prévu la semaine prochaine au siège de la CAF au Caire.

L'objectif est clair: remporter une 4ème Ligue des Champions pour le club le plus titré du Maroc.`,
        summary: 'Le WAC termine premier de son groupe et se qualifie pour les quarts de finale de la Ligue des Champions CAF.',
        category: 'match',
        is_featured: 1,
        is_published: 1
      },
      {
        title: 'Journée portes ouvertes au complexe Mohammed VI',
        content: `Le Wydad Athletic Club organise une journée portes ouvertes au complexe Mohammed VI ce samedi.

Au programme:
- Visite du centre d'entraînement
- Rencontre avec les joueurs de l'équipe première
- Séance d'autographes
- Animations pour les enfants
- Stands de la boutique officielle avec promotions exclusives

L'entrée est gratuite pour tous les membres et 50 DH pour le public.

Une occasion unique de découvrir les coulisses du club et de rencontrer vos joueurs préférés !`,
        summary: 'Journée portes ouvertes au complexe Mohammed VI avec rencontre des joueurs et animations.',
        category: 'club',
        is_featured: 0,
        is_published: 1
      },
      {
        title: 'Le centre de formation WAC produit un nouveau talent',
        content: `Le centre de formation du Wydad continue de produire des talents. Un jeune joueur de 17 ans vient d'être promu en équipe première.

Formé au club depuis l'âge de 10 ans, ce milieu de terrain créatif a impressionné lors des entraînements avec le groupe professionnel.

"C'est le fruit d'un travail de formation de qualité. Notre académie est l'une des meilleures en Afrique", a souligné le directeur du centre de formation.

Le joueur a signé son premier contrat professionnel de 4 ans avec le club de son cœur.`,
        summary: 'Un jeune talent de 17 ans issu du centre de formation signe son premier contrat professionnel.',
        category: 'youth',
        is_featured: 0,
        is_published: 1
      },
      {
        title: 'Les Winners préparent un tifo spectaculaire',
        content: `Les supporters du Wydad, les fameux Winners, préparent un tifo spectaculaire pour le prochain match à domicile.

Sans révéler les détails, les responsables du groupe ultra ont annoncé que ce sera "le plus grand tifo de l'histoire du football marocain".

Des semaines de préparation et des milliers d'heures de travail bénévole pour offrir un spectacle inoubliable au stade Mohammed V.

Le message est clair: montrer au monde entier la passion des supporters wydadis.`,
        summary: 'Les Winners annoncent un tifo historique pour le prochain match à domicile.',
        category: 'fans',
        is_featured: 0,
        is_published: 1
      },
      {
        title: 'Retour sur le titre de 1992: 30 ans déjà !',
        content: `Il y a 30 ans, le Wydad Athletic Club remportait sa première Ligue des Champions africaine (anciennement Coupe d'Afrique des clubs champions).

Une génération dorée menée par des légendes du club qui ont marqué l'histoire du football marocain et africain.

Le club organise une cérémonie d'hommage aux héros de cette épopée historique lors du prochain match à domicile.

Les anciens joueurs seront présents pour partager leurs souvenirs avec les supporters.`,
        summary: 'Le WAC célèbre les 30 ans de son premier titre continental avec une cérémonie d\'hommage.',
        category: 'history',
        is_featured: 0,
        is_published: 1
      },
      {
        title: 'Nouvelle collection 2026 disponible en boutique',
        content: `La nouvelle collection 2026 du Wydad Athletic Club est maintenant disponible dans toutes les boutiques officielles et en ligne.

Au programme:
- Nouveau maillot domicile avec design innovant
- Maillot extérieur en édition limitée
- Collection lifestyle complète
- Accessoires exclusifs

Profitez de 10% de réduction pour tout achat avant la fin du mois avec le code WYDAD2026.

Portez fièrement les couleurs de votre club !`,
        summary: 'La nouvelle collection 2026 est disponible avec 10% de réduction jusqu\'à la fin du mois.',
        category: 'club',
        is_featured: 1,
        is_published: 1
      }
    ];

    for (const news of newsItems) {
      await run(
        `INSERT INTO news (
          title, content, summary, category, is_featured, is_published, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [news.title, news.content, news.summary, news.category, news.is_featured, news.is_published]
      );
    }

    console.log(`✅ ${newsItems.length} actualités WAC ajoutées`);

  } catch (error) {
    console.error('❌ Erreur seed news:', error);
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
  await seedNews();
  
  console.log('===========================================');
  console.log('✅ Seed terminé');
  console.log('===========================================');
};

module.exports = { seedAdmin, seedPlayers, seedMatches, seedProducts, seedNews, seedAll };
