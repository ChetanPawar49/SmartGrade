document.addEventListener('DOMContentLoaded', function() {
    const createExamBtn = document.getElementById('create-exam-btn');
    const examCreationSection = document.getElementById('exam-creation-section');
    const dashboard = document.getElementById('dashboard');
    const generateQuestionsBtn = document.getElementById('generate-questions-btn');
    const questionsForm = document.getElementById('questions-form');
    const submitExamBtn = document.getElementById('submit-exam-btn');
    const examList = document.getElementById('exams-ul');
    const examDetailsSection = document.getElementById('exam-details-section');
    const examInfoName = document.getElementById('exam-info-name');
    const questionsUl = document.getElementById('questions-ul');
    const scheduleExamBtn = document.getElementById('schedule-exam-btn');
    const scheduleSection = document.getElementById('schedule-section');
    const examStatusBox = document.getElementById('exam-status-box');
    const statusSelect = document.getElementById('exam-status');
    const updateStatusBtn = document.getElementById('update-status-btn');
    let selectedExam = null;
    const exams = []; // Array to store exams

    // Navigate to the exam creation section
    createExamBtn.addEventListener('click', function() {
        dashboard.classList.add('hidden');
        examCreationSection.classList.remove('hidden');
    });

    // Handle generating questions inputs
    generateQuestionsBtn.addEventListener('click', function() {
        const numQuestions = parseInt(document.getElementById('num-questions').value);
        if (isNaN(numQuestions) || numQuestions <= 0) {
            alert("Please enter a valid number of questions.");
            return;
        }

        questionsForm.innerHTML = ''; // Clear existing questions

        for (let i = 0; i < numQuestions; i++) {
            questionsForm.innerHTML += `
                <div class="question-box">
                    <h3>Question ${i + 1}</h3>
                    <input type="text" placeholder="Enter question text" required>
                    <div class="options-container">
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

        submitExamBtn.classList.remove('hidden'); // Show submit button after questions are generated
    });

    // Handle exam submission
    document.getElementById('exam-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const examName = document.getElementById('exam-name').value;
        const questionBoxes = document.querySelectorAll('.question-box');
        const questions = [];

        questionBoxes.forEach((box, index) => {
            const questionText = box.querySelector('input[type="text"]').value;
            const options = Array.from(box.querySelectorAll('.option input[type="text"]')).map(input => input.value);
            const correctAnswer = box.querySelector(`input[name="answer-${index}"]:checked`).value;

            questions.push({
                question: questionText,
                options: options,
                answer: parseInt(correctAnswer)
            });
        });

        // Store exam data
        const examData = {
            id: exams.length + 1, // Simple ID generation
            name: examName,
            questions: questions,
            timestamp: new Date().toISOString(),
            scheduledDate: null, // Default to null
            scheduledTime: null  // Default to null
        };

        exams.push(examData);

        // Display the new exam in the dashboard
        const examItem = document.createElement('li');
        const examDate = new Date(examData.timestamp).toLocaleString();
        examItem.innerHTML = `${examData.name} - ${questions.length} Questions <span class="exam-date">${examDate}</span>`;
        examItem.dataset.examId = examData.id;
        examItem.classList.add('exam-item');
        examList.appendChild(examItem);

        // Reset the form
        document.getElementById('exam-form').reset();
        questionsForm.innerHTML = '';
        submitExamBtn.classList.add('hidden');

        // Navigate back to dashboard
        examCreationSection.classList.add('hidden');
        dashboard.classList.remove('hidden');
    });

    // Handle clicking on an exam to view details
    examList.addEventListener('click', function(event) {
        if (event.target.classList.contains('exam-item')) {
            const examId = parseInt(event.target.dataset.examId);
            selectedExam = exams.find(exam => exam.id === examId);

            if (selectedExam) {
                examInfoName.textContent = selectedExam.name;
                questionsUl.innerHTML = ''; // Clear existing questions

                selectedExam.questions.forEach((question, index) => {
                    const questionItem = document.createElement('li');
                    questionItem.innerHTML = `
                        <strong>Question ${index + 1}:</strong> ${question.question}<br>
                        <strong>Options:</strong><br>
                        ${question.options.map((option, i) => `${i + 1}. ${option}`).join('<br>')}<br>
                        <strong>Correct Answer:</strong> ${question.options[question.answer]}
                    `;
                    questionsUl.appendChild(questionItem);
                });

                // Update status display
                const now = new Date();
                const scheduledDateTime = new Date(`${selectedExam.scheduledDate}T${selectedExam.scheduledTime}`);
                const status = now >= scheduledDateTime ? 'Active' : 'Inactive';
                examStatusBox.textContent = `Status: ${status}`;
                statusSelect.value = status.toLowerCase(); // Sync status with dropdown

                dashboard.classList.add('hidden');
                examDetailsSection.classList.remove('hidden');
            }
        }
    });

    // Handle scheduling the exam
    scheduleExamBtn.addEventListener('click', function() {
        examDetailsSection.classList.add('hidden');
        scheduleSection.classList.remove('hidden');
    });

    // Handle scheduling form submission
    document.getElementById('schedule-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const scheduleDate = document.getElementById('schedule-date').value;
        const scheduleTime = document.getElementById('schedule-time').value;

        if (!scheduleDate || !scheduleTime) {
            alert("Please fill out both date and time.");
            return;
        }

        // Update the selected exam with the schedule details
        if (selectedExam) {
            selectedExam.scheduledDate = scheduleDate;
            selectedExam.scheduledTime = scheduleTime;

            // Update status box
            const now = new Date();
            const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
            const status = now >= scheduledDateTime ? 'Active' : 'Inactive';
            examStatusBox.textContent = `Status: ${status}`;
        }

        alert('Exam has been scheduled successfully!');

        // Navigate back to dashboard
        scheduleSection.classList.add('hidden');
        dashboard.classList.remove('hidden');
    });

    // Handle updating exam status
    updateStatusBtn.addEventListener('click', function() {
        if (!selectedExam) return;

        const now = new Date();
        const scheduledDateTime = new Date(`${selectedExam.scheduledDate}T${selectedExam.scheduledTime}`);
        const newStatus = statusSelect.value;

        if (newStatus === 'active' && now < scheduledDateTime) {
            alert("Exam cannot be set to 'Active' before the scheduled time.");
            return;
        }

        // Update status box
        examStatusBox.textContent = `Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
    });
});
