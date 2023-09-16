document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phoneNumber');
    const passwordField = document.getElementById('password');
    const rePasswordField = document.getElementById('rePassword');
    const submitButton = document.getElementById('submitButton');

    emailField.addEventListener('input', validateEmail);
    phoneField.addEventListener('input', validatePhoneNumber);
    passwordField.addEventListener('input', validatePassword);
    rePasswordField.addEventListener('input', validateRePassword);

    // form.addEventListener('submit', (event) => {
    //     console.log('form submit event triggered');
    //     if (!validateForm()) {
    //         event.preventDefault();
    //     }
    // });

    form.addEventListener('submit', async (event) => {
        if (!validateForm()) {
            event.preventDefault();
        }
    });

    function validateEmail() {
        const emailField = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        
        const email = emailField.value.trim();
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        
        if (!emailPattern.test(email)) {
            emailError.textContent = 'Invalid email address';
            emailField.classList.add('is-invalid');
        } else {
            emailError.textContent = '';
            emailField.classList.remove('is-invalid');
        }
        
        validateForm();
    }
    

    function validatePhoneNumber() {
        const phoneField = document.getElementById('phoneNumber');
        const phoneError = document.getElementById('phoneError');
        
        const phoneNumber = phoneField.value.trim();
        const phonePattern = /^[0-9]{10}$/;
        
        if (!phonePattern.test(phoneNumber)) {
            phoneError.textContent = 'Invalid phone number';
            phoneField.classList.add('is-invalid');
        } else {
            phoneError.textContent = '';
            phoneField.classList.remove('is-invalid');
        }
        
        validateForm();
    }

    function validatePassword() {
        const passwordField = document.getElementById('password');
        const passwordError = document.getElementById('passwordError');
        
        const password = passwordField.value;
        
        if (password.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters';
            passwordField.classList.add('is-invalid');
        } else {
            passwordError.textContent = '';
            passwordField.classList.remove('is-invalid');
        }
        
        validateForm();
    }
    

    function validateRePassword() {
        const passwordField = document.getElementById('password');
        const rePasswordField = document.getElementById('rePassword');
        const rePasswordError = document.getElementById('rePasswordError');
        
        const password = passwordField.value;
        const rePassword = rePasswordField.value;
        
        if (rePassword !== password) {
            rePasswordError.textContent = 'Passwords do not match';
            rePasswordField.classList.add('is-invalid');
        } else {
            rePasswordError.textContent = '';
            rePasswordField.classList.remove('is-invalid');
        }
        
        validateForm();
    }

    // function validateForm() {
    //     const submitButton = document.getElementById('submitButton');
    //     const inputs = document.querySelectorAll('.form-control');
    //     let isValid = true;
    
    //     inputs.forEach(input => {
    //         console.log(input.classList.contains('is-invalid'));
        
    //         if (input.classList.contains('is-invalid') || input.value.trim() === '') {
    //             isValid = false;
    //             return false
    //         }
    //     });
    
    //     submitButton.disabled = !isValid;
    // }

    function validateForm() {
        const inputs = [emailField, phoneField, passwordField, rePasswordField];
        let isValid = true;

        inputs.forEach(input => {
            if (input.classList.contains('is-invalid') || input.value.trim() === '') {
                isValid = false;
            }
        });

        submitButton.disabled = !isValid;
        return isValid;
    }

    // const emailField = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    // const submitButton = document.getElementById('submitButton');

    // emailField.addEventListener('blur', async () => {
    //     const email = emailField.value.trim();
    //     if (email === '') {
    //         return;
    //     }

    //     try {
    //         const response = await fetch(`/check-email?email=${email}`);
    //         const data = await response.json();

    //         if (data.exists) {
    //             emailError.textContent = 'Email already exists';
    //             emailField.classList.add('is-invalid');
    //             // submitButton.disabled = true;
    //         } else {
    //             emailError.textContent = '';
    //             emailField.classList.remove('is-invalid');
    //             // submitButton.disabled = false;
    //         }
    //     } catch (error) {
    //         console.error('Error checking email:', error);
    //     }

    //     validateForm();
    // });

    emailField.addEventListener('blur', async () => {
        const email = emailField.value.trim();
        if (email === '') {
            return;
        }

        try {
            const response = await fetch(`/check-email?email=${email}`);
            const data = await response.json();

            if (data.exists) {
                emailError.textContent = 'Email already exists';
                emailField.classList.add('is-invalid');
            } else {
                emailError.textContent = '';
                emailField.classList.remove('is-invalid');
            }
        } catch (error) {
            console.error('Error checking email:', error);
        }

        validateForm();
    });
});


// document.addEventListener('DOMContentLoaded', () => {
    
// });

