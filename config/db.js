const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection configuration: Prioritize MYSQL_URL (Railway standard)
const connectionConfig = process.env.MYSQL_URL || {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'student_portal',
    port: process.env.DB_PORT || 3306
};

console.log('--- Database Config Details ---');
console.log('Method:', process.env.MYSQL_URL ? 'MYSQL_URL (URI)' : 'Individual Parameters');
console.log('Database:', connectionConfig.database || 'Extracted from URI');

const pool = mysql.createPool(connectionConfig);

// Quick test connection on boot
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully');
        connection.release();
    } catch (err) {
        console.error('❌ Database Connection Failed:');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('Check your Railway environment variables (MYSQL_URL).');
    }
})();

module.exports = pool;
