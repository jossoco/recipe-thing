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

  this.CONFIRM_DIALOG = [
    'You have selected the recipe title "<span class="selected-data"></span>." If this is ' +
    'correct, click the ' + '<span class="button-label">Next</span> button to continue. If not, ' +
    'click the <span class="button-label">Back</span> button to edit your selection.'
  ];

  this.start = function () {
    rangy.init();
    this.cssApplier = rangy.createCssClassApplier('recipez-highlighted', {normalize: true});
    this.index = 0;
    this.currentData;

    this.appendCSS();
    this.appendEditor();

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

  this.appendEditor = function () {
    // Remove existing editor if one exists
    $('#recipez-editor').remove();

    var editor = $('<div id="recipez-editor"></div>');
    editor.append('<div class="recipez-editor-head">' + this.HEADER_TEXT[this.index] + '</div>');    

    var editorBody = $('<div class="recipez-editor-body"></div>');
    editorBody.append(this.BODY_CONTENT[this.index]);

    editorBody.append('<div class="recipez-editor-body-contents hidden"></div>');
    var buttonContainer = $('<div class="buttons"></div>');
    buttonContainer.append($('<div id="add-btn" class="button hidden disabled">Add</div>'));
    buttonContainer.append($('<div id="next-btn" class="button disabled">Next</div>'));
    editorBody.append(buttonContainer);
    editor.append(editorBody);
    $('body').append(editor);
  };

  this.appendConfirmDialog = function () {
    $('#recipez-confirm').remove();

    var confirm = $('<div id="recipez-confirm"></div>');
    var confirmBody = $('<div class="recipez-confirm-body"></div>');
    confirmBody.append(this.CONFIRM_DIALOG[this.index]);
    confirmBody.find('.selected-data').html(this.currentData);
    
    var buttonContainer = $('<div class="buttons"></div>');
    buttonContainer.append('<div id="back-btn" class="button">Back</div>');
    buttonContainer.append('<div id="confirm-next-btn" class="button">Next</div>');
    confirmBody.append(buttonContainer);
    confirm.append(confirmBody);
    $('body').append('<div id="recipez-bg"></div>');
    $('#recipez-bg').css('height', $(document).height() + 'px');
    $('body').append(confirm);
  };

  this.bindEvents = function () {
    $('body').mouseup($.proxy(this.updateButtonState, this));
    $(this.addButton).on('click', $.proxy(this.onAddButtonClick, this)); 
    $(this.nextButton).on('click', $.proxy(this.onNextButtonClick, this));
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

    // Show confirmation
    this.editor.addClass('hidden');
    this.appendConfirmDialog();
  };

  this.showConfirmDialog = function () {
    
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

  this.setVariables = function () {
    this.recipeData = {
      ingredients: [],
      steps: [],
      title: '',
      imageUrl: '',
      sourceName: '',
      url: window.location.href
    };
    this.editor = $('#recipez-editor');
    this.editorBody = $(this.editor.find('.recipez-editor-body'));
    this.addButton = $('#add-btn');
    this.nextButton = $('#next-btn');
    this.contents = $(this.editorBody.find('.recipez-editor-body-contents'));
  };
};

var editor = new Editor();
editor.start();
