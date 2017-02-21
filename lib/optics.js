export function createContext() {
  return {
    startWallTime: +new Date(),
    startHrTime: process.hrtime(),
    resolverCalls: [],
  };
}

export function finishContext(context = {}) {
  return {
    ...context,
    durationHrTime: process.hrtime(context.startHrTime),
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
