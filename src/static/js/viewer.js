function RecipeViewer (options) {

  this.TEMPLATE_NAME = 'recipe';

  this.init = function (options) {
    this.id = options.id;
    this.steps = options.steps;
    this.start(options);
  };

  this.start = function (options) {
    this.currentStepIndex = 0;
    this.render(options);

    this.recipeContainer = $('#' + this.id);
    this.headerContainer = this.recipeContainer.find('.recipe-header');
    this.bodyContainer = this.recipeContainer.find('.recipe-body');
    this.stepsContainer = this.recipeContainer.find('.recipe-steps');
    this.currentStepNumberContainer = this.recipeContainer.find('.recipe-current-step .step-number');
    this.currentStepTextContainer = this.recipeContainer.find('.recipe-current-step .step-text');
    this.backButton = this.recipeContainer.find('.back-btn');
    this.nextButton = this.recipeContainer.find('.next-btn');
    this.doneButton = this.recipeContainer.find('.done-btn');
    this.progressBar = this.recipeContainer.find('.recipe-meter span');

    this.setPanelHeights();
    this.bindEvents({
      'click .next-btn': this.onNextButtonClick,
      'click .back-btn': this.onBackButtonClick
    });
    this.updateCurrentStep();
  };

  this.updateCurrentStep = function () {
    if (this.steps[this.currentStepIndex]) {
      this.currentStepNumberContainer.text('Step ' + (this.currentStepIndex + 1));
      this.currentStepTextContainer.text(this.steps[this.currentStepIndex]);
      $(this.stepsContainer.find('li')).removeClass('highlighted');
      $(this.stepsContainer.find('li')[this.currentStepIndex]).addClass('highlighted');
    }

    if (this.currentStepIndex === this.steps.length) {
      this.nextButton.hide();
      this.doneButton.show();
    }

    if (!this.steps[this.currentStepIndex - 1]) {
      this.backButton.addClass('disabled');
    } else {
      this.backButton.removeClass('disabled');
    }

    var progress = this.currentStepIndex / this.steps.length * 100;
    this.progressBar.css('width', progress + '%');
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

  this.setPanelHeights = function () {
    var recipeHeight = this.recipeContainer.height();
    var headerHeight = this.headerContainer.height();
    this.bodyContainer.css('height', (recipeHeight - headerHeight - 10) + 'px');
  };
};

RecipeViewer.prototype = new View();
RecipeViewer.prototype.constructor = RecipeViewer;
