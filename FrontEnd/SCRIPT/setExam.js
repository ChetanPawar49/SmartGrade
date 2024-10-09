let questionCount = 0;
const questionsArray = [];

// Function to generate inputs for the questions
function generateQuestionInputs() {
    const numQuestions = parseInt(document.getElementById('num-questions').value);
    if (isNaN(numQuestions) || numQuestions <= 0) {
        alert("Please enter a valid number of questions.");
        return;
    }

    questionCount = numQuestions;
    const formContainer = document.getElementById('questions-form');
    formContainer.innerHTML = '';

    for (let i = 0; i < numQuestions; i++) {
        formContainer.innerHTML += `
            <div class="question-box">
                <h3>Question ${i + 1}</h3>
                <input type="text" id="question-${i}" placeholder="Enter question text" required>
                <div class="options-container" id="options-${i}">
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="0" required>
                        <input type="text" placeholder="Option 1" required>
                    </div>
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="1" required>
                        <input type="text" placeholder="Option 2" required>
                    </div>
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="2" required>
                        <input type="text" placeholder="Option 3" required>
                    </div>
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="3" required>
                        <input type="text" placeholder="Option 4" required>
                    </div>
                </div>
            </div>
        `;
    }

    document.getElementById('submit-container').classList.remove('hidden');
    document.getElementById('alert-message').classList.add('hidden');
    document.getElementById('success-message').classList.add('hidden');
}

// Function to submit the questions
function submitQuestions() {
    questionsArray.length = 0;
    const formElements = document.querySelectorAll('.question-box');

    let isValid = true;
    formElements.forEach((box, index) => {
        const questionText = box.querySelector(`input[id="question-${index}"]`).value;
        const options = Array.from(box.querySelectorAll('.options-container .option input[type="text"]')).map(input => input.value);
        const correctAnswer = box.querySelector(`input[name="answer-${index}"]:checked`)?.value;

        if (questionText && options.length === 4 && correctAnswer !== undefined) {
            questionsArray.push({ question: questionText, options, answer: parseInt(correctAnswer) });
        } else {
            isValid = false;
        }
    });

    if (isValid) {
        const createdQuestionsContainer = document.getElementById('created-questions');
        createdQuestionsContainer.innerHTML = '';

        questionsArray.forEach((question, index) => {
            createdQuestionsContainer.innerHTML += `
                <div class="question-item">
                    <span>${index + 1}</span>
                    <p>${question.question}</p>
                </div>
            `;
        });

        document.getElementById('alert-message').classList.add('hidden');
        document.getElementById('success-message').textContent = 'Questions submitted successfully!';
        document.getElementById('success-message').classList.remove('hidden');

        // Show the scheduling and publish form
        document.getElementById('schedule-form').classList.remove('hidden');
    } else {
        document.getElementById('alert-message').textContent = 'Please complete all questions with exactly four options before submitting.';
        document.getElementById('alert-message').classList.remove('hidden');
        document.getElementById('success-message').classList.add('hidden');
    }
}

// Function to schedule and publish the exam
function scheduleAndPublishExam() {
    const examTitle = document.getElementById('exam-title').value;
    const examDate = document.getElementById('exam-date').value;
    const examTime = document.getElementById('exam-time').value;

    if (!examTitle || !examDate || !examTime) {
        alert("Please fill out all the exam scheduling fields.");
        return;
    }

    const examDetails = {
        title: examTitle,
        date: examDate,
        time: examTime,
        questions: questionsArray
    };

    // Send exam details to the server (this could be an API call)
    console.log("Exam Scheduled and Published:", examDetails);
    
    alert('Exam has been scheduled and published successfully!');
    // Optionally clear the form or redirect to another page
}

// Event listeners
document.getElementById('generate-questions').addEventListener('click', generateQuestionInputs);
document.getElementById('submit-questions').addEventListener('click', submitQuestions);
document.getElementById('publish-exam').addEventListener('click', scheduleAndPublishExam);
