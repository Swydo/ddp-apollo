export function createContext() {
  // eslint-disable-next-line global-require
  const OpticsAgent = require('optics-agent');

  const context = {
    startWallTime: +new Date(),
    startHrTime: process.hrtime(),
    resolverCalls: [],
    queries: new Map(),
  };

  return OpticsAgent.context({
    _opticsContext: context,
  })
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
