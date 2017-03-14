export function createContext(connection = {}) {
  // eslint-disable-next-line global-require
  const OpticsAgent = require('optics-agent');

  // Optics requirs a `req` object to report traces
  // https://github.com/apollographql/optics-agent-js/blob/e32bb3579123ff8faa3f4f349767a193c109d034/src/Report.js#L216-L219
  const req = {
    headers: connection.httpHeaders,
    url: Meteor.absoluteUrl(),
    connection: {},
  };

  const context = {
    startWallTime: +new Date(),
    startHrTime: process.hrtime(),
    resolverCalls: [],
    queries: new Map(),
    req,
  };

  return OpticsAgent.context({
    _opticsContext: context,
  });
}

export function finishContext(context = {}) {
  return {
    ...context,
    durationHrTime: context.startHrTime && process.hrtime(context.startHrTime),
    endWallTime: +new Date(),
  };
}

export function reportContext(context = {}) {
  // eslint-disable-next-line global-require
  const { reportRequestEnd } = require('optics-agent/dist/Report');

  reportRequestEnd({
    _opticsContext: context,
  });
}
