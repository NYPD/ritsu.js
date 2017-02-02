/* eslint-env mocha */
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const jsdom = require('jsdom').jsdom;

const rules = require('../src/rules.js')();
const validation = require('../src/validation.js')(rules);

const core = require('../src/core.js')(rules, validation);

describe('core', function() {

  describe('#initialize()', function() {

    it('should throw an Error when the options passed in is not an object', function() {
      expect(function() {
        core.initialize('init');
      }).to.throw(Error);
    });

    it('should pass when the options passed in is any object', function() {

      var options = {
        useBootstrap3Stlying: true,
        autoMarkInvalidFields: false,
        autoShowErrorMessages: true
      };

      expect(function() {
        core.initialize(options);
      }).to.not.throw(Error);

    });

    //Clean up the ristu object to the defaults
    after(function() {
      core.initialize({});
    });

  });

  describe('#storeInitialFormValues()', function() {


    it('should store initialValue for a text input element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="bob"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      //change the current value
      input.value = 'crepes';

      let intialValue = input.getAttribute('data-initial-value');
      assert.strictEqual(intialValue, 'bob');

    });

    it('should store initialValue for a text input element on the document since nothing was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues();
      let input = document.getElementsByTagName('input')[0];

      //change the current value
      input.value = 'crepes';

      let intialValue = input.getAttribute('data-initial-value');
      assert.strictEqual(intialValue, 'benzi');

    });

    it('should store initialValue for a text input element on the document when a container is passed in', function() {

      global.document = jsdom('<div><input type="text" class="alpha alpha-only" value="jeans"/></div>');

      let div = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(div);

      //change the current value
      input.value = 'crepes';

      let intialValue = input.getAttribute('data-initial-value');
      assert.strictEqual(intialValue, 'jeans');

    });

    it('should store initialValue for a checkbox input element passed in', function() {

      global.document = jsdom('<input type="checkbox" checked/>');

      let checkbox = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(checkbox);

      //Make sure this checkbox is checked
      var checkboxIsChecked = checkbox.checked === true;
      assert.isTrue(checkboxIsChecked);

      //change the current value
      checkbox.checked = false;

      //Make sure it remembers the original checkbox state and this checkbox is unchecked
      var intialValue = checkbox.getAttribute('data-initial-value');
      var checkboxIsUnchecked = checkbox.checked === false;

      assert.strictEqual(intialValue, 'true');
      assert.isTrue(checkboxIsUnchecked);

    });

    it('should store initialValue for a radio input element passed in', function() {

      global.document = jsdom('<input type="radio" name="sex" value="male" id="male" checked/>' +
                              '<input type="radio" name="sex" value="female" id="female"/>');

      core.storeInitialFormValues();

      let maleRadio = document.getElementById('male');
      let femaleRadio = document.getElementById('female');

      //Make sure radio male button is checked
      assert.strictEqual(maleRadio.checked, true);
      assert.strictEqual(femaleRadio.checked, false);

      //change the current value
      femaleRadio.click();

      //Make sure it remembers the original radio states and that the female radio is checked
      let intialValueOfMale = document.getElementById('male').getAttribute('data-initial-value');
      let intialValueOfFemale = document.getElementById('female').getAttribute('data-initial-value');

      assert.strictEqual(intialValueOfMale, 'true');
      assert.strictEqual(intialValueOfFemale, 'false');


      //Make sure radio female button is checked
      assert.strictEqual(maleRadio.checked, false);
      assert.strictEqual(femaleRadio.checked, true);

    });

    //Cant test out a file input
    it('should store initialValue for a file input element passed in', function() {});


    after(function() {
      global.document = null;
    });

  });

  describe('#isFormDirty()', function() {

    it('should not return dirty since nothing changed', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      var isDirty = core.isFormDirty(input);
      assert.isFalse(isDirty);

    });

    it('should return dirty for a text input element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      let input = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(input);

      //change the current value
      input.value = 'crepes';

      var isDirty = core.isFormDirty(input);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a text input element on the document since nothing was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues();

      //change the current value
      document.getElementsByTagName('input')[0].value = 'crepes';

      var isDirty = core.isFormDirty();
      assert.isTrue(isDirty);

    });

    it('should return dirty for a text input element on the document when a container is passed in', function() {

      global.document = jsdom('<div><input type="text" class="alpha alpha-only" value="jeans"/></div>');

      let div = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      core.storeInitialFormValues(input);

      //change the current value
      input.value = 'crepes';

      var isDirty = core.isFormDirty(div);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a checkbox input element passed in', function() {

      global.document = jsdom('<input type="checkbox" checked/>');

      let checkbox = document.getElementsByTagName('input')[0];
      core.storeInitialFormValues(checkbox);

      //Make sure this checkbox is checked
      var checkboxIsChecked = checkbox.checked === true;
      assert.isTrue(checkboxIsChecked);

      //change the current value
      checkbox.checked = false;

      var isDirty = core.isFormDirty(checkbox);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a radio input element passed in', function() {

      global.document = jsdom('<input type="radio" name="sex" value="male" id="male" checked/>' +
                              '<input type="radio" name="sex" value="female" id="female"/>');

      core.storeInitialFormValues();

      let maleRadio = document.getElementById('male');
      let femaleRadio = document.getElementById('female');

      //Make sure radios are not dirty
      let isDirtyMale = core.isFormDirty(maleRadio);
      let isDirtyFemale = core.isFormDirty(femaleRadio);

      assert.isFalse(isDirtyMale);
      assert.isFalse(isDirtyFemale);

      //change the current value
      femaleRadio.click();

      //Make sure both radios are now dirty
      isDirtyMale = core.isFormDirty(maleRadio);
      isDirtyFemale = core.isFormDirty(femaleRadio);

      assert.isTrue(isDirtyMale);
      assert.isTrue(isDirtyFemale);

    });

    //Cant test out a file input
    it('should return dirty for a file input element passed in', function() {});

    after(function() {
      global.document = null;
    });

  });

  describe('#validate()', function() {


    it('should validate an input element passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure its passes
      input.value = 'beans';
      var isValid = core.validate(input);
      assert.isTrue(isValid);

      //Make sure its fails
      input.value = 'bea3ns';
      isValid = core.validate(input);
      assert.isFalse(isValid);

    });

    it('should validate an input element in the document since nothing was passed in', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      //Make sure its passes
      input.value = 'beans';
      var isValid = core.validate();
      assert.isTrue(isValid);

      //Make sure its fails
      input.value = 'bea3ns';
      isValid = core.validate();
      assert.isFalse(isValid);

    });

    it('should validate an input element based on the jQuery container passed in', function() {

      global.document = jsdom('<div><input type="text" class="alpha alpha-only"/></div>');

      let div = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Make sure its passes
      input.value = 'beans';
      var isValid = core.validate(div);
      assert.isTrue(isValid);

      //Make sure its fails
      input.value = 'bea3ns';
      isValid = core.validate(div);
      assert.isFalse(isValid);

    });

    it('should validate a select element passed in', function() {

      var select = document.createElement('select');
      select.setAttribute('required', '');

      var optionEmpty = document.createElement('option');
      var optionNonEmpty = document.createElement('option');

      optionEmpty.text = '';
      optionNonEmpty.text = 'Beans';

      select.appendChild(optionEmpty);
      select.appendChild(optionNonEmpty);

      //Make sure its fails
      select.options[0].selected = true;
      select.options[1].selected = false;
      var isValid = core.validate($(select));
      assert.isFalse(isValid);

      //Make sure its passes
      select.options[0].selected = false;
      select.options[1].selected = true;
      isValid = core.validate($(select));
      assert.isTrue(isValid);

    });

    it('should set an input element passed in with a data attribute of invalid = true', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'bean3s';
      core.validate(input);

      var hasDataInvalidAttr = input.getAttribute('data-invalid') === 'true';
      assert.isTrue(hasDataInvalidAttr);

    });

    it('should set an input element passed in with a data attribute of invalid = false', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'beans';
      core.validate(input);

      var dataInvalidAttr = input.getAttribute('data-invalid')  === 'false';
      assert.isTrue(dataInvalidAttr);

    });

    it('should mark an input element passed in with a .has-error class because autoMarkInvalidFields is true', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'b3ans';
      core.validate(input);

      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isTrue(hasHasErrorClass);

      //Reset the core options
      core.initialize({});

    });


    it('should not mark an input element passed in with a .has-error class because autoMarkInvalidFields is false', function() {

      core.initialize({
        autoMarkInvalidFields: false
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only"/>');

      let input = document.getElementsByTagName('input')[0];

      input.value = 'b3ans';
      core.validate(input);

      var hasHasErrorClass = input.classList.contains('has-error');
      assert.isFalse(hasHasErrorClass);

      //Reset the core options
      core.initialize({});

    });

    it('should add an error message label next to the input since autoShowErrorMessages is true', function() {

      core.initialize({
        autoShowErrorMessages: true
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" required/>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.validate(input);

      //Check label exists
      labelExists = input.nextElementSibling !== null;
      assert.isTrue(labelExists);

    });

    it('should not add a error message next to an input since autoShowErrorMessages is false', function() {

      core.initialize({
        autoShowErrorMessages: false
      });

      global.document = jsdom('<input type="text" class="alpha alpha-only" required/>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.validate(input);

      //Check label still does not exist
      labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

    });

    after(function() {
      global.document = null;
    });

  });

  describe('#showErrorMessages()', function() {

    it('should add an error message label next to the input', function() {

      global.document = jsdom('<input type="text" class="alpha alpha-only" data-invalid="true" required/>');

      let input = document.getElementsByTagName('input')[0];

      //Check label does not exist
      var labelExists = input.nextElementSibling !== null;
      assert.isFalse(labelExists);

      core.showErrorMessages(input);

      //Check label exists
      labelExists =  input.nextElementSibling !== null;
      assert.isTrue(labelExists);

    });

    it('should add an error message to a .form-group that has no .help-block when bootstrap is being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group"><input type="text" class="alpha alpha-only" data-invalid="true" required/></div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Check .help=block does not exist
      var helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isFalse(helpBlockExists);

      core.showErrorMessages(input);

      //Check .help=block does exist
      helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isTrue(helpBlockExists);

      //Reset core options
      core.initialize({});

    });

    it('should remove an error message from a .form-group that had no .help-block when bootstrap is being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
                                '<input type="text" class="alpha alpha-only" data-invalid="false"/>'+
                                '<span class="help-block ritsu-error"></span>' +
                              '</div>');

      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //.help block should be there
      var helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isTrue(helpBlockExists);

      core.showErrorMessages(input);

      //.help block should have been removed
      helpBlockExists = formGroup.querySelector('.help-block') !== null;
      assert.isFalse(helpBlockExists);

      //Reset core options
      core.initialize({});

    });

    it('should add a error message to a .form-group that already has a .help-block from bootstrap being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      global.document = jsdom('<div class="form-group">' +
                                '<input type="text" class="alpha alpha-only" data-invalid="true" required/>'+
                                '<span class="help-block"></span>' +
                              '</div>');


      let formGroup = document.getElementsByTagName('div')[0];
      let input = document.getElementsByTagName('input')[0];

      //Make sure there is a help block but no ritsu-error <b>
      var helpBlockExists = formGroup.querySelectorAll('.help-block').length === 1;
      var ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

      core.showErrorMessages(input);

      //Make sure there is a help block and a ritsu-error <b>
      helpBlockExists = formGroup.querySelectorAll('.help-block').length === 1;
      ritsuErrorExists = formGroup.querySelectorAll('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

    });
  //
  //   it('should remove a error message from a .form-group that already had a .help-block from bootstrap being used', function() {
  //
  //     core.initialize({
  //       useBootstrap3Stlying: true
  //     });
  //
  //     $body.append('<div class="form-group">' +
  //                    '<span class="help-block">' +
  //                      '<b class="ritsu-error"><em>You goofed</em></b><br class="ritsu-error">' +
  //                    '</span>' +
  //                  '</div>');
  //
  //     var $formGroup = $('.form-group');
  //     $formGroup.append($validinput);
  //
  //     //Make sure there is a help block and a ritsu-error <b>
  //     var helpBlockExists = $formGroup.find('.help-block').length === 1;
  //     var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
  //     assert.isTrue(helpBlockExists);
  //     assert.isTrue(ritsuErrorExists);
  //
  //     core.showErrorMessages($validinput);
  //
  //     //Make sure there is a help block still but the ritsu-error <b> gone
  //     helpBlockExists = $formGroup.find('.help-block').length === 1;
  //     ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
  //     assert.isTrue(helpBlockExists);
  //     assert.isFalse(ritsuErrorExists);
  //
  //   });
  //
  //   after(function() {
  //     core.initialize({});
  //     $body.empty();
  //   });

  });


  // describe('#markInvalidFields()', function() {
  //
  //   var $body = $('body');
  //   var $input = $('<input type="text" class="alpha alpha-only"/>');
  //
  //   beforeEach(function() {
  //     $body.empty();
  //     core.initialize({});
  //     $input.removeClass('has-error');
  //   });
  //
  //   it('should mark an input element passed in with a .has-error class', function() {
  //
  //     core.initialize({
  //       autoMarkInvalidFields: true
  //     });
  //
  //     $input.val('b3ans');
  //     core.validate($input);
  //
  //     var hasHasErrorClass = $input.hasClass('has-error');
  //     assert.isTrue(hasHasErrorClass);
  //
  //   });
  //
  //   it('should mark an input element with a .has-error class when nothing is passed in', function() {
  //
  //     core.initialize({
  //       autoMarkInvalidFields: true
  //     });
  //
  //     $input.val('b3ans');
  //     $body.append($input);
  //
  //     //Make sure there is no class
  //     var hasHasErrorClass = $input.hasClass('has-error');
  //     assert.isFalse(hasHasErrorClass);
  //
  //     core.validate();
  //
  //     //Make sure there is a class
  //     hasHasErrorClass = $input.hasClass('has-error');
  //     assert.isTrue(hasHasErrorClass);
  //
  //   });
  //
  //   it('should mark an input element with a .has-error class when nothing a container is passed in', function() {
  //
  //     core.initialize({
  //       autoMarkInvalidFields: true
  //     });
  //
  //     $input.val('b3ans');
  //     $body.append('<div class="form-group"></div>');
  //
  //     var $formGroup = $('.form-group');
  //     $formGroup.append($input);
  //
  //     //Make sure there is no class
  //     var hasHasErrorClass = $input.hasClass('has-error');
  //     assert.isFalse(hasHasErrorClass);
  //
  //     core.validate($formGroup);
  //
  //     //Make sure there is a class
  //     hasHasErrorClass = $input.hasClass('has-error');
  //     assert.isTrue(hasHasErrorClass);
  //
  //   });
  //
  //   it('should mark a .form-group element with a .has-error class when useBootstrap3Stlying = true', function() {
  //
  //     core.initialize({
  //       useBootstrap3Stlying: true,
  //       autoMarkInvalidFields: true
  //     });
  //
  //     $input.val('b3ans');
  //     $body.append('<div class="form-group"></div>');
  //
  //     var $formGroup = $('.form-group');
  //     $formGroup.append($input);
  //
  //     //Make sure there is no class
  //     var hasHasErrorClass = $formGroup.hasClass('has-error');
  //     assert.isFalse(hasHasErrorClass);
  //
  //     core.validate($formGroup);
  //
  //     //Make sure there is a class
  //     hasHasErrorClass = $formGroup.hasClass('has-error');
  //     assert.isTrue(hasHasErrorClass);
  //
  //   });
  //
  //   after(function() {
  //     core.initialize({});
  //     $body.empty();
  //   });
  //
  // });
  //
  // after(function() {
  //   delete global.window;
  // });

});
