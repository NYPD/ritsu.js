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

    var $element = $(element);
    var validAlpha = true;

    var fieldValue = $element.val();

    var isAlphaOnly = $element.hasClass("alpha-only");
    var isAlphaZip = $element.hasClass("alpha-zip");
    var isAlphaNumeric = $element.hasClass("alpha-numeric");
    var isAlphaEmail = $element.hasClass("alpha-email");

    if (isAlphaOnly) {
      validAlpha = rules.getAlphaOnlyRegex().test(fieldValue);
    } else if (isAlphaZip) {
      validAlpha = rules.getAlphaZipRegex().test(fieldValue);
    } else if (isAlphaNumeric) {
      validAlpha = rules.getAlphaNumericRegex().test(fieldValue);
    } else if (isAlphaEmail) {
      validAlpha = rules.getAlphaEmailRegex().test(fieldValue);
    }

    return validAlpha;
  };

  var _validateNumericField = function (element) {

    var $element = $(element);
    var validNumeric = true;

    var fieldValue = $element.val();

    var isNumericWholeInput = $element.hasClass("numeric-whole");
    var isNumericMonetaryInput = $element.hasClass("numeric-monetary");
    var isNumericDecimalInput = $element.hasClass("numeric-decimal");
    var isNumericFullYear = $element.hasClass("numeric-full-year");
    var isNumericDatePicker = $element.hasClass("numeric-jquery-date");

    if (isNumericWholeInput) {
      validNumeric = rules.getNumericWholeRegex().test(fieldValue);
    } else if (isNumericMonetaryInput) {
      validNumeric = rules.getNumericMonetaryRegex().test(fieldValue);
    } else if (isNumericDecimalInput) {
      validNumeric = rules.getNumericDecimalRegexString($element.data('decimal-max')).test(fieldValue);
    } else if (isNumericFullYear) {
      validNumeric = rules.getNumericFullYearRegex().test(fieldValue);
    } else if (isNumericDatePicker) {

      validNumeric = $element.datepicker("getDate") !== null;
      var isNoPastDate = element.hasAttribute('data-no-past-date');

      if (isNoPastDate && validNumeric) {
        var date = new Date();
        var dateWithNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        validNumeric = $element.datepicker('getDate').getTime() >= dateWithNoTime.getTime();
      }

    }

    if (validNumeric) {

      /*
       * I know javascript auto converts strings into numbers when using "non stirct equality" operators,
       * but do this excplicity to show intention. (This is prob overkill idk)
       *
       * This won't work in locales that use commas as decimal places.
       */
      var fieldValueAsNum = Number(fieldValue.replace(',', ''));

      var minLimit = $.trim($element.attr('min')) === "" ? null : Number($element.attr('min'));
      var maxLimit = $.trim($element.attr('max')) === "" ? null : Number($element.attr('max'));

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
