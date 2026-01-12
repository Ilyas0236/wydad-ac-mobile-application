const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'wac_database.db');
const db = new sqlite3.Database(dbPath);

console.log('Running migration: Adding wac_logo to matches...');

db.serialize(() => {
    db.run("ALTER TABLE matches ADD COLUMN wac_logo VARCHAR(255)", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✅ Column wac_logo already exists.');
            } else {
                console.error('❌ Error adding column:', err.message);
                process.exit(1);
            }
        } else {
            console.log('✅ Column wac_logo added successfully.');
        }
        process.exit(0);
    });
});
