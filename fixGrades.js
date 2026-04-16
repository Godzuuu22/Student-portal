const db = require('./config/db'); 
async function fixGrades() {
    await db.execute("UPDATE grades SET grade = '1.25' WHERE grade = 'A' OR grade = 'A+'");
    await db.execute("UPDATE grades SET grade = '1.50' WHERE grade = 'B' OR grade = 'B+'");
    await db.execute("UPDATE grades SET grade = '2.00' WHERE grade = 'C' OR grade = 'C+'");
    await db.execute("UPDATE grades SET grade = '3.00' WHERE grade = 'D' OR grade = 'D+'");
    await db.execute("UPDATE grades SET grade = '5.00' WHERE grade = 'F'");
    console.log('Grades updated');
    process.exit();
}
fixGrades();
