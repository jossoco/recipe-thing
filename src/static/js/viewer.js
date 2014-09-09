function RecipeViewer (options) {

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

  this.updateCurrentStep = function () {
    if (this.steps[this.currentStepIndex]) {
      this.currentStepContainer.text(this.steps[this.currentStepIndex]);
      $(this.stepsContainer.find('li')).removeClass('highlighted');
      $(this.stepsContainer.find('li')[this.currentStepIndex]).addClass('highlighted');
    }

    if (!this.steps[this.currentStepIndex + 1]) {
      this.nextButton.addClass('disabled');
    } else {
      this.nextButton.removeClass('disabled');
    }

    if (!this.steps[this.currentStepIndex - 1]) {
      this.backButton.addClass('disabled');
    } else {
      this.backButton.removeClass('disabled');
    }
  };

  this.onNextButtonClick = function () {
    if (!this.nextButton.hasClass('disabled')) {
      this.currentStepIndex += 1;
      this.updateCurrentStep();
    }
  };

  this.onBackButtonClick = function () {
    if (!this.backButton.hasClass('disabled')) {
      this.currentStepIndex -= 1;
      this.updateCurrentStep();
    }
  };
};

RecipeViewer.prototype = new View();
RecipeViewer.prototype.constructor = RecipeViewer;
