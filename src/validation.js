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

    var isAlpha = $element.hasClass('alpha');
    var isNumeric = $element.hasClass('numeric');
    var isOptional = $element.hasClass('optional');

    var fieldValue = $element.val();
    var isEmpty = $.trim(fieldValue) === '' || fieldValue === undefined;

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
    var isEmpty = $.trim(valueSelected) === '' || valueSelected === undefined;

    var validSelect = isOptional && isEmpty || !isEmpty;

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
        validNumeric = fieldValueAsNum >= minLimit || fieldValueAsNum <= maxLimit;
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

})();
