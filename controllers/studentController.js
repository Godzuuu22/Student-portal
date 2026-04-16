const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const studentId = req.session.user.student_id;
        const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [studentId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getEnrollments = async (req, res) => {
    try {
        const studentId = req.session.user.student_id;
        const query = `
            SELECT e.id, e.semester, e.progress, s.code, s.name, s.description, s.instructor, s.color_theme,
                   (SELECT g.grade FROM grades g WHERE g.enrollment_id = e.id LIMIT 1) as grade
            FROM enrollments e
            JOIN subjects s ON e.subject_id = s.id
            WHERE e.student_id = ?
        `;
        const [rows] = await db.execute(query, [studentId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getGrades = async (req, res) => {
    try {
        const studentId = req.session.user.student_id;
        const query = `
            SELECT g.grade, g.remarks, e.semester, s.code, s.name
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            JOIN subjects s ON e.subject_id = s.id
            WHERE e.student_id = ?
        `;
        const [rows] = await db.execute(query, [studentId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const studentId = req.session.user.student_id;
        const [rows] = await db.execute('SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC', [studentId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
