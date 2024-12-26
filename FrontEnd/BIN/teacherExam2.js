const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Endpoint to handle exam submission
app.post('/submit-exam', (req, res) => {
    const { name, duration, questions } = req.body;

    // Insert exam into Exam_Master table
    const insertExamQuery = 'INSERT INTO Exam_Master (exam_name, duration) VALUES (?, ?)';
    db.query(insertExamQuery, [name, duration], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }

        const examId = result.insertId;

        // Insert questions into Question_Master table
        // const insertQuestionQuery = `INSERT INTO Question_Master (exam_id, question_text, option_1, option_2, option_3, option_4, correct_option) VALUES ?`;
        const insertQuestionQuery = `INSERT INTO Question_Master (question, optionA, optionB, optionC, optionD, answer_key) VALUES ?`;
        const questionValues = questions.map((question) => [
            // examId,
            question.questionText,
            question.options[0],
            question.options[1],
            question.options[2],
            question.options[3],
            question.correctOption
        ]);

        db.query(insertQuestionQuery, [questionValues], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false });
            }

            res.json({ success: true });
        });
    });
});