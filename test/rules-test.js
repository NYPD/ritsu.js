/* eslint-env mocha */
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var rules = require('../src/rules.js');

var jsdom = require('jsdom').jsdom;
var window = jsdom().defaultView;
var document = window.document;


describe('rules', function() {

  describe('#getRuleByRuleClass()', function() {

    it('should return the correct rule by class name', function() {
      var rule = rules.getRuleByRuleClass('alpha-only');
      assert.isNotNull(rule);

      assert.equal(rule.ruleType, 'alpha');
      assert.equal(rule.getErrorMessage(), 'Only letters, spaces, hypens, and periods are allowed');
    });

    it('should return nothing since no rule was found', function() {
      var rule = rules.getRuleByRuleClass('cool-beans');
      assert.isNull(rule);
    });

  });


  describe('#addValidationRule()', function() {

    it('should add a new validation rule with multiple parameters', function() {

      var rule = rules.getRuleByRuleClass('numeric-beans');
      assert.isNull(rule);

      var ruleType = 'numeric';
      var ruleClass = 'numeric-beans';
      var validationFunction = function() {};

      rules.addValidationRule(ruleType, ruleClass, validationFunction);

      rule = rules.getRuleByRuleClass('numeric-beans');
      assert.isNotNull(rule);
    });

    it('should add a new validation rule with a rule object', function() {

      var rule = rules.getRuleByRuleClass('numeric-fruit');
      assert.isNull(rule);

      var validationFunction = function() {};

      rules.addValidationRule({
        ruleType: 'numeric',
        ruleClass: 'numeric-fruit',
        validationFunction: validationFunction
      });

      rule = rules.getRuleByRuleClass('numeric-fruit');
      assert.isNotNull(rule);

    });

    it('should add multiple validation rules', function() {

      var validationFunction = function() {};

      var ruleSilly = rules.getRuleByRuleClass('numeric-silly');
      var ruleSilly2 = rules.getRuleByRuleClass('numeric-silly2');

      assert.isNull(ruleSilly);
      assert.isNull(ruleSilly2);

      rules.addValidationRule([{
        ruleType: 'numeric',
        ruleClass: 'numeric-silly',
        validationFunction: validationFunction
      }, {
        ruleType: 'numeric',
        ruleClass: 'numeric-silly2',
        validationFunction: validationFunction
      }]);

      ruleSilly = rules.getRuleByRuleClass('numeric-silly');
      ruleSilly2 = rules.getRuleByRuleClass('numeric-silly2');

      assert.isNotNull(ruleSilly);
      assert.isNotNull(ruleSilly2);

    });

    it('should throw an Error when trying to add a rule with an incorrect rule type', function() {

      expect(function() {
        rules.addValidationRule('string');
      }).to.throw(Error);

    });

    it('should throw an Error when trying to add a non string rule class', function() {

      expect(function() {
        rules.addValidationRule('alpha', {});
      }).to.throw(Error);

    });

    it('should throw an Error when trying to add a non function validation function', function() {

      expect(function() {
        rules.addValidationRule('alpha', 'alpha-cool', 54);
      }).to.throw(Error);

    });

  });


  describe('default rule validations', function() {

    it('alpha-only', function() {

      var rule = rules.getRuleByRuleClass('alpha-only');

      var input = document.createElement('input');
      input.type = 'text';
      input.value = 'beans';

      var isValid = rule.validate(input);

      assert.isTrue(isValid);

      input.value = 'b34ns';
      isValid = rule.validate(input);

      assert.isFalse(isValid);

    });

    it('alpha-zip', function() {

      var rule = rules.getRuleByRuleClass('alpha-zip');

      var input = document.createElement('input');
      input.type = 'text';

      input.value = '19608';
      var isValid = rule.validate(input);
      assert.isTrue(isValid);

      input.value = '19608 8911';
      isValid = rule.validate(input);
      assert.isTrue(isValid);

      input.value = '19608-8911';
      isValid = rule.validate(input);
      assert.isTrue(isValid);

      input.value = 'A9C1A1';
      isValid = rule.validate(input);
      assert.isTrue(isValid);

      input.value = 'A9C 1A1';
      isValid = rule.validate(input);
      assert.isTrue(isValid);

      input.value = '19608 12';
      isValid = rule.validate(input);
      assert.isFalse(isValid);

    });

  });

});
