if (typeof jQuery === 'undefined' || typeof $ === 'undefined') {
  throw new Error('ritsu.js requires jQuery or a jQuery-compatible API');
}

var ritsu = (function() {

  var useBootstrap3Stlying = false;
  var autoMarkInvalidFields = true;
  var autoShowErrorMessages = false;

  var initialize = function(options) {

    var invalidOptions = typeof options !== 'object';
    if (invalidOptions) throw 'Invalid options to initialize ritsu.js';

    useBootstrap3Stlying = options.useBootstrap3Stlying === undefined ? false : options.useBootstrap3Stlying;
    autoMarkInvalidFields = options.autoMarkInvalidFields === undefined ? true : options.autoMarkInvalidFields;
    autoShowErrorMessages = options.autoShowErrorMessages === undefined ? false : options.autoShowErrorMessages;

    return this;
  };

  var storeInitialFormValues = function($selector) {

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    var isNotInputs = !$selector.is('input, textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    $selector.each(function() {

      var $this = $(this);

      var isCheckbox = $this.is('input[type="checkbox"]');
      var isRadio = $this.is('input[type="radio"]');
      var isFile = $this.is('input[type="file"]');

      if (isCheckbox || isRadio) {
        $this.data('initialValue', $this.is(':checked'));
      } else if (isFile) {

        var hasSimpleFileHash = $this.data('simple-file-hash') !== undefined;

        if (hasSimpleFileHash) {
          $this.data('initialValue', $this.data('simple-file-hash'));
          return true;
        }

        var hasFileAttached = this.files.length > 0;
        var initialValue = hasFileAttached ? this.files[0].name + this.files[0].size + this.files[0].lastModified : '';

        $this.data('initialValue', initialValue);

      } else {
        $this.data('initialValue', $this.val());
      }

    });

    return this;
  };

  var isFormDirty = function($selector) {

    var isDirty = false;

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    var isNotInputs = !$selector.is('input, textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    $selector.each(function() {

      var $this = $(this);

      var noInitialValue = $this.data('initialValue') === undefined;
      if (noInitialValue) return true;

      var isCheckbox = $this.is('input[type="checkbox"]');
      var isRadio = $this.is('input[type="radio"]');
      var isFile = $this.is('input[type="file"]');

      var valueChanged = false;

      if (isCheckbox || isRadio) {
        valueChanged = $this.data('initialValue') != $this.is(':checked');
      } else if (isFile) {
        var hasFileAttached = this.files.length > 0;
        valueChanged = $this.data('initialValue') != (hasFileAttached ? this.files[0].name + this.files[0].size + this.files[0].lastModified : $this.data('simple-file-hash'));
      } else {
        valueChanged = $this.data('initialValue') != $this.val();
      }

      //If one value has changed, mark the entire form dirty and return right away
      if (valueChanged) {
        isDirty = true;
        return false;
      }

    });

    return isDirty;
  };

  var validate = function($selector) {

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    var isNotInputs = !$selector.is('input, textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    var isValid = true;

    $selector.each(function() {

      var $element = $(this);

      var invalidElement = !validation.validateElement(this);

      //Sets the entire form to false, just because their was at least 1 invalid field
      if (invalidElement) {
        isValid = false;
        $element.data('invalid', true);
      } else {
        $element.data('invalid', false);
        _removeErrorMessage($element);
      }

    });

    if (autoMarkInvalidFields) markInvalidFields($selector);
    if (autoShowErrorMessages) showErrorMessages($selector);

    return isValid;
  };

  var markInvalidFields = function($selector) {

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    var isNotInputs = !$selector.is('input, textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    $selector.each(function() {

      var $this = $(this);
      var $errorSelector = useBootstrap3Stlying ? $this.closest('.form-group') : $this;

      var isInvalid = $this.data('invalid');

      if (isInvalid) {
        $errorSelector.addClass('has-error');
      } else {
        $errorSelector.removeClass('has-error');
      }

    });

    return this;
  };

  var showErrorMessages = function($selector) {

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    var isNotInputs = !$selector.is('input, textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    $selector.each(function() {

      var $this = $(this);

      _removeErrorMessage($this); //Remove any previous old error messages

      var isValid = !$this.data('invalid');
      if (isValid) return true;

      var errorMessage = _getErrorMessageForInput($this);

      if (useBootstrap3Stlying) {

        var $formGroup = $this.closest('.form-group');
        $formGroup.append('<span class="help-block">' + errorMessage + '</span>');

      } else {

        var id = $this.attr('id');
        var $errorContainer = $this.closest('.error-label-container').length === 0 ? $this.parent() : $this.closest('.error-label-container');
        $errorContainer.append('<label class="error-label"' + (id ? ' for="' + id + '"' : '') + '>' + errorMessage + '</label>');

      }

    });

    return this;
  };

  //Private Methods ************************************************************
  var _removeErrorMessage = function($input) {

    $input.closest('td').find('.error-label').remove();

    if (useBootstrap3Stlying) {
      $input.closest('.form-group').find('.help-block').remove();
      return;
    }

    var $labelParent = $input.closest('.error-label-container');
    if ($labelParent.length === 0) $labelParent = $input.parent();
    $labelParent.find('.error-label, .warning-label').remove();

  };

  var _getErrorMessageForInput = function($input) {

    var isAlpha = $input.hasClass('alpha');

    if (isAlpha) {

      var isAlphaAll = $input.hasClass('alpha-all');
      if (isAlphaAll) return null;

      var isAlphaOnly = $input.hasClass('alpha-only');
      if (isAlphaOnly) return 'Please enter only letters';

      var isAlphaZip = $input.hasClass('alpha-zip');
      if (isAlphaZip) return 'Please enter a valid zip code';

      var isAlphaJqueryDate = $input.hasClass('alpha-jquery-date');
      if (isAlphaJqueryDate) return 'Please select a date from the datepicker';

      var isAlphaNumeric = $input.hasClass('alpha-numeric');
      if (isAlphaNumeric) return 'Please enter only alphanumeric characters';
    }

    var isNumeric = $input.hasClass('numeric');

    if (isNumeric) {

      var errorMessage;

      var isNumericWholeInput = $input.hasClass('numeric-whole');
      if (isNumericWholeInput) errorMessage = 'Please enter a whole number';

      var isNumericMonetaryInput = $input.hasClass('numeric-monetary');
      if (isNumericMonetaryInput) errorMessage = 'Please enter a monetary value';

      var isNumericDecimalInput = $input.hasClass('numeric-decimal');
      if (isNumericDecimalInput) errorMessage = 'Please enter a number';

      var isNumericFullYear = $input.hasClass('numeric-full-year');
      if (isNumericFullYear) errorMessage = 'Please enter a 4 digit year';

      var hasMinLimit = $input.attr('min') !== undefined;
      var hasMaxLimit = $input.attr('max') !== undefined;
      var hasDecimalMax = $input.data('decimal-max') !== undefined;

      if (hasDecimalMax) errorMessage += ' with ' + $input.data('decimal-max') + ' decimal places max';

      if (hasMinLimit && hasMaxLimit) {
        errorMessage = errorMessage + ' from ' + $input.attr('min') + ' to ' + $input.attr('max');
      } else if (hasMinLimit) {
        errorMessage = errorMessage + ' greater or equal to ' + $input.attr('min');
      } else if (hasMaxLimit) {
        errorMessage = errorMessage + ' lesser or equal to ' + $input.attr('max');
      }

      errorMessage += '.';

      return errorMessage;

    }

    return 'Invalid Value';

  };

  return {
    initialize: initialize,
    storeInitialFormValues: storeInitialFormValues,
    isFormDirty: isFormDirty,
    validate: validate,
    markInvalidFields: markInvalidFields,
    showErrorMessages: showErrorMessages
  };

})();
