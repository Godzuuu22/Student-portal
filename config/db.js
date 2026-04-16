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

const pool = mysql.createPool(connectionConfig);

module.exports = pool;
