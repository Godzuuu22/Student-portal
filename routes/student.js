const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isAuthenticated, isStudent } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// All student routes require student authentication
router.use(isAuthenticated, isStudent);

router.get('/profile', studentController.getProfile);
router.post('/profile-pic', upload.single('profile_pic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        const file_path = '/uploads/' + req.file.filename;
        const studentId = req.session.user.student_id;
        
        await db.execute('UPDATE students SET profile_pic = ? WHERE id = ?', [file_path, studentId]);
        req.session.user.profile_pic = file_path;
        res.json({ message: 'Profile picture updated successfully', file_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/enrollments', studentController.getEnrollments);
router.get('/grades', studentController.getGrades);
router.get('/attendance', studentController.getAttendance);

module.exports = router;
