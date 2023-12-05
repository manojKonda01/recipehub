// Get recipe id parameter from the API request
const urlSearchParams = new URLSearchParams(window.location.search);
const recipeId = urlSearchParams.get('id');

const url = `https://api.edamam.com/api/recipes/v2/${recipeId}?app_id=${edamamID}&app_key=${edamamKey}&type=public`

// On page load run this
window.onload = function () {
    loadRecipeDetails();
}

const userRatings = async () => {
    if (recipeId) {
        const response = await fetch('/api/getReviews',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipeID: recipeId })
            })
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    }
}
// Function to create a user rating element
function createUserRatingElement(userRating) {
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('user-rating');

    // Create div for rating stars
    const starContainer = document.createElement('div');
    // set stars
    const userRatingStars = Array.from({ length: 5 }, (_, index) => {
        const star = document.createElement('span');
        star.innerHTML = '&#9733;';
        star.classList.add('star');
        if (index < userRating.rating) { star.classList.toggle('active') }
        return star;
    });
    // append to parent Element
    userRatingStars.forEach(star => starContainer.appendChild(star));
    ratingContainer.appendChild(starContainer);

    // create div for review text
    const textContainer = document.createElement('div');
    textContainer.classList.add('review-text');
    if(userRating.review){
        textContainer.innerHTML = userRating.review;
    }
    ratingContainer.appendChild(textContainer);

    // create div for Name text
    const nameContainer = document.createElement('div');
    nameContainer.classList.add('review-name');
    if(userRating.name){
        nameContainer.innerHTML = userRating.name;
    }
    ratingContainer.appendChild(nameContainer);

    return ratingContainer;
}

