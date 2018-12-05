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

    var validationPattern = element.getAttribute('pattern');
    var elementClassString = element.getAttribute('class');

    var elementHasNoClasses = elementClassString === null || elementClassString === '';
    if (elementHasNoClasses) return validAlpha; //No need to validate just exit early

    var elementClasses = elementClassString.split(' ');

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule === null) return validAlpha; //No rule found, so just exit

    validAlpha = rule.validate(element);

    return validAlpha;
  };

  var _validateNumericField = function _validateNumericField(element) {

    var validNumeric = true;

    var elementClassString = element.getAttribute('class');
    var elementClasses = elementClassString ? elementClassString.split(' ') : ''; //In case there is no classes, make it empty strings for null safety

    var rule = rules.getRuleByRuleClass(elementClasses);
    if (rule !== null) validNumeric = rule.validate(element);

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

module.exports = function(rules) {return validation(rules);};
