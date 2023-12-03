// Function to Query and get Recipes
function handleKeyPress(event) {
    if (event.key === "Enter") {
        handleSubmit(event);
    }
}

// Function to Query and get Recipes
function handleSubmit(event) {
    const searchInput = document.getElementById("search_recipes").value;
    // Redirect to the results page with the search input as a query parameter
    window.location.href = `/category?type=search&query=${searchInput}`;
    event.preventDefault();
}


window.onload = function () {
    // load_popular_recipes_section();
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
    const maxTime = 30;
    const requestData = `&time=0-${maxTime}`;
    // fetchReturnDataJson() is in common.js file
    let jsonData = await fetchReturnDataJson(`https://api.edamam.com/api/recipes/v2?type=public&q=&app_id=${edamamID}&app_key=${edamamKey}&random=true`, requestData);;
    const quickRecipe = document.getElementById('quick_easy_recipes');
    let appenHtml = '';
    const user = JSON.parse(localStorage.getItem('user'));
    let savedRecipes = []
    if (user) {
        if(user.savedRecipes){
            savedRecipes = user.savedRecipes.map(recipe=>recipe.uri)
        }
    }
    for (let i = 0; i < 4; i++) {
        let saved = false;
        if (savedRecipes.includes(jsonData.hits[i].recipe.uri)) {
            saved = true;
        }
        appenHtml += createRecipeCard(saved, jsonData.hits[i].recipe);
    }
    quickRecipe.innerHTML = appenHtml;
}

// Load Recommended Recipes DOM
const load_recommended_recipes = async () => {
    document.getElementById('recommended').style.display = 'none';
    const recommndedRecipe_section = document.getElementById('recommended_recipes');
    // Check User Session
    const userSession = JSON.parse(localStorage.getItem('user'));
    if (userSession) {
        document.getElementById('recommended').style.display = 'block';
        // Create request for recommeneded recipes for a user.
        document.getElementById('recommended_section_text').innerHTML = 'Recommended for you';
        let requestUrl = '';
        if (userSession.userPreferences) {
            for (each in userSession.userPreferences) {
                userSession.userPreferences[each].forEach((preference) => {
                    requestUrl += '&' + each + '=' + preference;
                });
            }
        }
        const recommendedRecipeData = await fetchReturnDataJson(`https://api.edamam.com/api/recipes/v2?type=public&q=&app_id=${edamamID}&app_key=${edamamKey}&random=true`, requestUrl);
        let appenHtml = '';
        const user = JSON.parse(localStorage.getItem('user'));
        let savedRecipes = []
        if (user) {
            if(user.savedRecipes){
                savedRecipes = user.savedRecipes.map(recipe=>recipe.uri);
            }
        }
        for (let i = 0; i < 8; i++) {
            let saved = false;
            if (savedRecipes.includes(recommendedRecipeData.hits[i].recipe.uri)) {
                saved = true;
            }
            appenHtml += createRecipeCard(saved, recommendedRecipeData.hits[i].recipe);
        }
        document.getElementById('recommended_section_text').setAttribute('data-category', 'recommended');
        document.getElementById('recommended_section_text').setAttribute('data-value', 'na');
        recommndedRecipe_section.innerHTML = appenHtml;
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
