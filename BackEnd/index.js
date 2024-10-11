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

// POST route to handle adding questions
app.post('/addQuestion', async (req, res) => {
    const { question, option1, option2, option3, option4, correctOption, question_marks } = req.body; // Extract data from request body
    console.log(req.body);

    // console.log(req.session.examID);
    const examID = req.session.examID; // Retrieve the exam ID from the session

    if (!examID) {
        return res.status(400).json({ message: 'Exam ID not found in session' });
    }

    let connection;
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        // Prepare the SQL query to insert the question and options into the Question_Master table
        const sql = `
            INSERT INTO Question_Master (
                examID, 
                question, 
                optionA, 
                optionB, 
                optionC, 
                optionD, 
                answer_key, 
                question_marks, 
                timestamp
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Prepare the options
        // const [optionA, optionB, optionC, optionD] = options; // Assumes options array contains 4 elements

        // Execute the SQL query
        const [result] = await connection.execute(sql, [
            // examID,
            req.session.examID,
            question,
            option1,
            option2,
            option3,
            option4,
            correctOption, // e.g., 'optionA', 'optionB', etc.
            question_marks,
            new Date() // Automatically sets current timestamp
        ]);

        // Send a success response
        res.status(200).json({ message: 'Registration successful!', receivedData: req.body });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing request' });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
});

//Set Test : SetTest

app.get('/SetTest', (req, res) => {
    console.log("serving test");
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
    const { examName, examDate, examTime, examDuration, totalMarks, passingMarks } = req.body;

    let connection;
    console.log("TeacherID:" + req.session.userID);
    try {
        connection = await pool.getConnection();

        // Insert into user_master
        const sql = 'INSERT INTO exam_master(teacherId, name, start_date, start_time, duration, total_marks, passing_marks, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await connection.execute(sql, [req.session.userID, examName, examDate, examTime, examDuration, totalMarks, passingMarks, new Date()]);

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

// app.post('/submit-exam', (req, res) => {
//     const { name, duration, questions } = req.body;

//     // Check if the examData object is valid
//     if (!name || !duration || !questions) {
//         return res.status(400).json({ success: false, message: 'Invalid exam data' });
//     }

//     console.log('Received exam data:', name);

//     // Insert exam into Exam_Master table
//     console.log("Success");
//     const insertExamQuery = 'INSERT INTO Exam_Master (name, duration) VALUES (?, ?)';
//     pool.query(insertExamQuery, [name, duration], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ success: false });
//         }

//         console.log("Exam inserted successfully");

//         const examId = result.insertId; // Retrieve the examId from the inserted exam

//         // Insert questions into Question_Master table
//         const insertQuestionQuery = `
//             INSERT INTO Question_Master (question, optionA, optionB, optionC, optionD, answer_key) 
//             VALUES ?`;

//         // Prepare question values, including examId for each question
//         const questionValues = questions.map((question) => [
//             // examId,                         // Add examId for each question
//             question.questionText,          // The actual question text
//             question.options[0],            // Option A
//             question.options[1],            // Option B
//             question.options[2],            // Option C
//             question.options[3],            // Option D
//             question.correctOption          // Correct option
//         ]);

//         // Execute bulk insert for questions
//         pool.query(insertQuestionQuery, [questionValues], (err, result) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ success: false });
//             }
//             console.log("Success");

//             res.json({ success: true });
//         });
//     });
// });


// Endpoint to handle exam submission
// app.post('/submit-exam', (req, res) => {
//     const { name, duration, questions } = req.body;

//     // Check if the examData object is valid
//     if (!name || !duration || !questions) {
//         return res.status(400).json({ success: false, message: 'Invalid exam data' });
//     }

//     console.log('Received exam data:', name);

//     // Insert exam into Exam_Master table
//     const insertExamQuery = 'INSERT INTO Exam_Master (name, duration) VALUES (?, ?)';
//     pool.query(insertExamQuery, [name, duration], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ success: false });
//         }

//         console.log("Success");
//     });

//     // const examId = result.insertId;

//     // Insert questions into Question_Master table
//     // const insertQuestionQuery = `INSERT INTO Question_Master (exam_id, question_text, option_1, option_2, option_3, option_4, correct_option) VALUES ?`;
//     const insertQuestionQuery = `INSERT INTO Question_Master (question, optionA, optionB, optionC, optionD, answer_key) VALUES ?`;
//     const questionValues = questions.map((question) => [
//         // examId,
//         question.questionText,
//         question.options[0],
//         question.options[1],
//         question.options[2],
//         question.options[3],
//         question.correctOption
//     ]);

//     // Create a query with placeholders for multiple rows
//     const valuesPlaceholders = questionValues.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

//     // Final query
//     insertQuestionQuery += valuesPlaceholders;

//     // Flatten the array of values
//     const flattenedValues = questionValues.flat();

//     console.log(pool.format(insertQuestionQuery, flattenedValues));

//     pool.query(insertQuestionQuery, flattenedValues, (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ success: false });
//         }

//         res.json({ success: true });
//     });
// });

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});