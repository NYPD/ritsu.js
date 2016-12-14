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

  describe('initialize();', function() {

    it('should throw Error when the options passed in is not an object', function() {
      expect(ritsu.initialize.bind('init')).to.throw(Error);
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

    after(function() {
      ritsu.initialize({});
    });

  });

  describe('storeInitialFormValues();', function() {

  });



  describe('validate();', function() {


    beforeEach(function() {
      $('body').html('');
      ritsu.initialize({});
    });

    it('should validate a input element passed in', function() {

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      input.value = 'beans';
      var $input = $(input);
      var isValid = ritsu.validate($input);
      assert.isTrue(isValid);

      input.value = 'bea3ns';
      $input = $(input);
      isValid = ritsu.validate($input);
      assert.isFalse(isValid);

    });

    it('should validate a input element in the document since nothing was passed in', function() {

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      input.value = 'beans';
      $('body').html(input);
      var isValid = ritsu.validate();
      assert.isTrue(isValid);

      input.value = 'bea3ns';
      $('body').html(input);
      isValid = ritsu.validate();
      assert.isFalse(isValid);

    });

    it('should validate a input element based on the jQuery container passed in', function() {

      $('body').append('<div class="cool"></div>');

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      input.value = 'beans';
      $('.cool').html(input);
      var isValid = ritsu.validate($('.cool'));
      assert.isTrue(isValid);

      input.value = 'bea3ns';
      $('.cool').html(input);
      isValid = ritsu.validate($('.cool'));
      assert.isFalse(isValid);

    });

    it('should validate a select element passed in', function() {

      var select = document.createElement('select');
      var option = document.createElement('option');

      option.text = 'cool option';
      select.appendChild(option);

      var $select = $(select);
      var isValid = ritsu.validate($select);
      assert.isTrue(isValid);

      option.text = '';

      select.options[0] = null;
      select.appendChild(option);
      $select = $(select);

      isValid = ritsu.validate($select);
      assert.isFalse(isValid);

    });

    it('should mark a input element passed in with a data attribute of invalid = true', function() {

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      input.value = 'bean3s';
      var $input = $(input);
      ritsu.validate($input);

      var invalid = $input.data('invalid') === true;
      assert.isTrue(invalid);

    });

    it('should mark a input element passed in with a data attribute of invalid = false once it passed validation', function() {

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      input.value = 'bean3s';
      var $input = $(input);
      ritsu.validate($input);

      var invalid = $input.data('invalid') === true;
      assert.isTrue(invalid);

      input.value = 'beans';
      $input = $(input);
      ritsu.validate($input);
      var valid = $input.data('invalid') === false;
      assert.isTrue(valid);

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

    it('should add a has-error class to the form-group of the input element passed in', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true
      });

      $('body').append('<div class="form-group"></div>');

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $formGroup = $('.form-group');
      $formGroup.append(input);

      ritsu.validate();

      var hasError = $formGroup.hasClass('has-error');
      assert.isTrue(hasError);

    });

    it('should add an error message label next to the input since autoShowErrorMessages is true', function() {

      ritsu.initialize({
        autoShowErrorMessages: true
      });

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      $('body').append($input);

      var labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

      ritsu.validate($input);

      labelExists = $input.next('label').length === 1;
      assert.isTrue(labelExists);

    });

    it('should not add a error message next to an input since autoShowErrorMessages is false', function() {

      ritsu.initialize({
        autoShowErrorMessages: false
      });

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      $('body').append($input);

      var labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

      ritsu.validate($input);

      labelExists = $input.next('label').length === 1;
      assert.isFalse(labelExists);

    });

    it('should add a error message to a .form-group that has no .help-block when bootstrap is being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      $('body').append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isFalse(helpBlockExists);

      ritsu.validate($input);

      helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isTrue(helpBlockExists);

    });

    it('should remove a error message from a .form-group that had no .help-block when bootstrap is being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      $('body').append('<div class="form-group"></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      ritsu.validate($input);

      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isTrue(helpBlockExists);

      //Time to fix the input
      $formGroup.find('input').val('beans');
      ritsu.validate($input);

      helpBlockExists = $formGroup.find('.help-block').length === 1;
      assert.isFalse(helpBlockExists);

    });

    it('should add a error message to a .form-group that already has a .help-block from bootstrap being used', function() {

      ritsu.initialize({
        useBootstrap3Stlying: true,
        autoShowErrorMessages: true
      });

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      $('body').append('<div class="form-group"><span class="help-block"></span></div>');

      var $formGroup = $('.form-group');

      $formGroup.append($input);

      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;

      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

      ritsu.validate($input);

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

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = 'bean3s';

      var $input = $(input);

      $('body').append('<div class="form-group"><span class="help-block"></span></div>');

      var $formGroup = $('.form-group');
      $formGroup.append($input);

      ritsu.validate($input);

      var helpBlockExists = $formGroup.find('.help-block').length === 1;
      var ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;

      assert.isTrue(helpBlockExists);
      assert.isTrue(ritsuErrorExists);

      //Time to fix the input
      $formGroup.find('input').val('beans');
      ritsu.validate($input);

      helpBlockExists = $formGroup.find('.help-block').length === 1;
      ritsuErrorExists = $formGroup.find('.ritsu-error').length > 0;

      assert.isTrue(helpBlockExists);
      assert.isFalse(ritsuErrorExists);

    });

  });

});
