/* ritsu.js v0.2.0 
 * Created 2016-10-05
 * Licensed under the MIT license
 * Source code can be found here: https://github.com/NYPD/ritsu 
 */

var rules = (function(element) {

  //Private Methods ************************************************************
  var _validateAlphaOnly = function(element) {
    /*
     * Any case insensitive Roman character with periods, dashes, and spaces.
     *
     * e.g. cool | cool-beans | cool beans | beans.
     */
    return /^([A-Za-z\s\.\-])+$/.test(element.value);
  };

  var _validateAlphaZip = function(element) {
    /*
     * Matches all Canadian or American postal codes with different formats. For USA it is:
     * any 5 digits followed optionally by an optional space or dash or empty string and any 4 digits after the optional
     * space or dash. For Canada it is: certain capital letters (only one), any digit (only one), any capital letter (only one),
     * optional space, any digit (only one), any capitol letter (only one), and and digit (only one).
     *
     * e.g. 19608 | 19608-8911 | A9C1A1 | A9C 1A1
     *
     */
    return /(^\d{5}([\s-]?\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} ?\d{1}[A-Z]{1}\d{1}$)/.test(element.value);
  };

  var _validateAlphaNumeric = function(element) {
    /*
     * Any case insensitive Roman character and digit
     *
     * e.g. Cool | C00l
     */
    return /^([a-zA-Z0-9]+)$/.test(element.value);
  };


  var _validateAlphaEmail = function(element) {
    /*
     * One or more non space charater + literal '@', + One or more non space charater + literal '.' + One or more non space charater.
     * It does not check tld and special chacter validity.
     *
     * e.g. a@a.a | bob@google.com | cool-beans@beans.com.uk | $#%@$%@$.com
     */
    return /^(\S+@\S+\.\S+)$/.test(element.value);
  };


  var _validateNumericWhole = function(element) {
    /*
     *  A negative or non negative number with optional thousands commas
     *
     *  e.g. 54 | -54 | -54,000 | 54000
     */
    return /^-?(([\d]{1,3}(,{1}[\d]{3})*)|[\d]+)$/.test(element.value);
  };

  var _validateNumericMonetary = function(element) {
    /*
     * A negative or non negative monetary amount with optional thousands commas and optional hundreds decimal place
     *
     * e.g. -54 | 54 | 54.00 | -54,544 | 54,544.54
     */
    return /^((-?[\d]{1,3}(,[\d]{3})*(\.[\d]{2})*)|-?[\d]+(\.[\d]{2})?)$/.test(element.value);
  };

  /*
   * Takes an optional decimalPlaces integer (defaults to 2 if not provided)
   */
  var _validateNumericDecimalString = function(element) {

    var decimalMax = element.getAttribute("data-decimal-max");
    if (decimalMax === null) decimalMax = 2;

    /*
     * Any negative or non negative number amount with optional thousands commas and optional hundreds decimal place
     *
     * e.g. (undefined) -54 | (1) 54.1 | (undefined) 54.00 | (undefined) -54,544 | (8) 54,544.54231541
     */
    var numericDecimalRegexString = "^-?((([\\d]{1,3}(,[\\d]{3})*)+(\\.[\\d]{1,decimalPlaces})?)|[\\d]+(\\.[\\d]{1,decimalPlaces})?)$";
    var numericDecimalRegex = new RegExp(numericDecimalRegexString.replace(/decimalPlaces/g, decimalMax));

    return numericDecimalRegex.test(element.value);
  };

  var _validateNumericFullYear = function(element) {
    /*
     * A four digit number
     *
     * e.g. 1999 | 2010 | 0000
     */
    return /^(\d{4})$/.test(element.value);
  };

  var _validateNumericJqueryDatePicker = function(element) {

    var $element = $(element);

    var isValid = $element.datepicker("getDate") !== null;

    var isNoPastDate = element.hasAttribute('data-no-past-date');

    if (isNoPastDate && isValid) {
      var date = new Date();
      var dateWithNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      validNumeric = $element.datepicker('getDate').getTime() >= dateWithNoTime.getTime();
    }

    return isValid;
  };

  var _Rule = function(ruleType, ruleClass, validationFunction) {
    this.ruleType = ruleType;
    this.ruleClass = ruleClass;
    this.validate = validationFunction;
  };

  var _rules = [
    new _Rule("alpha", "alpha-only", _validateAlphaOnly),
    new _Rule("alpha", "alpha-zip", _validateAlphaZip),
    new _Rule("alpha", "alpha-numeric", _validateAlphaNumeric),
    new _Rule("alpha", "alpha-email", _validateAlphaEmail),
    new _Rule("numeric", "numeric-whole", _validateNumericWhole),
    new _Rule("numeric", "numeric-monetary", _validateNumericMonetary),
    new _Rule("numeric", "numeric-decimal", _validateNumericDecimalString),
    new _Rule("numeric", "numeric-full-year", _validateNumericFullYear),
    new _Rule("numeric", "numeric-jquery-date", _validateNumericJqueryDatePicker)
  ];

  var _addNewValidationRule = function(ruleType, ruleClass, validationFunction) {

    if (ruleType !== "alpha" && ruleType !== "numeric")
      throw new Error('The rule type for a new validation rule must be either "alpha" or ""');

    if (typeof ruleClass !== "string")
      throw new Error('The rule class for a new validation rule is missing or is not of type string');

    if (typeof validationFunction !== "function")
      throw new Error('The validation function for a new validation rule is missing or is not of type function');

    var rule = new _Rule(ruleType, ruleClass, validationFunction);
    _rules.push(rule);
  };

  //Public Methods *************************************************************
  var getRuleByRuleClass = function(ruleClasses) {

    var isArray = Array.isArray(ruleClasses);
    var rule = null;

    for (var i = 0; i < _rules.length; i++) {

      var ruleDoesNotMatch = isArray ? ruleClasses.indexOf(_rules[i].ruleClass) === -1 : _rules[i].ruleClass !== ruleClass;
      if (ruleDoesNotMatch) continue;

      rule = _rules[i];
      break;
    }
    return rule;
  };

  var addOrUpdateValidationRule = function(ruleClass, validationFunction, ruleType) {
    var rule = getRuleByRuleClass(ruleClass);

    if (rule === null) {
      _addNewValidationRule(ruleType, ruleClass, validationFunction);
    } else {
      rule.ruleClass = ruleClass;
      rule.validate = validationFunction;
    }
  };

  return {
    getRuleByRuleClass: getRuleByRuleClass,
    addOrUpdateValidationRule: addOrUpdateValidationRule
  };

})();

