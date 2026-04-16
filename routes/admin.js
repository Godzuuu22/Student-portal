const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(isAuthenticated, isAdmin);

// Dashboard overview
router.get('/stats', adminController.getStats);

// Students CRUD
router.get('/students', adminController.getStudents);
router.post('/students', adminController.addStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Subjects CRUD
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.addSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Enrollments CRUD
router.get('/enrollments', adminController.getEnrollments);
router.post('/enrollments', adminController.addEnrollment);
router.delete('/enrollments/:id', adminController.deleteEnrollment);

// Grades CRUD
router.get('/grades', adminController.getGrades);
router.post('/grades', adminController.addGrade);
router.put('/grades/:id', adminController.updateGrade);
router.delete('/grades/:id', adminController.deleteGrade);

module.exports = router;
