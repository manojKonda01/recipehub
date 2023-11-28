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
                            passwordInput.style.borderColor = '1px solid #ced4da';
                            emailInput.style.borderColor = '#ced4da';
                            window.location.href = '/';
                        }
                        else if (data.status === 401) {
                            passwordInput.style.borderColor = '#DC582A';
                            passwordMsg.innerHTML = 'Incorrect Password';
                        }
                        else {
                            alert('Server Error');
                        }
                        console.log(data);
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

}