var validation = (function() {

  var validateElement = function(element) {

    var $element = $(element);
    var validElement = true;

    var isDisabled = $element.prop('disabled') === true;
    if (isDisabled) return validElement; //No need to validate just exit early

    var isInputOrTextarea = $element.is('input, textarea');
    var isSelect = $element.is('select');

    if (isInputOrTextarea) validElement = _validateInput(element);
    if (isSelect) validElement = _validateSelect(element);

    return validElement;

  };

  //Private Methods ************************************************************
  var _validateInput = function(element) {

    var $element = $(element);

    var validInput = true;

    var isAlpha = $element.hasClass("alpha");
    var isNumeric = $element.hasClass("numeric");
    var isOptional = $element.hasClass("optional");

    var fieldValue = $element.val();
    var isEmpty = $.trim(fieldValue) === "" || fieldValue === undefined;

    var noValidationNeeded = isEmpty && isOptional;
    if (noValidationNeeded) return validInput;

    if (isAlpha) validInput = _validateAlphaField(element);
    if (isNumeric) validInput = _validateNumericField(element);

    return validInput;
  };

  var _validateSelect = function(element) {

    var $element = $(element);

    var valueSelected = $element.val();
    var isOptional = $element.hasClass('optional');
    var isEmpty = $.trim(valueSelected) === "" || valueSelected === undefined;

    var validSelect = isOptional && isEmpty || !isEmpty;

    return validSelect;

  };

  var _validateAlphaField = function(element) {
    var validAlpha = true;

    var elementClassString = element.getAttribute('class');

    var elementHasNoClasses = elementClassString === null;
    if (elementHasNoClasses) return validAlpha; //No need to validate just exit early

    var elementClasses = elementClassString.split(' ');

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule === null) return validAlpha; //No rule found, so just exit

    validAlpha = rule.validate(element);

    return validAlpha;
  };

  var _validateNumericField = function(element) {

    var validNumeric = true;

    var elementClassString = element.getAttribute('class');

    var elementHasNoClasses = elementClassString === null;
    if (elementHasNoClasses) return validNumeric; //No need to validate just exit early

    var elementClasses = elementClassString.split(' ');

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule === null) return validNumeric; //No rule found, so just exit

    validNumeric = rule.validate(element);

    if (validNumeric) {
      /*
       * I know javascript auto converts strings into numbers when using "non stirct equality" operators,
       * but do this excplicity to show intention. (This is prob overkill idk)
       *
       * This won't work in locales that use commas as decimal places.
       */
      var fieldValueAsNum = Number(element.value.replace(',', ''));

      var minAttr = $.trim(element.getAttribute("min"));
      var maxAttr = $.trim(element.getAttribute("max"));

      var minLimit = (minAttr === "" || minAttr === null) ? null : Number(minAttr);
      var maxLimit = (maxAttr === "" || maxAttr === null) ? null : Number(maxAttr);

      var hasMinLimit = minLimit !== null;
      var hasMaxLimit = maxLimit !== null;

      if (hasMinLimit && hasMaxLimit) {
        validNumeric = fieldValue >= minLimit || fieldValue <= maxLimit;
      } else if (hasMinLimit) {
        validNumeric = fieldValue >= minLimit;
      } else if (hasMaxLimit) {
        validNumeric = fieldValue <= maxLimit;
      }
    }

    return validNumeric;
  };

  return {
    validateElement: validateElement
  };

})();

if (typeof jQuery === 'undefined' || typeof $ === 'undefined') {
  throw new Error('ritsu.js requires jQuery or a jQuery-compatible API');
}

var ritsu = (function() {

  var useBootstrap3Stlying = false;
  var autoMarkInvalidFields = true;
  var autoShowErrorMessages = false;

  var initialize = function(options) {

    var invalidOptions = typeof options !== "object";
    if (invalidOptions) throw "Invalid options to initialize ritsu.js";

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
        var initialValue = hasFileAttached ? this.files[0].name + this.files[0].size + this.files[0].lastModified : "";

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
        $errorSelector.addClass("has-error");
      } else {
        $errorSelector.removeClass("has-error");
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
        errorMessage = errorMessage + " from " + $input.attr('min') + " to " + $input.attr('max');
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

  return {
    initialize: initialize,
    storeInitialFormValues: storeInitialFormValues,
    isFormDirty: isFormDirty,
    validate: validate,
    markInvalidFields: markInvalidFields,
    showErrorMessages: showErrorMessages
  };

})();
