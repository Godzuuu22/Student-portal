const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [students] = await db.execute('SELECT COUNT(*) as count FROM students');
        const [subjects] = await db.execute('SELECT COUNT(*) as count FROM subjects');
        const [enrollments] = await db.execute('SELECT COUNT(*) as count FROM enrollments');
        res.json({
            students: students[0].count,
            subjects: subjects[0].count,
            enrollments: enrollments[0].count
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}

// Students
exports.getStudents = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM students');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.addStudent = async (req, res) => {
    // Usually handled by auth register, but admin can add directly too if needed
    res.status(501).json({ error: 'Not implemented, use register endpoint' });
};

exports.updateStudent = async (req, res) => {
    const { first_name, last_name, email, dob } = req.body;
    try {
        await db.execute('UPDATE students SET first_name=?, last_name=?, email=?, dob=? WHERE id=?', 
            [first_name, last_name, email, dob, req.params.id]);
        res.json({ message: 'Student updated' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        const [student] = await db.execute('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
        if (student.length > 0) {
            // Because of ON DELETE CASCADE, deleting user deletes student
            await db.execute('DELETE FROM users WHERE id = ?', [student[0].user_id]);
            res.json({ message: 'Student and associated user deleted' });
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Subjects
exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM subjects');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.addSubject = async (req, res) => {
    const { code, name, description } = req.body;
    try {
        await db.execute('INSERT INTO subjects (code, name, description) VALUES (?, ?, ?)', [code, name, description]);
        res.json({ message: 'Subject added' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateSubject = async (req, res) => {
    const { code, name, description } = req.body;
    try {
        await db.execute('UPDATE subjects SET code=?, name=?, description=? WHERE id=?', [code, name, description, req.params.id]);
        res.json({ message: 'Subject updated' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteSubject = async (req, res) => {
    try {
        await db.execute('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        res.json({ message: 'Subject deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Enrollments
exports.getEnrollments = async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.semester, s.code, s.name as subject_name, st.first_name, st.last_name, e.student_id, e.subject_id
            FROM enrollments e
            JOIN subjects s ON e.subject_id = s.id
            JOIN students st ON e.student_id = st.id
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.addEnrollment = async (req, res) => {
    const { student_id, subject_id, semester } = req.body;
    try {
        await db.execute('INSERT INTO enrollments (student_id, subject_id, semester) VALUES (?, ?, ?)', [student_id, subject_id, semester]);
        res.json({ message: 'Enrollment created' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteEnrollment = async (req, res) => {
    try {
        await db.execute('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Enrollment deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

// Grades
exports.getGrades = async (req, res) => {
    try {
        const query = `
            SELECT g.id, g.grade, g.remarks, e.semester, s.code as subject_code, st.first_name, st.last_name
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN subjects s ON e.subject_id = s.id
            JOIN students st ON e.student_id = st.id
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.addGrade = async (req, res) => {
    const { enrollment_id, grade, remarks } = req.body;
    try {
        await db.execute('INSERT INTO grades (enrollment_id, grade, remarks) VALUES (?, ?, ?)', [enrollment_id, grade, remarks]);
        res.json({ message: 'Grade added' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.updateGrade = async (req, res) => {
    const { grade, remarks } = req.body;
    try {
        await db.execute('UPDATE grades SET grade=?, remarks=? WHERE id=?', [grade, remarks, req.params.id]);
        res.json({ message: 'Grade updated' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteGrade = async (req, res) => {
    try {
        await db.execute('DELETE FROM grades WHERE id = ?', [req.params.id]);
        res.json({ message: 'Grade deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
};
