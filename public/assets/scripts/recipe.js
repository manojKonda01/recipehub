// Get recipe id parameter from the API request
const urlSearchParams = new URLSearchParams(window.location.search);
const recipeId = urlSearchParams.get('id');

const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?app_id=${edamamID}&app_key=${edamamKey}&type=public`

// On page load run this
window.onload = function () {
    loadRecipeDetails();
}

const userRatings = [
    { user: 'user1@example.com', rating: 4, review: 'Great recipe!' },
    { user: 'user2@example.com', rating: 5, review: 'Loved it!' },
    // Add more user ratings as needed
];
// Function to create a user rating element
function createUserRatingElement(userRating) {
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('user-rating');

    const userRatingStars = Array.from({ length: 5 }, (_, index) => {
        const star = document.createElement('span');
        star.innerHTML = '&#9733;';
        star.classList.add('star');
        if(index < userRating.rating){star.classList.toggle('active')}
        return star;
    });

    ratingContainer.appendChild(document.createTextNode(`${userRating.user}: `));
    userRatingStars.forEach(star => ratingContainer.appendChild(star));
    ratingContainer.appendChild(document.createTextNode(` - ${userRating.review}`));

    return ratingContainer;
}

// Load all the recipe details DOM
const loadRecipeDetails = async () => {
    // Fetch Recipe Data from the API
    const recipeDetails = await fetchReturnDataJson(url, '');
    const recipeDom = document.getElementById('recipe_section');

    const encodedData = utf8_to_b64(JSON.stringify(recipeDetails.recipe));
    let iconClass = 'far fa-heart', dataAttribute = false;

    let saved = false;
    const userSession = JSON.parse(localStorage.getItem('user'));
    if(userSession){
        if(userSession.savedRecipes){
            savedRecipes = userSession.savedRecipes.map(recipe=>recipe.uri)
        }
        if(savedRecipes.includes(recipeDetails.recipe.uri)){
            saved = true;
        }
        if (saved) {
            iconClass = 'fa fa-heart activeIcon';
            dataAttribute = true;
        }
    }
    // Create a DOM for Recipe Details    
    recipeDom.innerHTML = `
        <div class="recipe-head">
            <h1>${recipeDetails.recipe['label']}</h1>
            <div class="recipe-tags">
                <span>${recipeDetails.recipe['cuisineType']}</span><span> &gt </span>
                <span>${recipeDetails.recipe['dishType']}</span><span> &gt </span>
                <span>${recipeDetails.recipe['mealType']}</span>
            </div>
            <div class="rating-save">
                <div class="rating-container" id="ratingStars">
                    <span class="star" data-rating="1">&#9733;</span>
                    <span class="star" data-rating="2">&#9733;</span>
                    <span class="star" data-rating="3">&#9733;</span>
                    <span class="star" data-rating="4">&#9733;</span>
                    <span class="star" data-rating="5">&#9733;</span>
                    <span id="avgRating"></span>
                </div>
                <div class="save-container">
                    <span class="save_recipes" onclick="callSaveRecipe(this.getAttribute('id'))" id="${encodedData}" data-saved='${dataAttribute}'>
                        <i class="${iconClass}"></i>
                    </span>
                </div>
            </div>
            <figure id="recipe_fig">
                <img src="${recipeDetails.recipe['image']}" alt="${recipeDetails.recipe['label']}">
            </figure>
        </div>
        <div class="recipe-body">
            <div>Short details of Recipe(mealtype, caloreis, time taken)</div>
            <div>Steps to make Recipe</div>
            <div class="nutrition-facts-container">
                <p class="nutrition-facts-head">Nutrition Facts</p>
            </div>
        </div>
        <div class="recipe-foot">
            <div class="review-rating">Review</div>
            <div id="userRatings"></div>
        </div>
    `;
    const stars = document.querySelectorAll('#ratingStars .star');
    const avgRating = document.getElementById('avgRating');
    const rating = 4; //Avg Rating
    avgRating.innerHTML = rating.toFixed(1)
    stars.forEach(star => {
        const starRating = star.dataset.rating;
        star.classList.toggle('active', starRating <= rating);
    });

    // Render user ratings
    const userRatingsContainer = document.getElementById('userRatings');
    userRatings.forEach(userRating => {
        const userRatingElement = createUserRatingElement(userRating);
        userRatingsContainer.appendChild(userRatingElement);
    });
}