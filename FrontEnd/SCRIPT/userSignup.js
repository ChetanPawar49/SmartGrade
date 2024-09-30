document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    // const submitButton = document.getElementById('submit');

    if (!form) {
        console.error('Form element not found.');
        return;
    }

    form.addEventListener('submit', async (event) => {
        console.log('Form submit event triggered'); // Log when the event is triggered
        event.preventDefault(); // Prevent the default form submission

        // Extract form values into separate variables

        const firstName = document.getElementById('fname').value;
        const lastName = document.getElementById('lname').value;
        const email = document.getElementById('mail').value;
        const phoneNumber = document.getElementById('mobileno').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('pass').value;
        const userType = document.getElementById('usertype').value;
        // const userType = submitButton.value; // Get the value of the submit button

        // Validate passwords match
        // if (password !== confirmPassword) {
        //     alert('Passwords do not match.');
        //     console.log('Password mismatch detected.');
        //     return;
        // }

        // Combine variables into a single object
        const formData = {
            fname: firstName,
            lname: lastName,
            email: email,
            mobileno: phoneNumber,
            username: username,
            pass: password,
            usertype: userType
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! You will Receive an email once your account is activated with 24 hours ');
                // Redirect or clear the form as needed
                window.top.location.href = '/';
            } else {
                alert('Registration failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting the form.');
        }
    });
});
