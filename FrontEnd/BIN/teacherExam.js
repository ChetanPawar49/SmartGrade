let questionCount = 0;
const questionsArray = [];

function formatTimeToDisplay(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs} hr ${mins > 0 ? mins + " min" : ""}`;
    }
}

function generateQuestionInputs() {
    const numQuestions = parseInt(document.getElementById("num-questions").value);
    const examDuration = parseInt(document.getElementById("exam-duration").value);
    const examName = document.getElementById("exam-name").value;

    if (!examName.trim()) {
        alert("Please enter an exam name.");
        return;
    }

    if (isNaN(numQuestions) || numQuestions <= 0) {
        alert("Please enter a valid number of questions.");
        return;
    }

    if (isNaN(examDuration) || examDuration <= 0) {
        alert("Please set a valid exam duration.");
        return;
    }

    questionCount = numQuestions;
    const formContainer = document.getElementById("questions-form");
    formContainer.innerHTML = "";

    for (let i = 0; i < numQuestions; i++) {
        const questionBox = document.createElement("div");
        questionBox.classList.add("question-box");
        questionBox.innerHTML = `
                    <h3>Question ${i + 1}</h3>
                    <input type="text" id="question-${i}" placeholder="Enter your question">
                    <div class="options-container">
                        <div class="option">
                            <input type="radio" name="answer-${i}" value="option-1">
                            <input type="text" id="option-${i}-1" placeholder="Option 1">
                        </div>
                        <div class="option">
                            <input type="radio" name="answer-${i}" value="option-2">
                            <input type="text" id="option-${i}-2" placeholder="Option 2">
                        </div>
                        <div class="option">
                            <input type="radio" name="answer-${i}" value="option-3">
                            <input type="text" id="option-${i}-3" placeholder="Option 3">
                        </div>
                        <div class="option">
                            <input type="radio" name="answer-${i}" value="option-4">
                            <input type="text" id="option-${i}-4" placeholder="Option 4">
                        </div>
                    </div>
                `;
        formContainer.appendChild(questionBox);
    }

    // Show the submit button
    document.getElementById("submit-container").classList.remove("hidden");
}

function submitQuestions() {
    const examName = document.getElementById("exam-name").value;
    const examDuration = parseInt(document.getElementById("exam-duration").value);
    const examQuestions = [];

    for (let i = 0; i < questionCount; i++) {
        const questionText = document.getElementById(`question-${i}`).value;
        const options = [];
        const correctOption = document.querySelector(
            `input[name="answer-${i}"]:checked`
        );

        for (let j = 1; j <= 4; j++) {
            const optionText = document.getElementById(`option-${i}-${j}`).value;
            options.push(optionText);
        }

        if (correctOption === null) {
            alert(`Please select a correct answer for Question ${i + 1}`);
            return;
        }

        const questionData = {
            questionText,
            options,
            correctOption: correctOption.value,
        };

        examQuestions.push(questionData);
    }

    const examData = {
        name: examName,
        duration: examDuration,
        questions: examQuestions,
    };

    // // Clear alert and success messages
    // document.getElementById("alert-message").classList.add("hidden");
    // document.getElementById("success-message").classList.add("hidden");

    // // Store the exam data in questionsArray
    // questionsArray.push(examData);

    // // Display exam preview
    // previewExam(examData);

    // Send the exam data to the server via POST request
    // fetch('/submit-exam', {
    fetch('http://localhost:3000/submit-exam', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("success-message").textContent = "Exam submitted successfully!";
            document.getElementById("success-message").classList.remove("hidden");
        } else {
            document.getElementById("alert-message").textContent = "Error submitting exam.";
            document.getElementById("alert-message").classList.remove("hidden");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        console.log("Error");
    });
}

function previewExam(exam) {
    const previewContainer = document.getElementById("exam-preview");
    const previewExamName = document.getElementById("preview-exam-name");
    const examQuestionsContainer = document.getElementById("exam-questions");
    const examTimeDisplay = document.getElementById("exam-time-display");

    previewExamName.textContent = exam.name;
    examQuestionsContainer.innerHTML = ""; // Clear previous content

    const optionLabels = ["A", "B", "C", "D"];

    exam.questions.forEach((q, index) => {
        const questionItem = document.createElement("div");
        questionItem.innerHTML = `
                    <h4>Question ${index + 1}: ${q.questionText}</h4>
                    <ul>
                        ${q.options
                .map(
                    (opt, idx) =>
                        `<li>${optionLabels[idx]}. ${opt}</li>`
                )
                .join("")}
                    </ul>
                `;
        examQuestionsContainer.appendChild(questionItem);
    });

    examTimeDisplay.textContent = `Exam Duration: ${formatTimeToDisplay(
        exam.duration
    )}`;
    previewContainer.classList.remove("hidden"); // Show the preview container
}