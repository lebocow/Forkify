import { API_URL, RES_PER_PAGE } from './config';
import { getJSON } from './helpers';

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

// Loads and sets the current recipe by its id
export const loadRecipe = async function (id) {
  try {
    // fetch recipe data from API
    const data = await getJSON(`${API_URL}${id}`);

    // destructure recipe data from response
    const { recipe } = data.data;

    // update state with recipe data
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };

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
    const data = await getJSON(`${API_URL}?search=${query}`);

    // map search results to an array of objects with relevant data
    state.search.results = data.data.recipes.map(rec => ({
      id: rec.id,
      title: rec.title,
      publisher: rec.publisher,
      image: rec.image_url,
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

// Add a bookmark to the state and update the bookmarked status of the current recipe, if necessary
export function addBookmark(recipe) {
  // Add bookmark to state
  state.bookmarks.push(recipe);

  // Update bookmarked status of current recipe
  updateBookmarkedStatus(recipe, true);
}

// Remove a bookmark from the state and update the bookmarked status of the current recipe, if necessary
export function deleteBookmark(id) {
  // Find the index of the bookmark to delete
  const index = state.bookmarks.findIndex(el => el.id === id);

  // Remove the bookmark from the state
  state.bookmarks.splice(index, 1);

  // Update bookmarked status of current recipe
  updateBookmarkedStatus(state.recipe, false);
}

// Update the bookmarked status of a recipe
function updateBookmarkedStatus(recipe, newStatus) {
  recipe.bookmarked = newStatus;
}
