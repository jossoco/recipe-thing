function View () {

  this.TEMPLATE_PATH = 'static/js/ejs/';
  this.TEMPLATE_SUFFIX = '.ejs';

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
    options = options || {};
    $('body').html(this.renderTemplate(this.TEMPLATE_NAME, options));
  };

  this.hideElement = function (element) {
    $(element).addClass('hidden');
  };

  this.showElement = function (element) {
    $(element).removeClass('hidden');
  };
};
