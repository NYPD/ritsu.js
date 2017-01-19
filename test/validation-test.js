/* eslint-env mocha */
const chai = require('chai');
const assert = chai.assert;

const jsdom = require('jsdom').jsdom;
const window = jsdom().defaultView;
const document = window.document;

const rules = require('../src/rules.js')();
const validation = require('../src/validation.js')(rules);

describe('validation', function() {

  before(function (){
    global.jQuery = global.$ = require('jquery');//Need jQuery cause ritsu still uses jquery
  });

  describe('#validateElement()', function() {

    it('should not validate element because it is disabled', function() {

      //Should fail since it aint disabled
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.disabled = false;
      input.value = '1337Speak';
      input.disabled = true;

      //Should pass cause its disaled now home slice
      var validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should not validate input element because it is optional and has no value', function() {

      //Should fail since it aint optional
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';

      var validElement = validation.validateElement(input);
      assert.isTrue(validElement);

    });

    it('should validate optional input element beacuse it has a value', function() {

      //Should fail since it aint optional
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'alpha alpha-only';
      input.value = '1337Speak';

      var validElement = validation.validateElement(input);
      assert.isFalse(validElement);

    });

    it('should not validate select element is optional and has no value', function() {

      var select = document.createElement('select');
      var optionEmpty = document.createElement('option');

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

      optionEmpty.text = 'hello';

      select.appendChild(optionEmpty);

      select.options[0].selected = true;

      var validElement = validation.validateElement(select);
      assert.isTrue(validElement);

    });

    it('should fail select element validation beacuse it required and has no value', function() {

      var select = document.createElement('select');
      select.setAttribute('required', '');

      var optionEmpty = document.createElement('option');
      optionEmpty.text = '';

      select.appendChild(optionEmpty);

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
      input.setAttribute('required', '');

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
      input.setAttribute('required', '');

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
      input.setAttribute('required', '');

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
      input.setAttribute('required', '');

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
      input.setAttribute('required', '');

      var validElement = validation.validateElement(input);
      assert.isTrue(validElement);

      input.value = '1339';
      validElement = validation.validateElement(input);
      assert.isFalse(validElement);

    });


  });

});
