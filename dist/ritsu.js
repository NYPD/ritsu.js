/* ritsu.js v1.0.0 
 * Created 2017-01-19
 * Licensed under the MIT license
 * Source code can be found here: https://github.com/NYPD/ritsu 
 */

if (typeof jQuery === 'undefined' && typeof $ === 'undefined') {
  throw new Error('ritsu.js requires jQuery or a jQuery-compatible API');
}

var ritsu = (function() {
var rules = function() {

  var _rules = [];

  //Public Methods *************************************************************
  var getRuleByRuleClass = function(ruleClasses) {

    var isArray = Array.isArray(ruleClasses);
    var rule = null;

    for (var i = 0; i < _rules.length; i++) {

      var ruleDoesNotMatch = isArray ? ruleClasses.indexOf(_rules[i].ruleClass) === -1 : _rules[i].ruleClass !== ruleClasses;
      if (ruleDoesNotMatch) continue;

      rule = _rules[i];
      break;
    }
    return rule;
  };

  var addValidationRule = function(ruleTypeOrRules, ruleClass, validationFunction, errorMessageParam) {

    var isArray = Array.isArray(ruleTypeOrRules);
    var isRule = typeof ruleTypeOrRules === 'object' && !isArray;

    if (isArray || isRule) {

      if (isRule) ruleTypeOrRules = [ruleTypeOrRules];

      ruleTypeOrRules.forEach(function(rule) {
        _upsertValidationRule(rule.ruleType, rule.ruleClass, rule.validationFunction, rule.errorMessage);
      });

    } else {
      _upsertValidationRule(ruleTypeOrRules, ruleClass, validationFunction, errorMessageParam);
    }
  };

  //Private Methods ************************************************************
  var _Rule = function(ruleType, ruleClass, validationFunction, errorMessageFunction) {
    this.ruleType = ruleType;
    this.ruleClass = ruleClass;
    this.validate = validationFunction;
    this.getErrorMessage = errorMessageFunction;
  };

  var _upsertValidationRule = function(ruleType, ruleClass, validationFunction, errorMessageParam) {

    if (ruleType !== 'alpha' && ruleType !== 'numeric')
      throw new Error('The rule type for a new validation rule must be either "alpha" or "numeric"');

    if (typeof ruleClass !== 'string')
      throw new Error('The rule class for a new validation rule is missing or is not of type string');

    if (typeof validationFunction !== 'function')
      throw new Error('The validation function for a new validation rule is missing or is not of type function');

    if (errorMessageParam === undefined)
      errorMessageParam = new Function('', 'return "Invalid value";');

    if (typeof errorMessageParam === 'string')
      errorMessageParam = new Function('', 'return "' + errorMessageParam + '";');

    //Remove exsiting rule if found
    var rule = getRuleByRuleClass(ruleClass);
    if (rule !== null) {
      var ruleIndex = _rules.indexOf(rule);
      _rules.splice(ruleIndex, 1);
    }

    _rules.push(new _Rule(ruleType, ruleClass, validationFunction, errorMessageParam));

  };

  var _validateAlphaOnly = function(element) {

    var value = element.value;
    var noSpace = element.hasAttribute('data-no-space');

    /*
     * Any case insensitive Roman character with periods, dashes, and spaces (if allowed).
     *
     * e.g. cool | cool-beans | cool beans | beans.
     */
    var alphaOnlyRegexString = '^([A-Za-z@\.\-])+$';
    var alphaOnlyRegex = new RegExp(alphaOnlyRegexString.replace(/@/g, noSpace ? '' : '\\s'));

    return alphaOnlyRegex.test(value);
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

    var value = element.value;
    var noSpace = element.hasAttribute('data-no-space');

    /*
     * Any case insensitive Roman character, digit, and spaces (if allowed)
     *
     * e.g. Cool | C00l
     */
    var alphaNumericRegexString = '^([a-zA-Z0-9@]+)$';
    var alphaNumericRegex = new RegExp(alphaNumericRegexString.replace(/@/g, noSpace ? '' : '\\s'));

    return alphaNumericRegex.test(value);
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

    var value = element.value;
    var noThousandsSeparator = element.hasAttribute('data-no-thousands-separator');
    /*
     *  A negative or non negative number with optional thousands commas
     *
     *  e.g. 54 | -54 | -54,000 | 54000
     */
    var validNumericWhole = /^-?(([\d]{1,3}(,{1}[\d]{3})*)|[\d]+)$/.test(value);
    if (noThousandsSeparator) validNumericWhole = validNumericWhole && value.indexOf(',') === -1;

    return validNumericWhole;

  };

  var _getNumericWholeErrorMessage = function(element) {

    var errorMessage = 'Enter a whole number';

    var hasMinLimit = element.hasAttribute('min');
    var hasMaxLimit = element.hasAttribute('max');

    if (hasMinLimit && hasMaxLimit) {
      errorMessage = errorMessage + ' from ' + element.getAttribute('min') + ' to ' + element.getAttribute('max');
    } else if (hasMinLimit) {
      errorMessage = errorMessage + ' greater or equal to ' + element.getAttribute('min');
    } else if (hasMaxLimit) {
      errorMessage = errorMessage + ' lesser or equal to ' + element.getAttribute('max');
    }

    return errorMessage;
  };

  var _validateNumericDecimalString = function(element) {

    var value = element.value;
    var noThousandsSeparator = element.hasAttribute('data-no-thousands-separator');
    var decimalMax = element.getAttribute('data-decimal-max');
    if (decimalMax === null) decimalMax = 2;

    /*
     * A negative or non negative monetary amount with optional thousands commas and optional hundreds decimal place
     *
     * e.g. -54 | 54 | 54.00 | -54,544 | 54,544.54
     */
    var numericDecimalRegexString = '^-?((([\\d]{1,3}(,[\\d]{3})*)+(\\.[\\d]{1,decimalPlaces})?)|[\\d]+(\\.[\\d]{1,decimalPlaces})?)$';
    var numericDecimalRegex = new RegExp(numericDecimalRegexString.replace(/decimalPlaces/g, decimalMax));

    var validNumericDecimal = numericDecimalRegex.test(value);
    if (noThousandsSeparator) validNumericDecimal = validNumericDecimal && value.indexOf(',') === -1;

    return validNumericDecimal;
  };
  var _getNumericDecimalErrorMessage = function(element) {

    var errorMessage = 'Please enter a number';

    var hasMinLimit = element.hasAttribute('min');
    var hasMaxLimit = element.hasAttribute('max');

    var maxDecimals = element.hasAttribute('data-decimal-max') ? element.getAttribute('data-decimal-max') : 2;
    errorMessage += ' with ' + maxDecimals + ' decimal places max';

    if (hasMinLimit && hasMaxLimit) {
      errorMessage = errorMessage + ' and from ' + element.getAttribute('min') + ' to ' + element.getAttribute('max');
    } else if (hasMinLimit) {
      errorMessage = errorMessage + ' and greater or equal to ' + element.getAttribute('min');
    } else if (hasMaxLimit) {
      errorMessage = errorMessage + ' and lesser or equal to ' + element.getAttribute('max');
    }

    return errorMessage;
  };

  var _validateNumericFullYear = function(element) {
    /*
     * A four digit number
     *
     * e.g. 1999 | 2010 | 0000
     */
    return /^(\d{4})$/.test(element.value);
  };

  var _getNumericFullYearErrorMessage = function(element) {

    var errorMessage = 'Please enter a 4 digit year';

    var hasMinLimit = element.hasAttribute('min');
    var hasMaxLimit = element.hasAttribute('max');

    if (hasMinLimit && hasMaxLimit) {
      errorMessage = errorMessage + ' from ' + element.getAttribute('min') + ' to ' + element.getAttribute('max');
    } else if (hasMinLimit) {
      errorMessage = errorMessage + ' greater or equal to ' + element.getAttribute('min');
    } else if (hasMaxLimit) {
      errorMessage = errorMessage + ' lesser or equal to ' + element.getAttribute('max');
    }

    return errorMessage;
  };

  var _validateNumericJqueryDatePicker = function(element) {

    var $element = $(element);
    var isValid = $element.datepicker('getDate') !== null;

    return isValid;
  };

  //Add default rules
  _upsertValidationRule('alpha', 'alpha-only', _validateAlphaOnly, 'Only letters, spaces, hypens, and periods are allowed');
  _upsertValidationRule('alpha', 'alpha-zip', _validateAlphaZip, 'Enter a valid zip code');
  _upsertValidationRule('alpha', 'alpha-numeric', _validateAlphaNumeric, 'Enter only alphanumeric characters');
  _upsertValidationRule('alpha', 'alpha-email', _validateAlphaEmail, 'Make sure the email is correct');

  _upsertValidationRule('numeric', 'numeric-whole', _validateNumericWhole, _getNumericWholeErrorMessage);
  _upsertValidationRule('numeric', 'numeric-decimal', _validateNumericDecimalString, _getNumericDecimalErrorMessage);
  _upsertValidationRule('numeric', 'numeric-full-year', _validateNumericFullYear, _getNumericFullYearErrorMessage);
  _upsertValidationRule('numeric', 'numeric-jquery-date', _validateNumericJqueryDatePicker, 'Please select a date from the date picker');

  return {
    getRuleByRuleClass: getRuleByRuleClass,
    addValidationRule: addValidationRule
  };

};



var validation = function(rules) {

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

    var validInput = true;

    var isAlpha = element.classList.contains('alpha');
    var isNumeric = element.classList.contains('numeric');
    var isRequired = element.hasAttribute('required');

    var fieldValue = element.value;
    var isEmpty = $.trim(fieldValue) === '' || fieldValue === undefined;

    var noValidationNeeded = isEmpty && !isRequired;
    if (noValidationNeeded) return validInput;

    if (isAlpha) validInput = _validateAlphaField(element);
    if (isNumeric) validInput = _validateNumericField(element);
    if (!isAlpha && !isNumeric && isRequired) validInput = !isEmpty; //Anything is allowed, just can't be blank

    return validInput;
  };

  var _validateSelect = function(element) {

    var valueSelected = element.options[element.selectedIndex].value;
    var isRequired = element.hasAttribute('required');
    var isEmpty = $.trim(valueSelected) === '' || valueSelected === undefined;

    var validSelect = isEmpty && !isRequired || !isEmpty;

    return validSelect;

  };

  var _validateAlphaField = function(element) {
    var validAlpha = true;

    var validationPattern = element.getAttribute('pattern');
    var elementClassString = element.getAttribute('class');

    var hasValidationPattern = validationPattern !== null;
    //User supplied their own validation, use that instead
    if (hasValidationPattern) {
      var userRegex = new RegExp(validationPattern, 'u'); //unicode flag as that what the browser does with the pattern attribute
      return userRegex.test(element.value);
    }

    var elementHasNoClasses = elementClassString === null || elementClassString === '';
    if (elementHasNoClasses) return validAlpha; //No need to validate just exit early

    var elementClasses = elementClassString.split(' ');

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule === null) return validAlpha; //No rule found, so just exit

    validAlpha = rule.validate(element);

    return validAlpha;
  };

  var _validateNumericField = function(element) {

    var validNumeric = true;

    var validationPattern = element.getAttribute('pattern');
    var hasValidationPattern = validationPattern !== null;

    //User supplied their own validation, use that instead
    if (hasValidationPattern) {
      var userRegex = new RegExp(validationPattern, 'u'); //unicode flag as that what the browser does with the pattern attribute
      validNumeric = userRegex.test(element.value);
    } else {
      var elementClassString = element.getAttribute('class');
      var elementClasses = elementClassString ? elementClassString.split(' ') : ''; //In case there is no classes, make it empty strings for null safety

      var rule = rules.getRuleByRuleClass(elementClasses);
      if (rule !== null) validNumeric = rule.validate(element);
    }

    //If it is still valid, check min and max if it has any
    if (validNumeric) {
      /*
       * I know javascript auto converts strings into numbers when using "non stirct equality" operators,
       * but do this excplicity to show intention. (This is prob overkill idk)
       *
       * This won't work in locales that use commas as decimal places.
       */
      var fieldValueAsNum = Number(element.value.replace(',', ''));
      if (isNaN(fieldValueAsNum)) return validNumeric; //Not a number, just return

      var minAttr = element.getAttribute('min');
      var maxAttr = element.getAttribute('max');

      var minLimit = (minAttr === '' || minAttr === null) ? null : Number(minAttr);
      var maxLimit = (maxAttr === '' || maxAttr === null) ? null : Number(maxAttr);

      var hasMinLimit = minLimit !== null;
      var hasMaxLimit = maxLimit !== null;

      if (hasMinLimit && hasMaxLimit) {
        validNumeric = fieldValueAsNum >= minLimit && fieldValueAsNum <= maxLimit;
      } else if (hasMinLimit) {
        validNumeric = fieldValueAsNum >= minLimit;
      } else if (hasMaxLimit) {
        validNumeric = fieldValueAsNum <= maxLimit;
      }
    }

    return validNumeric;
  };

  return {
    validateElement: validateElement
  };

};



