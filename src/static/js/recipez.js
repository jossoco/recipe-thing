$(document).ready(function () {
  if (recipeData) {
    var options = {
      id: 'test',
      url: recipeData.url,
      sourceName: recipeData.sourceName,
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      imageUrl: ''
    };
    var recipe = new RecipeViewer();
    recipe.init(options);
  } else {
    var prompt = new RecipePrompt();
    prompt.init();
  }
});
