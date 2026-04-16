const db = require('./config/db');

async function seed() {
    console.log("Starting Schedule Integration Seed...");
    try {
        // 1. Update Settings with new images
        const settings = [
            ['schedule_image', '/uploads/weekly_schedule.png'],
            ['exam_schedule_image', '/uploads/exam_schedule.png'],
            ['section_schedule_image', '/uploads/room_guide.png']
        ];
        
        for (const [key, value] of settings) {
            await db.execute(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
            console.log(`Updated setting: ${key} -> ${value}`);
        }

        // 2. Ensure Announcements mention the update
        const annTitle = "Updated Institutional Schedules Released";
        const annContent = "The weekly class schedules, midterm examination dates, and room guides for Semester 2, Academic Year 2025-2026 have been officially updated. Please check the 'Current Schedule' tab for the latest information.";
        
        await db.execute(
            'INSERT INTO announcements (title, content, icon_type, tag_name, department, author_id) VALUES (?, ?, ?, ?, ?, ?)',
            [annTitle, annContent, 'calendar', 'Urgent', 'Registrar Office', 1]
        );

        console.log("Adding announcement about schedule update.");
        console.log("Seed complete.");
        process.exit();
    } catch (err) {
        console.error("Seed failed:", err);
        process.exit(1);
    }
}

seed();
