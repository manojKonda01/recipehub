function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}
// Email validation
function isValidEmail(email) {
    // Basic email format validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function login() {
    event.preventDefault();
    const emailInput = document.getElementById('login_email');
    const email = emailInput.value;
    const passwordInput = document.getElementById('login_password');
    const password = passwordInput.value;
    const emailMsg = document.getElementById('invalid_login_email');
    const passwordMsg = document.getElementById('invalid_login_password');
    if (email.length === 0) {
        emailInput.style.borderColor = '#DC582A';
        emailMsg.innerHTML = 'Please Enter Email';
    }
    else {
        if (isValidEmail(email)) {
            emailInput.style.borderColor = '#84BD00';
            emailMsg.innerHTML = '';
            if (password.length > 0) {
                // Verify Login using API created in Node server
                fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 200) {
                            passwordInput.style.borderColor = '#ced4da';
                            emailInput.style.borderColor = '#ced4da';
                            sessionStorage.setItem('modal', 'login');
                            window.location.href = '/';
                        }
                        else if (data.status === 401) {
                            passwordInput.style.borderColor = '#DC582A';
                            passwordMsg.innerHTML = 'Incorrect Password';
                        }
                        else {
                            alert('Server Error');
                        }
                    })
                    .catch(error => console.error('Error during login:', error));
            }
        }
        else {
            emailInput.style.borderColor = '#DC582A';
            emailMsg.innerHTML = 'Please Enter Valid Email';
        }
    }
    if (password.length === 0) {
        passwordInput.style.borderColor = '#DC582A';
        passwordMsg.innerHTML = 'Please Enter Password';
    }
    else {
        passwordInput.style.borderColor = '#84BD00';
        passwordMsg.innerHTML = '';
    }
}

function signup() {
    event.preventDefault();

    // Get all the input values
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    const nameInput = document.getElementById('name');
    const name = nameInput.value;
    const confirmPassInput = document.getElementById('verify_password');
    const confirmPass = confirmPassInput.value;

    const invalid_field = document.getElementById('invalid_fields');
    const emailMsg = document.getElementById('invalid_email');
    const passwordMsg = document.getElementById('invalid_confirm_password');

    // Name, Email and password fields must not be empty
    if (name.length === 0) {
        nameInput.style.borderColor = '#DC582A';
    }
    if (email.length === 0) {
        emailInput.style.borderColor = '#DC582A';
    }
    else {
        // Validating email
        if (isValidEmail(email)) {
            emailInput.style.borderColor = '#84BD00';
            emailMsg.innerHTML = '';
        }
        else {
            emailInput.style.borderColor = '#DC582A';
            emailMsg.innerHTML = 'Please Enter Valid Email';
        }
    }
    if (password.length === 0) {
        passwordInput.style.borderColor = '#DC582A';
    }
    if (confirmPass.length === 0) {
        confirmPassInput.style.borderColor = '#DC582A';
    }
    // Check Password Match
    if (password.length < 8) {
        passwordMsg.innerHTML = 'Password must be at least 8 characters long';
    }
    else {
        if (password !== confirmPass) {
            passwordMsg.innerHTML = 'Password and confirm password do not match.';
        }
    }
    // * are required fields
    if (email.length === 0 || password.length === 0 || confirmPass.length === 0 || name.length === 0) {
        invalid_field.innerHTML = '* are Mandatory fields';
    }
    // If all are valid insert user details to DB
    if (email.length > 0 && password.length > 0 && confirmPass.length > 0 && name.length > 0 && isValidEmail(email) && (password === confirmPass)) {
        invalid_field.innerHTML = '';
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 200) {
                    if(data.message === 'User already exists'){
                        alert(data.message);
                        emailInput.style.borderColor = '#DC582A';
                    }
                    else{
                        sessionStorage.setItem('modal', 'signup');
                        window.location.href = '/';
                    }
                }
                else if (data.status === 401) {
                    alert('avvaledhu');
                }
                else {
                    alert('Server Error');
                }
            })
            .catch(error => console.error('Error during login:', error));
    }
}
