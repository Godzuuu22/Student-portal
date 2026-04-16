const db = require('./config/db');
async function test() {
    console.time("QueryTime");
    try {
        const [rows] = await db.execute('SELECT a.*, u.username as author FROM announcements a LEFT JOIN users u ON a.author_id = u.id ORDER BY a.date DESC');
        console.log("Success length:", rows.length);
    } catch(e) {
        console.error(e);
    }
    console.timeEnd("QueryTime");
    process.exit();
}
test();
