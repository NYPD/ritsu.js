var ritsu = new function () {

  this.useBootstrap3Stlying = false;
  this.autoMarkInvalidFields = true;
  this.autoShowErrorMessages = false;

  this.initialize = function (parameters) {

    var invalidParams = typeof parameters !== "object";
    if (invalidParams) throw "Invalid parameters to initialize ritsu.js";

    this.useBootstrap3Stlying = parameters.useBootstrap3Stlying === undefined ? false : parameters.useBootstrap3Stlying;
    this.autoMarkInvalidFields = parameters.autoMarkInvalidFields === undefined ? true : parameters.autoMarkInvalidFields;
    this.autoShowErrorMessages = parameters.autoShowErrorMessages === undefined ? false : parameters.autoShowErrorMessages;

    return this;
  };

  this.storeInitialFormValues = function ($selector) {

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    $selector.each(function () {

      var $this = $(this);

      var isCheckbox = $this.is('input[type="checkbox"]');
      var isRadio = $this.is('input[type="radio"]');

      if (isCheckbox || isRadio) {
        $this.data('initialValue', $this.is(':checked'));
      } else {
        $this.data('initialValue', $this.val());
      }

    });

    return this;
  };

  this.isFormDirty = function ($selector) {

    var isDirty = false;

    var selectorUndefined = $selector === undefined;
    if (selectorUndefined) $selector = $('input, textarea, select');

    $selector.each(function () {

      var $this = $(this);

      var noInitialValue = $this.data('initialValue') === undefined;
      if (noInitialValue) return true;

      var isCheckbox = $this.is('input[type="checkbox"]');
      var isRadio = $this.is('input[type="radio"]');

      var valueChanged = false;

      if (isCheckbox || isRadio) {
        valueChanged = $this.data('initialValue') != $this.is(':checked');
      } else {
        valueChanged = $this.data('initialValue') != $this.val();
      }

      if (valueChanged) {
        isDirty = true;
        return false;
      }

    });

    return isDirty;
  };

  this.validate = function ($selector) {

    var noSelectorPassedIn = $selector === undefined;
    if (noSelectorPassedIn) throw "No selector passed in";

    var isNotInputs = !$selector.is('input[type="text"], textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    var isValid = true;

    //Loops through all the jQuery inputs
    $selector.filter('textarea, input[type="text"]').each(function () {

      var $input = $(this);
      var inputIsDisabled = $input.prop('disabled') === true;

      if (inputIsDisabled) return true;

      var isAlpha = $input.hasClass("alpha");
      var isNumeric = $input.hasClass("numeric");
      var isOptional = $input.hasClass("optional");

      var fieldValue = $input.val();
      var isEmpty = $.trim(fieldValue) === "" || fieldValue === undefined;

      var valueIsMissing = isEmpty && !isOptional;
      var noValidationNeeded = isEmpty && isOptional;

      var invalidInput = noValidationNeeded ? false : valueIsMissing;
      var furtherValidationIsNeeded = !noValidationNeeded && !valueIsMissing;

      //If its a valid input, further verify it. If it is invalid, no reason to validate more
      if (furtherValidationIsNeeded && isAlpha) invalidInput = validateAlphaField($input);
      if (furtherValidationIsNeeded && isNumeric) invalidInput = validateNumericField($input);

      //Sets the entire form to false, just because the was at least 1 invalid field
      if (invalidInput) {
        isValid = false;
        $input.data('invalid', true);
      } else {
        $input.data('invalid', false);
        removeErrorMessage($input);
        $input.parent('td').find('.error-label').remove();
      }

    });

    $selector.filter('select').each(function () {

      var $dropdown = $(this);

      var dropdownIsDisabled = $dropdown.prop('disabled') === true;
      if (dropdownIsDisabled) return true;

      var valueSelected = $dropdown.val();
      var isNotOptional = !$dropdown.hasClass('optional');

      var invalidDropdown = isNotOptional && (valueSelected === "" || valueSelected === undefined || valueSelected === null);

      if (invalidDropdown) {
        isValid = false;
        $dropdown.data('invalid', true);
      } else {
        $dropdown.data('invalid', false);
      }

    });

    if (this.autoMarkInvalidFields) this.markInvalidFields($selector);
    if (this.autoShowErrorMessages) this.showErrorMessages($selector);

    return isValid;
  };

  this.markInvalidFields = function ($selector) {

    var noSelectorPassedIn = $selector === undefined;
    if (noSelectorPassedIn) throw "No selector passed in";

    var isNotInputs = !$selector.is('input[type="text"], textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    $selector.each(function () {

      var $this = $(this);
      var $errorSelector = ritsu.useBootstrap3Stlying ? $this.closest('.form-group') : $this;

      var isInvalid = $this.data('invalid');

      if (isInvalid) {
        $errorSelector.addClass("has-error");
      } else {
        $errorSelector.removeClass("has-error");
      }

    });

    return this;
  };

  this.showErrorMessages = function ($selector) {

    var noSelectorPassedIn = $selector === undefined;
    if (noSelectorPassedIn) throw "No selector passed in";

    var isNotInputs = !$selector.is('input[type="text"], textarea, select');
    if (isNotInputs) $selector = $selector.find('input, textarea, select');

    $selector.each(function () {

      var $this = $(this);
      var isInvalid = $this.data('invalid');
      var errorMessage = getErrorMessageForInput($this);

      if (ritsu.useBootstrap3Stlying) {
        var $formGroup = $this.closest('.form-group');
        $formGroup.find('.help-block').remove();

        if (isInvalid) $formGroup.append('<span class="help-block">' + errorMessage + '</span>');

      } else {
        var id = $this.attr('id');
        var $errorContainer = $this.closest('.error-label-container').length === 0 ? $this.parent() : $this.closest('.error-label-container');
        $errorContainer.find('.error-label, .warning-label').remove();

        if (isInvalid) $errorContainer.append('<label class="error-label"' + (id ? ' for="' + id + '"' : '') + '>' + errorMessage + '</label>');
      }

    });

    return this;
  };

  var validateNumericField = function ($input) {

    var invalidNumeric = false;

    var fieldValue = $input.val();

    var isNumericWholeInput = $input.hasClass("numeric-whole");
    var isNumericMonetaryInput = $input.hasClass("numeric-monetary");
    var isNumericDecimalInput = $input.hasClass("numeric-decimal");
    var isNumericFullYear = $input.hasClass("numeric-full-year");
    var isNumericDatePicker = $input.hasClass("numeric-date-picker");

    if (isNumericWholeInput) {
      invalidNumeric = !rules.getNumericWholeRegex().test(fieldValue);
    } else if (isNumericMonetaryInput) {
      invalidNumeric = !rules.getNumericMonetaryRegex().test(fieldValue);
    } else if (isNumericDecimalInput) {
      invalidNumeric = !rules.getNumericDecimalRegexString($input.data('decimal-max')).test(fieldValue);
    } else if (isNumericFullYear) {
      invalidNumeric = !rules.getNumericFullYearRegex().test(fieldValue);
    } else if (isNumericDatePicker) {
      invalidNumeric = !rules.getNumericDatePickerRegex().test(fieldValue);

      var isNoPastDate = $input[0].hasAttribute('data-no-past-date');
      if (isNoPastDate && !invalidNumeric) invalidNumeric = new Date().getTime() > new Date(fieldValue);

    }

    var hasMinLimit = $input.attr('min') !== undefined;
    var hasMaxLimit = $input.attr('max') !== undefined;

    if (!invalidNumeric) {

      if (hasMinLimit && hasMaxLimit) {
        invalidNumeric = fieldValue < $input.attr('min') || fieldValue > $input.attr('max');
      } else if (hasMinLimit) {
        invalidNumeric = fieldValue < $input.attr('min');
      } else if (hasMaxLimit) {
        invalidNumeric = fieldValue > $input.attr('max');
      }
    }

    return invalidNumeric;
  };

  var validateAlphaField = function ($input) {

    var invalidAlphaInput = false;

    var fieldValue = $input.val();

    var isAlphaAll = $input.hasClass("alpha-all"); //We dont check for this via regex, but it is nice to state that u dont care what the user enters here
    var isAlphaOnly = $input.hasClass("alpha-only");
    var isAlphaZip = $input.hasClass("alpha-zip");
    var isAlphaJqueryDate = $input.hasClass("alpha-jquery-date");
    var isAlphaNumeric = $input.hasClass("alpha-numeric");

    if (isAlphaOnly) {
      invalidAlphaInput = !rules.getAlphaOnlyRegex().test(fieldValue);
    } else if (isAlphaZip) {
      invalidAlphaInput = !rules.getAlphaZipRegex().test(fieldValue);
    } else if (isAlphaJqueryDate) {
      invalidAlphaInput = $input.datepicker("getDate") === null;
    } else if (isAlphaNumeric) {
      invalidAlphaInput = !rules.getAlphaNumericRegex().test(fieldValue);
    }

    return invalidAlphaInput;
  };

  var removeErrorMessage = function ($input) {

    if (this.useBootstrap3Stlying) {
      $input.closest('.form-group').find('.help-block').remove();
      return;
    }

    var $labelParent = $input.closest('.error-label-container');
    if ($labelParent.length === 0) $labelParent = $input.parent();
    $labelParent.find('.error-label, .warning-label').remove();

  };

  var getErrorMessageForInput = function ($input) {

    var isAlpha = $input.hasClass("alpha");

    if (isAlpha) {

      var isAlphaAll = $input.hasClass("alpha-all");
      if (isAlphaAll) return null;

      var isAlphaOnly = $input.hasClass("alpha-only");
      if (isAlphaOnly) return "Please enter only letters";

      var isAlphaZip = $input.hasClass("alpha-zip");
      if (isAlphaZip) return "Please enter a valid zip code";

      var isAlphaJqueryDate = $input.hasClass("alpha-jquery-date");
      if (isAlphaJqueryDate) return "Please select a date from the datepicker";

      var isAlphaNumeric = $input.hasClass("alpha-numeric");
      if (isAlphaNumeric) return "Please enter only alphanumeric characters";
    }

    var isNumeric = $input.hasClass("numeric");

    if (isNumeric) {

      var errorMessage;

      var isNumericWholeInput = $input.hasClass("numeric-whole");
      if (isNumericWholeInput) errorMessage = "Please enter a whole number";

      var isNumericMonetaryInput = $input.hasClass("numeric-monetary");
      if (isNumericMonetaryInput) errorMessage = "Please enter a monetary value";

      var isNumericDecimalInput = $input.hasClass("numeric-decimal");
      if (isNumericDecimalInput) errorMessage = "Please enter a number";

      var isNumericFullYear = $input.hasClass("numeric-full-year");
      if (isNumericFullYear) errorMessage = "Please enter a 4 digit year";

      var hasMinLimit = $input.attr('min') !== undefined;
      var hasMaxLimit = $input.attr('max') !== undefined;
      var hasDecimalMax = $input.data('decimal-max') !== undefined;

      if (hasDecimalMax) errorMessage += " with " + $input.data('decimal-max') + " decimal places max";

      if (hasMinLimit && hasMaxLimit) {
        errorMessage = errorMessage + " between " + $input.attr('min') + " and " + $input.attr('max');
      } else if (hasMinLimit) {
        errorMessage = errorMessage + " greater or equal to " + $input.attr('min');
      } else if (hasMaxLimit) {
        errorMessage = errorMessage + " lesser or equal to " + $input.attr('max');
      }

      errorMessage += ".";

      return errorMessage;

    }

    return "Invalid Value";

  };

};
