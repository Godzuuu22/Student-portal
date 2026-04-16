const db = require('./config/db');

async function seedCustomSchedule() {
    console.log("Applying custom student schedule...");
    try {
        await db.execute('DELETE FROM class_schedules');
        
        const [allSubs] = await db.execute('SELECT id, code, instructor FROM subjects');
        const subIds = {};
        const subInstr = {};
        allSubs.forEach(r => {
            subIds[r.code] = r.id;
            subInstr[r.code] = r.instructor;
        });

        const schedules = [
            // Tuesday
            [subIds['CSP 112'], 'TUESDAY', '07:00:00', '13:00:00', 'Room TBA', subInstr['CSP 112'], '#1E8449'],
            [subIds['CSP 115'], 'TUESDAY', '14:00:00', '17:00:00', 'Thesis Lab', subInstr['CSP 115'], '#2874A6'],
            
            // Wednesday
            [subIds['CSE 102'], 'WEDNESDAY', '13:00:00', '17:00:00', 'Room TBA', subInstr['CSE 102'], '#B7950B'],
            
            // Thursday
            [subIds['CSA 106'], 'THURSDAY', '07:00:00', '12:00:00', 'Room TBA', subInstr['CSA 106'], '#2874A6'],
            [subIds['CSP 111'], 'THURSDAY', '13:00:00', '15:00:00', 'Lecture Room', subInstr['CSP 111'], '#6C3483'],
            
            // Saturday
            [subIds['MTE 101'], 'SATURDAY', '07:00:00', '10:00:00', 'Room TBA', subInstr['MTE 101'], '#6C3483'],
            [subIds['CSP 111'], 'SATURDAY', '10:00:00', '13:00:00', 'Computer Lab', subInstr['CSP 111'], '#6C3483'],
            [subIds['CSP 113'], 'SATURDAY', '14:00:00', '17:00:00', 'Room TBA', subInstr['CSP 113'], '#D35400']
        ];
        
        for(const sch of schedules) {
            await db.execute('INSERT INTO class_schedules (subject_id, day_group, start_time, end_time, room, instructor, color_hex) VALUES (?, ?, ?, ?, ?, ?, ?)', sch);
        }

        console.log("Custom schedule applied.");
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

seedCustomSchedule();
