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

module.exports = function() {return rules();};