function randomText() {
    const text = ['Add', 'Take', 'Mix']
    const random = Math.floor(Math.random() * text.length);
    return text[random];
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
    if (userSession) {
        if (userSession.savedRecipes) {
            savedRecipes = userSession.savedRecipes.map(recipe => recipe.uri)
        }
        if (savedRecipes.includes(recipeDetails.recipe.uri)) {
            saved = true;
        }
        if (saved) {
            iconClass = 'fa fa-heart activeIcon';
            dataAttribute = true;
        }
    }
    let ingredientsTable = '';
    const ingredientsData = recipeDetails.recipe['ingredients'];
    for (let j = 0; j < ingredientsData.length; j++) {
        ingredientsTable +=
            `<tr>
            <td>
                <figure class="table-figure">
                    <img src=${ingredientsData[j]['image']} alt=${ingredientsData[j]['food']}>
                    <figcaption>${ingredientsData[j]['food']}</figcaption>
                </figure>
            </td>
            <td>
                ${ingredientsData[j]['foodCategory']}
            </td>
            <td>
                ${ingredientsData[j]['measure']}
            </td>
            <td>
                ${ingredientsData[j]['quantity']}
            </td>
        </tr>`
    }
    const directions = recipeDetails.recipe['ingredientLines'];
    let directionsDOM = '';
    for (let i = 0; i < directions.length; i++) {
        directionsDOM +=
            `<li><p>${randomText()} ${directions[i]}</p></li>`;
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
            <div class="recipe-details">
                <div class="short-details">
                    <div class="detail-item">
                        <div class="item-head">
                            Total Time:
                        </div>
                        <div class="item-value">
                            ${recipeDetails.recipe['totalTime']} min
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="item-head">
                            Total Weight:
                        </div>
                        <div class="item-value">
                            ${recipeDetails.recipe['totalWeight'].toFixed(0)} gms
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="item-head">
                            Calories:
                        </div>
                        <div class="item-value">
                            ${recipeDetails.recipe['calories'].toFixed(0)} kCal
                        </div>
                    </div>
                </div>
                <div class="nutrition-container">
                    <div id="nutrition_title">Nutrition Facts</div>
                    <div id="nutrition_facts">
                        <h2>Nutrition Facts</h2>
                        <p>about ${recipeDetails.recipe['yield']} servings</p>
                        <div class="fact calories">
                            <h3>Calories</h3>
                            <span>250</span>
                        </div>
                        <div class="fact">
                            <div>
                                <span class="label">Total Fat </span>
                                <span class="value quantity">${recipeDetails.recipe['totalNutrients']['FAT']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalNutrients']['FAT']['unit']}</span>
                            </div>
                            <div>
                                <span class="value">${recipeDetails.recipe['totalDaily']['FAT']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalDaily']['FAT']['unit']}</span>
                            </div>
                        </div>
                        <div class="fact">
                            <div>
                                <span class="label">Cholestrol</span>
                                <span class="value quantity">${recipeDetails.recipe['totalNutrients']['CHOLE']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalNutrients']['CHOLE']['unit']}</span>
                            </div>
                            <div>
                                <span class="value">${recipeDetails.recipe['totalDaily']['CHOLE']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalDaily']['CHOLE']['unit']}</span>
                            </div>
                        </div>
                        <div class="fact">
                            <div>
                                <span class="label">Total Carbohydrates</span>
                                <span class="value quantity">${recipeDetails.recipe['totalNutrients']['CHOCDF']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalNutrients']['CHOCDF']['unit']}</span>
                            </div>
                            <div>
                                <span class="value quantity">${recipeDetails.recipe['totalDaily']['CHOCDF']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalDaily']['CHOCDF']['unit']}</span>
                            </div>
                        </div>
                        <div class="fact">
                            <div>
                                <span class="label">Protein</span>
                                <span class="value quantity">${recipeDetails.recipe['totalNutrients']['PROCNT']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalNutrients']['PROCNT']['unit']}</span>
                            </div>
                            <div>
                                <span class="value quantity">${recipeDetails.recipe['totalDaily']['PROCNT']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalDaily']['PROCNT']['unit']}</span>
                            </div>
                        </div>
                        <div class="fact">
                            <div>
                                <span class="label">Sodium</span>
                                <span class="value quantity">${recipeDetails.recipe['totalNutrients']['NA']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalNutrients']['NA']['unit']}</span>
                            </div>
                            <div>
                                <span class="value quantity">${recipeDetails.recipe['totalDaily']['NA']['quantity'].toFixed(0)}</span>
                                <span class="value">${recipeDetails.recipe['totalDaily']['NA']['unit']}</span>
                            </div>
                        </div>
                        <div class='vitamin-facts'>
                            <div class="fact">
                                <div>
                                    <span class="vit-label">Calcium</span>
                                    <span class="value quantity">${recipeDetails.recipe['totalNutrients']['CA']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalNutrients']['CA']['unit']}</span>
                                </div>
                                <div>
                                    <span class="value quantity">${recipeDetails.recipe['totalDaily']['CA']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalDaily']['CA']['unit']}</span>
                                </div>
                            </div>
                            <div class="fact">
                                <div>
                                    <span class="vit-label">Iron</span>
                                    <span class="value quantity">${recipeDetails.recipe['totalNutrients']['FE']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalNutrients']['FE']['unit']}</span>
                                </div>
                                <div>
                                    <span class="value quantity">${recipeDetails.recipe['totalDaily']['FE']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalDaily']['FE']['unit']}</span>
                                </div>
                            </div>
                            <div class="fact">
                                <div>
                                    <span class="vit-label">Potassium</span>
                                    <span class="value quantity">${recipeDetails.recipe['totalNutrients']['K']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalNutrients']['K']['unit']}</span>
                                </div>
                                <div>
                                    <span class="value quantity">${recipeDetails.recipe['totalDaily']['K']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalDaily']['K']['unit']}</span>
                                </div>
                            </div>
                            <div class="fact">
                                <div>
                                    <span class="vit-label">Vitamin C</span>
                                    <span class="value quantity">${recipeDetails.recipe['totalNutrients']['VITC']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalNutrients']['VITC']['unit']}</span>
                                </div>
                                <div>
                                    <span class="value quantity">${recipeDetails.recipe['totalDaily']['VITC']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalDaily']['VITC']['unit']}</span>
                                </div>
                            </div>
                            <div class="fact">
                                <div>
                                    <span class="vit-label">Vitamin D</span>
                                    <span class="value quantity">${recipeDetails.recipe['totalNutrients']['VITD']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalNutrients']['VITD']['unit']}</span>
                                </div>
                                <div>
                                    <span class="value quantity">${recipeDetails.recipe['totalDaily']['VITD']['quantity'].toFixed(0)}</span>
                                    <span class="value">${recipeDetails.recipe['totalDaily']['VITD']['unit']}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ingredients">
                <h2>Ingredients :</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Food</th>
                            <th>Category</th>
                            <th>Measure</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ingredientsTable}
                    </tbody>
                </table>
            </div>
            <div class='directions-container'>
                <h2>Directions :</h2>
                <ul>
                    ${directionsDOM}
                </ul>
            </div>
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
    // Toggle Nutrition Facts
    document.getElementById('nutrition_title').addEventListener('click', function () {
        const slideContainer = document.getElementById('nutrition_facts');
        slideContainer.classList.toggle('closed');
    });
    loadReviews();
}

const write_review = document.getElementById('write_review');
const write_review_btn = document.getElementById('write_review_btn');
const hiddenInp = document.getElementById('hiddenInp');
write_review_btn.addEventListener('click', function () {
    if(!localStorage.getItem('user')){
        alert('Please Login to Write a review');
        window.location.href = '/login';
    }
    else{
        write_review.classList.toggle('hide');
    }
})

// Function to load reviews
async function loadReviews() {
    displayLoading();
    const reviewData = await userRatings();
    hideLoading();
    const userRatingsContainer = document.getElementById('userRatings');
    userRatingsContainer.innerHTML = '';
    const userRating_txt = document.getElementById('userRating_txt');
    if (reviewData.data) {
        // Create a More Reviews
        const moreReviewsBtn = document.createElement('button');
        moreReviewsBtn.innerHTML = 'See More Reviews'
        moreReviewsBtn.classList.add('slide', 'active', 'more-reviews-btn');
        userRating_txt.innerHTML = 'Click to Write a Review';
        const reviews = reviewData.data;
        reviews.slice(0,3).forEach(review => {
            const userRatingElement = createUserRatingElement(review);
            userRatingsContainer.appendChild(userRatingElement);
        })
        if(localStorage.getItem('user')){
            const userEmail = JSON.parse(localStorage.getItem('user')).email;
            const result = reviews.some(obj => obj.email === userEmail);
            if(result){
                const toggleReview = document.getElementById('toggleReview');
                toggleReview.classList.add('hide');
            }
        }
        // Display More Review button
        if(reviews.length > 3){
            userRatingsContainer.appendChild(moreReviewsBtn);
        }

        let reviewIndex = 3;
        moreReviewsBtn.addEventListener('click', function(){
            reviews.slice(reviewIndex,reviewIndex+9).forEach(review => {
                moreReviewsBtn.remove();
                const userRatingElement = createUserRatingElement(review);
                userRatingsContainer.appendChild(userRatingElement);
            })
            reviewIndex += 9;
            if(reviews.length > reviewIndex+9){
                userRatingsContainer.appendChild(moreReviewsBtn);
            }
        })
    }
    else {
        userRating_txt.innerHTML = 'Be First one to Review the Recipe';
    }
}


// Function to handlle star click 
function handleStarClick(event) {
    const selectedRating = event.target.dataset.rating;
    hiddenInp.value = selectedRating;
    // Update the active class based on the selected rating
    const stars = document.querySelectorAll('#writeRating .star');
    stars.forEach(star => {
        const rating = star.dataset.rating;
        star.classList.toggle('active', rating <= selectedRating);
    });
}
const stars = document.querySelectorAll('#writeRating .star');
stars.forEach(star => {
    star.addEventListener('click', handleStarClick);
});

// Function to write a review
function submitReview() {
    const commentValue = document.getElementById('comment').value;
    const ratingValue = hiddenInp.value;
    const userSession = JSON.parse(localStorage.getItem('user'));
    if(userSession){
        fetch('/api/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipeID: recipeId, userReview: {email: userSession.email, name: userSession.name, rating: ratingValue, review: commentValue} })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 200) {
                    loadReviews();
                }
            })
            .catch(error => console.error('Error:', error));
    }
    else{
        window.location.href = '/'
    }
}