/* eslint-env mocha */
global.$ = require('jquery');
var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();
var ritsu = require('../dist/ritsu.js');

describe('ritsu', function() {

  describe('#initialize()', function() {

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

  });

  describe('#storeInitialFormValues()', function() {

  });

});
