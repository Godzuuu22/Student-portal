const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { username, password, first_name, last_name, email, dob } = req.body;
    
    if (!username || !password || !first_name || !last_name || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

        const [existingEmail] = await db.execute('SELECT id FROM students WHERE email = ?', [email]);
        if (existingEmail.length > 0) return res.status(400).json({ error: 'Email already exists' });

        const hash = await bcrypt.hash(password, 10);
        
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [userResult] = await connection.execute(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                [username, hash, 'student']
            );
            
            const userId = userResult.insertId;
            
            await connection.execute(
                'INSERT INTO students (user_id, first_name, last_name, email, dob) VALUES (?, ?, ?, ?, ?)',
                [userId, first_name, last_name, email, dob || null]
            );

            await connection.commit();
            res.status(201).json({ message: 'Registration successful' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password, loginType } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        
        if (loginType && user.role !== loginType) {
            return res.status(401).json({ error: `Unauthorized. Please log in through the ${user.role} portal.` });
        }

        let studentData = null;
        if (user.role === 'student') {
            const [students] = await db.execute('SELECT id, first_name, last_name, profile_pic FROM students WHERE user_id = ?', [user.id]);
            if (students.length > 0) studentData = students[0];
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            student_id: studentData ? studentData.id : null,
            name: studentData ? `${studentData.first_name} ${studentData.last_name}` : 'Admin',
            profile_pic: studentData ? studentData.profile_pic : null
        };

        res.json({ message: 'Logged in successfully', user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
};

exports.getMe = (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};
