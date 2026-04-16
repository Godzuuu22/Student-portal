const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3307,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'student_portal'
        });
        
        await connection.query('ALTER TABLE announcements ADD COLUMN image_path VARCHAR(255) NULL AFTER content;');
        console.log("DB Updated with image_path successfully");
        process.exit();
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
            process.exit();
        }
        console.error("Migration failed:", err);
        process.exit(1);
    }
}
updateDB();
