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
    this.currentStepContainer = this.recipeContainer.find('.recipe-current-step');
    this.currentStepNumberContainer = this.currentStepContainer.find('.step-number');
    this.currentStepTextContainer = this.currentStepContainer.find('.step-text');
    this.backButton = this.recipeContainer.find('.back-btn');
    this.nextButton = this.recipeContainer.find('.next-btn');
    this.doneButton = this.recipeContainer.find('.done-btn');
    this.progressBar = this.recipeContainer.find('.recipe-meter span');

    this.setPanelHeights();
    this.bindEvents({
      'click .next-btn': this.onNextButtonClick,
      'click .back-btn': this.onBackButtonClick,
      'click .done-btn': this.onDoneButtonClick
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

    if (this.currentStepIndex + 1 === this.steps.length) {
      this.nextButton.addClass('hidden');
      this.doneButton.removeClass('hidden');
    } else {
      this.nextButton.removeClass('hidden');
      this.doneButton.addClass('hidden');
    }

    if (!this.steps[this.currentStepIndex - 1]) {
      this.backButton.addClass('disabled');
    } else {
      this.backButton.removeClass('disabled');
    }

    var progressPercent = this.currentStepIndex / this.steps.length * 100;
    this.setProgressBarPercentage(progressPercent);
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
      this.currentStepContainer.removeClass('complete');
    }
  };

  this.onDoneButtonClick = function () {
    this.currentStepIndex += 1;
    this.currentStepNumberContainer.text('Done!');
    this.currentStepTextContainer.text('');
    this.currentStepContainer.addClass('complete');
    this.setProgressBarPercentage(100);
    this.doneButton.addClass('hidden');
  };

  this.setProgressBarPercentage = function (percentage) {
    this.progressBar.animate({'width': percentage + '%'});
    if (parseInt(100) === percentage) {
      this.progressBar.addClass('complete');
    } else {
      this.progressBar.removeClass('complete');
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
