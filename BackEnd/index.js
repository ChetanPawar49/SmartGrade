const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

// Serve static files from the 'Frontend/CSS' directory
app.use('/css', express.static(path.join(__dirname, '../FrontEnd/CSS')));

// Serve static files from the 'Frontend/CSS' directory
app.use('/fav', express.static(path.join(__dirname, '../FrontEnd/favicon_io')));

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
    saveUninitialized: false,           // ensures that a session is not created until data is stored in it.
    cookie: {
        maxAge: 1000 * 60 * 60 * 24     // 24 hours in milliseconds
        // secure: false,               // Use true if using HTTPS
        // maxAge: 60000 * 30           // Cookie expiration time 30 minutes session expiration
    }
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

app.post('/login-packet-admin', async (req, res) => {
    const { username, password } = req.body;
    console.log("Username: " + username);
    console.log("Password: " + password);

    if (!username || !password) {
        console.log("Empty packet");
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const connection = await pool.getConnection();

    try {
        const sql = 'SELECT username, password FROM admin WHERE username = ?';
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
        res.status(200).json({ redirectURL: '/admin' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error checking username and password' });
    }
});

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
        const sql = 'SELECT userID, username, password, firstname, lastname, email, mobile, usertype, status FROM user_master WHERE username = ?';
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

        if (user.status !== "Active") {
            console.log("User Not Active");
            return res.status(401).json({ message: 'Inactive User.' });
        }

        req.session.userID = result[0].userID;
        // req.session.username=result[0].username;
        // req.session.firstname=result[0].firstname;
        // req.session.lastname=result[0].lastname;
        // req.session.mobile=result[0].mobile;
        // req.session.email=result[0].email;
        // req.session.usertype=result[0].usertype;

        switch (user.usertype) {
            case 'Student':
                console.log('Login successful, redirecting...');
                res.status(200).json({ redirectURL: '/studentInterface' });
                break;
            case 'Teacher':
                console.log('Login successful, redirecting...');
                res.status(200).json({ redirectURL: '/teacherInterface' });
                break;
        }
        // console.log('Login successful, redirecting...');
        // res.status(200).json({ redirectURL: '/studentInterface.html' });
        // res.status(200).json({ redirectURL: '/userInterface.html' });
        // res.status(200).json({ redirectURL: '/exam.html' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error checking username and password' });
    }
});

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
    if (!req.session.userID) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

app.get('/user-info', checkAuth, async (req, res) => {
    try {
        const userId = req.session.userID;
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

// Resetting Session expiration time
app.use((req, res, next) => {
    if (req.session) {
        req.session.touch(); // Reset the session expiration time
    }
    next();
});

//get Student dashboard
app.get('/studentInterface', (req, res) => {
    console.log("serving applicant dash");
    const filePath = path.join(__dirname, '../Frontend/HTML/studentInterface.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status || 500).send('Error sending file');
        } else {
            console.log('File sent:', filePath);
        }
    });
});

//get Teacher dashboard
app.get('/teacherInterface', (req, res) => {
    console.log("serving applicant dash");
    const filePath = path.join(__dirname, '../Frontend/HTML/teacherInterface.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status || 500).send('Error sending file');
        } else {
            console.log('File sent:', filePath);
        }
    });
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
        // const [results] = await pool.query('SELECT userID AS id, username AS name, email, usertype, status AS role FROM User_Master where usertype="student"');
        const [results] = await pool.query('SELECT userID AS id, username AS name, email, usertype, status FROM User_Master where usertype="student"');
        res.json(results);
    } catch (err) {
        console.error('Error fetching users data:', err);
        res.status(500).json({ error: 'Failed to fetch users data' });
    }
});

