function RecipePrompt () {

  this.TEMPLATE_NAME = 'prompt';

  this.init = function () {
    this.start();
  };

  this.start = function () {
    this.render();
  };
};

RecipePrompt.prototype = new View();
RecipePrompt.prototype.constructor = RecipePrompt;
