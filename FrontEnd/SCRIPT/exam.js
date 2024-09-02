const questions = [
    { question: 'What is the time complexity of binary search?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'] },
    { question: 'Which data structure uses LIFO (Last In First Out) principle?', options: ['Queue', 'Stack', 'Array', 'Linked List'] },
    { question: 'What is the output of `console.log(2 + \'2\')` in JavaScript?', options: ['4', '22', 'undefined', 'NaN'] },
    { question: 'Which sorting algorithm has the best average time complexity?', options: ['Bubble Sort', 'Merge Sort', 'Insertion Sort', 'Quick Sort'] },
    { question: 'What is the purpose of a hash table?', options: ['Store elements in a sorted order', 'Allow for constant time lookups', 'Implement a stack', 'Perform binary search'] },
    { question: 'Which keyword is used to define a class in Python?', options: ['class', 'def', 'struct', 'type'] },
    { question: 'In which algorithm is a divide and conquer strategy used?', options: ['Breadth-First Search', 'Depth-First Search', 'Merge Sort', 'Linear Search'] },
    { question: 'What is a common characteristic of a recursive function?', options: ['It always terminates', 'It calls itself', 'It uses iteration', 'It has constant space complexity'] },
    { question: 'Which of the following is a statically typed language?', options: ['JavaScript', 'Python', 'Java', 'PHP'] },
    { question: 'What is the primary use of the `this` keyword in JavaScript?', options: ['To reference the global object', 'To reference the current function', 'To reference the current object', 'To reference the parent object'] }
];

let currentQuestionIndex = 0;
const answers = new Array(questions.length).fill(null);

function createProgressCircles() {
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.innerHTML = ''; // Clear existing circles

    questions.forEach((_, index) => {
        const circle = document.createElement('div');
        circle.className = 'progress-circle';
        progressContainer.appendChild(circle);
    });
}

function updateProgressCircles() {
    const circles = document.querySelectorAll('.progress-circle');
    circles.forEach((circle, index) => {
        if (answers[index] !== null) {
            circle.classList.add('filled');
        } else {
            circle.classList.remove('filled');
        }
    });
}

function showQuestion(index) {
    const question = questions[index];
    document.getElementById('question-text').textContent = `Question ${index + 1}: ${question.question}`;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    question.options.forEach((option) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `
            <label>
                <input type="radio" name="option" value="${option}" ${answers[index] === option ? 'checked' : ''}>
                ${option}
            </label>
        `;
        optionDiv.addEventListener('click', () => selectOption(option));
        optionsDiv.appendChild(optionDiv);
    });

    document.getElementById('prev-button').disabled = index === 0;
    document.getElementById('next-button').disabled = index === questions.length - 1;
    document.getElementById('submit-button').disabled = answers.includes(null);

    updateProgressCircles(); // Update progress circles on question change
}

function selectOption(selectedOption) {
    answers[currentQuestionIndex] = selectedOption;
    document.querySelectorAll('.option').forEach(optionDiv => {
        optionDiv.classList.toggle('selected', optionDiv.querySelector('input').value === selectedOption);
    });
    document.getElementById('submit-button').disabled = answers.includes(null);
    updateProgressCircles(); // Update progress circles on option selection
}

document.getElementById('next-button').addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
});

document.getElementById('prev-button').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
});

document.getElementById('quiz-form').addEventListener('submit', (event) => { 
    event.preventDefault();

    fetch('/save-answers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Your answers have been submitted successfully!', data);
        showResult();
    })
    .catch(error => {
        console.error('Error:', error);
        console.log('There was a problem submitting your answers. Please try again.');
    });
});


function showResult() {
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('result').style.display = 'block';
}

document.getElementById('home-button').addEventListener('click', () => {
    // Navigate to the home page
    window.location.href = '/'; // Replace with your actual home URL
});

document.addEventListener('DOMContentLoaded', () => {
    createProgressCircles(); // Create progress circles when page loads
    showQuestion(currentQuestionIndex);
});