import { DEFAULT_CREATE_CONTEXT } from '../common/defaults';

export function contextToFunction(context) {
  switch (typeof context) {
    case 'object':
      return defaultContext => ({ ...defaultContext, ...context });
    case 'function':
      return context;
    default:
      return DEFAULT_CREATE_CONTEXT;
  }
}
