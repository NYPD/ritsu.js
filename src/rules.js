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
