// Get the full URL
const currentURL = window.location.href;

// Get all the parameters from the URL
const urlSearchParams = new URLSearchParams(window.location.search);
searchQuery = urlSearchParams.get('query');
const fixedSearchQuery = searchQuery;
pageType = urlSearchParams.get('type');
value = urlSearchParams.get('value');

// Set Quick Recipes Time = 30min
const quick = '30';

const searchRecipes = document.querySelector('.search-container');
const categoryHeading = document.querySelector('.recipes h1');
searchRecipes.style.display = 'none';
if (pageType === 'search') {
  // Show Search Input for pageType = 'search' parameter
  searchRecipes.style.display = 'flex';
  categoryHeading.innerText = 'Search Results';
} else if (pageType === 'time') {
  categoryHeading.innerHTML = 'Quick + Easy Recipes';
} else if (pageType === 'recommended') {
  categoryHeading.innerHTML = 'Recommended for You';
  // Hide filters
  document.getElementById('filters').style.display = 'none';
  const userSession = JSON.parse(localStorage.getItem('user'));
  if (!userSession) {
    // If user is not logged in display Please login message
    document.getElementById('categorypage_body').innerHTML = '';
    alert('Please Login first');
  }
} else {
  categoryHeading.innerText =
    value.length > 0
      ? formatRecipeName(value)
      : 'All ' + formatRecipeName(pageType) + 's';
}

searchQuery = searchQuery === null ? '' : searchQuery;
const limit = 24;
let currentPage = 1;
let request = '';

window.onload = function () {
  loadFiltersDOM();
  if (pageType === 'search' || pageType === 'all') {
    if (searchQuery === '') {
      request = generateDefaultRequest();
    }
  } else if (pageType === 'recommended') {
    const userSession = JSON.parse(localStorage.getItem('user'));
    if (userSession.userPreferences) {
      for (each in userSession.userPreferences) {
        userSession.userPreferences[each].forEach((preference) => {
          request += '&' + each + '=' + preference;
        });
      }
    }
  } else {
    request =
      value.length > 0
        ? `&${pageType}=${value}`
        : `&${pageType}=${filters[pageType].join(`&${pageType}=`)}`;
  }
  loadRecipes(searchQuery, request, currentPage);
};

const generateDefaultRequest = () => {
  let requestData = '';
  requestData += '&dishType=' + filters['dishType'].join('&dishType=');
  requestData += '&cuisineType=' + filters['cuisineType'].join('&cuisineType=');
  // requestData += '&diet='+filters['diet'].join('&diet=');
  //   requestData += '&health=' + filters['health'].join('&health=');
  requestData += '&mealType=' + filters['mealType'].join('&mealType=');
  return requestData;
};

// Load Filter By Js
const loadFiltersDOM = () => {
  const filterList = document.getElementById('filter_list');
  const showList_limit = 5;
  let innerHTML = '';
  for (const category in filters) {
    if (formatRecipeName2(category) !== pageType) {
      let eachFilterList = '';
      filters[category].forEach((option) => {
        // Create a each filter checkbox
        eachFilterList += `<li class="recipe-cat-list-item">
                    <label for="${option}"></label>
                        <input type="checkbox" name="${category}" id="${category}_${option}" data-value="${option}">${capitalizeAndReplaceHyphens(
          option
        )}
                </li>`;
      });
      let seeMore_list = '';
      // See More or See less Filters
      if (filters[category].length > showList_limit) {
        seeMore_list = `<li class="recipe-cat-list-item see_more display-block" data-category="${category}">
                    View More
                </li>`;
      }
      innerHTML += `
            <li class="list-item">
                <div class="filter-category">
                    <div class="filter-cat-head">
                        <i class="fa-solid fa-plus"></i>
                        <p class="display-inline">${formatRecipeName(
                          category
                        )}</p>
                    </div>
                    <div class="filter-cat-body">
                        <ul class="recipe-cat-list" data-category="${category}">
                            ${eachFilterList}
                            ${seeMore_list}
                        </ul>
                    </div>
                </div>
            </li>`;
    }
  }
  filterList.innerHTML = innerHTML;

  //Logic to See More or See less Filters
  const seeMore_link = document.getElementsByClassName('see_more');
  for (let i = 0; i < seeMore_link.length; i++) {
    seeMore_link[i].addEventListener('click', function (event) {
      const filter_ul = seeMore_link[i].closest('.recipe-cat-list');
      const list = filter_ul.querySelectorAll('li');
      if (seeMore_link[i].innerText === 'View More') {
        list.forEach((item, index) => {
          if (index >= 5 && index <= list.length) {
            item.style.display = 'block';
          }
        });
        seeMore_link[i].innerText = 'View Less';
      } else {
        list.forEach((item, index) => {
          if (index >= 5 && index <= list.length) {
            item.style.display = 'none';
          }
        });
        seeMore_link[i].innerText = 'View More';
      }
      const cursorX = event.clientX;
      const cursorY = event.clientY;

      // Calculate the scroll position to bring the target div to the cursor's position
      const targetX = seeMore_link[i].getBoundingClientRect().left;
      const targetY = seeMore_link[i].getBoundingClientRect().top;

      const scrollX = window.scrollX + targetX - cursorX;
      const scrollY = window.scrollY + targetY - cursorY;

      // Scroll to the calculated position
      window.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth',
      });
    });
  }

  // Toggle Filter Section
  //   const filter_toggle = document.getElementById('toggleHead');
  //   filter_toggle.addEventListener('click', function () {
  //     document.getElementById('toggleBody').classList.toggle('hidden');
  //   });

  // Toggle Each Filter Category
  const category_filter = document.querySelectorAll('.filter-category p');
  for (let i = 0; i < category_filter.length; i++) {
    category_filter[i].addEventListener('click', function () {
      const parent = category_filter[i].closest('.filter-category');
      const toggleSubMenu = parent.querySelector('.filter-cat-body');
      const icon = parent.querySelector('i');
      if (icon.classList.contains('fa-plus')) {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
      } else {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      }
      toggleSubMenu.classList.toggle('hide-sublist');
    });
  }

  // Detect when Filters are changes and create Query to fetch according to selected filters
  const recipeFilters = document.querySelectorAll(
    '.recipe-cat-list-item input'
  );
  for (let i = 0; i < recipeFilters.length; i++) {
    recipeFilters[i].addEventListener('change', function () {
      request = '';
      for (let i = 0; i < recipeFilters.length; i++) {
        if (recipeFilters[i].checked) {
          request += `&${formatRecipeName2(
            recipeFilters[i].getAttribute('name')
          )}=${recipeFilters[i].getAttribute('data-value')}`;
        }
      }
      if (pageType === 'search' || pageType === 'all') {
        if (searchQuery === '' && request === '') {
          request = generateDefaultRequest();
        }
      } else {
        const addRequest =
          value.length > 0
            ? `&${pageType}=${value}`
            : `&${pageType}=${filters[pageType].join(`&${pageType}=`)}`;
        request += addRequest;
      }
      currentPage = 1;
      loadRecipes(searchQuery, request, currentPage);
    });
  }

  const closeFilter = document.getElementById('closeFilter');
  const openFilter = document.getElementById('openFilter');
  closeFilter.addEventListener('click', filterToggle);
  openFilter.addEventListener('click', filterToggle);
};

