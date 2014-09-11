$(document).ready(function () {
  var options = {
    id: 'test',
    url: recipeData.url,
    sourceName: recipeData.sourceName,
    title: recipeData.title,
    ingredients: recipeData.ingredients,
    steps: recipeData.steps,
    imageUrl: recipeData.imageUrl
  };
  var recipe = new RecipeViewer();
  recipe.init(options);
});
