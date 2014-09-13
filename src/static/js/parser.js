function RecipeParser () {

  this.TEMPLATE_NAME = 'parser';
  this.TYPES = {
    INGREDIENTS: 'Ingredients',
    STEP: 'Step'
  };

  this.init = function (options) {
    this.id = 'recipe-parser';
    this.recipeData = {
      title: options.title,
      sourceName: options.sourceName,
      imageUrl: options.imageUrl,
      recipeUrl: options.url,
      ingredients: [],
      steps: []
    };

    this.currentStepIndex = 0;
    rangy.init();
    this.start(options);
  };

  this.start = function (options) {
    options.type = this.getStepName();
    this.render(options);

    this.cssApplier = rangy.createCssClassApplier('highlighted', {normalize: true});

    this.nextButton = $('#' + this.id + ' .next-btn');
    this.addButton = $('#' + this.id + ' .add-btn');
    this.doneButton = $('#' + this.id + ' .done-btn');
    this.recipePanel = $('#recipe-panel');
    this.widget = $('#parse-widget');
    this.widgetContents = $('#' + this.id + ' .widget-contents');

    this.recipePanel.find('.button').removeClass('button');

    $('body').mouseup($.proxy(this.updateButtonState, this));
    this.bindEvents({
      'click .next-btn': this.onNextButtonClick,
      'click .add-btn': this.onAddButtonClick,
      'click .done-btn': this.onDoneButtonClick
    });
  };

  this.onNextButtonClick = function () {
    $('.highlighted').removeClass('highlighted').addClass('selected').addClass('selected-' + this.currentStepIndex);
    this.currentStepIndex += 1;
    this.hideElement($('span.ingredients'));
    this.showElement($('span.step'));
    this.nextButton.addClass('disabled');
    var type = this.getStepName();
    this.widgetContents.text('');
    this.widget.find('.header').text(type);
    this.widget.find('.type').text(type);
  };

  this.onAddButtonClick = function () {
    var highlightedText = this.getHighlightedText();
    if ('' !== highlightedText) {
      // Ingredients
      if (this.currentStepIndex === 0) {
        this.renderIngredients(highlightedText);
        if (this.widgetContents.find('li').length > 0) {
          this.nextButton.removeClass('disabled');
        }
        $('#parse-widget li').unbind('click');
          this.bindEvents({
            'click #parse-widget li': this.onListItemClick
        });

      // Steps
      } else {
        this.renderStep(highlightedText);
        if (this.widgetContents.text() !== '') {
          this.nextButton.removeClass('disabled');
        }
      }
    }

    this.addButton.addClass('disabled');
    this.cssApplier.applyToSelection();
    this.deselectText();
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

  this.renderIngredients = function (text) {
    var ingredients = text.split('\n');
    this.recipeData.ingredients = this.recipeData.ingredients.concat(ingredients);
    var renderedIngredients = this.renderTemplate('ingredients', {ingredients: ingredients});
    var list = this.widgetContents.find('.list');
    if (list.length > 0) {
      list.append(renderedIngredients.find('li'));
    } else {
      this.widgetContents.append(renderedIngredients);
    }
  };

  this.renderStep = function (text) {
    this.widgetContents.append(' ' + text);
    var savedStep = this.recipeData.steps[this.currentStepIndex - 1];
    if (savedStep) {
      this.recipeData.steps[this.currentStepIndex - 1] = savedStep + ' ' + text;
    } else {
      this.recipeData.steps.push(text);
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

  this.getStepName = function () {
    if (this.currentStepIndex === 0) {
      return this.TYPES.INGREDIENTS;
    } else {
      return this.TYPES.STEP + ' ' + this.currentStepIndex;
    }
  };

  this.onDoneButtonClick = function () {
    var self = this;
    onSuccess = function () {
      //$.ajax({
      //  type: 'GET',
      //  url: 'recipe?url=' + self.recipeData.recipeUrl,
      //});
      window.location = '/recipe?url=' + self.recipeData.recipeUrl;
    };
    $.ajax({
      type: 'POST',
      url: 'editor',
      contentType: 'application/json',
      data: JSON.stringify(this.recipeData),
      success: onSuccess
    });
  };
};

RecipeParser.prototype = new View();
RecipeParser.prototype.constructor = RecipeParser;

$(document).ready(function () {
  var parser = new RecipeParser();
  recipeData = JSON.parse(recipeData);
  var options = {
    title: recipeData.title,
    sourceName: recipeData.sourceName,
    imageUrl: recipeData.imageUrl,
    url: recipeData.url,
    recipeHtml: recipeData.recipeHtml.replace('\n', '')
  };
  parser.init(options);
});
