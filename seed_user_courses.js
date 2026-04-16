const db = require('./config/db');

async function seedUserCourses() {
    console.log("Seeding new custom courses...");
    try {
        const [students] = await db.execute('SELECT id FROM students LIMIT 1');
        if (students.length === 0) {
            console.log("No student found!");
            return process.exit(1);
        }
        const s_id = students[0].id;

        await db.execute('DELETE FROM enrollments');
        await db.execute('DELETE FROM class_schedules');
        await db.execute('DELETE FROM subjects');
        
        const subs = [
            ['CSA 106', 'Event Driven Programming', 'Mr. Simora', 'blue'],
            ['CSE 102', 'Elective 2', 'Mr. Torres', 'green'],
            ['CSP 111', 'Software Engineer 2', 'Mr. Montalbo', 'purple'],
            ['CSP 112', 'Operating System', 'Mr. Gonzales', 'gold'],
            ['CSP 113', 'Human Computer Interaction', 'Mr. Pineda', 'orange'],
            ['CSP 115', 'CS Thesis Writing 1', 'Mr. Yumul', 'blue'],
            ['MTE 101', 'Quantitative Method (Math Elective)', 'Mrs. Capuno', 'purple']
        ];

        for (const s of subs) {
            await db.execute('INSERT INTO subjects (code, name, instructor, color_theme) VALUES (?, ?, ?, ?)', s);
        }

        const [allSubs] = await db.execute('SELECT id, code FROM subjects');
        const subIds = {};
        allSubs.forEach(r => subIds[r.code] = r.id);

        const enrs = [
            [s_id, subIds['CSA 106'], '2nd Sem', 45, 'A'],
            [s_id, subIds['CSE 102'], '2nd Sem', 80, 'B+'],
            [s_id, subIds['CSP 111'], '2nd Sem', 65, 'B'],
            [s_id, subIds['CSP 112'], '2nd Sem', 92, 'A-'],
            [s_id, subIds['CSP 113'], '2nd Sem', 55, 'B'],
            [s_id, subIds['CSP 115'], '2nd Sem', 30, 'C'],
            [s_id, subIds['MTE 101'], '2nd Sem', 88, 'A']
        ];
        
        for (const e of enrs) {
            const [enrRes] = await db.execute('INSERT INTO enrollments (student_id, subject_id, semester, progress) VALUES (?, ?, ?, ?)', [e[0], e[1], e[2], e[3]]);
            await db.execute('INSERT INTO grades (enrollment_id, grade, remarks) VALUES (?, ?, ?)', [enrRes.insertId, e[4], '']);
        }

        const schedules = [
            [subIds['CSA 106'], 'MONDAY / WEDNESDAY / FRIDAY', '07:30:00', '09:00:00', 'Room 101', 'Prof. Mr. Simora', '#2874A6'],
            [subIds['CSE 102'], 'MONDAY / WEDNESDAY / FRIDAY', '09:00:00', '10:30:00', 'Room 102', 'Prof. Mr. Torres', '#1E8449'],
            [subIds['CSP 111'], 'MONDAY / WEDNESDAY / FRIDAY', '10:30:00', '12:00:00', 'Lab 1', 'Prof. Mr. Montalbo', '#6C3483'],
            [subIds['CSP 112'], 'TUESDAY / THURSDAY', '08:00:00', '09:30:00', 'Room 201', 'Prof. Mr. Gonzales', '#B7950B'],
            [subIds['CSP 113'], 'TUESDAY / THURSDAY', '09:30:00', '11:00:00', 'Room 202', 'Prof. Mr. Pineda', '#D35400'],
            [subIds['CSP 115'], 'TUESDAY / THURSDAY', '13:00:00', '14:30:00', 'Thesis Lab', 'Prof. Mr. Yumul', '#2874A6'],
            [subIds['MTE 101'], 'TUESDAY / THURSDAY', '14:30:00', '16:00:00', 'Room 303', 'Prof. Mrs. Capuno', '#6C3483']
        ];
        for(const sch of schedules) {
            await db.execute('INSERT INTO class_schedules (subject_id, day_group, start_time, end_time, room, instructor, color_hex) VALUES (?, ?, ?, ?, ?, ?, ?)', sch);
        }

        console.log("Seeding complete.");
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

seedUserCourses();
