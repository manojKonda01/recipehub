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
// function to format name
function formatName(recipeName) {
    // Replace underscores with white spaces
    let formattedName = recipeName.replace(/-/g, ' ');

    // Capitalize the first letter of each word
    formattedName = formattedName.replace(/\b\w/g, function (match) {
        return match.toUpperCase();
    });

    return formattedName;
}
// funtion to create a recipe card
const createRecipeCard = (saved, jsonData) => {
    const encodedData = utf8_to_b64(JSON.stringify(jsonData));
    let iconClass = 'far fa-heart', dataAttribute = false;
    if (saved) {
        iconClass = 'fa fa-heart activeIcon';
        dataAttribute = true;
    }
    return `<figure class="margin-0 display-grid">
          <a href="recipe?id=${jsonData.uri.split('_')[1]}" id="${jsonData.uri.split('_')[1]}"><img src="${jsonData.image}" alt="${jsonData.label}"><a>
          <figcaption class="padding-x-1">
          <p class="recipe-image-category-name display-inline-flex">${jsonData.dishType ? jsonData.dishType[0] : ''}</p>
          <span class="save_recipes" onclick="callSaveRecipe(this.getAttribute('id'))" id="${encodedData}" data-saved='${dataAttribute}'>
            <i class="${iconClass} float-right"></i>
          </span>
          <hr class='recipe-name-image-seperator'>
          <p class='recipe-card-name'>${jsonData.label}</p>
          </figcaption>
      </figure>`;
};
function callSaveRecipe(encodedData) {
    // Decode Base64 and parse JSON
    const result = window.confirm('Are you sure?');
    if (result) {
        if (userSession) {
            const saveIconContainer = document.getElementById(encodedData)
            const saveIcon = saveIconContainer.querySelector('i');
            if (saveIconContainer.getAttribute('data-saved') === 'true') {
                // unsave Recipe and delete it from users list
                unSaveRecipe(userSession, JSON.parse(atob(encodedData)));
                saveIconContainer.setAttribute('data-saved', 'false');
                saveIconContainer.parentElement.parentElement.parentElement.remove();
            }
            saveIcon.classList.toggle('activeIcon')
        }
        else {
            window.location.href = '/login';
            return;
        }
    }
    return;
}

// unSave Recipe function
function unSaveRecipe(user, jsonData) {
    const email = user.email;
    if (jsonData) {
        fetch('/api/unSaveRecipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, jsonData }),
        })
            .then(response => response.json())
            .then(data => {
                if (user.savedRecipes) {
                    // Find the index of the recipe to remove from user session;
                    const index = user.savedRecipes.findIndex(obj => obj.uri === jsonData.uri);
                    // If the value exists, remove the object from the array
                    if (index !== -1) {
                        user.savedRecipes.splice(index, 1);
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }
                }
                console.log(data.message)
            })
            .catch(error => console.error('Error during Unsaving Recipe Data:', error));
    }
}
// User Session Details
const userSession = JSON.parse(sessionStorage.getItem('user'));
const parentElement = document.getElementById('changeContent');
const userName = document.getElementById('userName');
if (userSession) {
    userName.innerHTML = 'Hi, ' + userSession.name
    const navs = document.querySelectorAll('.profile-nav');
    let i = 0;
    const childElements = parentElement.children;
    for (let i = 0; i < navs.length; i++) {
        navs[i].addEventListener('click', function () {
            navs.forEach((nav) => { nav.classList.remove('selected') });
            navs[i].classList.add('selected');
            // Hide all divs
            for (let j = 0; j < childElements.length; j++) {
                childElements[j].classList.add('hide');
            }
            // Show Approrpiate form on click
            childElements[i].classList.remove('hide');
        });
    }

    const changeEmail = document.getElementById('changeEmail');
    changeEmail.placeholder = userSession.email;

    const changeName = document.getElementById('changeName');
    changeName.placeholder = userSession.name;
}
else {
    window.location.href = '/';
}

// Function to create survery DOM through JS
function createSurvery() {
    for (const each in preferences) {
        if (each !== 'mealType') {
            const eachSurvery = document.getElementById(each + '_labels');
            eachSurvery.classList.add('label-buttons-container');
            preferences[each].forEach((option) => {
                // Activate the userPreferences
                if (userSession) {
                    if (userSession.userPreferences) {
                        const button = document.createElement('button');
                        button.setAttribute('data-value', option);
                        button.textContent = formatName(option);
                        button.classList.add('suvery-button');
                        for (const eachPreference in userSession.userPreferences) {
                            if (userSession.userPreferences[eachPreference].includes(option)) {
                                button.classList.add('active');
                            }
                        }
                        eachSurvery.appendChild(button);
                    }
                }
            });
        }
    }
    // on click buttons change color
    const labelButtons = document.querySelectorAll('.suvery-button');
    labelButtons.forEach((button) => {
        button.addEventListener('click', function () {
            event.preventDefault();
            button.classList.toggle('active');
        })
    })
}
createSurvery();

