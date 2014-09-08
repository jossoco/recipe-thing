function Recipe (options) {

  this.TEMPLATE_PATH = 'static/js/ejs/';
  this.TEMPLATE_SUFFIX = '.ejs';
  this.TEMPLATE_NAME = 'recipe';

  this.init = function (options) {
    this.id = options.id;
    this.steps = options.steps;
    this.start(options);
  };

  this.start = function (options) {
    this.currentStepIndex = 0;
    options.currentStep = options.steps[this.currentStepIndex];
    this.render(options);

    var recipe = $('#' + this.id);
    this.stepsContainer = recipe.find('.recipe-steps');
    this.currentStepContainer = recipe.find('.recipe-current-step');
    this.backButton = recipe.find('.back-btn');
    this.nextButton = recipe.find('.next-btn');

    this.bindEvents({
      'click .next-btn': this.onNextButtonClick,
      'click .back-btn': this.onBackButtonClick
    });
    this.updateCurrentStep();
  };

  this.bindEvents = function (events) {
    _.each(events, function (handler, event) {
        var eventParts = event.split(' ');
        var eventType = eventParts.shift();
        var selector = '#' + this.id + ' ' + eventParts.join(' ');
        $(selector).on(eventType, $.proxy(handler, this));
    }, this);
  };

  this.getTemplateURL = function (templateName) {
      return this.TEMPLATE_PATH + templateName + this.TEMPLATE_SUFFIX;
  };

  this.renderTemplate = function (templateName, options) {
    var url = this.getTemplateURL(templateName);
    return $(new EJS({url: url}).render(options));
  };

  this.render = function (options) {
    $('body').append(this.renderTemplate(this.TEMPLATE_NAME, options));
  };

  this.updateCurrentStep = function () {
    if (this.steps[this.currentStepIndex]) {
      this.currentStepContainer.text(this.steps[this.currentStepIndex]);
      $(this.stepsContainer.find('li')).removeClass('highlighted');
      $(this.stepsContainer.find('li')[this.currentStepIndex]).addClass('highlighted');
    }

    if (!this.steps[this.currentStepIndex + 1]) {
      this.nextButton.attr('disabled', 'disabled');
    } else {
      this.nextButton.removeAttr('disabled');
    }

    if (!this.steps[this.currentStepIndex - 1]) {
      this.backButton.attr('disabled', 'disabled');
    } else {
      this.backButton.removeAttr('disabled');
    }
  };

  this.onNextButtonClick = function () {
    this.currentStepIndex += 1;
    this.updateCurrentStep();
  };

  this.onBackButtonClick = function () {
    this.currentStepIndex -= 1;
    this.updateCurrentStep();
  };
};

$(document).ready(function () {
  //var imageUrl = 'http://d24edc7kaf4agn.cloudfront.net/1620905/67370600/how-to-saute-onions.jpg';
  //var steps = ['Heat oil in skillet.', 'Add chopped onions.', 'Saute until translucent.'];

  var options = {
    id: 'test',
    url: recipeData.url,
    title: recipeData.title,
    steps: recipeData.steps,
    imageUrl: ''
  };
  var recipe = new Recipe();
  recipe.init(options);
});
