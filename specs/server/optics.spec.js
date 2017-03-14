/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import chai from 'chai';
import Agent from 'optics-agent/dist/Agent';
import { createContext, finishContext } from '../../lib/server/optics';

describe('Optics', function () {
  describe('#createContext', function () {
    it('should create a context', function () {
      const context = createContext();

      chai.expect(context.startWallTime).to.be.a('number');
      chai.expect(context.queries).to.be.an.instanceof(Map);
      chai.expect(context.agent).to.be.an.instanceof(Agent);

      // To make tracing work:
      chai.expect(context.req).to.be.an('object');
      chai.expect(context.req.connection).to.be.an('object');
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
