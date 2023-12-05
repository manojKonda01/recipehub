// Check Session 
const loginUser = document.getElementById('signin_image_caption');
const username = document.getElementById('username');
let session = false;

if(localStorage.getItem('user') !== 'undefined' || localStorage.getItem('user')){
  let userSession = JSON.parse(localStorage.getItem('user'));
  if (userSession) {
    session = true;
    getUserDetails(userSession.email);
    userSession = JSON.parse(localStorage.getItem('user'));
    // Display modals with diff msgs when login signup and logout success
    loginUser.innerHTML = 'My Account';
    username.innerHTML = 'Hi, ' + userSession.name;
    if (sessionStorage.getItem('modal') === 'login') {
      openModal('Logged in. Welcome Back ' + userSession.name + ' !');
    }
    else if (sessionStorage.getItem('modal') === 'signup') {
      openModal('Welcome ' + userSession.name + ' !');
    }
    sessionStorage.setItem('modal', '');
    sessionStorage.setItem('username', '');
  }
  else {
    loginUser.innerHTML = 'Login';
    if (sessionStorage.getItem('modal') === 'logout') {
      openModal('Logged Out Successfully');
    }
  }
}


// Fetch Api
const fetchReturnDataJson = async (url, request) => {
  // Check if data is already in sessionStorage
  const cachedData = sessionStorage.getItem(url + request);
  if (cachedData) {
    // If cached data is available, parse and return it
    console.log('data is from cache');
    return JSON.parse(cachedData);
  }
  else {
    console.log('api data');
    const response = await fetch(url + request);
    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem(url + request, JSON.stringify(data));
      return data;
    }
  }
};

// Check Session for user
async function sessionVerify() {
  // Check user login and get session data
  const sessionFetch = await fetch('/api/sessionVerify');
  if (sessionFetch.ok) {
    const sessionData = await sessionFetch.json();
    if (sessionData.status === 200) {
      session = true;
      loginUser.innerHTML = 'My Account';
      username.innerHTML = 'Hi, ' + sessionData.user.name;
      // store user data in local cache
      localStorage.setItem('user', JSON.stringify(sessionData.user));
    }
    else if (sessionData.status === 404) {
      loginUser.innerHTML = 'Login';
      sessionStorage.removeItem('user');
    }
  }
}

