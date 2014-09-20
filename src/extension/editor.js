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

  this.SECTIONS = [
    'title',
    'ingredients',
    'steps'
  ];

  this.HEADER_TEXT = [
    'Recipe Title',
    'Ingredients',
    'Step'
  ];

  this.start = function () {
    rangy.init();
    this.cssApplier = rangy.createCssClassApplier('recipez-highlighted', {normalize: true});
    this.index = 0;
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
    this.loadEditor();
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

    $('body').append(this.renderTemplate('editor'));
  };

  this.appendReviewDialog = function () {
    $('#recipez-review').remove();

    var self = this;
    var sections = '';
    $.each(this.SECTIONS, function (i, section) {
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
    $(this.backButton).on('click', $.proxy(this.onBackButtonClick, this));
    $(this.reviewBackButton).on('click', $.proxy(this.onReviewBackButtonClick, this));
    $(this.reviewNextButton).on('click', $.proxy(this.onReviewNextButtonClick, this));
  };

  this.onAddButtonClick = function () {
    if (!this.addButton.hasClass('disabled')) {
      this.cssApplier.applyToSelection();
      this.appendIngredients(this.getSelectedText());
      this.unselectText();
      this.updateButtonState();
    }
  };

  this.onNextButtonClick = function () {
    if (!this.nextButton.hasClass('disabled')) {
      if (this.index == 0 && this.getSelectedText() != '') {
        this.recipeData.title = this.getSelectedText();
        $('.recipez-selected-0').removeClass('recipez-selected-0');
        this.cssApplier.applyToSelection();
      } else if (this.index == 1) {
        var self = this;
        this.recipeData.ingredients = [];
        $.each(this.contents.find('li'), function (i, item) {
          self.recipeData.ingredients.push($(item).text());
        });
      }

      $('.recipez-highlighted').removeClass('recipez-highlighted').addClass(
          'recipez-selected recipez-selected-' + this.index);

      this.index += 1;
      this.unselectText();
      this.loadEditor();
   }
  };

  this.onBackButtonClick = function () {
    this.index -= 1;
    this.loadEditor();
  };

  this.loadEditor = function () {
    this.reviewDialog.addClass('hidden');
    $(this.editor.find('.editor-section')).addClass('hidden');
    $(this.editor.find('.editor-section.' + this.SECTIONS[this.index])).removeClass('hidden');
    $(this.editor.find('.recipez-editor-head')).text(this.HEADER_TEXT[this.index]);
    if (this.index > 0) {
      this.contents.removeClass('hidden');
      this.backButton.removeClass('disabled');
    } else {
      this.contents.addClass('hidden');
      this.backButton.addClass('disabled');
      this.addButton.addClass('disabled');
    }

    if (this.index == 1) {
      this.appendIngredients(this.recipeData.ingredients.join('\n'));
    } else {
      this.contents.html('');
    }

    if (this.recipeData.steps.length > 0) {
      this.doneButton.removeClass('disabled');
    }

    $('.recipez-selected').removeClass('recipez-selected');
    $('.recipez-selected-' + this.index).addClass('recipez-selected');

    this.updateButtonState();
  };

  this.loadReviewDialog = function () {
    this.editor.addClass('hidden');
    var self = this;
    $.each(this.SECTIONS, function (i, section) {
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

  this.appendIngredients = function (ingredients) {
    if (!(ingredients instanceof Array)) {
      ingredients = ingredients.split('\n');
    }
    if (this.contents.find('ul').length == 0) {
      this.contents.append('<ul></ul');
    }

    var self = this;
    var list = $(this.contents.find('ul'));
    $.each(ingredients, function (i, ingredient) {
      if (ingredient != '') {
        list.append('<li>' + ingredient + '</li>');
      }
    });
  };

  this.updateButtonState = function () {
    if (this.index > 0) {
      if (this.getSelectedText() != '') {
        this.addButton.removeClass('disabled');
      } else {
        this.addButton.addClass('disabled');
      }
      if (this.contents.text() != '') {
        this.nextButton.removeClass('disabled');
      } else {
        this.nextButton.addClass('disabled');
      }
    } else {
      if (this.getSelectedText() != '' || this.recipeData.title != '') {
        this.nextButton.removeClass('disabled');
      } else {
        this.nextButton.addClass('disabled');
     }
    }
  };

  this.onReviewBackButtonClick = function () {
    this.reviewDialog.addClass('hidden');
    this.editor.removeClass('hidden');
  };

  this.onReviewNextButtonClick = function () {
    this.index += 1;
    this.loadEditor();
  };

  this.setVariables = function () {
    this.editor = $('#recipez-editor');
    this.reviewDialog = $('#recipez-review');
    this.editorBody = $(this.editor.find('.recipez-editor-body'));
    this.addButton = $('#add-btn');
    this.nextButton = $('#next-btn');
    this.backButton = $('#back-btn');
    this.reviewBackButton = $('#review-back-btn');
    this.reviewNextButton = $('#review-next-btn');
    this.contents = $(this.editorBody.find('.recipez-editor-body-contents'));
  };
};

var editor = new Editor();
editor.start();
