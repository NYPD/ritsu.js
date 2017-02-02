var core = function(rules, validation) {

  var jQueryIsPresent = typeof jQuery !== undefined || typeof $ !== undefined;
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

  var storeInitialFormValues = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      var isCheckbox = element.type === 'checkbox';
      var isRadio = element.type === 'radio';
      var isFile = element.type === 'file';

      if (isCheckbox || isRadio) {
        element.setAttribute('data-initial-value', element.checked);
      } else if (isFile) {

        var hasSimpleFileHash = this.getAttribute('data-simple-file-hash') !== undefined;

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

  var isFormDirty = function(selector) {

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
        valueChanged = intialValue != '' + element.checked; //Need to convert it to a string to properly compare, since JS does not convert string to boolean for us http://www.ecma-international.org/ecma-262/5.1/#sec-11.9.3
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

  var validate = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    var isValid = true;

    elementArray.forEach(function(element) {

      var invalidElement = !validation.validateElement(element);

      //Sets the entire form to false, just because their was at least 1 invalid field
      if (invalidElement) {
        isValid = false;
        element.setAttribute('data-invalid', true);
      } else {
        element.setAttribute('data-invalid', false);
        _removeErrorMessage(element);
      }

    });

    if (autoMarkInvalidFields) markInvalidFields(selector);
    if (autoShowErrorMessages) showErrorMessages(selector);

    return isValid;
  };

  var markInvalidFields = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      var errorElement = useBootstrap3Stlying ? _getClosestParentByClass(element, 'form-group') : element;

      var isInvalid = element.getAttribute('data-invalid') === 'true';

      if (isInvalid)
        errorElement.classList.add('has-error');
      else
        errorElement.classList.remove('has-error');

    });

    return this;
  };

  var showErrorMessages = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      _removeErrorMessage(element); //Remove any previous old error messages

      var isValid = element.getAttribute('data-invalid') !== 'true';
      if (isValid) return true;

      var errorMessage = _getErrorMessageForInput(element);

      if (useBootstrap3Stlying) {

        var formGroup = _getClosestParentByClass(element, 'form-group');
        var helpBlock = formGroup.querySelector('.help-block');

        var hasHelpBlock = helpBlock !== null;

        var em = document.createElement('em');
        em.innerHTML = errorMessage;

        var b = document.createElement('b');

        if (hasHelpBlock) {

          var br = document.createElement('br');
          br.className = 'ritsu-error';

          b.className = 'ritsu-error';
          b.appendChild(em);
          b.appendChild(br);

          helpBlock.insertBefore(b, parent.firstChild);
        } else {

          b.appendChild(em);

          var span = document.createElement('span');
          span.className = 'help-block ritsu-error';
          span.appendChild(b);

          helpBlock.appendChild(span);
        }

      } else {

        var elementId = element.getAttribute('id');

        var label = document.createElement('label');
        label.className = 'error-label';
        label.htmlFor = elementId ? elementId : '';
        label.innerHTML = errorMessage;

        var errorContainer = _getClosestParentByClass(element, 'form-group') === null ? element.parentElement : _getClosestParentByClass(element, 'form-group');

        errorContainer.appendChild(label);

      }

    });

    return this;
  };

  //Private Methods ************************************************************
  var _getSelectorAsElementArray = function(selector) {

    var isJquery = jQueryIsPresent ? selector instanceof jQuery : false;
    selector = isJquery ? selector.get() : selector;

    var selectorUndefined = selector === undefined;
    if (selectorUndefined) selector = Array.prototype.slice.call(document.querySelectorAll('input, textarea, select'));

    var isNotArray = !Array.isArray(selector);
    if (isNotArray) selector = [selector];

    var noElements = selector.length === 0;
    if (noElements) return []; // return empty array to prevent kabooms in the console

    var firstElement = selector[0];

    var isNotInputs = ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(firstElement.nodeName) === -1;
    if (isNotInputs) selector = Array.prototype.slice.call(firstElement.querySelectorAll('input, textarea, select'));

    return selector;
  };

  var _getClosestParentByClass = function(element, className) {

    while (element) {

      var parent = element.parentElement;

      var isFormGroup = parent !== null && parent.classList.contains(className);
      if (isFormGroup) return parent;

      element = parent;

    }

    return null;

  };

  var _removeErrorMessage = function(element) {

    var parentElement = _getClosestParentByClass(element, useBootstrap3Stlying? 'form-group': 'error-label-container');
    if(parentElement === null) return; //nothing to remove, just exit

    Array.prototype.slice.call(parentElement.querySelectorAll(useBootstrap3Stlying? '.ritsu-error' : '.error-label, .warning-label')).forEach(function(element) {
      parentElement.removeChild(element);
    });

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

module.exports = function(rules, validation) {
  return core(rules, validation);
};