// Function to send an email (modular)
async function sendEmail(userEmail, status) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or your email provider
        secure: true,
        port: 465,
        auth: {
            user: 'lastspacehero@gmail.com',
            pass: 'pvnu knbm fakv bzfz'
        }
    });

    let subject, text;

    if (status === 'Active') {
        subject = 'Account Activated';
        text = `Dear User, your account has been activated.`;
    } else if (status === 'Inactive') {
        subject = 'Account Deactivated';
        text = `Dear User, your account has been deactivated.`;
    }

    const mailOptions = {
        from: 'lastspacehero@gmail.com',
        to: userEmail,
        subject: subject,
        text: text
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`);
}

// API route to handle status update and send email
app.post('/status', async (req, res) => {
    const { id, status } = req.body;
    console.log("id : ", id, "status :", status);
    let connection;
    try {
        connection = await pool.getConnection();

        // Update status query
        const [result] = await connection.query('UPDATE user_master SET status = ? WHERE userId = ?', [status, id]);

        // Check if update was successful
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found or no change in status' });
        }

        // Fetch user email
        const [userResult] = await connection.query('SELECT email FROM user_master WHERE userId = ?', [id]);

        if (userResult.length > 0) {
            const userEmail = userResult[0].email;

            // Send email
            await sendEmail(userEmail, status);

            // Send success response
            res.status(200).json({ message: 'Status updated and email sent successfully!' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating status or sending email:', err);
        res.status(500).json({ error: 'Failed to update status or send email' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.get('/teacher', async (req, res) => {
    try {
        // const [results] = await pool.query('SELECT userID AS id, username AS name, email, usertype, status AS role FROM User_Master where usertype="teacher"');
        const [results] = await pool.query('SELECT userID AS id, username AS name, email, usertype, status FROM User_Master where usertype="teacher"');
        res.json(results);
    } catch (err) {
        console.error('Error fetching users data:', err);
        res.status(500).json({ error: 'Failed to fetch users data' });
    }
});

app.get('/exam', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT examID AS id, name, app_start_date, app_end_date FROM Exam_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching exams data:', err);
        res.status(500).json({ error: 'Failed to fetch exams data' });
    }
});

app.get('/question', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT questionID AS id, examID, question, optionA, optionB, optionC, optionD FROM Question_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching questions data:', err);
        res.status(500).json({ error: 'Failed to fetch questions data' });
    }
});

app.get('/attempt', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT attemptID AS id, examID, questionID, applicationID, selected_option, correct_option, marks_obt FROM Attempt_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching attempts data:', err);
        res.status(500).json({ error: 'Failed to fetch attempts data' });
    }
});
//Admin Apis END

app.get('/profile', (req, res) => {
    if (req.session.username) {
        // Assuming username is stored in session
        res.json({ username: req.session.username, firstname: req.session.firstname, lastname: req.session.lastname, mobile: req.session.mobile, email: req.session.email, usertype: req.session.usertype });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        // Send a response indicating successful logout
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/exam-schedule', checkAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT examID, name, start_date, start_time, end_time, total_marks, passing_marks FROM exam_master WHERE start_date = CURDATE()');

        if (rows.length > 0) {
            res.json(rows); // Send today's exam data as JSON
        } else {
            res.status(404).json({ message: 'No exams scheduled for today' });
        }
    } catch (error) {
        console.error('Error fetching exam schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to fetch all exams
app.get('/getExams', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // const [rows] = await connection.query('SELECT * FROM Exam_Master where examID=?');
        // const sql = await connection.query('SELECT * FROM Exam_Master WHERE examID=?');
        console.log(req.session.userID);

        // Using connection.execute for parameterized query
        const [result] = await connection.execute('SELECT * FROM Exam_Master WHERE teacherId = ?', [req.session.userID]);

        // console.log(result);
        // const [result] = await connection.execute(sql, [req.session.examID]);
        res.json({ success: true, exams: result });
        // res.json({ success: true, exams: rows });

        // Return the fetched data as JSON
        // res.json({ success: true, exams: rows });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ success: false, message: 'Error fetching exams.' });
    } finally {
        if (connection) connection.release();
    }
});

// Route to fetch all exams
app.get('/getStudentExams', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        // const [rows] = await connection.query('SELECT * FROM Exam_Master where examID=?');
        // const sql = await connection.query('SELECT * FROM Exam_Master WHERE examID=?');
        console.log(req.session.userID);

        // Using connection.execute for parameterized query
        const [result] = await connection.execute('SELECT * FROM Exam_Master');

        // console.log(result);
        // const [result] = await connection.execute(sql, [req.session.examID]);
        res.json({ success: true, exams: result });
        // res.json({ success: true, exams: rows });

        // Return the fetched data as JSON
        // res.json({ success: true, exams: rows });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ success: false, message: 'Error fetching exams.' });
    } finally {
        if (connection) connection.release();
    }
});

//handling the teacher question preview
app.get('/teacherquestion', (req, res) => {
    const filePath = path.join(__dirname, '../teacher.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status || 500).send('Error sending file');
        } else {
            console.log('File sent:', filePath);
        }
    });
});

// // POST route to handle adding questions
// app.post('/addQuestion', async (req, res) => {
//     const { question, option1, option2, option3, option4, correctOption, question_marks } = req.body; // Extract data from request body
//     console.log(req.body);

//     // console.log(req.session.examID);
//     const examID = req.session.examID; // Retrieve the exam ID from the session

//     if (!examID) {
//         return res.status(400).json({ message: 'Exam ID not found in session' });
//     }

//     let connection;
//     try {
//         // Get a connection from the pool
//         connection = await pool.getConnection();

//         // Prepare the SQL query to insert the question and options into the Question_Master table
//         const sql = `
//             INSERT INTO Question_Master (
//                 examID, 
//                 question, 
//                 optionA, 
//                 optionB, 
//                 optionC, 
//                 optionD, 
//                 answer_key, 
//                 question_marks, 
//                 timestamp
//             ) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         // Prepare the options
//         // const [optionA, optionB, optionC, optionD] = options; // Assumes options array contains 4 elements

//         // Execute the SQL query
//         const [result] = await connection.execute(sql, [
//             // examID,
//             req.session.examID,
//             question,
//             option1,
//             option2,
//             option3,
//             option4,
//             correctOption, // e.g., 'optionA', 'optionB', etc.
//             question_marks,
//             new Date() // Automatically sets current timestamp
//         ]);

//         // Send a success response
//         res.status(200).json({ message: 'Registration successful!', receivedData: req.body });

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ message: 'Error processing request' });
//     } finally {
//         if (connection) connection.release(); // Release the connection back to the pool
//     }
// });

