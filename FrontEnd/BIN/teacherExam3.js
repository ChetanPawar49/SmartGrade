let questionCount = 0;

const button1 = document.getElementById('submitQuestion');

button1.addEventListener('click', function () {
    submitQuestions();
});

function generateQuestionInputs() {
    const numQuestions = parseInt(document.getElementById('num-questions').value);

    if (isNaN(numQuestions) || numQuestions <= 0) {
        alert("Please enter a valid number of questions.");
        return;
    }

    questionCount = numQuestions;
    const formContainer = document.getElementById('questions-form');
    formContainer.innerHTML = ''; // Clear any previous form

    for (let i = 0; i < numQuestions; i++) {
        addQuestion(i);
    }

    // Show the submit button
    document.getElementById('submit-container').classList.remove('hidden');
}

function addQuestion(index) {
    const formContainer = document.getElementById('questions-form');

    const questionBox = document.createElement('div');
    questionBox.classList.add('question-box');
    questionBox.setAttribute('id', `question-box-${index}`);

    questionBox.innerHTML = `
                <h3>Question ${index + 1}</h3>
                <input type="text" id="question-${index}" placeholder="Enter your question">
                <div class="options-container" id="options-container-${index}">
                    ${generateOptionHTML(index, 1)}
                    ${generateOptionHTML(index, 2)}
                    ${generateOptionHTML(index, 3)}
                    ${generateOptionHTML(index, 4)}
                </div>
                <button onclick="addOption(${index})">Add Option</button>
                <button onclick="removeOption(${index})">Remove Option</button>
                <button onclick="removeQuestion(${index})">Remove Question</button>
            `;

    formContainer.appendChild(questionBox);
}

function generateOptionHTML(questionIndex, optionIndex) {
    return `
                <div class="option">
                    <input type="radio" name="answer-${questionIndex}" value="option-${optionIndex}">
                    <input type="text" id="option-${questionIndex}-${optionIndex}" placeholder="Option ${optionIndex}">
                </div>
            `;
}

function addOption(questionIndex) {
    const optionsContainer = document.getElementById(`options-container-${questionIndex}`);
    const optionCount = optionsContainer.children.length + 1;

    const newOption = document.createElement('div');
    if (optionCount <= 6) { // Ensure there are always at least two options
        newOption.classList.add('option'); // Ensures same styling as other options

        newOption.innerHTML = `
                <input type="radio" name="answer-${questionIndex}" value="option-${optionCount}">
                <input type="text" id="option-${questionIndex}-${optionCount}" placeholder="Option ${optionCount}">
            `;

        optionsContainer.appendChild(newOption); // Append the new option
    } else {
        alert("You can have maximum of 6 options per question.");
    }
    // newOption.classList.add('option'); // Ensures same styling as other options

    // newOption.innerHTML = `
    //             <input type="radio" name="answer-${questionIndex}" value="option-${optionCount}">
    //             <input type="text" id="option-${questionIndex}-${optionCount}" placeholder="Option ${optionCount}">
    //         `;

    // optionsContainer.appendChild(newOption); // Append the new option
}

function removeOption(questionIndex) {
    const optionsContainer = document.getElementById(`options-container-${questionIndex}`);
    const optionCount = optionsContainer.children.length;

    if (optionCount > 2) { // Ensure there are always at least two options
        optionsContainer.lastElementChild.remove();
    } else {
        alert("You must have at least two options per question.");
    }
}

function removeQuestion(index) {
    const questionBox = document.getElementById(`question-box-${index}`);
    questionBox.remove();
}

async function submitQuestions() {
    // const examName = document.getElementById('examName').value; // Removed input field for exam name
    // const examName = sessionStorage.getItem('examName'); //Getting exam name from session storage
    // const examDuration = sessionStorage.getItem('examDuration');
    const examQuestions = [];

    for (let i = 0; i < questionCount; i++) {
        const questionText = document.getElementById(`question-${i}`).value;
        const options = document.querySelectorAll(`#options-container-${i} .option`);

        if (!questionText.trim()) {
            alert("Please enter a question.");
            return;
        }

        const correctOption = document.querySelector('input[type="radio"]').checked;
        // options.forEach((option, index) => {
        //     const optionText = option.querySelector('input[type="text"]').value;
        //     const correctMark = correctOption ? ' (Correct)' : '';
        //     // questionPreview.innerHTML += `<p>Option ${index + 1}: ${optionText}${correctMark}</p>`;
        // });

        const questionData = {
            question: questionText,
            options: options,
            correctOption: correctOption
        };

        // const questionData = {
        //     questionText,
        //     options,
        //     correctOption: correctOption.value,
        // };

        examQuestions.push(questionData);
        // previewExamQuestions.appendChild(questionPreview);
    }

    const examData = {
        questions: examQuestions,
    };

    try {
        console.log("Exam Creation");
        const response = await fetch('/addQuestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(examData)
        });

        // Check if the response is OK and is in JSON format
        if (response.ok) {
            const data = await response.json();  // Only try parsing if response is OK
            console.log("Success:", data.message);
        } else {
            // Log the raw response if it's not JSON (like an error page)
            const errorText = await response.text();
            console.error('Error Response Status:', response.status);
            console.error('Response error:', errorText);
            alert('Error: ' + errorText);
        }
        
        // const data = await response.json();
        // if (response.ok) {
        //     console.log("Success");
        //     // console.log(questionData.questionNumber + " Added");
        //     // Redirect or clear the form as needed
        //     //window.location.href = data.redirectURL;
        // } else {
        //     alert('Registration failed: ' + data.message);
        // }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting the form.');
    }

    // document.getElementById('exam-time-display').innerHTML = `Duration: null`; // Show null for duration
    // document.getElementById('exam-preview').classList.remove('hidden'); // Show the preview

    // fetch('http://localhost:3000/submit-exam', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(examData),
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.success) {
    //         document.getElementById("success-message").textContent = "Exam submitted successfully!";
    //         document.getElementById("success-message").classList.remove("hidden");
    //     } else {
    //         document.getElementById("alert-message").textContent = "Error submitting exam.";
    //         document.getElementById("alert-message").classList.remove("hidden");
    //     }
    // })
    // .catch((error) => {
    //     console.error('Error:', error);
    //     console.log("Error");
    // });
}