// function to encoding string
function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// function showSavedRecipes() {
//     const email = userSession.email;
//     fetch('/api/get-user-details', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email }),
//     })
//         .then(response => response.json())
//         .then(data => {
//             sessionStorage.setItem('user', JSON.stringify(userSession));
//             const saved_recipes = document.getElementById('saved_recipes');
//             const savedRecipesJson = data.user.savedRecipes;
//             savedRecipesJson.forEach((each) => {
//                 saved_recipes.innerHTML += createRecipeCard(true, each);
//             });
//         })
//         .catch(error => console.error('Error during Saving Preferences:', error));
// }

// function to display all the saved recipe cards
function showSavedRecipes() {
    const savedRecipesJson = userSession.savedRecipes;
    const saved_recipes = document.getElementById('saved_recipes');
    savedRecipesJson.forEach((each) => {
        saved_recipes.innerHTML += createRecipeCard(true, each);
    });
}
showSavedRecipes();
// funtion to fill progress
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

// Function to show next and prev divs
let currentIndex = 0;
const divs = document.querySelectorAll('.labels');
function showDiv(direction) {
    event.preventDefault();
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

function updatePreferences() {
    event.preventDefault();
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
    const email = userSession.email;
    fetch('/api/updatePreferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, updatedPreferences }),
    })
        .then(response => response.json())
        .then(data => {
            userSession.userPreferences = updatedPreferences;
            sessionStorage.setItem('user', JSON.stringify(userSession));
            alert(data.message);
        })
        .catch(error => console.error('Error during Saving Preferences:', error));
}

// Email validation
function isValidEmail(email) {
    // Basic email format validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function savePersonalDetails() {
    event.preventDefault();
    const changeEmail = document.getElementById('changeEmail');
    const email = changeEmail.value
    const changeName = document.getElementById('changeName');
    const name = changeName.value;
    const oldEmail = userSession.email;
    if (email.length > 0 || name.length > 0) {
        // Update User info using API created in Node server
        if (email.length > 0 && !isValidEmail(email)) {
            alert('Invalid Email');
            return;
        }
        displayLoading();
        fetch('/api/updateuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldEmail, email, name }),
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                alert(data.message);
                if (data.status === 200) {
                    userSession.name = name;
                    userSession.email = email;
                    // Updating user session details
                    sessionStorage.setItem('user', JSON.stringify(userSession));
                    userName.innerHTML = 'Hi, ' + userSession.name;
                    // Updating placeholders
                    if (email.length > 0) {
                        changeEmail.placeholder = userSession.email;
                    }
                    if (name.length > 0) {
                        changeName.placeholder = userSession.name;
                    }
                    // reset form
                    document.getElementById('saveDetaild_form').reset();
                    document.getElementById('changePass_form').reset()
                }
            })
            .catch(error => console.error('Error during login:', error));

    }
    else {
        alert('Please Enter to update');
    }
}

const loader = document.querySelector('#spinner');
const changeContent = document.getElementById('changeContent');
// showing loading
function displayLoading() {
    loader.classList.add('display');
    changeContent.classList.add('hide');
}

// hiding loading
function hideLoading() {
    loader.classList.remove('display');
    changeContent.classList.remove('hide');
}


function changePassword() {
    event.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = userSession.email;
    if (oldPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0) {
        // Check Password Match

        if (newPassword.length < 8) {
            alert('New Password must be at least 8 characters long');
        }
        else {
            if (newPassword !== confirmPassword) {
                alert('Password and confirm password do not match.');
            }
            else {
                displayLoading();
                // Change Password using API created in Node server
                fetch('/api/changePassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, oldPassword, newPassword }),
                })
                    .then(response => response.json())
                    .then(data => {
                        hideLoading();
                        alert(data.message);
                        if (data.status === 200) {
                            document.getElementById('changePass_form').reset()
                        }
                    })
                    .catch(error => console.error('Error during login:', error));
            }
        }
    }
    else {
        alert('Password cannot be empty');
    }
}

