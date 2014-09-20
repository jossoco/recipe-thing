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

  this.SECTIONS = [
    'title',
    'ingredients',
    'steps'
  ];

  this.HEADER_TEXT = [
    'Recipe Title',
    'Ingredients'
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
    $(this.doneButton).on('click', $.proxy(this.onDoneButtonClick, this));
  };

  this.onAddButtonClick = function () {
    if (!this.addButton.hasClass('disabled')) {
      if (this.index == 1) {
        this.cssApplier.applyToSelection();
        this.appendIngredients(this.getSelectedText());
        this.unselectText();
        this.updateButtonState();
        this.bindListItemEvents();
      }
    }
  };

  this.onNextButtonClick = function () {
    if (!this.nextButton.hasClass('disabled')) {
      this.saveData();
      this.index += 1;

      if (this.index == this.HEADER_TEXT.length) {
        this.HEADER_TEXT.push('Step ' + (this.index-1));
      }

      this.unselectText();
      this.loadEditor();
   }
  };

  this.onBackButtonClick = function () {
    if (!this.backButton.hasClass('disabled')) {
      this.saveData();
      this.index -= 1;
      this.unselectText();
      this.loadEditor();
    }
  };

  this.saveData = function () {
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
    } else if (this.getSelectedText() != '') {
      this.recipeData.steps[this.index-2] = this.getSelectedText();
      $('.recipez-selected-' + this.index).removeClass('recipez-selected-' + this.index);
      this.cssApplier.applyToSelection();
    }

    $('.recipez-highlighted').removeClass('recipez-highlighted').addClass(
       'recipez-selected recipez-selected-' + this.index);
  };

  this.loadEditor = function () {
    var sectionIndex = this.index;
    if (this.index >= this.SECTIONS.length) {
      sectionIndex = 2;
    }
    $(this.editor.find('.editor-section')).addClass('hidden');
    $(this.editor.find('.editor-section.' + this.SECTIONS[sectionIndex])).removeClass('hidden');
    $(this.editor.find('.recipez-editor-head')).text(this.HEADER_TEXT[this.index]);

    if (this.index > 0) {
      this.backButton.removeClass('disabled');
    } else {
      this.backButton.addClass('disabled');
      this.addButton.addClass('disabled');
    }

    if (this.index == 1) {
      this.contents.removeClass('hidden');
      this.appendIngredients(this.recipeData.ingredients.join('\n'));
      this.bindListItemEvents();
    } else {
      this.contents.addClass('hidden');
    }

    if (this.recipeData.steps.length > 0) {
      this.doneButton.removeClass('disabled');
    }

    $('.recipez-highlighted').removeClass('recipez-highlighted');
    $('.recipez-selected-' + this.index).addClass('recipez-highlighted');

    this.updateButtonState();
  };

  this.loadReviewDialog = function () {
    this.editor.addClass('hidden');
    var self = this;
    $.each(this.SECTIONS, function (i, section) {
      var el = $(self.reviewDialog.find('.recipez-review-section.' + section)[0]);
      var reviewBody;
      if (section != 'title') {
        var listType = section == 'ingredients' ? 'ul' : 'ol';
        reviewBody = self.renderTemplate('review_list', {
          items: self.recipeData[section],
          listType: listType
         });
      } else {
        reviewBody = self.recipeData[section];
      }
      $(el.find('.recipez-review-section-body')[0]).html(reviewBody);
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
    if (this.index == 1) {
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
      var dataSaved = false;
      if (this.index == 0) {
        dataSaved = this.recipeData.title != '';
      } else {
        dataSaved = this.recipeData.steps.length >= (this.index-2) && this.recipeData.steps[this.index-2] != '';
      }
      if (this.getSelectedText() != '' || dataSaved) {
        this.nextButton.removeClass('disabled');
      } else {
        this.nextButton.addClass('disabled');
     }
    }
  };

  this.setVariables = function () {
    this.editor = $('#recipez-editor');
    this.reviewDialog = $('#recipez-review');
    this.editorBody = $(this.editor.find('.recipez-editor-body'));
    this.addButton = $('#add-btn');
    this.nextButton = $('#next-btn');
    this.backButton = $('#back-btn');
    this.doneButton = $('#done-btn');
    this.reviewBackButton = $('#review-back-btn');
    this.reviewNextButton = $('#review-next-btn');
    this.contents = $(this.editorBody.find('.recipez-editor-body-contents'));
  };

  this.onListItemClick = function (event) {
    var item = event.target;
    var confirmed = confirm('Delete ingredient "' + $(item).text() + '"?');
    if (confirmed) {
      $(event.target).remove();
      $(document).find(':contains(' + $(item).text() + ')').removeClass('recipez-highlighted')
          .removeClass('recipez-selected').removeClass('recipez-selected-' + this.index);
    }
  };

  this.bindListItemEvents = function () {
    $(this.contents.find('li')).on('click', $.proxy(this.onListItemClick, this));
  };

  this.onDoneButtonClick = function () {
    if (!this.doneButton.hasClass('disabled')) {
      this.loadReviewDialog();
    }
  }
};

var editor = new Editor();
editor.start();
