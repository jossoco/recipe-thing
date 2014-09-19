function Editor() {

  this.CSS_FILES = [
    {
      href: 'assets/css/editor.css',
      local: true
    }, {
      href: 'http://fonts.googleapis.com/css?family=Lato',
      local: false
    }
  ];

  this.JS_FILES = [
    {
      src: 'assets/js/rangy-core.js',
      local: true
    }, {
      src: 'assets/js/rangy-cssclassapplier.js',
      local: true
    }
  ];

  this.REVIEW_SECTIONS = [
    'title',
    'ingredients',
    'steps'
  ];

  this.HEADER_TEXT = [
    'Recipe Title',
    'Ingredients',
    'Step'
  ];

  this.BODY_CONTENT = [
    'Highlight the title of the recipe. Click the <span class="button-label">Next</span> ' +
    'button when you are done.',
    'Highlight ingredients, then click the <span class="button-label">Add</span> button. ' +
    'When all ingredients have been added, click the <span class="button-label">Next</span> ' +
    'button to continue.'
  ];

  this.start = function () {
    rangy.init();
    this.cssApplier = rangy.createCssClassApplier('recipez-highlighted', {normalize: true});
    this.index = 0;
    this.currentData;
    this.recipeData = {
      ingredients: [],
      steps: [],
      title: '',
      imageUrl: '',
      sourceName: '',
      url: window.location.href
    };

    this.appendCSS();
    this.appendEditor();
    this.appendReviewDialog();

    this.setVariables();
    this.bindEvents();
  };

  this.appendCSS = function () {
    $.each(this.CSS_FILES, function (i, css) {
      var href = css.href;
      if (css.local) {
        href = chrome.extension.getURL(css.href);
      }
      $('head').append('<link rel="stylesheet" type="text/css" href="' + href + '">');
    });
  };

  this.renderTemplate = function (templateName, options) {
   options = options || {};
   var url = chrome.extension.getURL('assets/js/ejs/' + templateName + '.ejs');
   return new EJS({url: url}).render(options);
  };

  this.appendEditor = function () {
    // Remove existing editor if one exists
    $('#recipez-editor').remove();

    $('body').append(this.renderTemplate('editor', {
      headerText: this.HEADER_TEXT[this.index],
      body: this.BODY_CONTENT[this.index]
    }));
  };

  this.appendReviewDialog = function () {
    $('#recipez-review').remove();

    var self = this;
    var sections = '';
    $.each(this.REVIEW_SECTIONS, function (i, section) {
      sections += self.renderTemplate('review_section', {
        body: self.recipeData[section],
        type: section
      });
    });

    $('body').append(this.renderTemplate('review', {
      sections: sections
    }));
  };

  this.bindEvents = function () {
    $('body').mouseup($.proxy(this.updateButtonState, this));
    $(this.addButton).on('click', $.proxy(this.onAddButtonClick, this)); 
    $(this.nextButton).on('click', $.proxy(this.onNextButtonClick, this));
    $(this.reviewBackButton).on('click', $.proxy(this.onReviewBackButtonClick, this));
  };

  this.onAddButtonClick = function () {
    if (!this.addButton.hasClass('disabled')) {
      this.cssApplier.applyToSelection();
      this.appendIngredients(this.getSelectedText());
      this.unselectText();
    }
  };

  this.onNextButtonClick = function () {
    $('.recipez-highlighted').removeClass('recipez-highlighted').addClass('recipez-selected selected-' + this.index);

    if (this.index == 0) {
       this.currentData = this.getSelectedText();
       this.recipeData.title = this.currentData;
       this.unselectText();
    }

    // Show review
    this.editor.addClass('hidden');
    this.loadReviewDialog();
  };

  this.loadReviewDialog = function () {
    var self = this;
    $.each(this.REVIEW_SECTIONS, function (i, section) {
      var el = $(self.reviewDialog.find('.recipez-review-section.' + section)[0]);
      $(el.find('.recipez-review-section-body')[0]).html(self.recipeData[section]);
    });

    this.reviewDialog.removeClass('hidden');
  };

  this.getSelectedText = function () {
    if (window.getSelection) {
      return window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
      return document.selection.createRange().text;
    }
  };

  this.unselectText = function () {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection && document.selection.type != 'Control') {
      window.selection.empty();
    }
  };

  this.appendIngredients = function (text) {
    var ingredients = text.split('\n');
    if (this.contents.find('ul').length == 0) {
      this.contents.append('<ul></ul');
    }

    var list = $(this.contents.find('ul'));
    $.each(ingredients, function (i, ingredient) {
      list.append('<li>' + ingredient + '</li>');
      this.recipeData.ingredients.append(ingredient);
    });

    this.currentData = this.recipeData.ingredients;
  };

  this.updateButtonState = function () {
    if ('' !== this.getSelectedText()) {
      this.addButton.removeClass('disabled');

      // Need only highlight text for title selection
      if (this.index == 0) {
        this.nextButton.removeClass('disabled');
      }

    } else {
      this.addButton.addClass('disabled');
      if (this.index == 0) {
        this.nextButton.addClass('disabled');
      }
    }
    if (this.contents.find('li').length > 0) {
      this.nextButton.removeClass('disabled');
    }
  };

  this.onReviewBackButtonClick = function () {
    this.reviewDialog.addClass('hidden');
    this.editor.removeClass('hidden');
  };

  this.setVariables = function () {
    this.editor = $('#recipez-editor');
    this.reviewDialog = $('#recipez-review');
    this.editorBody = $(this.editor.find('.recipez-editor-body'));
    this.addButton = $('#add-btn');
    this.nextButton = $('#next-btn');
    this.reviewBackButton = $('#review-back-btn');
    this.reviewNextButton = $('#review-next-btn');
    this.contents = $(this.editorBody.find('.recipez-editor-body-contents'));
  };
};

var editor = new Editor();
editor.start();
