var rules = (function(value) {

  /**
   * Tries to find and return  the specific rule for ruleClasses paramter
   * 
   * @param  {(string | string[])} ruleClasses - Can take an array of class strings or just a singular class string
   * @return {object} - The rule object if found, otherwise null;
   */
  var getRuleByRuleClass = function(ruleClasses) {

    var isArray = Arrays.isArray(ruleClasses);
    var rule = null;

    for (var i = 0; i < _rules.length; i++) {

      var ruleDoesNotMatch = isArray ? ruleClasses.indexOf(_rules[i].ruleClass) : _rules[i].ruleClass !== ruleClass;
      if (ruleDoesNotMatch) continue;

      rule = _rules[i];
      break;
    }
    return rule;
  };

  //Private Methods ************************************************************
  var _validateAlphaOnly = function(value) {
    /*
     * Any case insensitive Roman character with periods, dashes, and spaces.
     *
     * e.g. cool | cool-beans | cool beans | beans.
     */
    return /^([A-Za-z\s\.\-])+$/.test(value);
  };

  var _validateAlphaZip = function(value) {
    /*
     * Matches all Canadian or American postal codes with different formats. For USA it is:
     * any 5 digits followed optionally by an optional space or dash or empty string and any 4 digits after the optional
     * space or dash. For Canada it is: certain capital letters (only one), any digit (only one), any capital letter (only one),
     * optional space, any digit (only one), any capitol letter (only one), and and digit (only one).
     *
     * e.g. 19608 | 19608-8911 | A9C1A1 | A9C 1A1
     *
     */
    return /(^\d{5}([\s-]?\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} ?\d{1}[A-Z]{1}\d{1}$)/.test(value);
  };

  var _validateAlphaNumeric = function(value) {
    /*
     * Any case insensitive Roman character and digit
     *
     * e.g. Cool | C00l
     */
    return /^([a-zA-Z0-9]+)$/.test(value);
  };


  var _validateAlphaEmail = function(value) {
    /*
     * One or more non space charater + literal '@', + One or more non space charater + literal '.' + One or more non space charater.
     * It does not check tld and special chacter validity.
     *
     * e.g. a@a.a | bob@google.com | cool-beans@beans.com.uk | $#%@$%@$.com
     */
    return /^(\S+@\S+\.\S+)$/.test(value);
  };


  var _validateNumericWhole = function(value) {
    /*
     *  A negative or non negative number with optional thousands commas
     *
     *  e.g. 54 | -54 | -54,000 | 54000
     */
    return /^[-]?(([\d]{1,3}(,{1}[\d]{3})*)|[\d]+)$/.test(value);
  };

  var _validateNumericMonetary = function(value) {
    /*
     * A negative or non negative monetary amount with optional thousands commas and optional hundreds decimal place
     *
     * e.g. -54 | 54 | 54.00 | -54,544 | 54,544.54
     */
    return /^((-?[\d]{1,3}(,[\d]{3})*(\.[\d]{2})*)|-?[\d]+(\.[\d]{2})?)$/.test(value);
  };

  /*
   * Takes an optional decimalPlaces integer (defaults to 2 if not provided)
   */
  var _validateNumericDecimalString = function(value, decimalPlaces) {

    var decimalPlacesUndefined = decimalPlaces === undefined;
    if (decimalPlacesUndefined) decimalPlaces = 2;

    /*
     * Any negative or non negative number amount with optional thousands commas and optional hundreds decimal place
     *
     * e.g. (undefined) -54 | (1) 54.1 | (undefined) 54.00 | (undefined) -54,544 | (8) 54,544.54231541
     */
    var numericDecimalRegexString = "^((([\\d]{1,3}(,[\\d]{3})*)?(\\.[\\d]{1,decimalPlaces})?)|[\\d]*(\\.[\\d]{1,decimalPlaces})?)$";
    var numericDecimalRegex = new RegExp(numericDecimalRegexString.replace(/decimalPlaces/g, decimalPlaces));

    return numericDecimalRegex.test(value);
  };

  var _validateNumericFullYear = function(value) {
    /*
     * A four digit number
     *
     * e.g. 1999 | 2010 | 0000
     */
    return /^(\d{4})$/.test(value);
  };

  var _validateNumericDatePicker = function(value) {
    /*
     * A date String in the format of MM/dd/YYYY. It DOES NOT check for validity of the month or day number.
     *
     * e.g. 10/02/1990 | 12/12/2014 | 84/65/1990
     */
    return /^(\d{2}\/\d{2}\/\d{4})$/.test(value);
  };

  var _Rule = function(primaryClass, ruleClass, validationFunction) {
    this.primaryClass = primaryClass;
    this.ruleClass = ruleClass;
    this.validate = validationFunction;
  };

  var _rules = [
    new _Rule("alpha", "alpha-only", _validateAlphaOnly),
    new _Rule("alpha", "alpha-zip", _validateAlphaZip),
    new _Rule("alpha", "alpha-numeric", _validateAlphaNumeric),
    new _Rule("alpha", "alpha-email", _validateAlphaEmail),
    new _Rule("numeric", "alpha-zip", _validateNumericWhole),
    new _Rule("numeric", "alpha-zip", _validateNumericMonetary),
    new _Rule("numeric", "alpha-zip", _validateNumericDecimalString),
    new _Rule("numeric", "alpha-zip", _validateNumericFullYear),
    new _Rule("numeric", "alpha-zip", _validateNumericDatePicker)
  ];

  return {
    getRuleByRuleClass: getRuleByRuleClass
  };

})();
