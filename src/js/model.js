import { API_URL, KEY, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

// `state` is an object that holds the current state of the application
export const state = {
  recipe: {}, // current recipe being displayed
  search: {
    // current search results and query
    query: ``, // search query
    page: 1, // current page of search results
    results: [], // array of search results
    resultsPerPage: RES_PER_PAGE, // number of results per page
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  // destructure recipe data from response
  const { recipe } = data.data;
  // update state with recipe data
  return (state.recipe = {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  });
};

// Loads and sets the current recipe by its id
export const loadRecipe = async function (id) {
  try {
    // fetch recipe data from API
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (error) {
    console.error(`${error} 💥`);
    throw error;
  }
};

// Loads search results for a given query and updates state
export const loadSearchResults = async function (query) {
  try {
    // update search query in state
    state.search.query = query;

    // fetch search results from API
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // map search results to an array of objects with relevant data
    state.search.results = data.data.recipes.map(rec => ({
      id: rec.id,
      title: rec.title,
      publisher: rec.publisher,
      image: rec.image_url,
      ...(rec.key && { key: rec.key }),
    }));

    // Reset page on a new submit search request
    state.search.page = 1;
  } catch (error) {
    console.error(`${error} 💥`);
    throw error;
  }
};

// Returns the current page of search results
export const getSearchResultsPage = function (page = state.search.page) {
  // update current page in state
  state.search.page = page;

  // calculate start and end indices of search results to display
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  // return a slice of the search results
  return state.search.results.slice(start, end);
};

// Updates the ingredient quantities for a new serving size
export const updateServings = function (newServings) {
  // update ingredient quantities to reflect new serving size
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  // update state with new serving size
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem(`bookmarks`, JSON.stringify(state.bookmarks));
};

// Add a bookmark to the state and update the bookmarked status of the current recipe, if necessary
export function addBookmark(recipe) {
  // Add bookmark to state
  state.bookmarks.push(recipe);

  // Update bookmarked status of current recipe
  updateBookmarkedStatus(recipe, true);
  persistBookmarks();
}

// Remove a bookmark from the state and update the bookmarked status of the current recipe, if necessary
export function deleteBookmark(id) {
  // Find the index of the bookmark to delete
  const index = state.bookmarks.findIndex(el => el.id === id);

  // Remove the bookmark from the state
  state.bookmarks.splice(index, 1);

  // Update bookmarked status of current recipe
  updateBookmarkedStatus(state.recipe, false);
  persistBookmarks();
}

// Update the bookmarked status of a recipe
function updateBookmarkedStatus(recipe, newStatus) {
  recipe.bookmarked = newStatus;
}

const init = function () {
  const storage = localStorage.getItem(`bookmarks`);
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith(`ingredient`) && entry[1] !== ``)
      .map(ing => {
        // const ingArr = ing[1].replaceAll(` `, ``).split(`,`);
        const ingArr = ing[1].split(`,`).map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            `Wrong ingredient format! Please use correct format!`
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};