var core = function(rules, validation) {

  var useBootstrap3Stlying = false;
  var autoMarkInvalidFields = true;
  var autoShowErrorMessages = false;

  var initialize = function(options) {

    var invalidOptions = typeof options !== 'object';
    if (invalidOptions) throw new Error('Invalid options to initialize ritsu.js');

    useBootstrap3Stlying = options.useBootstrap3Stlying === undefined ? false : options.useBootstrap3Stlying;
    autoMarkInvalidFields = options.autoMarkInvalidFields === undefined ? true : options.autoMarkInvalidFields;
    autoShowErrorMessages = options.autoShowErrorMessages === undefined ? false : options.autoShowErrorMessages;

    var validationRules = options.validationRules;
    if (validationRules !== undefined) rules.addValidationRule(validationRules);

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
        var initialValue = hasFileAttached ? this.files[0].name + this.files[0].size : undefined;

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
        valueChanged = $this.data('initialValue') != (hasFileAttached ? this.files[0].name + this.files[0].size : $this.data('simple-file-hash'));
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

      var errorMessage = _getErrorMessageForInput(this);

      if (useBootstrap3Stlying) {

        var $formGroup = $this.closest('.form-group');
        var $helpBlock = $formGroup.find('.help-block');

        var hasHelpBlock = $helpBlock.length > 0;

        if (hasHelpBlock)
          $helpBlock.prepend('<b class="ritsu-error"><em>' + errorMessage + '</em></b><br class="ritsu-error">');
        else
          $formGroup.append('<span class="help-block ritsu-error"><b><em>' + errorMessage + '</em></b></span>');


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
      $input.closest('.form-group').find('.ritsu-error').remove(); //Will find either the <b><em> and <br> or remove the <span> help block
      return;
    }

    var $labelParent = $input.closest('.error-label-container');
    if ($labelParent.length === 0) $labelParent = $input.parent();
    $labelParent.find('.error-label, .warning-label').remove();

  };

  var _getErrorMessageForInput = function(element) {

    var isDropdown = element.nodeName === 'SELECT';
    if (isDropdown) return 'Please select an option'; //Selects do not have rules

    var elementHasErrorMessageAttr = element.hasAttribute('data-error-message');
    if (elementHasErrorMessageAttr) return element.getAttribute('data-error-message');

    var errorMessage = 'Invalid Value';

    var elementClassString = element.getAttribute('class');

    var elementHasNoClasses = elementClassString === null || elementClassString === '';
    if (elementHasNoClasses) return errorMessage; //Element has no classes for some reason, so no rule wil be found

    var elementClasses = elementClassString.split(' ');

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule !== null) errorMessage = rule.getErrorMessage(element);

    return errorMessage;

  };

  return {
    rules: rules, //Access to the Rules API

    initialize: initialize,
    storeInitialFormValues: storeInitialFormValues,
    isFormDirty: isFormDirty,
    validate: validate,
    markInvalidFields: markInvalidFields,
    showErrorMessages: showErrorMessages

  };

};


return core(rules(), validation(rules()));
})();
