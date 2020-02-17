import { DEFAULT_CREATE_CONTEXT } from 'apollo-link-ddp';

export function contextToFunction(context) {
  switch (typeof context) {
    case 'object':
      return (defaultContext) => ({ ...defaultContext, ...context });
    case 'function':
      return context;
    default:
      return DEFAULT_CREATE_CONTEXT;
  }
}
