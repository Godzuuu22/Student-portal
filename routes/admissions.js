const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../public/uploads/applications');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Apply for Admission
router.post('/apply', upload.fields([{ name: 'form137', maxCount: 1 }, { name: 'grades', maxCount: 1 }]), async (req, res) => {
    try {
        const { first_name, last_name, email, phone, course } = req.body;
        
        let form137Path = null;
        let gradesPath = null;

        if (req.files['form137']) {
            form137Path = '/uploads/applications/' + req.files['form137'][0].filename;
        }
        if (req.files['grades']) {
            gradesPath = '/uploads/applications/' + req.files['grades'][0].filename;
        }

        const [result] = await db.execute(
            'INSERT INTO admission_applications (first_name, last_name, email, phone, course, form137_path, grades_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, course, form137Path, gradesPath]
        );

        res.status(201).json({ message: 'Application submitted successfully', applicationId: result.insertId });
    } catch (err) {
        console.error('Application Error:', err);
        res.status(500).json({ error: 'Failed to submit application. Please try again later.' });
    }
});

module.exports = router;
