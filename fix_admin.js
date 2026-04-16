const db = require('./config/db');
const bcrypt = require('bcrypt');

async function fixAdmin() {
    console.log('--- Admin Account Fix Started ---');
    try {
        const username = 'admin';
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);

        // Check if user exists
        const [users] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);

        if (users.length > 0) {
            // Update existing admin
            await db.execute(
                'UPDATE users SET password_hash = ?, role = "admin" WHERE username = ?',
                [hash, username]
            );
            console.log(`✅ Admin password has been reset to: ${password}`);
        } else {
            // Create new admin
            await db.execute(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                [username, hash, 'admin']
            );
            console.log(`✅ Admin account created with password: ${password}`);
        }

        console.log('\nYou can now log in at /admin_login.html');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing admin account:', err.message);
        process.exit(1);
    }
}

fixAdmin();
