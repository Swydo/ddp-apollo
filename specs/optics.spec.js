/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import { createContext, finishContext } from '../lib/optics';
import Agent from 'optics-agent/dist/Agent';

describe('Optics', function () {
  describe('#createContext', function () {
    it('should create a context', function () {
      const context = createContext();

      chai.expect(context.startWallTime).to.be.a('number');
      chai.expect(context.queries).to.be.an.instanceof(Map);
      chai.expect(context.agent).to.be.an.instanceof(Agent);
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
