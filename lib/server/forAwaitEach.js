function createAsyncIterator(source) {
  const method = source && (source[Symbol.asyncIterator] || source['@@asyncIterator']);
  if (typeof method === 'function') {
    return method.call(source);
  }
  return null;
}

export default function forAwaitEach(source, callback, thisArg) {
  const asyncIterator = createAsyncIterator(source);
  if (asyncIterator) {
    let i = 0;
    return new Promise((resolve, reject) => {
      function next() {
        asyncIterator
          .next()
          .then((step) => {
            if (!step.done) {
              Promise.resolve(callback.call(thisArg, step.value, i++, source))
                .then(next)
                .catch(reject);
            } else {
              resolve();
            }
          })
          .catch(reject);
      }
      next();
    });
  }

  return Promise.resolve();
}
