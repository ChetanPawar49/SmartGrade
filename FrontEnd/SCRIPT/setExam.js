let questionCount = 0;
const questionsArray = [];

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
                <input type="text" id="question-${i}" placeholder="Enter question text">
                <div class="options-container" id="options-${i}">
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="0">
                        <input type="text" placeholder="Option 1">
                    </div>
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="1">
                        <input type="text" placeholder="Option 2">
                    </div>
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="2">
                        <input type="text" placeholder="Option 3">
                    </div>
                    <div class="option">
                        <input type="radio" name="answer-${i}" value="3">
                        <input type="text" placeholder="Option 4">
                    </div>
                </div>
            </div>
        `;
    }

    document.getElementById('submit-container').classList.remove('hidden');
    document.getElementById('alert-message').classList.add('hidden');
    document.getElementById('success-message').classList.add('hidden');
}

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
        document.getElementById('success-message').textContent = 'Test created successfully!';
        document.getElementById('success-message').classList.remove('hidden');
    } else {
        document.getElementById('alert-message').textContent = 'Please complete all questions with exactly four options before submitting.';
        document.getElementById('alert-message').classList.remove('hidden');
        document.getElementById('success-message').classList.add('hidden');
    }
}