/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { createContext, finishContext } from '../lib/optics';

describe('Optics', function () {
  describe('#createContext', function () {
    it('should create a context', function () {
      chai.expect(createContext().startWallTime).to.be.a('number');
    });
  });

  describe('#finishContext', function () {
    it('should add an endWallTime', function () {
      const context = {
        foo: 'bar',
      };

      const finalContext = finishContext(context);

      chai.expect(context).to.deep.equal(context);

      chai.expect(finalContext.endWallTime).to.be.a('number');
    });
  });
});
