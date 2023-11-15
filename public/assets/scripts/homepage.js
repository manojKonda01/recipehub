// Function to Query and get Recipes
function handleKeyPress(event) {
    if (event.key === "Enter") {
        handleSubmit(event);
    }
}

// Function to Query and get Recipes
function handleSubmit(event){
    const searchInput = document.getElementById("search_recipes").value;
    // Redirect to the results page with the search input as a query parameter
    window.location.href = `/category?type=search&query=${searchInput}`;
    event.preventDefault();
}


window.onload = function () {
    load_popular_recipes_section();
    load_quickRecipes_DOM();
    load_recommended_recipes();
}


function load_popular_recipes_section() {
    const popular_recipes_section = document.getElementById('recipe_cards');
    fetch('assets/scripts/popular_recipes.json')
        .then(response => response.json())
        .then(data => {
            let appenHtml = '';
            for (let i = 1; i < 5; i++) {
                // createRecipeCard() is in common.js file
                appenHtml += createRecipeCard(data[i]);
            }
            popular_recipes_section.innerHTML = appenHtml;
        })
        .catch(error => console.log(error));
}


// Load Quick Recipe DOM
const load_quickRecipes_DOM = async () => {
    let jsonData = await quickRecipesData(0, 4);
    const quickRecipe = document.getElementById('quick_easy_recipes');
    let appenHtml = '';
    for (let i = 0; i < jsonData.hits.length; i++) {
        appenHtml += createRecipeCard(jsonData.hits[i].recipe);
    }
    quickRecipe.innerHTML = appenHtml;
}

// Load Recommended Recipes DOM
const load_recommended_recipes = async () => {
    const recommndedRecipe_section = document.getElementById('recommended_recipes');
    const login = false;
    // If no login show Random Recipes
    if (!login) {
        document.getElementById('recommended_section_text').innerHTML = 'Recommended Recipes';
        const randomDishTypes = getRandomDishTypeSubarrays(filters['dishType'], 8);
        const dishTypeQuery = randomDishTypes.map(type => `&dishType=${type}`).join('+');
        const randomRecipeData = await fetchReturnDataJson(apiUrl, `&from=${0}&to=${4}` + dishTypeQuery);
        console.log(randomRecipeData);
        let appenHtml = '';
        for (let i = 0; i < randomRecipeData.hits.length; i++) {
            appenHtml += createRecipeCard(randomRecipeData.hits[i].recipe);
        }
        recommndedRecipe_section.innerHTML = appenHtml;
    }
    // else show Recommended Recipes
    else {
        document.getElementById('recommended_section_text').innerHTML = 'Recommended Recipes';
    }

}

const backgroundVideo = document.getElementById('bg_video');
const backgroundPoster = document.getElementById('bg_poster');
const pauseVideo = document.getElementById('pause_button');
const playVideo = document.getElementById('play_button');
const poster = backgroundVideo.getAttribute('poster');
pauseVideo.addEventListener('click', function () {
    backgroundVideo.pause();
    backgroundVideo.style.display = 'none';
    backgroundPoster.style.display = 'block';
    this.style.display = 'none';
    playVideo.style.display = 'block';
});
playVideo.addEventListener('click', function () {
    backgroundVideo.play();
    backgroundVideo.style.display = 'block';
    backgroundPoster.style.display = 'none';
    this.style.display = 'none';
    pauseVideo.style.display = 'block';
});

// Fetch Quick Recipes Data from API
const quickRecipesData = async (from, to) => {
    const maxTime = 30;
    const sort = 'alphabet';
    const randomDishTypes = getRandomDishTypeSubarrays(filters['dishType'], 12);
    const dishTypeQuery = randomDishTypes.map(type => `&dishType=${type}`).join('+');
    const requestData = `&time=0-${maxTime}&sort=${sort}&from=${from}&to=${to}${dishTypeQuery}`;
    // fetchReturnDataJson() is in common.js file
    return fetchReturnDataJson(apiUrl, requestData);
}

