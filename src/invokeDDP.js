import { DDP } from 'meteor/ddp';
import { Random } from 'meteor/random';

const { DDPCommon } = Package['ddp-common'];

// For details, please see https://github.com/meteor/meteor/issues/6388

function createInvocation(options) {
  return new DDPCommon.MethodInvocation({
    isSimulation: false,
    setUserId: () => {},
    unblock: () => {},
    connection: {},
    randomSeed: Random.id(),
    ...options,
  });
}

export function invokeDDP(func, options) {
  const invocation = createInvocation(options);

  return DDP._CurrentMethodInvocation.withValue(invocation, func);
}
