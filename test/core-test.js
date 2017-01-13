/* eslint-env mocha */
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var jsdom = require('jsdom').jsdom;
global.document = jsdom('<html><body></body></html>');
global.window = document.defaultView;

global.$ = require('jquery');
global.rules = require('../src/rules.js');
global.validation = require('../src/validation.js');
var core = require('../src/core.js');

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

    var $body = $('body');

    afterEach(function() {
      $body.empty();
    });

    it('should store initialValue for a text input element passed in', function() {

      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues($input);

      //change the current value
      $input.val('crepes');

      var intialValue = $input.data('initialValue');

      assert.strictEqual(intialValue, 'benzi');

    });

    it('should store initialValue for a text input element on the document since nothing was passed in', function() {

      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');
      $body.append($input);

      core.storeInitialFormValues();

      //change the current value
      $input.val('crepes');

      var intialValue = $input.data('initialValue');

      assert.strictEqual(intialValue, 'benzi');

    });

    it('should store initialValue for a text input element on the document when a container is passed in', function() {

      $body.append('<div></div>');

      var $div = $('div');
      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');

      $div.append($input);

      core.storeInitialFormValues($div);

      //change the current value
      $input.val('crepes');

      var intialValue = $input.data('initialValue');

      assert.strictEqual(intialValue, 'benzi');

    });

    it('should store initialValue for a checkbox input element passed in', function() {

      var $checkbox = $('<input type="checkbox" checked/>');

      core.storeInitialFormValues($checkbox);

      //Make sure this checkbox is checked
      var checkboxIsChecked = $checkbox.is(':checked') === true;
      assert.isTrue(checkboxIsChecked);

      //change the current value
      $checkbox.prop('checked', false);

      //Make sure it remembers the original checkbox state and this checkbox is unchecked
      var intialValue = $checkbox.data('initialValue');
      var checkboxIsUnchecked = $checkbox.is(':checked') === false;

      assert.strictEqual(intialValue, true);
      assert.isTrue(checkboxIsUnchecked);

    });

    it('should store initialValue for a radio input element passed in', function() {

      var $radio1 = $('<input type="radio" name="sex" value="male" id="male" checked/>');
      var $radio2 = $('<input type="radio" name="sex" value="female" id="female"/>');

      $body.append([$radio1, $radio2]);

      core.storeInitialFormValues();

      //Make sure radio male button is checked
      var currentRadioValue = $body.find('input[type="radio"]:checked').val();
      assert.strictEqual(currentRadioValue, 'male');

      //change the current value
      $('#female').prop('checked', true);

      //Make sure it remembers the original radio states and that the female radio is checked
      var intialValueOfMale = $('#male').data('initialValue');
      var intialValueOfFemale = $('#female').data('initialValue');
      currentRadioValue = $body.find('input[type="radio"]:checked').val();

      assert.strictEqual(intialValueOfMale, true);
      assert.strictEqual(intialValueOfFemale, false);
      assert.strictEqual(currentRadioValue, 'female');

    });

    //Cant test out a file input
    it('should store initialValue for a file input element passed in', function() {});

  });

  describe('#isFormDirty()', function() {

    var $body = $('body');

    afterEach(function() {
      $body.empty();
    });

    it('should not return dirty since nothing changed', function() {

      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues($input);

      var isDirty = core.isFormDirty($input);
      assert.isFalse(isDirty);

    });

    it('should return dirty for a text input element passed in', function() {

      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');

      core.storeInitialFormValues($input);

      //change the current value
      $input.val('crepes');

      var isDirty = core.isFormDirty($input);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a text input element on the document since nothing was passed in', function() {

      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');
      $body.append($input);

      core.storeInitialFormValues();

      //change the current value
      $input.val('crepes');

      var isDirty = core.isFormDirty();
      assert.isTrue(isDirty);

    });

    it('should return dirty for a text input element on the document when a container is passed in', function() {

      $body.append('<div></div>');

      var $div = $('div');
      var $input = $('<input type="text" class="alpha alpha-only" value="benzi"/>');

      $div.append($input);

      core.storeInitialFormValues($input);

      //change the current value
      $input.val('crepes');

      var isDirty = core.isFormDirty($div);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a checkbox input element passed in', function() {

      var $checkbox = $('<input type="checkbox" checked/>');

      core.storeInitialFormValues($checkbox);

      //Make sure this checkbox is checked
      var checkboxIsChecked = $checkbox.is(':checked') === true;
      assert.isTrue(checkboxIsChecked);

      //change the current value
      $checkbox.prop('checked', false);

      var isDirty = core.isFormDirty($checkbox);
      assert.isTrue(isDirty);

    });

    it('should return dirty for a radio input element passed in', function() {

      var $radio1 = $('<input type="radio" name="sex" value="male" id="male" checked/>');
      var $radio2 = $('<input type="radio" name="sex" value="female" id="female"/>');

      $body.append([$radio1, $radio2]);

      core.storeInitialFormValues();

      var $male = $('#male');
      var $female = $('#female');

      //Make sure radios are not dirty
      var isDirtyMale = core.isFormDirty($male);
      var isDirtyFemale = core.isFormDirty($female);

      assert.isFalse(isDirtyMale);
      assert.isFalse(isDirtyFemale);

      //change the current value
      $('#female').prop('checked', true);

      //Make sure both radios are now dirty
      isDirtyMale = core.isFormDirty($male);
      isDirtyFemale = core.isFormDirty($female);

      assert.isTrue(isDirtyMale);
      assert.isTrue(isDirtyFemale);

    });

    //Cant test out a file input
    it('should return dirty for a file input element passed in', function() {});


  });

  describe('#validate()', function() {

    var $body = $('body');
    var $input = $('<input type="text" class="alpha alpha-only"/>');

    beforeEach(function() {
      $body.empty();
      core.initialize({});
      $input.removeClass('has-error');
    });

    it('should validate an input element passed in', function() {

      //Make sure its passes
      $input.val('beans');
      var isValid = core.validate($input);
      assert.isTrue(isValid);

      //Make sure its fails
      $input.val('bea3ns');
      isValid = core.validate($input);
      assert.isFalse(isValid);

    });

    it('should validate an input element in the document since nothing was passed in', function() {

      $body.html($input);

      //Make sure its passes
      $input.val('beans');
      var isValid = core.validate();
      assert.isTrue(isValid);

      //Make sure its fails
      $input.val('bea3ns');
      isValid = core.validate();
      assert.isFalse(isValid);

    });

    it('should validate an input element based on the jQuery container passed in', function() {

      $body.append('<div class="cool"></div>');

      var $cool = $('.cool');
      $cool.html($input);

      //Make sure its passes
      $input.val('beans');
      var isValid = core.validate($cool);
      assert.isTrue(isValid);

      //Make sure its fails
      $input.val('bea3ns');
      isValid = core.validate($cool);
      assert.isFalse(isValid);

    });

    it('should validate a select element passed in', function() {

      var select = document.createElement('select');
      var optionEmpty = document.createElement('option');
      var optionNonEmpty = document.createElement('option');

      optionEmpty.text = '';
      optionNonEmpty.text = 'Beans';

      select.appendChild(optionEmpty);
      select.appendChild(optionNonEmpty);

      //Make sure its passes
      select.options[0].selected = true;
      select.options[1].selected = false;
      var isValid = core.validate($(select));
      assert.isFalse(isValid);

      //Make sure its fails
      select.options[0].selected = false;
      select.options[1].selected = true;
      isValid = core.validate($(select));
      assert.isTrue(isValid);

    });

    it('should set an input element passed in with a data attribute of invalid = true', function() {

      $input.val('bean3s');
      core.validate($input);

      var hasDataInvalidAttr = $input.data('invalid') === true;
      assert.isTrue(hasDataInvalidAttr);

    });

    it('should set an input element passed in with a data attribute of invalid = false', function() {

      $input.val('beans');
      core.validate($input);

      var dataInvalidAttr = $input.data('invalid') === false;
      assert.isTrue(dataInvalidAttr);

    });

    it('should mark an input element passed in with a .has-error class because autoMarkInvalidFields is true', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      core.validate($input);

      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });


    it('should not mark an input element passed in with a .has-error class because autoMarkInvalidFields is false', function() {

      core.initialize({
        autoMarkInvalidFields: false
      });

      $input.val('b3ans');
      core.validate($input);

      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

    });

    it('should add an error message label next to the input since autoShowErrorMessages is true', function() {

      core.initialize({
        autoShowErrorMessages: true
      });

      $body.append($input);

      //Check label does not exist
      var labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

      core.validate($input);

      //Check label exists
      labelExists = $input.next('label').length === 1;
      assert.isTrue(labelExists);

    });

    it('should not add a error message next to an input since autoShowErrorMessages is false', function() {

      core.initialize({
        autoShowErrorMessages: false
      });

      $input.val('bean3s');
      $body.append($input);

      //Check label does not exist
      var labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

      core.validate($input);

      //Check label still does not exist
      labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

    });

    after(function() {
      core.initialize({});
      $body.empty();
    });

  });

  describe('#showErrorMessages()', function() {

    var $body = $('body');
    var $validinput = $('<input type="text" class="alpha alpha-only" data-invalid="false"/>');
    var $invalidinput = $('<input type="text" class="alpha alpha-only" data-invalid="true"/>');

    beforeEach(function() {
      core.initialize({});
      $body.empty();
    });

    it('should add an error message label next to the input', function() {

      $body.append($invalidinput);

      //Check label does not exist
      var labelExists = $invalidinput.next('label').length === 1;
      assert.isFalse(labelExists);

      core.showErrorMessages($invalidinput);

      //Check label exists
      labelExists = $invalidinput.next('label').length === 1;
      assert.isTrue(labelExists);

    });

    it('should add an error message to a .form-group that has no .help-block when bootstrap is being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      $body.append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($invalidinput);

      //Check .help=block does not exist
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isFalse(helpBlockExists);

      core.showErrorMessages($invalidinput);

      //Check .help=block does exist
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isTrue(helpBlockExists);

    });

    it('should remove an error message from a .form-group that had no .help-block when bootstrap is being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      $body.append('<div class="form-group">' +
                     '<span class="help-block ritsu-error"></span>' +
                   '</div>');

      var $formGroup = $('.form-group');
      $formGroup.append($validinput);

      //.help block should be there
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isTrue(helpBlockExists);

      core.showErrorMessages($validinput);

      //.help block should have been removed
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isFalse(helpBlockExists);

    });

    it('should add a error message to a .form-group that already has a .help-block from bootstrap being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      $body.append('<div class="form-group"><span class="help-block"></span></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($invalidinput);

      //Make sure there is a help block but no ritsu-error <b>
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

      core.showErrorMessages($invalidinput);

      //Make sure there is a help block and a ritsu-error <b>
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

    });

    it('should remove a error message from a .form-group that already had a .help-block from bootstrap being used', function() {

      core.initialize({
        useBootstrap3Stlying: true
      });

      $body.append('<div class="form-group">' +
                     '<span class="help-block">' +
                       '<b class="ritsu-error"><em>You goofed</em></b><br class="ritsu-error">' +
                     '</span>' +
                   '</div>');

      var $formGroup = $('.form-group');
      $formGroup.append($validinput);

      //Make sure there is a help block and a ritsu-error <b>
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

      core.showErrorMessages($validinput);

      //Make sure there is a help block still but the ritsu-error <b> gone
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

    });

    after(function() {
      core.initialize({});
      $body.empty();
    });

  });


  describe('#markInvalidFields()', function() {

    var $body = $('body');
    var $input = $('<input type="text" class="alpha alpha-only"/>');

    beforeEach(function() {
      $body.empty();
      core.initialize({});
      $input.removeClass('has-error');
    });

    it('should mark an input element passed in with a .has-error class', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      core.validate($input);

      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark an input element with a .has-error class when nothing is passed in', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      $body.append($input);

      //Make sure there is no class
      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

      core.validate();

      //Make sure there is a class
      hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark an input element with a .has-error class when nothing a container is passed in', function() {

      core.initialize({
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      $body.append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      //Make sure there is no class
      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

      core.validate($formGroup);

      //Make sure there is a class
      hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark a .form-group element with a .has-error class when useBootstrap3Stlying = true', function() {

      core.initialize({
        useBootstrap3Stlying: true,
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      $body.append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      //Make sure there is no class
      var hasHasErrorClass = $formGroup.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

      core.validate($formGroup);

      //Make sure there is a class
      hasHasErrorClass = $formGroup.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    after(function() {
      core.initialize({});
      $body.empty();
    });

  });

});
