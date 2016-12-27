/* eslint-env mocha */
var chai = require('chai');
var assert = chai.assert;

var jsdom = require('jsdom').jsdom;
var window = jsdom().defaultView;
var document = window.document;

global.$ = require('jquery');
global.rules = require('../src/rules.js');
var validation = require('../src/validation.js');

describe('validation', function() {

  describe('#validateElement()', function() {

    it('should not validate element because it is disabled', function() {

      //Should fail since it aint disabled
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.disabled = false;
      input.value = '1337Speak';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

      input.disabled = true;

      //Should pass cause its disaled now home slice
      validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should not validate input element is optional and has no value', function() {

      //Should fail since it aint optional
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

      input.classList.add('optional');

      //Should pass cause its disaled now home slice
      validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should validate optional input element beacuse it has a value', function() {

      //Should fail since it aint optional
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only optional';
      input.value = '1337Speak';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

    });

    it('should not validate select element is optional and has no value', function() {

      var select = document.createElement('select');
      var optionEmpty = document.createElement('option');

      select.className = 'optional';
      optionEmpty.text = '';

      select.appendChild(optionEmpty);

      //Make sure its passes
      select.options[0].selected = true;

      var validElement = validation.validateElement(select);
      assert.isTrue(validElement);

    });

    it('should validate optional select element beacuse it has a value', function() {

      var select = document.createElement('select');
      var optionEmpty = document.createElement('option');

      optionEmpty.text = '';

      select.appendChild(optionEmpty);

      //Make sure its passes
      select.options[0].selected = true;

      var validElement = validation.validateElement(select);
      assert.isFalse(validElement);

    });

    it('should validate an alpha input that has a validation pattern attribute', function() {

      //Should fail
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = '1337Speak';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

      input.pattern = '1337Speak';

      //Should pass since there is a pattern attribute
      validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should validate an numeric input that has a validation pattern attribute', function() {

      //Should fail
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'numeric numeric-whole';
      input.value = '1337Speak';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

      input.pattern = '1337Speak';

      //Should pass since there is a pattern attribute
      validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should validate an numeric input with min attribute', function() {

      //Should fail
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'numeric numeric-whole';
      input.min = '1338';
      input.value = '1337';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

      input.value = '1339';

      validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should validate an numeric input with max attribute', function() {

      //Should fail
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'numeric numeric-whole';
      input.max = '1336';
      input.value = '1337';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

      input.value = '1335';

      validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should validate an numeric input with max and min attribute', function() {

      //Should fail
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'numeric numeric-whole';
      input.min = '1336';
      input.max = '1338';
      input.value = '1337';

      var validElement = validation.validateElement(input);
      assert.isTrue(validElement);

      input.value = '1339';
      validElement = validation.validateElement(input);
      assert.isFalse(validElement);

    });


  });

});
