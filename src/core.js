var core = function(rules, validation) {

  var version = '${version}';
  var jQueryIsPresent = typeof jQuery !== 'undefined';
  var defaultOptions = {
    useBootstrap3Stlying: false,
    autoMarkInvalidFields: true,
    autoShowErrorMessages: false,
    messageCallback: null
  };

  var initialize = function(options) {

    var invalidOptions = typeof options !== 'object';
    if (invalidOptions) throw new Error('Invalid options to initialize ritsu.js');

    defaultOptions.useBootstrap3Stlying = options.useBootstrap3Stlying === undefined ? false : options.useBootstrap3Stlying;
    defaultOptions.autoMarkInvalidFields = options.autoMarkInvalidFields === undefined ? true : options.autoMarkInvalidFields;
    defaultOptions.autoShowErrorMessages = options.autoShowErrorMessages === undefined ? false : options.autoShowErrorMessages;

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

  var storeInitialFormValues = function(selector) {

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

  var getInitialFormValue = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);
    if (elementArray.length === 0) return null;

    return elementArray[0].getAttribute('data-initial-value');

  };


  var resetInitialFormValues = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    for (var i = 0; i < elementArray.length; i++) {

      var element = elementArray[i];

      var noInitialValue = !element.hasAttribute('data-initial-value');
      if (noInitialValue) continue;

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

    }

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

  var validate = function(selector, messageCallback) {

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

  var markInvalidFields = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    elementArray.forEach(function(element) {

      var errorElement = defaultOptions.useBootstrap3Stlying ? _getClosestParentByClass(element, 'form-group') : element;

      //If the user is using bootstrap and does not have the input in a form-group for some reason
      if (errorElement === null)
        errorElement = element;

      var isInvalid = element.getAttribute('data-invalid') === 'true';

      if (isInvalid)
        errorElement.classList.add('has-error');
      else
        errorElement.classList.remove('has-error');

    });

    return this;
  };

  var getErrorMessage = function(selector) {

    if (selector === undefined)
      throw new Error('No selector passed in');

    var errorMessages = getErrorMessages(selector);
    return errorMessages[0] === undefined? null: errorMessages[0];
  };

  var getErrorMessages = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    var errorMessages = [];

    elementArray.forEach(function(element) {
      var isInvalid = element.getAttribute('data-invalid') === 'true';
      if(isInvalid) errorMessages.push(_getErrorMessageForInput(element));
    });

    return errorMessages;

  };

  var getErrorMessagesAsMap = function(selector) {

    var elementArray = _getSelectorAsElementArray(selector);

    var errorMessageMap = {};

    elementArray.forEach(function(element) {
      var isInvalid = element.getAttribute('data-invalid') === 'true';
      if(isInvalid) errorMessageMap[element] = _getErrorMessageForInput(element);
    });

    return errorMessageMap;

  };

  var showErrorMessages = function(selector, messageCallback) {

    var elementArray = _getSelectorAsElementArray(selector);
    var messageCallbackProvided = messageCallback !== undefined;

    for (var i = 0; i < elementArray.length; i++) {

      var element = elementArray[i];

      var isValid = element.getAttribute('data-invalid') !== 'true';

      if (defaultOptions.messageCallback !== null || messageCallbackProvided) {
        _handlemessageCallback(element, messageCallbackProvided? messageCallback : defaultOptions.messageCallback, !isValid);
      } else {
        _removeErrorMessage(element); //Remove any previous old error messages
      }

      if (isValid) continue;

      var errorMessage = _getErrorMessageForInput(element);

      if (defaultOptions.useBootstrap3Stlying) {

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

          helpBlock.insertBefore(b, helpBlock.firstChild);
        } else {

          b.appendChild(em);

          var span = document.createElement('span');
          span.className = 'help-block ritsu-error';
          span.appendChild(b);

          formGroup.appendChild(span);
        }

      } else {

        var elementId = element.getAttribute('id');

        var label = document.createElement('label');
        label.className = 'error-label';
        label.htmlFor = elementId || '';
        label.innerHTML = errorMessage;

        var errorContainer = _getClosestParentByClass(element, 'form-group') === null ? element.parentElement : _getClosestParentByClass(element, 'form-group');

        errorContainer.appendChild(label);

      }

    }

    return this;
  };

  //Private Methods ************************************************************

  // Return an empty array if nothing is found
  var _getSelectorAsElementArray = function(selector) {

    var isJquery = jQueryIsPresent ? selector instanceof jQuery : false;
    if (isJquery) selector = selector.get();

    var selectorUndefined = selector === undefined;
    if (selectorUndefined) selector = Array.prototype.slice.call(document.querySelectorAll('input, textarea, select'));

    var isStringSelector = typeof selector === 'string';
    if (isStringSelector) selector = Array.prototype.slice.call(document.querySelectorAll(selector));

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

    var parentElement = _getClosestParentByClass(element, 'form-group') === null ? element.parentElement : _getClosestParentByClass(element, 'form-group');
    if (parentElement === null) return; //nothing to remove, just exit

    Array.prototype.slice.call(parentElement.querySelectorAll(defaultOptions.useBootstrap3Stlying ? '.ritsu-error' : '.error-label, .warning-label')).forEach(function(element) {
      element.parentElement.removeChild(element);
    });

  };

  var _handlemessageCallback = function(element, messageCallback, invalidElement) {
    var errorMessage = invalidElement? _getErrorMessageForInput(element): null;
    messageCallback(element, errorMessage);
  };

  var _defaultmessageCallback = function(selector) {

    if (defaultOptions.autoMarkInvalidFields) markInvalidFields(selector);
    if (defaultOptions.autoShowErrorMessages) showErrorMessages(selector);

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
    //For mocha tests temporarily
    mocha_getSelectorAsElementArray : _getSelectorAsElementArray,

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
    getErrorMessagesAsMap: getErrorMessagesAsMap

  };

};

module.exports = function(rules, validation) {return core(rules, validation);};
