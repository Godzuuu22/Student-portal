const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Check Auth Middleware locally for simple checking
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ----------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------

// Get all announcements
router.get('/announcements', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT a.*, u.username as author FROM announcements a LEFT JOIN users u ON a.author_id = u.id ORDER BY a.date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post announcement (Admin only)
router.post('/announcements', requireAdmin, upload.single('ann_image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const author_id = req.session.user.id;
        const image_path = req.file ? '/uploads/' + req.file.filename : null;
        await db.execute('INSERT INTO announcements (title, content, author_id, image_path) VALUES (?, ?, ?, ?)', [title, content, author_id, image_path]);
        res.json({ message: 'Announcement posted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------
// CLASS SCHEDULES
// ----------------------------------------------------

// Serve student specific schedule
router.get('/student-schedule', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'student') {
            return res.status(403).json({ error: 'Student access required' });
        }
        const studentId = req.session.user.student_id;
        
        const query = `
            SELECT cs.*, s.code, s.name 
            FROM class_schedules cs
            JOIN subjects s ON cs.subject_id = s.id
            JOIN enrollments e ON e.subject_id = s.id
            WHERE e.student_id = ?
            ORDER BY cs.start_time ASC
        `;
        const [rows] = await db.execute(query, [studentId]);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------
// MATERIALS
// ----------------------------------------------------

// Get all materials
router.get('/materials', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT m.*, u.username as uploader FROM materials m LEFT JOIN users u ON m.uploaded_by = u.id ORDER BY m.upload_date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload material (Admin only)
router.post('/materials', requireAdmin, upload.single('material_file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const { title } = req.body;
        const file_path = '/uploads/' + req.file.filename;
        const uploaded_by = req.session.user.id;
        
        await db.execute('INSERT INTO materials (title, file_path, uploaded_by) VALUES (?, ?, ?)', [title, file_path, uploaded_by]);
        
        res.json({ message: 'Material uploaded successfully', file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------
// SCHEDULE
// ----------------------------------------------------

// Get schedule image path
router.get('/schedule', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT setting_value FROM settings WHERE setting_key = "schedule_image"');
        const schedulePath = rows.length ? rows[0].setting_value : null;
        res.json({ schedule_image: schedulePath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload schedule image (Admin only)
router.post('/schedule', requireAdmin, upload.single('schedule_image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        
        const file_path = '/uploads/' + req.file.filename;
        
        // Upsert the setting
        await db.execute('INSERT INTO settings (setting_key, setting_value) VALUES ("schedule_image", ?) ON DUPLICATE KEY UPDATE setting_value = ?', [file_path, file_path]);
        
        res.json({ message: 'Schedule updated successfully', file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Exam Schedule
router.get('/exam-schedule', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT setting_value FROM settings WHERE setting_key = "exam_schedule_image"');
        const path = rows.length ? rows[0].setting_value : null;
        res.json({ schedule_image: path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Exam Schedule
router.post('/exam-schedule', requireAdmin, upload.single('exam_schedule_image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        const file_path = '/uploads/' + req.file.filename;
        await db.execute('INSERT INTO settings (setting_key, setting_value) VALUES ("exam_schedule_image", ?) ON DUPLICATE KEY UPDATE setting_value = ?', [file_path, file_path]);
        res.json({ message: 'Exam schedule updated successfully', file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Section Schedule
router.get('/section-schedule', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT setting_value FROM settings WHERE setting_key = "section_schedule_image"');
        const path = rows.length ? rows[0].setting_value : null;
        res.json({ schedule_image: path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Section Schedule
router.post('/section-schedule', requireAdmin, upload.single('section_schedule_image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        const file_path = '/uploads/' + req.file.filename;
        await db.execute('INSERT INTO settings (setting_key, setting_value) VALUES ("section_schedule_image", ?) ON DUPLICATE KEY UPDATE setting_value = ?', [file_path, file_path]);
        res.json({ message: 'Section schedule updated successfully', file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------
// SYSTEM BACKGROUND
// ----------------------------------------------------

// Serve system background dynamically
router.get('/background', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT setting_value FROM settings WHERE setting_key = "sys_background"');
        if (rows.length && rows[0].setting_value) {
            return res.redirect(rows[0].setting_value);
        }
        res.redirect('https://placehold.co/1920x1080/002D62/FFFFFF/png?text=CHCC+Portal+Background');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload system background (Admin only)
router.post('/background', requireAdmin, upload.single('bg_image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        const file_path = '/uploads/' + req.file.filename;
        await db.execute('INSERT INTO settings (setting_key, setting_value) VALUES ("sys_background", ?) ON DUPLICATE KEY UPDATE setting_value = ?', [file_path, file_path]);
        res.json({ message: 'Background updated successfully', file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
