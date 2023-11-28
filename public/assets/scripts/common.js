// Check Session 
const loginUser = document.getElementById('signin_image_caption');
const username = document.getElementById('username');
let session = false;
fetch('/api/sessionVerify', {
  method: 'GET'
}).then(response => response.json())
  .then(data => {
    if (data.status === 200) {
      session = true;
      loginUser.innerHTML = 'My Account';
      username.innerHTML = 'Hi, '+data.user.name;
    }
    else if (data.status === 404) {
      loginUser.innerHTML = 'Login';
    }
  })

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
// const edamamID = 'a95235c2';
const edamamID = 'a29ca2af';

// const edamamKey = '564076ca84419d8fb46806893bfcf5d4';
const edamamKey = 'c6337b9eed35a5669b86dd5a6c188cc2';

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
    'No-oil-added',
    'paleo',
    'peanut-free',
    'pecatarian',
    'pork-free',
    'red-meat-free',
    'sesame-free',
    'shellfish-free',
    'soy-free',
    'sugar-conscious',
    'sulfite-free',
    'tree-but-free',
    'vegan',
    'vegetarian',
    'wheat-free',
  ],
};

var searchQuery = '';
let apiUrl = `https://api.edamam.com/search?&q=${searchQuery}&app_id=${edamamID}&app_key=${edamamKey}`;

// Recipe Card
const createRecipeCard = (jsonData) => {
  return `<figure class="margin-0 display-grid">
        <a href="recipe?id=${jsonData.uri.split('_')[1]}" id="${jsonData.uri.split('_')[1]}"><img src="${jsonData.image}" alt="${jsonData.label}"><a>
        <figcaption class="padding-x-1">
        <p class="recipe-image-category-name display-inline-flex">${jsonData.dishType ? jsonData.dishType[0] : ''}</p>
        <i class="far fa-heart float-right"></i>
        <hr class='recipe-name-image-seperator'>
        <p class='recipe-card-name'>${jsonData.label}</p>
        </figcaption>
    </figure>`;
};

// Fetch Api
const fetchReturnDataJson = async (url, request) => {
  let responseData = await fetch(url + request);
  return await responseData.json();
};

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
  setTimeout(() => {
    loader.classList.remove('display');
  }, 5000);
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

function logout(){
  fetch('/api/logout').then(response=>response.json())
  .then(data=>{
      if(data.status === 200){
          alert(data.message)
          window.location.href = '/';
      }
      else{
          alert('LogOut Failed');
      }
  })
}