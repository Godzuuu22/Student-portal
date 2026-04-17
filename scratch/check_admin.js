const db = require('../config/db');
const bcrypt = require('bcrypt');

async function checkAdmin() {
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', ['admin']);
        if (users.length === 0) {
            console.log('❌ Admin user NOT found in database.');
        } else {
            const user = users[0];
            console.log('✅ Admin user found:');
            console.log('ID:', user.id);
            console.log('Username:', user.username);
            console.log('Role:', user.role);
            console.log('Hash:', user.password_hash);
            
            const match = await bcrypt.compare('password123', user.password_hash);
            console.log('Password "password123" matches hash:', match);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error checking admin:', err.message);
        process.exit(1);
    }
}

checkAdmin();
