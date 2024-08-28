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
// app.use('/js', express.static(path.join(__dirname, '../Frontend/SCRIPT')));

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

// app.post('/register', async (req, res) => {
//     const { fname, lname, email, mobileno, username, pass, usertype } = req.body;
//     // Validate required fields
//     if (!fname || !lname || !pass || !email || !usertype) {
//         return res.status(400).send('All fields are required.');
//     }
//     let connection;
//     try {
//         connection = await pool.getConnection();
  
//         // Insert into user_master
//         const sql = 'INSERT INTO user_master(username, password, firstname, lastname, usertype, mobile, email, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
//         const [result] = await connection.execute(sql, [username, pass, fname, lname, usertype, mobileno, email, new Date()]);
//         // const newUserID = result.insertId; // Get the ID of the newly inserted user
    
//         // Respond with success
//         res.status(200).json({ message: 'Registration successful!', receivedData: req.body });
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Error processing request.');
//     } finally {
//         if (connection) connection.release();
//     }
// });

app.listen(PORT, ()=> {
    console.log(`Server is running on port http://localhost:${PORT}`);
});