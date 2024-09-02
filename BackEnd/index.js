const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the 'Frontend/CSS' directory
app.use('/css', express.static(path.join(__dirname, '../FrontEnd/CSS')));

//For Images
app.use('/img', express.static(path.join(__dirname, '../FrontEnd/IMAGES')));

// Serve static files from the 'Frontend/HTML' directory

//JavaScript
app.use('/js', express.static(path.join(__dirname, '../Frontend/SCRIPT')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// mysql connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'smartgrade',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Serve 'home.html' on root path
app.get('/', (req, res) => {
    console.log("serving home");
    const filePath = path.join(__dirname, '../FrontEnd/HTML/home.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status || 500).send('Error sending file');
        } else {
            console.log('File sent:', filePath);
        }
    });
});
app.use('/', express.static(path.join(__dirname, '../FrontEnd/HTML')));

app.post('/login-packet', async (req, res) => {
    const { username, password } = req.body;
    console.log("Username: " + username);
    console.log("Password: " + password);
  
    if (!username || !password) {
        console.log("Empty packet");
        return res.status(400).json({ message: 'Username and password are required.' });
    }
  
    const connection = await pool.getConnection();
  
    try {
        const sql = 'SELECT username, password FROM user_master WHERE username = ?';
        const [result] = await connection.execute(sql, [username]);
        connection.release();
    
        if (result.length === 0) {
            console.log("No UserName");
            return res.status(404).json({ message: 'No such username found.' });
        }
    
        const user = result[0];
    
        if (user.password !== password) {
            console.log("Wrong Pass");
            return res.status(401).json({ message: 'Incorrect password.' });
        }
    
        console.log('Login successful, redirecting...');
        res.status(200).json({ redirectURL: '/userInterface.html' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error checking username and password' });
    }
});

app.post('/register', async (req, res) => {
    const { fname, lname, email, mobileno, username, pass, usertype } = req.body;

    // Validate required fields
    if (!fname || !lname || !pass || !email || !usertype) {
        return res.status(400).send('All fields are required.');
    }

    let connection;
    try {
        connection = await pool.getConnection();
  
        // Insert into user_master
        const sql = 'INSERT INTO user_master(username, password, firstname, lastname, usertype, mobile, email, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await connection.execute(sql, [username, pass, fname, lname, usertype, mobileno, email, new Date()]);
        // const newUserID = result.insertId; // Get the ID of the newly inserted user
    
        // Respond with success
        res.status(200).json({ message: 'Registration successful!', receivedData: req.body });
        // res.status(200).json({ message: 'Registration successful!', userId: result.insertId });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing request.');
    } finally {
        if (connection) connection.release();
    }
});

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

app.get('/user-info', checkAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const [rows] = await pool.query('SELECT username, firstname, lastname, email, mobile, usertype FROM user_master WHERE userID = ?', [userId]);
        if (rows.length > 0) {
            res.json(rows[0]); // Send user data as JSON
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Admin Apis
app.get('/admin', (req, res) => {
    const filePath = path.join(__dirname, '../Frontend/HTML/admin.html');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(err.status || 500).send('Error sending file');
      } else {
        console.log('File sent:', filePath);
      }
    });
});

// Serve data endpoints
app.get('/student', async (req, res) => {
    console.log("Okayyy");
    try {
        const [results] = await pool.query('SELECT userID AS id, username AS name, email, usertype, status AS role FROM User_Master where usertype="student"');
        res.json(results);
    } catch (err) {
        console.error('Error fetching users data:', err);
        res.status(500).json({ error: 'Failed to fetch users data' });
    }
});

app.get('/teacher', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT userID AS id, username AS name, email, usertype, status AS role FROM User_Master where usertype="teacher"');
        res.json(results);
    } catch (err) {
        console.error('Error fetching users data:', err);
        res.status(500).json({ error: 'Failed to fetch users data' });
    }
});

app.get('/exams', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT examID AS id, name, app_start_date, app_end_date FROM Exam_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching exams data:', err);
        res.status(500).json({ error: 'Failed to fetch exams data' });
    }
});

app.get('/questions', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT questionID AS id, examID, question, optionA, optionB, optionC, optionD FROM Question_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching questions data:', err);
        res.status(500).json({ error: 'Failed to fetch questions data' });
    }
});
  
app.get('/attempts', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT attemptID AS id, examID, questionID, applicationID, selected_option, correct_option, marks_obt FROM Attempt_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching attempts data:', err);
        res.status(500).json({ error: 'Failed to fetch attempts data' });
    }
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port http://localhost:${PORT}`);
});