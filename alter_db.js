const mysql = require('mysql2/promise');
require('dotenv').config();

async function addColumnIfNotExists(connection, tableName, columnName, columnDefinition) {
    try {
        const [columns] = await connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()`,
            [tableName, columnName]
        );

        if (columns.length === 0) {
            console.log(`➕ Adding column [${columnName}] to table [${tableName}]...`);
            await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
            console.log(`✅ Successfully added [${columnName}].`);
        } else {
            console.log(`ℹ️ Column [${columnName}] already exists in [${tableName}]. Skipping.`);
        }
    } catch (err) {
        console.error(`❌ Error adding column [${columnName}]:`, err.message);
    }
}

async function repair() {
    console.log('--- Database Schema Repair Started ---');
    
    let connection;
    try {
        const config = process.env.MYSQL_URL || {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'student_portal'
        };

        connection = await mysql.createConnection(config);
        console.log('✅ Connected to database for repair.');

        // Students Table Repairs
        await addColumnIfNotExists(connection, 'students', 'profile_pic', "VARCHAR(255) DEFAULT 'default-profile.png'");
        await addColumnIfNotExists(connection, 'students', 'gender', "ENUM('Male', 'Female', 'Other')");
        await addColumnIfNotExists(connection, 'students', 'address', "TEXT");
        await addColumnIfNotExists(connection, 'students', 'phone', "VARCHAR(20)");
        await addColumnIfNotExists(connection, 'students', 'religion', "VARCHAR(50)");
        await addColumnIfNotExists(connection, 'students', 'age', "INT");
        await addColumnIfNotExists(connection, 'students', 'height', "VARCHAR(20)");
        await addColumnIfNotExists(connection, 'students', 'weight', "VARCHAR(20)");
        await addColumnIfNotExists(connection, 'students', 'birthdate', "DATE");
        await addColumnIfNotExists(connection, 'students', 'nationality', "VARCHAR(50) DEFAULT 'Filipino'");

        // Subjects Table Repairs
        await addColumnIfNotExists(connection, 'subjects', 'instructor', "VARCHAR(100)");
        await addColumnIfNotExists(connection, 'subjects', 'color_theme', "VARCHAR(20) DEFAULT 'blue'");

        // Enrollments Table Repairs
        await addColumnIfNotExists(connection, 'enrollments', 'progress', "INT DEFAULT 0");

        console.log('--- Database Schema Repair Completed ---');
        await connection.end();
        process.exit(0);

    } catch (err) {
        console.error('❌ Repair Failed:', err.message);
        if (connection) await connection.end();
        process.exit(1);
    }
}

repair();
