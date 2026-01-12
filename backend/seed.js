/**
 * ===========================================
 * WYDAD ATHLETIC CLUB - SEED DATA
 * ===========================================
 * Script pour initialiser l'admin par défaut
 * Toutes les autres données sont gérées via l'interface admin
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
// EXÉCUTER SEULEMENT LE SEED ADMIN
// Les données sont gérées par l'admin via l'interface
// ===========================================
const seedAll = async () => {
  console.log('===========================================');
  console.log('🌱 Initialisation de l\'application...');
  console.log('===========================================');

  await seedAdmin();

  console.log('===========================================');
  console.log('✅ Initialisation terminée');
  console.log('   📝 Utilisez l\'interface admin pour ajouter:');
  console.log('   - Joueurs, Matchs, Produits, Tickets, Actualités, Boutiques');
  console.log('===========================================');
};

module.exports = { seedAdmin, seedAll };
