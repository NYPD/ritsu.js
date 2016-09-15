var rules = (function () {

  /*
   * Matches all Canadian or American postal codes with different formats. For USA it is:
   * any 5 digits followed optionally by an optional space or dash or empty string and any 4 digits after the optional
   * space or dash. For Canada it is: certain capital letters (only one), any digit (only one), any capital letter (only one),
   * optional space, any digit (only one), any capitol letter (only one), and and digit (only one).
   *
   * e.g. 19608 | 19608-8911 | A9C1A1 | A9C 1A1
   *
   */
  var getAlphaZipRegex = function () {
    return /(^\d{5}([\s-]?\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} ?\d{1}[A-Z]{1}\d{1}$)/;
  };

  /*
   * Any case insensitive Roman character with periods, dashes, and spaces.
   *
   * e.g. cool | cool-beans | cool beans | beans.
   */
  var getAlphaOnlyRegex = function () {
    return /^([A-Za-z\s\.\-])+$/;
  };

  /*
   * Any case insensitive Roman character and digit
   *
   * e.g. Cool | C00l
   */
  var getAlphaNumericRegex = function () {
    return /^([a-zA-Z0-9]+)$/;
  };

  /*
   *  A negative or non negative number with optional thousands commas
   *
   *  e.g. 54 | -54 | -54,000 | 54000
   */
  var getNumericWholeRegex = function () {
    return /^[-]?(([\d]{1,3}(,{1}[\d]{3})*)|[\d]+)$/;
  };

  /*
   * A negative or non negative monetary amount with optional thousands commas and optional hundreds decimal place
   *
   * e.g. -54 | 54 | 54.00 | -54,544 | 54,544.54
   */
  var getNumericMonetaryRegex = function () {
    return /^((-?[\d]{1,3}(,[\d]{3})*(\.[\d]{2})*)|-?[\d]+(\.[\d]{2})?)$/;
  };

  /*
   * Taking an optional decimalPlaces integer (defaults to 2 if not provided), any negative or non negative number amount with
   * optional thousands commas and optional hundreds decimal place
   *
   * e.g. (undefined) -54 | (1) 54.1 | (undefined) 54.00 | (undefined) -54,544 | (8) 54,544.54231541
   */
  var getNumericDecimalRegexString = function (decimalPlaces) {

    var decimalPlacesUndefined = decimalPlaces === undefined;
    if (decimalPlacesUndefined) decimalPlaces = 2;

    var numericDecimalRegexString = "^((([\\d]{1,3}(,[\\d]{3})*)?(\\.[\\d]{1,decimalPlaces})?)|[\\d]*(\\.[\\d]{1,decimalPlaces})?)$";
    var numericDecimalRegex = new RegExp(numericDecimalRegexString.replace(/decimalPlaces/g, decimalPlaces));

    return numericDecimalRegex;
  };

  /*
   * A four digit number
   *
   * e.g. 1999 | 2010 | 0000
   */
  var getNumericFullYearRegex = function () {
    return /^(\d{4})$/;
  };

  /*
   * A date String in the format of MM/dd/YYYY. It DOES NOT check for validity of the month or day number.
   *
   * e.g. 10/02/1990 | 12/12/2014 | 84/65/1990
   */
  var getNumericDatePickerRegex = function () {
    return /^(\d{2}\/\d{2}\/\d{4})$/;
  };

  return {
    getAlphaZipRegex: getAlphaZipRegex,
    getAlphaOnlyRegex: getAlphaOnlyRegex,
    getAlphaNumericRegex: getAlphaNumericRegex,
    getNumericWholeRegex: getNumericWholeRegex,
    getNumericMonetaryRegex: getNumericMonetaryRegex,
    getNumericDecimalRegexString: getNumericDecimalRegexString,
    getNumericFullYearRegex: getNumericFullYearRegex,
    getNumericDatePickerRegex: getNumericDatePickerRegex
  };

})();
