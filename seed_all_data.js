const pool = require('./config/db');
const bcrypt = require('bcrypt');

const studentsToSeed = [
    { first: 'Aaron', last: 'Pallasigue' },
    { first: 'Balong', last: 'Mangaoang' },
    { first: 'Adrian', last: 'Estrada' },
    { first: 'Dhenniel', last: 'Mendez' },
    { first: 'Bernald', last: 'Catli' },
    { first: 'Raven', last: 'Robles' },
    { first: 'Maryann', last: 'Castro' },
    { first: 'Jerry', last: 'Cudia' },
    { first: 'Jenine', last: 'Samson' },
    { first: 'Gerald', last: 'Bengco' }
];

const subjects = [
    { code: 'IT101', name: 'Introduction to Programming', desc: 'Fundamentals of algorithm and logic.' },
    { code: 'IT102', name: 'Web Development 1', desc: 'Front-end development with HTML, CSS, and JS.' },
    { code: 'CS201', name: 'Data Structures & Algorithms', desc: 'Efficient data management and sorting.' },
    { code: 'ENG101', name: 'Professional Communication', desc: 'Writing and speaking in business environments.' },
    { code: 'MATH101', name: 'Discrete Mathematics', desc: 'Mathematical structures for computer science.' }
];

const announcements = [
    { title: 'Welcome to the New Semester!', content: 'We are excited to see you all back for the 2nd Semester of 2026. Make sure to check your schedules!', author_id: 1 },
    { title: 'Final Examination Schedule', content: 'Finals will be held from June 15 to June 20. Please settle all your balances before then.', author_id: 1 },
    { title: 'Intramurals 2026', content: 'Join us for a week of sports and camaraderie! Registration for teams is now open at the Student Council office.', author_id: 1 }
];

const materials = [
    { title: 'Student Handbook 2026', file: 'uploads/handbook.pdf', uploader: 1 },
    { title: 'Introduction to Node.js Guide', file: 'uploads/node_guide.docx', uploader: 1 },
    { title: 'Academic Calendar 2026', file: 'uploads/calendar.jpg', uploader: 1 }
];

async function seed() {
    console.log('--- Starting Comprehensive Seed ---');
    
    try {
        // 1. Seed Subjects
        console.log('Seeding subjects...');
        const subjectIds = [];
        for (const sub of subjects) {
            const [res] = await pool.execute(
                'INSERT INTO subjects (code, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code=code',
                [sub.code, sub.name, sub.desc]
            );
            // If inserted or already exists, get the ID
            const [rows] = await pool.execute('SELECT id FROM subjects WHERE code = ?', [sub.code]);
            subjectIds.push(rows[0].id);
        }

        // 2. Seed Students
        console.log('Seeding students...');
        const passHash = await bcrypt.hash('password123', 10);
        
        for (let i = 0; i < studentsToSeed.length; i++) {
            const s = studentsToSeed[i];
            const username = `STU-2024-${(i + 1).toString().padStart(2, '0')}`;
            const email = `${s.first.toLowerCase()}.${s.last.toLowerCase().replace(' ', '')}@example.com`;
            
            // Insert User
            const [uRes] = await pool.execute(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE username=username',
                [username, passHash, 'student']
            );
            
            const [uRows] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
            const userId = uRows[0].id;

            // Insert Student Profile (Update if user_id exists)
            const [sRes] = await pool.execute(
                `INSERT INTO students (user_id, first_name, last_name, email, dob) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 first_name = VALUES(first_name), 
                 last_name = VALUES(last_name), 
                 email = VALUES(email)`,
                [userId, s.first, s.last, email, '2004-05-15']
            );
            
            const [sRows] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
            const studentId = sRows[0].id;

            // 3. Enroll & Grade
            console.log(`Enrolling and grading ${s.first}...`);
            const semester = '2nd Semester 2026';
            for (const subId of subjectIds) {
                // Enrollment
                await pool.execute(
                    'INSERT IGNORE INTO enrollments (student_id, subject_id, semester) VALUES (?, ?, ?)',
                    [studentId, subId, semester]
                );
                
                const [eRows] = await pool.execute(
                    'SELECT id FROM enrollments WHERE student_id = ? AND subject_id = ?',
                    [studentId, subId]
                );
                const enrId = eRows[0].id;

                // Grade
                const randomGrade = (1.0 + Math.random() * 1.5).toFixed(2);
                const remarks = parseFloat(randomGrade) <= 3.0 ? 'PASSED' : 'FAILED';
                await pool.execute(
                    'INSERT INTO grades (enrollment_id, grade, remarks) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE grade=?',
                    [enrId, randomGrade, remarks, randomGrade]
                );
            }

            // 4. Attendance (last 15 days)
            console.log(`Generating attendance for ${s.first}...`);
            for (let d = 0; d < 15; d++) {
                const date = new Date();
                date.setDate(date.getDate() - d);
                const dateStr = date.toISOString().split('T')[0];
                const statuses = ['Present', 'Present', 'Present', 'Late', 'Present', 'Absent']; // Weighted
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                await pool.execute(
                    'INSERT IGNORE INTO attendance (student_id, date, status) VALUES (?, ?, ?)',
                    [studentId, dateStr, status]
                );
            }
        }

        // 5. Announcements
        console.log('Seeding announcements...');
        for (const ann of announcements) {
            await pool.execute(
                'INSERT INTO announcements (title, content, author_id) VALUES (?, ?, ?)',
                [ann.title, ann.content, ann.author_id]
            );
        }

        // 6. Materials
        console.log('Seeding materials...');
        for (const mat of materials) {
            await pool.execute(
                'INSERT INTO materials (title, file_path, uploaded_by) VALUES (?, ?, ?)',
                [mat.title, mat.file, mat.uploader]
            );
        }

        // 7. Schedule (Setting)
        console.log('Setting institutional schedule...');
        await pool.execute(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['schedule_image', '../images/fun_Run.jpg', '../images/fun_Run.jpg']
        );

        console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
        console.log(`Summary:`);
        console.log(`- Students Added/Updated: ${studentsToSeed.length}`);
        console.log(`- Subjects: ${subjects.length}`);
        console.log(`- Grades Generated: ${studentsToSeed.length * subjects.length}`);
        console.log(`- Attendance Records: ${studentsToSeed.length * 15}`);
        console.log(`\nDemo Login: STU-2024-01 / password123`);
        
        process.exit(0);

    } catch (err) {
        console.error('Seed Failed:', err);
        process.exit(1);
    }
}

seed();
