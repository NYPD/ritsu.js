/* eslint-env mocha */
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var jsdom = require('jsdom').jsdom;
global.document = jsdom('<html><body></body></html>');
global.window = document.defaultView;
global.$ = require('jquery');

var ritsu = require('../dist/ritsu.js');

describe('ritsu', function() {

  describe('#initialize()', function() {

    it('should throw an Error when the options passed in is not an object', function() {
      expect(function() {
        ritsu.initialize('init');
      }).to.throw(Error);
    });

    it('should pass when the options passed in is any object', function() {

      var options = {
        useBootstrap3Stlying: true,
        autoMarkInvalidFields: false,
        autoShowErrorMessages: true
      };

      expect(function() {
        ritsu.initialize(options);
      }).to.not.throw(Error);

    });

    //Clean up the ristu object to the defaults
    after(function() {
      ritsu.initialize({});
    });

  });

  describe('#storeInitialFormValues()', function() {

  });

  describe('#validate()', function() {

    var $body = $('body');
    var $input = $('<input type="text" class="alpha alpha-only"/>');

    beforeEach(function() {
      $body.empty();
      ritsu.initialize({});
      $input.removeClass('has-error');
    });

    it('should validate an input element passed in', function() {

      //Make sure its passes
      $input.val('beans');
      var isValid = ritsu.validate($input);
      assert.isTrue(isValid);

      //Make sure its fails
      $input.val('bea3ns');
      isValid = ritsu.validate($input);
      assert.isFalse(isValid);

    });

    it('should validate an input element in the document since nothing was passed in', function() {

      $body.html($input);

      //Make sure its passes
      $input.val('beans');
      var isValid = ritsu.validate();
      assert.isTrue(isValid);

      //Make sure its fails
      $input.val('bea3ns');
      isValid = ritsu.validate();
      assert.isFalse(isValid);

    });

    it('should validate an input element based on the jQuery container passed in', function() {

      $body.append('<div class="cool"></div>');

      var $cool = $('.cool');
      $cool.html($input);

      //Make sure its passes
      $input.val('beans');
      var isValid = ritsu.validate($cool);
      assert.isTrue(isValid);

      //Make sure its fails
      $input.val('bea3ns');
      isValid = ritsu.validate($cool);
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
      var isValid = ritsu.validate($(select));
      assert.isFalse(isValid);

      //Make sure its fails
      select.options[0].selected = false;
      select.options[1].selected = true;
      isValid = ritsu.validate($(select));
      assert.isTrue(isValid);

    });

    it('should mark an input element passed in with a data attribute of invalid = true', function() {

      $input.val('bean3s');
      ritsu.validate($input);

      var hasDataInvalidAttr = $input.data('invalid') === true;
      assert.isTrue(hasDataInvalidAttr);

    });

    it('should mark an input element passed in with a data attribute of invalid = false', function() {

      $input.val('beans');
      ritsu.validate($input);

      var dataInvalidAttr = $input.data('invalid') === false;
      assert.isTrue(dataInvalidAttr);

    });

    it('should mark an input element passed in with a .has-error class', function() {

      ritsu.initialize( {
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      ritsu.validate($input);

      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark an input element with a .has-error class when nothing is passed in', function() {

      ritsu.initialize( {
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      $body.append($input);

      //Make sure there is no class
      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

      ritsu.validate();

      //Make sure there is a class
      hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark an input element with a .has-error class when nothing a container is passed in', function() {

      ritsu.initialize( {
        autoMarkInvalidFields: true
      });

      $input.val('b3ans');
      $body.append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      //Make sure there is no class
      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

      ritsu.validate($formGroup);

      //Make sure there is a class
      hasHasErrorClass = $input.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should mark a .form-group element with a .has-error class when useBootstrap3Stlying = true', function() {

      ritsu.initialize( {
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

      ritsu.validate($formGroup);

      //Make sure there is a class
      hasHasErrorClass = $formGroup.hasClass('has-error');
      assert.isTrue(hasHasErrorClass);

    });

    it('should not mark an input element passed in with a .has-error class because autoMarkInvalidFields is false', function() {

      ritsu.initialize( {
        autoMarkInvalidFields: false
      });

      $input.val('b3ans');
      ritsu.validate($input);

      var hasHasErrorClass = $input.hasClass('has-error');
      assert.isFalse(hasHasErrorClass);

    });

    it('should add a has-error class to the input element passed in', function() {

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      ritsu.validate($input);

      var hasError = $input.hasClass('has-error');
      assert.isTrue(hasError);

    });

    it('should add an error message label next to the input since autoShowErrorMessages is true', function() {

      ritsu.initialize({
        autoShowErrorMessages: true
      });

      $body.append($input);

      //Check label does not exist
      var labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

      ritsu.validate($input);

      //Check label exists
      labelExists = $input.next('label').length === 1;
      assert.isTrue(labelExists);

    });

    it('should not add a error message next to an input since autoShowErrorMessages is false', function() {

      ritsu.initialize({
        autoShowErrorMessages: false
      });

      $input.val('bean3s');
      $body.append($input);

      //Check label does not exist
      var labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

      ritsu.validate($input);

      //Check label still does not exist
      labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

    });

    it('should add an error message to a .form-group that has no .help-block when bootstrap is being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      $input.val('bean3s');
      $body.append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      //Check .help=block does not exist
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isFalse(helpBlockExists);

      ritsu.validate($input);

      //Check .help=block does exist
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isTrue(helpBlockExists);

    });

    it('should remove an error message from a .form-group that had no .help-block when bootstrap is being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      $input.val('bean3s');
      $body.append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      ritsu.validate($input);

      //.help block should have been added
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isTrue(helpBlockExists);

      //Time to fix the input
      $input.val('beans');
      ritsu.validate($input);

      //.help block should have been removed
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isFalse(helpBlockExists);

    });

    it('should add a error message to a .form-group that already has a .help-block from bootstrap being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      $input.val('bean3s');
      $body.append('<div class="form-group"><span class="help-block"></span></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      //Make sure there is a help block but no ritsu-error <b>
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

      ritsu.validate($input);

      //Make sure there is a help block and a ritsu-error <b>
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

    });

    it('should remove a error message from a .form-group that already had a .help-block from bootstrap being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      $input.val('bean3s');
      $body.append('<div class="form-group"><span class="help-block"></span></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      ritsu.validate($input);

      //Make sure there is a help block and a ritsu-error <b>
      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

      //Time to fix the input
      $input.val('beans');
      ritsu.validate($input);

      //Make sure there is a help block still but the ritsu-error <b> gone
      helpBlockExists = $formGroup.find('.help-block').length === 1;
      ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;
      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

    });

  });

});
