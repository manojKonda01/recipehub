// Get recipe id parameter from the API request
const urlSearchParams = new URLSearchParams(window.location.search);
const recipeId = urlSearchParams.get('id');

const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?app_id=${edamamID}&app_key=${edamamKey}&type=public`

// On page load run this
window.onload = function () {
    loadRecipeDetails();
}

// Load all the recipe details DOM
const loadRecipeDetails =  async() => {
    // Fetch Recipe Data from the API
    const recipeDetails = await fetchReturnDataJson(url, '');
    const recipeDom = document.getElementById('recipe_section');
    // Create a DOM for Recipe Details
    recipeDom.innerHTML = `
        <div class="recipe-head">
            <h1>${recipeDetails.recipe['label']}</h1>
            <p>Rating</p>
            <p>Save</p>
            <figure>
                <img src="${recipeDetails.recipe['image']}" alt="${recipeDetails.recipe['label']}">
            </figure>
        </div>
    `;
}