const prevButton = document.getElementById('prev_page');
const nextButton = document.getElementById('next_page');
// fetch search results from API and show in a div id="search_recipes"
const loadRecipes = async (searchQuery, request, page) => {
  apiUrl = `https://api.edamam.com/search?&q=${searchQuery}&app_id=${edamamID}&app_key=${edamamKey}`;
  const recipeSection = document.getElementById('search_recipes');
  recipeSection.style.display = 'none';
  displayLoading();
  const startIndex = (page - 1) * limit;
  // fetch from URL
  const searchResults = await fetchReturnDataJson(
    apiUrl,
    request + `&from=${startIndex}&to=${startIndex + limit}`
  );
  let appenHtml = '';
  const user = JSON.parse(localStorage.getItem('user'));
  let savedRecipes = [];
  if (user) {
    if (user.savedRecipes) {
      savedRecipes = user.savedRecipes.map((recipe) => recipe.uri);
    }
  }
  for (let i = 0; i < searchResults.hits.length; i++) {
    let saved = false;
    if (savedRecipes.includes(searchResults.hits[i].recipe.uri)) {
      saved = true;
    }
    appenHtml += createRecipeCard(saved, searchResults.hits[i].recipe);
  }
  hideLoading();
  recipeSection.style.display = 'flex';
  recipeSection.innerHTML = appenHtml;
  checkHide(searchResults.hits.length);
};

// In Page Search
function searchHandleKeyPress(event) {
  if (event.key === 'Enter') {
    searchHandleSubmit();
  }
}
function searchHandleSubmit(event) {
  const searchMoreInput = document.getElementById('search_more_input').value;
  if (searchMoreInput.length > 0) {
    searchQuery = searchMoreInput;
  } else {
    alert('Serach Input Cannot be empty');
    return;
  }
  currentPage = 1;
  loadRecipes(searchQuery, request, currentPage);
}
//

// Prev and Next Pagination
const checkHide = (resultLen) => {
  nextButton.style.display = resultLen < limit ? 'none' : 'block';
  prevButton.style.display = currentPage === 1 ? 'none' : 'block';
};
prevButton.addEventListener('click', function () {
  if (currentPage > 0) {
    currentPage--;
    loadRecipes(searchQuery, request, currentPage);
  }
  nextButton.classList.remove('active');
  prevButton.classList.add('active');
  categoryHeading.scrollIntoView();
});
nextButton.addEventListener('click', function () {
  if (currentPage > 0) {
    currentPage++;
    loadRecipes(searchQuery, request, currentPage);
  }
  nextButton.classList.add('active');
  prevButton.classList.remove('active');
  categoryHeading.scrollIntoView();
});

// funtion to toggle filter for mobile screens
function filterToggle() {
  const aside = document.getElementById('filters');
  const body = document.body;

  aside.classList.toggle('show');
  body.classList.toggle('no-scroll');
}
