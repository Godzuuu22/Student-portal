const db = require('./config/db');
const hash = '$2b$10$kZxqNpk2fpUlUjCIUq.le.0uEToPo8.5SXB6SGoOprbUOCcKoRQbK';

db.execute('UPDATE users SET password_hash = ? WHERE username = "admin"', [hash])
    .then(() => {
        console.log('Fixed properly!');
        process.exit(0);
    })
    .catch(console.error);
