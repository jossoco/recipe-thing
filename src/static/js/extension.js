function RecipeExtension () {

  this.init = function (recipeUrl) {
    if ($('body').hasClass('souschef-ext-loaded')) {
      // redirect
      if (recipeUrl) {
        $('#extension-downloaded').show();
        setTimeout(function () {
          window.location.replace(recipeUrl);
        }, 2000);
      }
    } else {
      $('#download-extension').show();
    }
  };
};

RecipeExtension.prototype = new View();
RecipeExtension.prototype.constructor = RecipeExtension;

$(document).ready(function () {
  setTimeout(function () {
    var extension = new RecipeExtension();
    extension.init(recipeUrl);
  }, 1000);
});
