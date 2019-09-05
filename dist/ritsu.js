/* ritsu.js v1.5.0 
 * Created 2019-09-04
 * Licensed under the MIT license
 * Source code can be found here: https://github.com/NYPD/ritsu 
 */

var ritsu = (function() {
var rules = function rules() {

  var _rules = [];

  //Public Methods *************************************************************
  var getRuleByRuleClass = function getRuleByRuleClass(ruleClasses) {

    var notAnArray = !Array.isArray(ruleClasses);
    if (notAnArray) return _rules[ruleClasses] === undefined ? null : _rules[ruleClasses];

    var ruleToFind = null;
    ruleClasses.some(function(ruleClass) {

      if (_rules[ruleClass] === undefined) return false;

      ruleToFind = _rules[ruleClass];
      return true;

    });

    return ruleToFind;

  };

  var addValidationRule = function addValidationRule(ruleTypeOrRules, ruleClass, validationFunction, errorMessageParam) {

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
  var _Rule = function _Rule(ruleType, ruleClass, validationFunction, errorMessageFunction) {
    this.ruleType = ruleType;
    this.ruleClass = ruleClass;
    this.validate = validationFunction;
    this.getErrorMessage = errorMessageFunction;
  };

  var _upsertValidationRule = function _upsertValidationRule(ruleType, ruleClass, validationFunction, errorMessageParam) {

    if (ruleType !== 'alpha' && ruleType !== 'numeric')
      throw new Error('The rule type for a new validation rule must be either "alpha" or "numeric"');

    if (typeof ruleClass !== 'string')
      throw new Error('The rule class for a new validation rule is missing or is not of type string');

    if (typeof validationFunction !== 'function')
      throw new Error('The validation function for a new validation rule is missing or is not of type function');

    if (errorMessageParam === undefined)
      errorMessageParam = function defaultErrorMessage() { return 'Invalid value'; };

    if (typeof errorMessageParam === 'string') {
      var customErrorMessage = errorMessageParam;
      errorMessageParam = function defaultCustomErrorMessage() { return customErrorMessage; };
    }

    //Remove exsiting rule if found
    var rule = getRuleByRuleClass(ruleClass);
    if (rule !== null) {
      var ruleIndex = _rules.indexOf(rule);
      _rules.splice(ruleIndex, 1);
    }

    _rules[ruleClass] = new _Rule(ruleType, ruleClass, validationFunction, errorMessageParam);

  };

  var _validateAlphaOnly = function _validateAlphaOnly(element) {

    var value = element.value;
    var noSpace = element.hasAttribute('data-no-space');

    /*
     * Any case insensitive Roman character with periods, dashes, and spaces (if allowed).
     *
     * e.g. cool | cool-beans | cool beans | beans.
     */
    var alphaOnlyRegexString = '^([A-Za-z@.-])+$';
    var alphaOnlyRegex = new RegExp(alphaOnlyRegexString.replace(/@/g, noSpace ? '' : '\\s'));

    return alphaOnlyRegex.test(value);
  };

  var _validateAlphaZip = function _validateAlphaZip(element) {
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

  var _validateAlphaNumeric = function _validateAlphaNumeric(element) {

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


  var _validateAlphaEmail = function _validateAlphaEmail(element) {
    /*
     * One or more non space charater + literal '@', + One or more non space charater + literal '.' + One or more non space charater.
     * It does not check tld and special chacter validity.
     *
     * e.g. a@a.a | bob@google.com | cool-beans@beans.com.uk | $#%@$%@$.com
     */
    return /^(\S+@\S+\.\S+)$/.test(element.value);
  };


  var _validateNumericWhole = function _validateNumericWhole(element) {

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

  var _getNumericWholeErrorMessage = function _getNumericWholeErrorMessage(element) {

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

  var _validateNumericDecimalString = function _validateNumericDecimalString(element) {

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
  var _getNumericDecimalErrorMessage = function _getNumericDecimalErrorMessage(element) {

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

  /**
   * @deprecated Since v1.3.0. Use numeric-whole instead and specify a min/max on the element
   */
  var _validateNumericFullYear = function _validateNumericFullYear(element) {
    /*
       * A four digit number
       *
       * e.g. 1999 | 2010 | 0000
       */
    // eslint-disable-next-line no-console
    console.warn(
      'numeric-full-year has been deprecated since v1.3.0. Use numeric-whole instead and specify a min/max on the element'
    );
    return /^(\d{4})$/.test(element.value);
  };


  var _getNumericFullYearErrorMessage = function _getNumericFullYearErrorMessage(element) {

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

  var _validateNumericJqueryDatePicker = function _validateNumericJqueryDatePicker(element) {

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



var validation = function validation(rules) {

  var validateElement = function validateElement(element) {

    var validElement = true;

    var isDisabled = element.disabled === true;
    if (isDisabled) return validElement; //No need to validate just exit early

    var isInputOrTextarea = ['INPUT', 'TEXTAREA'].indexOf(element.nodeName) > -1;
    var isSelect = element.nodeName === 'SELECT';

    if (isInputOrTextarea) validElement = _validateInput(element);
    if (isSelect) validElement = _validateSelect(element);

    return validElement;

  };

  //Private Methods ************************************************************
  var _validateInput = function _validateInput(element) {

    var validInput = true;

    var isHidden = element.type === 'hidden';
    if (isHidden) return validInput;

    var isAlpha = element.classList.contains('alpha');
    var isNumeric = element.classList.contains('numeric');
    var isFile = element.type === 'file';
    var isRequired = element.hasAttribute('required');

    var fieldValue = element.value;
    var isEmpty = fieldValue === undefined || fieldValue.trim() === '';

    var validationPattern = element.getAttribute('pattern');

    var hasValidationPattern = validationPattern !== null;
    if (hasValidationPattern) {

      if (isEmpty && !isRequired) return validInput;

      var userRegex;

      try {
        userRegex = new RegExp(validationPattern, 'u');
      } catch (exception) {
        userRegex = new RegExp(validationPattern);
      }

      return userRegex.test(fieldValue);
    }

    var noValidationNeeded = isEmpty && !isRequired && !isFile; //Cant check value of file inputs like this, let the _validateFileField() do it
    if (noValidationNeeded) return validInput;

    if (isAlpha) validInput = _validateAlphaField(element);
    if (isNumeric) validInput = _validateNumericField(element);
    if (isFile) validInput = _validateFileField(element);
    if (!isAlpha && !isNumeric && !isFile && isRequired) validInput = !isEmpty; //Anything is allowed, just can't be blank

    return validInput;
  };

  var _validateSelect = function _validateSelect(element) {
    //If nothing is selected or there is no options, make the value undefined to avoid a TypeError
    var valueSelected = element.selectedIndex === -1 ? undefined : element.options[element.selectedIndex].value;
    var isRequired = element.hasAttribute('required');
    var isEmpty = valueSelected === undefined || valueSelected.trim() === '';

    var validSelect = isEmpty && !isRequired || !isEmpty;

    return validSelect;

  };

  var _validateFileField = function _validateFileField(element) {
    var validFile = true;

    var isNotRequired = !element.hasAttribute('required');
    if (isNotRequired) return validFile; //We dont care at all if it is not required (we cant eve validate it)

    var simpleFileHash = element.getAttribute('data-simple-file-hash');

    var noSimpleFileHash = !(simpleFileHash !== null && simpleFileHash.trim() !== '');
    var noFilesAttached = element.files.length === 0;

    if (noFilesAttached && noSimpleFileHash) validFile = false;
    return validFile;
  };

  var _validateAlphaField = function _validateAlphaField(element) {

    var validAlpha = true;

    var isRequired = element.hasAttribute('required');
    var elementClassString = element.getAttribute('class');
    var elementClasses = elementClassString.split(' ');

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule === null && !isRequired) return validAlpha; //No rule found and not required, so just exit
    if (rule === null && isRequired) { //No rule found and IS required
      console.warn('No ritsu rule found for the "alpha" input, add the appropriate alpha validation rule');
      return false; 
    }

    validAlpha = rule.validate(element);

    return validAlpha;
  };

  var _validateNumericField = function _validateNumericField(element) {

    var validNumeric = true;

    var isRequired = element.hasAttribute('required');
    var elementClassString = element.getAttribute('class');
    var elementClasses = elementClassString ? elementClassString.split(' ') : ''; //In case there is no classes, make it empty strings for null safety

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule === null && !isRequired) return validNumeric; //No rule found and not required, so just exit
    if (rule === null && isRequired) { //No rule found and IS required
      console.warn('No ritsu rule found for the "numeric" input, add the appropriate alpha validation rule');
      return false; 
    }
    
    validNumeric = rule.validate(element);

    //If it is still valid, check min and max if it has any
    if (validNumeric) {
      /*
       * I know javascript auto converts strings into numbers when using "non stirct equality" operators,
       * but do this excplicity to show intention. (This is prob overkill idk)
       *
       * This won't work in locales that use commas as decimal places.
       */
      var fieldValueAsNum = Number(element.value.replace(',', ''));
      if (Number.isNaN(fieldValueAsNum)) return validNumeric; //Not a number, just return

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



var core = function core(rules, validation) {

  var version = '1.5.0';
  var jQueryIsPresent = typeof jQuery !== 'undefined';
  var defaultOptions = {
    useBootstrap: false,
    useBootstrap3Stlying: false,
    useBootstrap4Stlying: false,
    autoMarkInvalidFields: true,
    autoShowErrorMessages: false,
    messageCallback: null
  };

  var initialize = function initilaize(options) {

    var invalidOptions = typeof options !== 'object';
    if (invalidOptions) throw new Error('Invalid options to initialize ritsu.js');

    defaultOptions.useBootstrap3Stlying = options.useBootstrap3Stlying === undefined ? false : options.useBootstrap3Stlying;
    defaultOptions.useBootstrap4Stlying = options.useBootstrap4Stlying === undefined ? false : options.useBootstrap4Stlying;
    defaultOptions.autoMarkInvalidFields = options.autoMarkInvalidFields === undefined ? true : options.autoMarkInvalidFields;
    defaultOptions.autoShowErrorMessages = options.autoShowErrorMessages === undefined ? false : options.autoShowErrorMessages;

    defaultOptions.useBootstrap = defaultOptions.useBootstrap3Stlying || defaultOptions.useBootstrap4Stlying;

    if (options.messageCallback === undefined) {
      defaultOptions.messageCallback = null;
    } else {
      if (typeof options.messageCallback !== 'function') throw new Error('messageCallback is not a function');
      defaultOptions.messageCallback = options.messageCallback;
    }

    var validationRules = options.validationRules;
    if (validationRules !== undefined) rules.addValidationRule(validationRules);

    return this;
  };

  var storeInitialFormValues = function storeInitialFormValues(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      var isCheckbox = element.type === 'checkbox';
      var isRadio = element.type === 'radio';
      var isFile = element.type === 'file';

      if (isCheckbox || isRadio) {
        element.setAttribute('data-initial-value', element.checked);
      } else if (isFile) {

        var hasSimpleFileHash = element.getAttribute('data-simple-file-hash') !== undefined;

        if (hasSimpleFileHash) {
          element.setAttribute('data-initial-value', element.getAttribute('data-simple-file-hash'));
          return true;
        }

        var hasFileAttached = element.files.length > 0;
        var initialValue = hasFileAttached ? element.files[0].name + element.files[0].size : undefined;

        element.setAttribute('data-initial-value', initialValue);

      } else {
        element.setAttribute('data-initial-value', element.value);
      }

    });

    return this;
  };

  var getInitialFormValue = function getInitialFormValue(selector) {

    var elementArray = _getSelectorAsElementArray(selector);
    if (elementArray.length === 0) return null;

    return elementArray[0].getAttribute('data-initial-value');

  };

  var resetInitialFormValues = function resetInitialFormValues(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    var initialValueElements = elementArray.reduce(function(accumulator, element) {

      var hasInitialValue = element.hasAttribute('data-initial-value');
      if (hasInitialValue) accumulator.push(element);

      return accumulator;

    }, []);

    initialValueElements.forEach(function(element) {

      var isCheckbox = element.type === 'checkbox';
      var isRadio = element.type === 'radio';
      var isFile = element.type === 'file';
      var intialValue = element.getAttribute('data-initial-value');

      if (isCheckbox || isRadio) {
        element.checked = intialValue == 'true';
      } else if (isFile) {

        var newElement = element.cloneNode(true);
        newElement.removeAttribute('data-initial-value');
        newElement.removeAttribute('data-simple-file-hash');

        element.parentNode.replaceChild(newElement, element);

      } else {
        element.value = intialValue;
      }

    });

    return this;
  };

  var isFormDirty = function isFormDirty(selector) {

    var isDirty = false;

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      var noInitialValue = element.getAttribute('data-initial-value') === undefined;
      if (noInitialValue) return true;

      var isCheckbox = element.type === 'checkbox';
      var isRadio = element.type === 'radio';
      var isFile = element.type === 'file';

      var valueChanged = false;

      var intialValue = element.getAttribute('data-initial-value');

      if (isCheckbox || isRadio) {
        valueChanged = intialValue != String(element.checked); //Need to convert it to a string to properly compare, since JS does not convert string to boolean for us http://www.ecma-international.org/ecma-262/5.1/#sec-11.9.3
      } else if (isFile) {
        var hasFileAttached = element.files.length > 0;
        valueChanged = intialValue !== (hasFileAttached ? element.files[0].name + element.files[0].size : element.getAttribute('data-simple-file-hash'));
      } else {
        valueChanged = intialValue !== element.value;
      }

      //If one value has changed, mark the entire form dirty and return right away
      if (valueChanged) {
        isDirty = true;
        return false;
      }

    });

    return isDirty;
  };

  var validate = function validate(selector, messageCallback) {

    var messageCallbackProvided = messageCallback !== undefined;
    var elementArray = _getSelectorAsElementArray(selector);

    var isValid = true;

    elementArray.forEach(function(element) {

      var invalidElement = !validation.validateElement(element);

      if (defaultOptions.messageCallback !== null || messageCallbackProvided) {

        if (messageCallbackProvided)
          _handlemessageCallback(element, messageCallback, invalidElement);
        else
          _handlemessageCallback(element, defaultOptions.messageCallback, invalidElement);

      }

      //Sets the entire form to false, just because their was at least 1 invalid field
      if (invalidElement) {
        isValid = false;
        element.setAttribute('data-invalid', true);
      } else {
        element.setAttribute('data-invalid', false);

        //If there is no callback go ahead and de the default remove error message
        if (defaultOptions.messageCallback === null && !messageCallbackProvided) _removeErrorMessage(element);
      }

    });

    //If an messageCallback is provided use that always regardless of the "auto" settings
    if (defaultOptions.messageCallback === null && !messageCallbackProvided) _defaultmessageCallback(elementArray);

    return isValid;
  };

  var markInvalidFields = function markInvalidFields(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      var isInvalid = element.getAttribute('data-invalid') === 'true';
      var useBootstrap4Stlying = defaultOptions.useBootstrap4Stlying;

      var errorElement = defaultOptions.useBootstrap3Stlying ? _getClosestParentByClass(element, 'form-group') : element;
      //If the user is using bootstrap and does not have the input in a form-group for some reason
      if (errorElement === null) errorElement = element;
      //The error class is the same for Bootstrap 3 and vanilla
      var errorElementClassToUse = defaultOptions.useBootstrap4Stlying ? 'is-invalid' : 'has-error';

      //These two vars are used only for Bootstrap 4
      var nextSibling  = element.nextElementSibling;
      var hasNextSibling = nextSibling !== undefined && nextSibling !== null;

      if (isInvalid) {
        errorElement.classList.add(errorElementClassToUse);
        if (useBootstrap4Stlying && hasNextSibling) nextSibling.classList.add('invalid-feedback');
      }
      else {
        errorElement.classList.remove(errorElementClassToUse);
        if (useBootstrap4Stlying && hasNextSibling) nextSibling.classList.remove('invalid-feedback');
      }
    });

    return this;
  };

  var getErrorMessage = function getErrorMessage(selector) {

    if (selector === undefined)
      throw new Error('No selector passed in');

    var errorMessages = getErrorMessages(selector);
    return errorMessages[0] === undefined ? null : errorMessages[0];
  };

  var getErrorMessages = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    var errorMessages = [];

    elementArray.forEach(function(element) {
      var isInvalid = element.getAttribute('data-invalid') === 'true';
      if (isInvalid) errorMessages.push(_getErrorMessageForInput(element));
    });

    return errorMessages;

  };

  /**
   * @deprecated since v1.4.0
   */
  var getErrorMessagesAsMap = function getErrorMessagesAsMap(selector) {

    // eslint-disable-next-line no-console
    console.warn(
      'getErrorMessagesAsMap has been deprecated since v1.4.0. Use getErrorMessagesAsObjects instead.'
    );

    var elementArray = _getSelectorAsElementArray(selector);

    var errorMessageMap = {};

    elementArray.forEach(function(element) {
      var isInvalid = element.getAttribute('data-invalid') === 'true';
      if (isInvalid) errorMessageMap[element] = _getErrorMessageForInput(element);
    });

    return errorMessageMap;

  };

  var getErrorMessagesAsObjects = function getErrorMessagesAsMap(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    var invalidErrorObjects = elementArray.reduce(function(accumulator, element) {

      var isInvalid = element.getAttribute('data-invalid') === 'true';
      if (isInvalid) {
        accumulator.push({
          'input': element,
          'errorMessage': _getErrorMessageForInput(element)
        });
      }

      return accumulator;

    }, []);

    return invalidErrorObjects;

  };

  var showErrorMessages = function showErrorMessages(selector, messageCallback) {

    var elementArray = _getSelectorAsElementArray(selector);
    var messageCallbackProvided = messageCallback !== undefined;

    var invalidElements = elementArray.reduce(function(accumulator, element) {

      var isInvalid = element.getAttribute('data-invalid') === 'true';

      if (defaultOptions.messageCallback !== null || messageCallbackProvided) {
        _handlemessageCallback(element, messageCallbackProvided ? messageCallback : defaultOptions.messageCallback, isInvalid);
      } else {
        _removeErrorMessage(element); //Remove any previous old error messages
      }

      if (isInvalid) accumulator.push(element);

      return accumulator;

    }, []);

    invalidElements.forEach(function(invalidElement) {

      var errorMessage = _getErrorMessageForInput(invalidElement);
      var formGroup = _getClosestParentByClass(invalidElement, 'form-group');

      var useBootstrapStlying = defaultOptions.useBootstrap3Stlying || defaultOptions.useBootstrap4Stlying;

      if (useBootstrapStlying && formGroup != null) {

        if (defaultOptions.useBootstrap4Stlying) {

          var small = document.createElement('small');
          small.innerHTML = errorMessage;
          small.className = 'ritsu-error invalid-feedback';
          formGroup.insertBefore(small, invalidElement.nextSibling);

        } else {

          var helpBlock = formGroup.querySelector('.help-block');
          var hasHelpBlock = helpBlock !== null;

          var em = document.createElement('em');
          em.innerHTML = errorMessage;

          var b = document.createElement('b');

          //If it already has a help text node, add the error message indide it without messing up what is already there
          if (hasHelpBlock) {

            var br = document.createElement('br');
            br.className = 'ritsu-error';

            b.className = 'ritsu-error';
            b.appendChild(em);
            b.appendChild(br);

            helpBlock.insertBefore(b, helpBlock.firstChild);
          } else {

            b.appendChild(em);

            var helpTextNode = document.createElement('span');
            helpTextNode.className = 'ritsu-error help-block';
            helpTextNode.appendChild(b);

            invalidElement.parentElement.appendChild(helpTextNode);
          }
        }

      } else {

        var elementId = invalidElement.getAttribute('id');

        var label = document.createElement('label');
        label.className = 'error-label ritsu-error';
        label.htmlFor = elementId || '';
        label.innerHTML = errorMessage;

        var closestFormGroup = _getClosestParentByClass(invalidElement, 'form-group');
        var errorContainer = closestFormGroup === null ? invalidElement.parentElement : closestFormGroup;

        errorContainer.appendChild(label);

      }

    });

    return this;
  };

  //Private Methods ************************************************************

  // Return an empty array if nothing is found
  var _getSelectorAsElementArray = function _getSelectorAsElementArray(selector) {

    var isJquery = jQueryIsPresent ? selector instanceof jQuery : false;
    if (isJquery) selector = selector.get();

    var selectorUndefined = selector === undefined;
    if (selectorUndefined) selector = Array.prototype.slice.call(document.querySelectorAll('input, textarea, select'));

    var isStringSelector = typeof selector === 'string';
    if (isStringSelector) selector = Array.prototype.slice.call(document.querySelectorAll(selector));

    var isNodeListOrHtmlCollection = selector instanceof NodeList || selector instanceof HTMLCollection;
    if (isNodeListOrHtmlCollection) selector = Array.prototype.slice.call(selector);

    var isNotArray = !Array.isArray(selector);
    if (isNotArray) selector = [selector];

    var noElements = selector.length === 0;
    if (noElements) return []; // return empty array to prevent kabooms in the console

    var containerInputs = [];

    selector.forEach(function(element) {

      var isNotInputs = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(element.nodeName) === -1;

      if (isNotInputs)
        containerInputs = containerInputs.concat(Array.prototype.slice.call(element.querySelectorAll('input, textarea, select')));
      else
        containerInputs.push(element);
    });

    return containerInputs;
  };

  var _getClosestParentByClass = function _getClosestParentByClass(element, className, subString) {

    while (element) {

      var parent = element.parentElement;

      if (parent === null || parent.classList.length === 0) {
        element = parent;
        continue;
      }

      var isClassDesired = Array.from(parent.classList).some(function(clazz) {
        return subString ? clazz.includes(className) : clazz === className;
      });

      if (isClassDesired) return parent;

      element = parent;

    }

    return null;

  };

  var _removeErrorMessage = function _removeErrorMessage(element) {

    var parentElement = _getClosestParentByClass(element, 'form-group'); // TODO: might interfere with non bootstrap pages that have the same class.
    if (parentElement === null) parentElement = element.parentElement;

    if (parentElement === null) return; //still nothing to remove, just exit

    var querySelector = defaultOptions.useBootstrap ? '.ritsu-error' : '.error-label, .warning-label'; //TODO maybe eveything should be a ritsu-error

    Array.prototype.slice.call(parentElement.querySelectorAll(querySelector)).forEach(function(element) {
      element.parentElement.removeChild(element);
    });

  };

  var _handlemessageCallback = function _handlemessageCallback(element, messageCallback, invalidElement) {
    var errorMessage = invalidElement ? _getErrorMessageForInput(element) : null;
    messageCallback(element, errorMessage);
  };

  var _defaultmessageCallback = function _defaultmessageCallback(selector) {

    if (defaultOptions.autoMarkInvalidFields) markInvalidFields(selector);
    if (defaultOptions.autoShowErrorMessages) showErrorMessages(selector);

  };

  var _getErrorMessageForInput = function _getErrorMessageForInput(element) {

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
    


    version: version,
    rules: rules, //Access to the Rules API

    initialize: initialize,
    storeInitialFormValues: storeInitialFormValues,
    getInitialFormValue: getInitialFormValue,
    resetIntialFormValues: resetInitialFormValues, //DEPRECATED as of v1.2.3
    resetInitialFormValues: resetInitialFormValues,
    isFormDirty: isFormDirty,
    validate: validate,
    markInvalidFields: markInvalidFields,
    showErrorMessages: showErrorMessages,
    getErrorMessage: getErrorMessage,
    getErrorMessages: getErrorMessages,
    getErrorMessagesAsMap: getErrorMessagesAsMap,
    getErrorMessagesAsObjects: getErrorMessagesAsObjects

  };

};



var r = rules(); return core(r, validation(r));
})();
