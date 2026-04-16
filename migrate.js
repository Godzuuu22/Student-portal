const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        let connection;
        if (process.env.MYSQL_URL) {
            // Correctly handle URI + options for migrations
            connection = await mysql.createConnection(process.env.MYSQL_URL + (process.env.MYSQL_URL.includes('?') ? '&' : '?') + 'multipleStatements=true');
        } else {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3307,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'student_portal',
                multipleStatements: true
            });
        }
        
        const sql = fs.readFileSync('database.sql', 'utf8');
        await connection.query(sql);
        console.log("Database updated successfully");
        process.exit();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}
migrate();
