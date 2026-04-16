const db = require('./config/db');
async function test() {
    console.log("Connecting...");
    console.time("QueryTime");
    try {
        const [rows] = await db.execute('SELECT 1');
        console.log("Success:", rows);
    } catch(e) {
        console.error(e);
    }
    console.timeEnd("QueryTime");
    process.exit();
}
test();
