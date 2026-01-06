/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - SEED DATA
 * ===========================================
 * Script pour initialiser les données de base
 * ===========================================
 */

const bcrypt = require('bcryptjs');
const { run, get } = require('./database');

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
// EXÉCUTER TOUS LES SEEDS
// ===========================================
const seedAll = async () => {
  console.log('===========================================');
  console.log('🌱 Initialisation des données...');
  console.log('===========================================');
  
  await seedAdmin();
  
  console.log('===========================================');
  console.log('✅ Seed terminé');
  console.log('===========================================');
};

module.exports = { seedAdmin, seedAll };
