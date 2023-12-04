const preferences = {
    dishType: [
        'biscuits and cookies',
        'bread',
        'cereals',
        'desserts',
        'drinks',
        'egg',
        'ice cream and custard',
        'pancake',
        'pasta',
        'pizza',
        'salad',
        'sandwiches',
        'seafood',
        'side dish',
        'soup',
        'sweets',
    ],
    diet: [
        'balanced',
        'high-fiber',
        'high-protein',
        'low-carb',
        'low-fat',
        'low-sodium',
    ],
    cuisineType: [
        'american',
        'asian',
        'british',
        'caribbean',
        'central europe',
        'chinese',
        'eastern europe',
        'french',
        'greek',
        'indian',
        'italian',
        'japanese',
        'korean',
        'kosher',
        'mediterranean',
        'mexican',
        'middle eastern',
        'nordic',
        'south american',
        'south east asian',
        'world',
    ],
    health: [
        'dairy-free',
        'egg-free',
        'fish-free',
        'gluten-free',
        'immuno-supportive',
        'keto-friendly',
        'kidney-friendly',
        'low-sugar',
        'mustard-free',
        'No-oil-added',
        'peanut-free',
        'pork-free',
        'red-meat-free',
        'sesame-free',
        'soy-free',
        'sugar-conscious',
        'vegan',
        'vegetarian',
        'wheat-free',
    ],
};
function formatName(recipeName) {
    // Replace underscores with white spaces
    let formattedName = recipeName.replace(/-/g, ' ');

    // Capitalize the first letter of each word
    formattedName = formattedName.replace(/\b\w/g, function (match) {
        return match.toUpperCase();
    });

    return formattedName;
}
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

const loader = document.querySelector('#spinner');
const loginContent = document.getElementById('login_content');
// showing loading
function displayLoading() {
    loginContent.style.display = 'none';
    loader.classList.add('display');
    // to stop loading after some time
    // setTimeout(() => {
    //     loader.classList.remove('display');
    // }, 5000);
}

// hiding loading
function hideLoading() {
    loginContent.style.display = 'block';
    loader.classList.remove('display');
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
                displayLoading();
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
                        hideLoading();
                        if (data.status === 200) {
                            passwordInput.style.borderColor = '#ced4da';
                            emailInput.style.borderColor = '#ced4da';
                            sessionStorage.setItem('modal', 'login');
                            sessionStorage.setItem('user', JSON.stringify(data.user));
                            window.location.href = '/';
                        }
                        else if (data.status === 401) {
                            if (data.message === 'Email Not Found') {
                                emailInput.style.borderColor = '#DC582A';
                                emailMsg.innerHTML = data.message;
                            }
                            else if (data.message === 'Incorrect Password') {
                                passwordInput.style.borderColor = '#DC582A';
                                passwordMsg.innerHTML = data.message;
                            }
                            else {
                                passwordMsg.innerHTML = data.message;
                            }
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
        displayLoading();
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.status === 200) {
                    if (data.message === 'User already exists') {
                        alert(data.message);
                        emailInput.style.borderColor = '#DC582A';
                    }
                    else {
                        sessionStorage.setItem('modal', 'signup');
                        openPreferncesModal();
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
// Function to create survery DOM through JS
function createSurvery() {
    for (const each in preferences) {
        if (each !== 'mealType') {
            const eachSurvery = document.getElementById(each + '_labels');
            eachSurvery.classList.add('label-buttons-container');
            preferences[each].forEach((option) => {
                const button = document.createElement('button');
                button.setAttribute('data-value', option);
                button.textContent = formatName(option);
                button.classList.add('suvery-button');
                eachSurvery.appendChild(button);
            });
        }
    }

    // on click buttons change color
    const labelButtons = document.querySelectorAll('.suvery-button');
    labelButtons.forEach((button) => {
        button.addEventListener('click', function () {
            button.classList.toggle('active');
        })
    })
}
// Function to open the modal
function openPreferncesModal() {
    createSurvery();
    const modal = document.getElementById('preferences');
    const body = document.body;
    body.classList.add('overflow-hidden');
    // Display the modal
    modal.style.display = 'block';
}

// function to close modal
function closePreferncesModal() {
    const modal = document.getElementById('preferences');
    modal.style.display = 'none';
}
// Function to show next and prev divs
let currentIndex = 0;
const divs = document.querySelectorAll('.labels');

function progressFill(index) {
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach((progress, i) => {
        if (i < index) {
            progress.classList.add('active')
        }
        else {
            progress.classList.remove('active');
        }
    });
}
function updatePreferences() {
    // Store all the selected preferences
    const activePreferences = document.querySelectorAll('.suvery-button.active');
    const updatedPreferences = {
        dishType: [],
        diet: [],
        cuisineType: [],
        health: []
    };
    activePreferences.forEach((preference) => {
        const key = preference.parentNode.getAttribute('id').split('_')[0];
        updatedPreferences[key].push(preference.getAttribute('data-value'));
    });
    const email = document.getElementById('email').value;
    fetch('/api/updatePreferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, updatedPreferences }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message)
            if (data.status === 200) {
                window.location.href = '/';
            }
        })
        .catch(error => console.error('Error during Saving Preferences:', error));
}
function showDiv(direction) {
    divs[currentIndex].classList.remove('show');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % divs.length;
        next.classList.add('active');
        prev.classList.remove('active');
        // Change Next to Submit after last preferences
        if (currentIndex === 3) {
            next.innerHTML = 'Submit';
            next.setAttribute('onclick', 'updatePreferences()');
        }
    } else if (direction === 'prev' && currentIndex !== 0) {
        currentIndex = (currentIndex - 1 + divs.length) % divs.length;
        next.classList.remove('active');
        prev.classList.add('active');
        if (currentIndex < 3) {
            // Set Next if we move back when Next is change to Submit
            next.innerHTML = 'Next';
            next.setAttribute('onclick', "showDiv('next')");
        }
    }
    divs[currentIndex].classList.add('show');
    progressFill(currentIndex + 1);
}
// Function to skip survery
function skip() {
    const result = window.confirm('Are you sure?');
    if (result) {
        window.location.href = '/';
    }
    return;
}