//route to handle multiple question at once into the database from teacherQue.html 
app.post('/addMultipleQuestion', async (req, res) => {
    const { questions } = req.body; // Extract the questions array from the request body
    console.log(req.body);

    const examID = req.session.examID; // Assuming examID is stored in session
    // const examID = 1; // Assuming examID is stored in session

    if (!examID) {
        return res.status(400).json({ message: 'Exam ID not found in session' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        // Prepare the SQL query to insert all questions at once
        const sql = `
            INSERT INTO Question_Master (
                examID, question, question_marks, optionA, optionB, optionC, optionD, answer_key
            ) VALUES ?
        `;

        // Prepare the data to be inserted
        const questionData = questions.map(q => [
            examID,
            q.question,  // Question text
            q.question_marks,
            q.optionA,   // Option A
            q.optionB,   // Option B
            q.optionC,   // Option C
            q.optionD,   // Option D
            q.answer_key // Correct option
        ]);

        // Execute the SQL query to insert all questions
        const [result] = await connection.query(sql, [questionData]);

        // Send success response
        res.status(200).json({ message: 'Questions successfully inserted!', receivedData: req.body });

    } catch (error) {
        console.error('Error inserting questions:', error);
        res.status(500).json({ message: 'Error processing request' });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
});

//route to handle total marks and passing marks into the database from teacherQue.html 
app.post('/addTotalMarks', async (req, res) => {
    const { totalMarks, passingMarks } = req.body; // Extract the questions array from the request body
    console.log(req.body);

    const examID = req.session.examID; // Assuming examID is stored in session
    // const examID = 1; // Assuming examID is stored in session

    if (!examID) {
        return res.status(400).json({ message: 'Exam ID not found in session' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        // Prepare the SQL query to insert all questions at once
        const sql = `
            UPDATE Exam_Master 
            SET total_marks=?, passing_marks=? 
            WHERE examID=?
        `;

        // Execute the SQL query to insert all questions
        const [result] = await connection.query(sql, [totalMarks, passingMarks, examID]);

        // Send success response
        res.status(200).json({ success: true, message: 'Marks successfully inserted!', receivedData: req.body });

    } catch (error) {
        console.error('Error updating questions:', error);
        res.status(500).json({ message: 'Error processing request' });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
});

//Set Test : SetTest
app.get('/SetTest', (req, res) => {
    console.log("serving test");
    // const filePath = path.join(__dirname, '../Frontend/HTML/teacherQue.html');
    const filePath = path.join(__dirname, '../Frontend/HTML/teacherQue.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status || 500).send('Error sending file');
        } else {
            res.fil
            console.log('File sent:', filePath);
        }
    });
});

//Exam Creation:
app.post('/addExam', async (req, res) => {

    console.log("Adding Exam");
    const { examName, examDate, examTime, examEndTime } = req.body;

    let connection;
    console.log("TeacherID:" + req.session.userID);
    try {
        connection = await pool.getConnection();

        // Insert into user_master
        const sql = 'INSERT INTO exam_master(teacherId, name, start_date, start_time, end_time, timestamp) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await connection.execute(sql, [req.session.userID, examName, examDate, examTime, examEndTime, new Date()]);

        // Get the generated examID from the insert result
        const newExamID = result.insertId;

        // Store the examID in the session
        req.session.examID = newExamID;
        // sessionStorage.setItem('examID', newExamID);
        console.log(req.session);

        // const newexamID = result.insertId; // Get the ID of the newly inserted user
        // Respond with success

        // req.session.examID = newexamID;
        res.status(200).json({ message: 'Registration successful!', redirectURL: "/SetTest", receivedData: req.body });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing request.');
    } finally {
        if (connection) connection.release();
    }
});

// Route to send exam data as a response
app.get('/api/exam', async (req, res) => {
    try {
        console.log("Inside Exam...");
        const [results] = await pool.query('SELECT examID , name, start_date, start_time, duration, total_marks FROM Exam_Master');
        res.json(results);
    } catch (err) {
        console.error('Error fetching exams data:', err);
        res.status(500).json({ error: 'Failed to fetch exams data' });
    }
});

app.post('/api/exams/myexam', async (req, res) => {
    const { examID } = req.body;
    const sql = "SELECT * FROM exam_master where examID=? And teacherId=?";
    const connection = await pool.getConnection();
    const [result] = await connection.execute(sql, [examID, req.session.userID]);
    connection.release();
    console.log(result);
    res.json(result);
});

//to Update Exam:
app.post('/updateExam', async (req, res) => {
    const { examID, name, exam_start_date, exam_start_time, exam_end_time, total_marks, passing_marks } = req.body;

    let connection;
    console.log("teacherID: " + req.session.userID);

    try {
        // Get the connection asynchronously
        connection = await pool.getConnection();

        // Prepare the SQL query for updating exam_master
        const sql = 'UPDATE exam_master SET name = ?, start_date = ?, start_time = ?, end_time = ?, total_marks = ?, passing_marks = ?, timestamp = ? WHERE examID = ? AND teacherId=?';

        // Execute the query and update the data in the database
        const [result] = await connection.execute(sql, [name, exam_start_date, exam_start_time, exam_end_time, total_marks, passing_marks, new Date(), examID, req.session.userID]);

        // Check if any rows were updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Exam not found or not authorized to update" });
        }

        console.log("Exam updated successfully, Exam ID: " + examID);

        // Respond with success (you can modify this based on your application's needs)
        res.json({
            success: true,
            message: "Exam updated successfully",
            examID: examID
        });

    } catch (error) {
        console.error("Error updating exam data:", error);
        res.status(500).json({ success: false, message: "Error updating exam" });
    } finally {
        if (connection) {
            connection.release(); // Make sure to release the connection
        }
    }

});

//Delete an Exam
app.post('/delExam', async (req, res) => {
    const { examID } = req.body;
    const sql = "DELETE FROM question_master WHERE examID=?";
    const connection = await pool.getConnection();
    const [result1] = await connection.execute(sql, [examID]);
    const sql1 = "DELETE FROM exam_master WHERE examID=?";
    const [result2] = await connection.execute(sql1, [examID]);
    connection.release();
    res.status(200).json({ redirectURL: "/teacherExamDisplay.html", receivedData: req.body });
    // res.status(200).json({ redirectURL: "/api/exam", receivedData: req.body });
});

// Start Exam
app.get('/start_exam', (req, res) => {
    const { examID } = req.query;
    req.session.testExamID = examID;
    console.log("serving home with examID:", req.session.testExamID);
    const filePath = path.join(__dirname, '../Frontend/HTML/takeExam.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status || 500).send('Error sending file');
        } else {
            console.log('File sent:', filePath);
        }
    });
});

app.post('/get-questions', async (req, res) => {
    const examId = req.session.testExamID; // examId comes from URL params
    let connection;

    // Modified query to fetch questions and their corresponding options from question_master
    const query = `
      SELECT questionID, question, optionA, optionB, optionC, optionD
      FROM question_master
      WHERE examID = ?;
    `;

    try {
        // Fetch questions and options from the database
        connection = await pool.getConnection();

        const [results] = await connection.query(query, [examId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No questions found for this exam.' });
        }
        console.log(results);

        // Format the questions and options into an array
        const questionsArray = results.map(row => ({
            id: row.questionID, // Add questionID to the object
            question: row.question,
            options: [row.optionA, row.optionB, row.optionC, row.optionD]
        }));

        // Send the formatted questions array back to the frontend
        res.json({ examId, questions: questionsArray });
    } catch (err) {
        console.error('Error fetching questions:', err);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release(); // Release the database connection
    }
});

//Insert Into Attempts:
app.post('/InsertAttempt', async (req, res) => {
    const { questionId, sel_answer } = req.body;
    const examId = req.session.testExamID; // examId comes from URL params
    let connection;

    const sql = 'Select * from Attempt_Master where examID=? and questionID=? and applicationID=?';
    // Modified query to fetch questions and their corresponding options from question_master
    const query = `INSERT INTO Attempt_Master (examID, questionID, applicationID, selected_option) VALUES(?,?,?,?)`;
    const updateQuery = 'UPDATE Attempt_Master SET selected_option = ? WHERE examID = ? AND questionID = ? AND applicationID = ?';
    try {
        // Fetch questions and options from the database
        connection = await pool.getConnection();
        const [result1] = await connection.query(sql, [examId, questionId, req.session.userID]);
        if (result1.length > 0) {
            const [results] = await connection.query(updateQuery, [sel_answer, examId, questionId, req.session.userID]);
            console.log(results);
            return res.status(200).json({ message: 'Attempted' });
        } else {
            const [results] = await connection.query(query, [examId, questionId, req.session.userID, sel_answer]);
            console.log(results);
            return res.status(200).json({ message: 'Attempted' });
        }
    } catch (err) {
        console.error('Error fetching questions:', err);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release(); // Release the database connection
    }
});

// Route to add notice
app.post('/add-notice', async (req, res) => {
    const notice = req.body.notice;
    let connection;

    if (!notice) {
        return res.status(400).json({ success: false, message: 'Notice text is required' });
    }

    const query = 'INSERT INTO notices (notice_text) VALUES (?)';

    try {
        // Acquire a connection from the pool
        connection = await pool.getConnection();

        // Execute the query using a promise-based approach
        await connection.query(query, [notice]);

        // Send success response
        res.json({ success: true, message: 'Notice added successfully' });
    } catch (err) {
        console.error('Error inserting notice:', err);
        res.status(500).json({ success: false, message: 'Error inserting notice' });
    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
    }
});

// Route to get all notices
app.get('/notices', async (req, res) => {
    let connection;

    try {
        // Acquire a connection from the pool
        connection = await pool.getConnection();

        const query = 'SELECT * FROM notices ORDER BY created_at DESC';

        // Use a promise-based approach to handle the query
        const [results] = await connection.query(query);

        // Send back the results
        res.json({ success: true, notices: results });
    } catch (err) {
        console.error('Error fetching notices:', err);
        res.status(500).json({ success: false, message: 'Error fetching notices' });
    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
    }
});

// Route to delete a notice from database
app.delete('/delete-notice/:id', async (req, res) => {
    const noticeId = req.params.id;
    let connection;

    const query = 'DELETE FROM notices WHERE id = ?';

    try {
        connection = await pool.getConnection();
        const result = await connection.query(query, [noticeId]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Notice deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Notice not found' });
        }
    } catch (err) {
        console.error('Error deleting notice:', err);
        res.status(500).json({ success: false, message: 'Error deleting notice' });
    } finally {
        if (connection) connection.release();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});