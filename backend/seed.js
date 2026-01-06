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
// EXÉCUTER TOUS LES SEEDS
// ===========================================
const seedAll = async () => {
  console.log('===========================================');
  console.log('🌱 Initialisation des données...');
  console.log('===========================================');
  
  await seedAdmin();
  await seedPlayers();
  
  console.log('===========================================');
  console.log('✅ Seed terminé');
  console.log('===========================================');
};

module.exports = { seedAdmin, seedPlayers, seedAll };
