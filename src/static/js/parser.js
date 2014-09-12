function RecipeParser () {

  this.TEMPLATE_NAME = 'parser';
  this.PARSING_TYPES = ['ingredients', 'instructions'];

  this.init = function (options) {
    this.id = 'recipe-parser';
    this.currentStepIndex = 0;
    this.ingredients = [];

    rangy.init();
    this.start(options);
  };

  this.start = function (options) {
    options.type = this.PARSING_TYPES[this.currentStepIndex];
    this.render(options);

    this.cssApplier = rangy.createCssClassApplier('highlighted', {normalize: true});

    this.nextButton = $('#' + this.id + ' .next-btn');
    this.addButton = $('#' + this.id + ' .add-btn');
    this.editPanel = $('#edit-panel');
    this.recipePanel = $('#recipe-panel');
    this.parseWidget = $('#parse-widget');
    this.widgetContents = $('#' + this.id + ' .widget-contents');

    this.recipePanel.find('.button').removeClass('button');

    $('body').mouseup($.proxy(this.updateButtonState, this));
    this.bindEvents({
      'click .next-btn': this.onNextButtonClick,
      'click .add-btn': this.onAddButtonClick
    });
  };

  this.onNextButtonClick = function () {
    var contents = this.widgetContents.find('.list');
    this.showElement(this.editPanel);
    this.hideElement(this.parseWidget);
    this.hideElement(this.recipePanel);
    this.editPanel.find('.text-type').text(this.PARSING_TYPES[this.currentStepIndex]);
    this.editPanel.find('.user-text').html(contents);
  };

  this.onAddButtonClick = function () {
    var highlightedText = this.getHighlightedText();
    if ('' !== highlightedText) {
      this.parseAndRenderIngredients(highlightedText);
    }
    this.addButton.addClass('disabled');
    if (this.widgetContents.find('li').length > 0) {
      this.nextButton.removeClass('disabled');
    }
    this.cssApplier.applyToSelection();
    this.deselectText();

    $('#parse-widget li').unbind('click');
    this.bindEvents({
      'click #parse-widget li': this.onListItemClick
    });
  };

  this.getHighlightedText = function () {
    if (window.getSelection) {
      return window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
      return document.selection.createRange().text;
    }
    return '';
  };

  this.deselectText = function () {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
   }
  };

  this.updateButtonState = function () {
    var highlightedText = this.getHighlightedText();
    if ('' !== highlightedText) {
      this.addButton.removeClass('disabled');
    } else {
      this.addButton.addClass('disabled');
    }
  };

  this.parseAndRenderIngredients = function (text) {
    var ingredients = text.split('\n');
    this.ingredients = this.ingredients.concat(ingredients);
    var renderedIngredients = this.renderTemplate('ingredients', {ingredients: ingredients});
    var list = this.widgetContents.find('.list');
    if (list.length > 0) {
      list.append(renderedIngredients.find('li'));
    } else {
      this.widgetContents.append(renderedIngredients);
    }
  };

  this.onListItemClick = function (event) {
    var target = $(event.target);
    var text = target.text();
    var confirmed = confirm('Remove ingredient "' + text + '"?');
    if (confirmed) {
      $('.highlighted:contains("' + text + '")').removeClass('highlighted');
      target.remove();
    }
  };
};

RecipeParser.prototype = new View();
RecipeParser.prototype.constructor = RecipeParser;

$(document).ready(function () {
  var parser = new RecipeParser();
  var options = {
    allText: recipeData.allText.replace('\n', '')
  };
  parser.init(options);
});