// function to get user details
function getUserDetails(email) {
  fetch('/api/get-user-details',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    .then(response => response.json())
      .then(data => {
        if(data.status === 200){
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch(error => console.error('Error:', error));
}

// Login Icon
const loginIcon = document.getElementById('loginIcon');

// On Click Login Icon
loginIcon.addEventListener('click', function () {
  // If session open Account settings else redirect login
  if (!session) {
    window.location.href = '/login';
  }
})
const myaccount = document.getElementById('loginIcon');
const showAccount = document.getElementById('account_drop_down');
myaccount.addEventListener('mouseenter', function () {
  if (session) {
    showAccount.style.display = 'block';
  }
});
myaccount.addEventListener('mouseleave', function () {
  if (session) {
    showAccount.style.display = 'none';
  }
});

// Edamam API ID and Key 
const edamamID = '6d7cac0d';
const edamamKey = 'b1976c96297a0b1dfd3715d8497f59a6';

const filters = {
  mealType: ['breakfast', 'lunch', 'dinner', 'snack', 'teatime'],
  dishType: [
    'alcohol cocktail',
    'biscuits and cookies',
    'bread',
    'cereals',
    'condiments and sauces',
    'desserts',
    'drinks',
    'egg',
    'ice cream and custard',
    'main course',
    'pancake',
    'pasta',
    'pastry',
    'pies and tarts',
    'pizza',
    'preps',
    'preserve',
    'salad',
    'sandwiches',
    'seafood',
    'side dish',
    'soup',
    'special occasion',
    'starter',
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
    '	middle eastern',
    'nordic',
    'south american',
    'south east asian',
    'world',
  ],
  health: [
    'alcohol-cocktail',
    'alcohol-free',
    'celery-free',
    'crustacean-free',
    'dairy-free',
    'DASH',
    'egg-free',
    'fish-free',
    'fodmap-free',
    'gluten-free',
    'immuno-supportive',
    'keto-friendly',
    'kidney-friendly',
    'kosher',
    'low-potassium',
    'low-sugar',
    'lupine-free',
    'Mediterranean',
    'mollusk-free',
    'mustard-free',
    'paleo',
    'peanut-free',
    'pork-free',
    'red-meat-free',
    'sesame-free',
    'shellfish-free',
    'soy-free',
    'sugar-conscious',
    'sulfite-free',
    'vegan',
    'vegetarian',
    'wheat-free',
  ],
};

var searchQuery = '';
let apiUrl = `https://api.edamam.com/search?&q=${searchQuery}&app_id=${edamamID}&app_key=${edamamKey}`;

// Recipe Card
function utf8_to_b64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
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

// Function to call saveRecipe with Base64-encoded JSON data
function callSaveRecipe(encodedData) {
  const user = JSON.parse(localStorage.getItem('user'));
  // Decode Base64 and parse JSON
  if (user) {
    const saveIconContainer = document.getElementById(encodedData)
    const saveIcon = saveIconContainer.querySelector('i');
    if (saveIconContainer.getAttribute('data-saved') === 'false') {
      // Save Recipe
      saveRecipe(user, JSON.parse(atob(encodedData)));
      saveIconContainer.setAttribute('data-saved', 'true')
      saveIcon.classList.remove('far');
      saveIcon.classList.add('fa');
    }
    else if (saveIconContainer.getAttribute('data-saved') === 'true') {
      // unsave Recipe
      unSaveRecipe(user, JSON.parse(atob(encodedData)));
      saveIconContainer.setAttribute('data-saved', 'false')
      saveIcon.classList.add('far');
      saveIcon.classList.remove('fa');
    }
    saveIcon.classList.toggle('activeIcon')
  }
  else {
    window.location.href = '/login';
    return;
  }
}

// Save Recipe function
function saveRecipe(user, jsonData) {
  const email = user.email;
  if (jsonData) {
    fetch('/api/saveRecipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, jsonData }),
    })
      .then(response => response.json())
      .then(data => {
        if (user.savedRecipes) {
          // Check if the recipe exists within the user session
          const exists = user.savedRecipes.some(obj => obj.uri === jsonData.uri);
          // If the value doesn't exist, add a new object to the array
          if (!exists) {
            user.savedRecipes.push(jsonData);
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        console.log(data.message)
      })
      .catch(error => console.error('Error during Saving Recipe Data:', error));
  }
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
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        console.log(data.message)
      })
      .catch(error => console.error('Error during Unsaving Recipe Data:', error));
  }
}
// Click on list category
const mealList = document.querySelectorAll('.list-category, .submenu-item, .category-click');
for (let i = 0; i < mealList.length; i++) {
  mealList[i].addEventListener('click', function (event) {
    const type = mealList[i].getAttribute('data-category');
    const value = mealList[i].getAttribute('data-value');
    window.location.href = `/category?type=${type}&value=${value}`;
  });
}

const loader = document.querySelector('#spinner');
// showing loading
function displayLoading() {
  loader.classList.add('display');
  // to stop loading after some time
  // setTimeout(() => {
  //   loader.classList.remove('display');
  // }, 5000);
}

// hiding loading
function hideLoading() {
  loader.classList.remove('display');
}

function formatRecipeName(recipeName) {
  // Replace underscores with white spaces
  let formattedName = recipeName.replace(/_/g, ' ');

  // Capitalize the first letter of each word
  formattedName = formattedName.replace(/\b\w/g, function (match) {
    return match.toUpperCase();
  });

  return formattedName;
}

function formatRecipeName2(recipeName) {
  // Replace underscores with white spaces
  let formattedName = recipeName.replace(/_/g, ' ');

  // Split the string into words
  const words = formattedName.split(' ');

  // Check if there are at least two words
  if (words.length >= 2) {
    // Capitalize the first letter of the second word
    words[1] = words[1].charAt(0).toUpperCase() + words[1].slice(1);
  }

  // Rejoin the words into a single string
  formattedName = words.join(' ');

  return formattedName.replace(' ', '');
}

function capitalizeAndReplaceHyphens(inputString) {
  // Use a regular expression to match word boundaries and hyphens
  const regex = /(\b\w|-\w)/g;

  // Replace hyphens with spaces and capitalize the first letter of each word
  return inputString.replace(regex, function (match) {
    if (match.charAt(0) === '-') {
      // Replace hyphen with space
      return ' ' + match.charAt(1).toUpperCase();
    } else {
      // Capitalize the first letter (excluding hyphens)
      return match.charAt(0).toUpperCase() + match.slice(1);
    }
  });
}

// Function to randomly select 5 subarrays from the array
function getRandomDishTypeSubarrays(array, count) {
  if (count >= array.length) {
    // If count is greater than or equal to the array length, return the entire array
    return [array];
  }
  const subarrays = [];
  const shuffledArray = array.slice();
  while (subarrays.length < count) {
    const randomIndex = Math.floor(Math.random() * shuffledArray.length);
    subarrays.push(shuffledArray.splice(randomIndex, 1));
  }
  return subarrays;
}

function logout() {
  fetch('/api/logout').then(response => response.json())
    .then(data => {
      if (data.status === 200) {
        localStorage.removeItem('user');
        sessionStorage.setItem('modal', 'logout');
        sessionStorage.clear();
        window.location.href = '/';
      }
      else {
        alert('LogOut Failed');
      }
    })
}

// Function to open the modal with a specific message
function openModal(message) {
  const modal = document.getElementById('alertModal');
  const alertMessage = document.getElementById('alertMessage');

  // Set the alert message
  alertMessage.textContent = message;

  // Display the modal
  modal.style.display = 'block';

  // Automatically close the modal after 5 seconds (5000 milliseconds)
  setTimeout(() => {
    closeModal();
  }, 5000);
}

// function to close modal
function closeModal() {
  const modal = document.getElementById('alertModal');
  modal.style.display = 'none';
}

const profile = document.getElementById('profile');
profile.addEventListener('click', function () {
  window.location.href = '/profile';
});