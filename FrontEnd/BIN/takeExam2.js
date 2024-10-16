// State to track the current question index and store the fetched questions
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];

// DOM elements
const questionId = document.getElementById("question-id");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const saveButton = document.getElementById("save-button");
const submitButton = document.getElementById("submit-button");
const display = document.getElementById('time-left');
const progressBar = document.getElementById('timer-bar');

// Fetch questions from backend
async function fetchQuestions() {
    //const examId = 1; // Replace this with dynamic examId if needed
    console.log("Inside Fetch");

    try {
        const response = await fetch(`http://localhost:3000/get-questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        questions = data.questions;

        // Initialize userAnswers array with null values
        userAnswers = new Array(questions.length).fill(null);

        // Display the first question
        displayQuestion(currentQuestionIndex);

        // Create progress circles after fetching questions
        createProgressCircles();

        // Start the timer using the exam end time
        // startTimer(totalDuration, display, progressBar);
        startTimer(data.end_time);
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Timer setup
function startTimer(examEndTime) {
    let startTime = Date.now();
    let timeInterval = setInterval(function () {
        let elapsed = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
        let timeLeft = duration - elapsed;

        // Convert timeLeft to minutes and seconds
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        // Format time with leading zero if needed
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        // Update the display
        display.textContent = minutes + ":" + seconds;

        // Calculate and update progress bar width
        let percentage = (timeLeft / duration) * 100;
        progressBar.style.width = percentage + "%";

        // Change color based on the percentage of time left
        if (percentage > 60) {
            progressBar.style.backgroundColor = "green"; // More than 60% time left
        } else if (percentage > 30) {
            progressBar.style.backgroundColor = "yellow"; // Between 30% and 60%
        } else {
            progressBar.style.backgroundColor = "red"; // Less than 30% time left
        }

        // Stop the timer when time runs out
        if (timeLeft <= 0) {
            clearInterval(timeInterval);
            display.textContent = "Time's up!";
            progressBar.style.width = "0%";
            // Auto-submit the form when time's up
            // document.getElementById('quiz-form').submit();
            // Check if the quiz form exists before submitting
            const quizForm = document.getElementById('quiz-form');
            if (quizForm) {
                console.log("Success");
                saveAnswer();
                quizForm.submit(); // Auto-submit the form when time's up
                window.location.href = `/studentInterface.html`;
            } else {
                console.error("Quiz form not found!");
            }
        }
    }, 1000); // Updates every second
}

function createProgressCircles() {
    console.log("Inside Progress Container");
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = ''; // Clear existing circles

    // Create a circle for each question
    questions.forEach((_, index) => {
        const circle = document.createElement('div');
        circle.className = 'progress-circle';
        circle.textContent = index + 1; // Display question number
        circle.addEventListener('click', () => {
            // Jump to the clicked question when a circle is clicked
            currentQuestionIndex = index;
            displayQuestion(currentQuestionIndex);
        });
        progressContainer.appendChild(circle);
    });
}

function updateProgressCircles() {
    const circles = document.querySelectorAll('.progress-circle');
    circles.forEach((circle, index) => {
        if (userAnswers[index] !== null) {
            circle.classList.add('filled'); // Mark as filled when answered
        } else {
            circle.classList.remove('filled');
        }
    });
}

// Function to display a question and its options
function displayQuestion(index) {
    const currentQuestion = questions[index];
    questionId.textContent = currentQuestion.id;
    questionText.textContent = currentQuestion.question;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Generate options
    currentQuestion.options.forEach((option, i) => {
        const optionLabel = document.createElement("label");
        const optionInput = document.createElement("input");
        optionInput.type = "radio";
        optionInput.name = "option";
        optionInput.value = option;

        // Map index to letters (A, B, C, D)
        const optionLetter = String.fromCharCode(65 + i); // Converts 0 -> A, 1 -> B, 2 -> C, 3 -> D
        optionInput.setAttribute("data-option-letter", optionLetter); // Set the option letter as a data attribute

        // Check if the user has already selected an option for this question
        if (userAnswers[index] === option) {
            optionInput.checked = true;
        }

        optionLabel.appendChild(optionInput);
        optionLabel.appendChild(document.createTextNode(`${optionLetter}: ${option}`));
        optionsContainer.appendChild(optionLabel);
        optionsContainer.appendChild(document.createElement("br"));
    });


    // Disable the previous button if it's the first question
    prevButton.disabled = index === 0;

    // Show the submit button if it's the last question, otherwise show the next button
    if (index === questions.length - 1) {
        nextButton.style.display = "none";
        submitButton.style.display = "inline-block";
    } else {
        nextButton.style.display = "inline-block";
        submitButton.style.display = "none";
    }

    updateProgressCircles(); // Update progress circles on question change
}

// Save the selected answer for the current question
// Save the selected answer for the current question
function saveAnswer() {
    // Get the selected option
    const selectedOption = document.querySelector('input[name="option"]:checked');

    if (selectedOption) {
        // Save the selected option for the current question
        userAnswers[currentQuestionIndex] = selectedOption.value;

        // Get the option letter from the data attribute
        const selectedOptionLetter = selectedOption.getAttribute("data-option-letter");

        // Get the question ID from the questions array
        const questionId = questions[currentQuestionIndex].id;

        // Show the alert with question ID and selected option letter
        const sel_answer = "option" + selectedOptionLetter;
        console.log(`Question ID: ${questionId}, Selected Option: ${sel_answer}`);
        const data = {
            questionId: questionId,  // Pass the question ID
            sel_answer: sel_answer  // Pass the selected answer
        };

        // Make the POST request using fetch
        fetch('/InsertAttempt', {
            method: 'POST',  // HTTP method
            headers: {
                'Content-Type': 'application/json'  // Set the content type to JSON
            },
            body: JSON.stringify(data)  // Convert JavaScript object to JSON string
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();  // Parse the JSON response
            })
            .then(data => {
                console.log('Success:', data);
                // Handle the success response (display message, update UI, etc.)
                console.log(data.message);
            })
            .catch((error) => {
                console.error('Error:', error);
                // Handle the error response
                alert('Error submitting attempt. Please try again.');
            });

    } else {
        userAnswers[currentQuestionIndex] = null; // If no option is selected
        alert(`No option selected for Question ID: ${questions[currentQuestionIndex].id}`);
    }
    updateProgressCircles(); // Update progress circles on option selection
}

// Event listeners for navigation buttons
prevButton.addEventListener("click", (e) => {
    e.preventDefault();
    saveAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
});

nextButton.addEventListener("click", (e) => {
    e.preventDefault();
    saveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
});

saveButton.addEventListener("click", (e) => {
    e.preventDefault();

    // Save the answer and show the alert
    saveAnswer();

    console.log(userAnswers); // This logs the user's answers
});

// Submit button event
submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    saveAnswer();
    alert("Exam Submitted. Thank you!");
    console.log(userAnswers); // This will log the user's answers, replace with actual submission logic
    document.getElementById("quiz").style.display = "none"; // Hide the quiz
    // document.getElementById("result").style.display = "block"; // Show the result page
    document.getElementById("progress-container").style.display = "none"; // Hide the progress container
    
    window.location.href = `/studentInterface.html`;
    // Change the frame locations using parent
    // parent.frames['left'].location.href = `/studentSide.html`;
    // parent.frames['right'].location.href = `/studentExamDisplay.html`;
});

// Fetch questions when the page loads
// window.onload = fetchQuestions;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
    createProgressCircles(); // Create progress circles when page loads
    console.log("Done");

    // let totalDuration = 1 * 60; // 1 minute in seconds
    // let display = document.getElementById('time-left');
    // let progressBar = document.getElementById('timer-bar');
    // startTimer(totalDuration, display, progressBar);
});

// Disable right-click and copy-paste
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert("Right-click is disabled during the exam.");
});

document.addEventListener('copy', function(e) {
    e.preventDefault();
    alert("Copying is not allowed during the exam.");
});

document.addEventListener('paste', function(e) {
    e.preventDefault();
    alert("Pasting is not allowed during the exam.");
});

// Detect tab switching (visibility change)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        alert("You switched tabs! This is not allowed during the exam.");
    }
});

// Disable certain keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        alert("Copying is disabled.");
    }
    if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        alert("Pasting is disabled.");
    }
    if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        alert("Opening new tabs is not allowed.");
    }
    if (event.altKey && event.key === 'Tab') {
        event.preventDefault();
        alert("Switching tabs is not allowed.");
    }
    if (event.key === 'F12') {
        event.preventDefault();
        alert("Developer tools are disabled.");
    }
});