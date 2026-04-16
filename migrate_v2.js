const db = require('./config/db');

async function migrate() {
    console.log("Starting Migration v2...");
    try {
        // 1. Create class_schedules table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS class_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_id INT NOT NULL,
                day_group VARCHAR(50) NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                room VARCHAR(100) NOT NULL,
                instructor VARCHAR(100) NOT NULL,
                color_hex VARCHAR(20) NOT NULL,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        `);
        console.log("Created class_schedules table.");

        // 2. Add fields to subjects
        try { await db.execute('ALTER TABLE subjects ADD COLUMN instructor VARCHAR(100) DEFAULT "TBA"'); } catch(e) {}
        try { await db.execute('ALTER TABLE subjects ADD COLUMN color_theme VARCHAR(50) DEFAULT "blue"'); } catch(e) {}
        console.log("Added fields to subjects.");

        // 3. Add fields to enrollments
        try { await db.execute('ALTER TABLE enrollments ADD COLUMN progress INT DEFAULT 0'); } catch(e) {}
        console.log("Added fields to enrollments.");

        // 4. Add fields to students
        try { await db.execute('ALTER TABLE students ADD COLUMN program VARCHAR(100) DEFAULT "Undeclared"'); } catch(e) {}
        try { await db.execute('ALTER TABLE students ADD COLUMN year_level INT DEFAULT 1'); } catch(e) {}
        try { await db.execute('ALTER TABLE students ADD COLUMN current_semester VARCHAR(100) DEFAULT "1st Semester"'); } catch(e) {}
        try { await db.execute('ALTER TABLE students ADD COLUMN cumulative_gpa DECIMAL(3,2) DEFAULT 0.00'); } catch(e) {}
        try { await db.execute('ALTER TABLE students ADD COLUMN credit_hours INT DEFAULT 0'); } catch(e) {}
        try { await db.execute('ALTER TABLE students ADD COLUMN status VARCHAR(50) DEFAULT "Regular"'); } catch(e) {}
        console.log("Added fields to students.");

        // 5. Add fields to announcements
        try { await db.execute('ALTER TABLE announcements ADD COLUMN icon_type VARCHAR(50) DEFAULT "info"'); } catch(e) {}
        try { await db.execute('ALTER TABLE announcements ADD COLUMN tag_name VARCHAR(50) DEFAULT "General"'); } catch(e) {}
        try { await db.execute('ALTER TABLE announcements ADD COLUMN department VARCHAR(100) DEFAULT "Admin"'); } catch(e) {}
        console.log("Added fields to announcements.");

        // SEED DUMMY DATA matching the UI provided by User
        // Get the single seeded student or create one
        let [students] = await db.execute('SELECT id, user_id FROM students LIMIT 1');
        if (students.length > 0) {
            let s_id = students[0].id;
            // Update student profile matching Aria Anderson CS Y3
            await db.execute(`
                UPDATE students SET 
                program = 'BS Computer Science', 
                year_level = 3, 
                current_semester = '2nd Semester, 2025-2026', 
                cumulative_gpa = 3.72, 
                credit_hours = 15, 
                status = 'Regular' 
                WHERE id = ?`, [s_id]
            );

            // Clean existing subjects and enrollments for a fresh seed mapping
            await db.execute('DELETE FROM enrollments');
            await db.execute('DELETE FROM class_schedules');
            await db.execute('DELETE FROM subjects');

            // Insert 5 Subjects matching mockup
            const subs = [
                ['CS 301', 'Data Structures & Algorithms', 'Dr. Marco Reyes', 'blue'],
                ['CS 312', 'Database Systems', 'Prof. Yuki Nakamura', 'green'],
                ['CS 320', 'Operating Systems', 'Dr. Leon Fischer', 'purple'],
                ['MATH 201', 'Linear Algebra', 'Dr. Sofia Flores', 'gold'],
                ['ENG 210', 'Technical Communication', 'Ms. Rachel Kim', 'orange']
            ];
            
            for (const s of subs) {
                await db.execute('INSERT INTO subjects (code, name, instructor, color_theme) VALUES (?, ?, ?, ?)', s);
            }

            const [allSubs] = await db.execute('SELECT id, code FROM subjects');
            
            // Map code to ID
            const subIds = {};
            allSubs.forEach(r => subIds[r.code] = r.id);

            // Insert Enrollments corresponding to progress
            const enrs = [
                [s_id, subIds['CS 301'], '2nd Sem', 72],
                [s_id, subIds['CS 312'], '2nd Sem', 60],
                [s_id, subIds['CS 320'], '2nd Sem', 55],
                [s_id, subIds['MATH 201'], '2nd Sem', 68],
                [s_id, subIds['ENG 210'], '2nd Sem', 80]
            ];
            for (const e of enrs) {
                const [enrRes] = await db.execute('INSERT INTO enrollments (student_id, subject_id, semester, progress) VALUES (?, ?, ?, ?)', e);
                // Also add dummy grades matching the UI mock
                const grades = {
                    'CS 301': 'A',
                    'CS 312': 'B+',
                    'CS 320': 'B',
                    'MATH 201': 'A-',
                    'ENG 210': 'A'
                };
                const scode = Object.keys(subIds).find(k => subIds[k] === e[1]);
                await db.execute('INSERT INTO grades (enrollment_id, grade, remarks) VALUES (?, ?, ?)', [enrRes.insertId, grades[scode], '']);
            }

            // Insert Class Schedules matching the mockup exactly
            const schedules = [
                [subIds['CS 301'], 'MONDAY / WEDNESDAY / FRIDAY', '08:00:00', '09:30:00', 'Block C, Room 301', 'Dr. Reyes', '#2874A6'],
                [subIds['MATH 201'], 'MONDAY / WEDNESDAY / FRIDAY', '14:00:00', '15:30:00', 'Block B, Room 112', 'Dr. Flores', '#D35400'],
                [subIds['CS 312'], 'TUESDAY / THURSDAY', '10:30:00', '12:00:00', 'Block A, Lab 2', 'Prof. Nakamura', '#1E8449'],
                [subIds['CS 320'], 'TUESDAY / THURSDAY', '13:00:00', '14:30:00', 'Block C, Room 204', 'Dr. Fischer', '#6C3483'],
                [subIds['ENG 210'], 'TUESDAY / THURSDAY', '15:30:00', '17:00:00', 'Block D, Room 101', 'Ms. Kim', '#922B21']
            ];
            for(const sch of schedules) {
                await db.execute('INSERT INTO class_schedules (subject_id, day_group, start_time, end_time, room, instructor, color_hex) VALUES (?, ?, ?, ?, ?, ?, ?)', sch);
            }

            // Update Announcements
            await db.execute('DELETE FROM announcements');
            const anns = [
                ['Midterm Exam Schedule Released', 'Midterm examination schedules for Semester 2, 2025-2026 are now available...', 'calendar', 'Academic', 'Registrar Office', 1],
                ['Dean\'s List Nominations Open', 'Students who have maintained a cumulative GPA of 3.5 or higher...', 'trophy', 'Awards', 'Academic Affairs', 1],
                ['Graduation Application Deadline', 'Students expected to graduate in June 2026 must submit their graduation...', 'graduation', 'Graduation', 'Registrar Office', 1],
                ['Library System Maintenance - Apr 10', 'The library management system will be offline on April 10 from 10:00 PM to 2:00 AM...', 'warning', 'System', 'IT Services', 1]
            ];
            for (const a of anns) {
                await db.execute('INSERT INTO announcements (title, content, icon_type, tag_name, department, author_id) VALUES (?, ?, ?, ?, ?, ?)', a);
            }

        }
        
        console.log("Migration complete.");
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
