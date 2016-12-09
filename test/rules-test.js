/* eslint-env mocha */
var chai = require('chai');
var assert = chai.assert;
var rules = require('../src/rules.js');

describe('rules', function() {

  describe('#getRuleByRuleClass()', function() {

    it('should return the correct rule by class name', function() {
      var rule = rules.getRuleByRuleClass('alpha-only');
      assert.isOk(rule);

      assert.equal(rule.ruleType, 'alpha');
      assert.equal(rule.getErrorMessage(), 'Only letters, spaces, hypens, and periods are allowed');
    });

    it('should return nothing since no rule was found', function() {
      var rule = rules.getRuleByRuleClass('cool-beans');
      assert.isNull(rule);
    });

  });


  describe('#addValidationRule()', function() {

    it('should add a new validation rule', function() {

      var rule = rules.getRuleByRuleClass('numeric-beans');
      assert.isNotOk(rule);

      var ruleType = 'numeric';
      var ruleClass = 'numeric-beans';
      var validationFunction = function () {};

      rules.addValidationRule(ruleType, ruleClass, validationFunction);

      rule = rules.getRuleByRuleClass('numeric-beans');
      assert.isOk(rule);
    });

    it('should add multiple validation rule');

  });

});
