function RecipeForm () {

  this.TEMPLATE_NAME = 'form';

  this.init = function (options) {
    this.id = 'recipe-form';
    this.start(options);
  };

  this.start = function (options) {
    this.render(options);
  };
};

RecipeForm.prototype = new View();
RecipeForm.prototype.constructor = RecipeForm;

$(document).ready(function () {
  var form = new RecipeForm();
  var options = {
    error: formError
  };
  form.init(options);
});
