function RecipePrompt () {

  this.TEMPLATE_NAME = 'prompt';

  this.init = function (options) {
    this.start(options);
  };

  this.start = function (options) {
    this.render(options);
  };
};

RecipePrompt.prototype = new View();
RecipePrompt.prototype.constructor = RecipePrompt;

$(document).ready(function () {
  var prompt = new RecipePrompt();
  var options = {
    error: formError
  };
  prompt.init(options);
});
