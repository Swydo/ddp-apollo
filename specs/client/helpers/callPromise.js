export function callPromise(name, ...args) {
  return new Promise((resolve, reject) => {
    Meteor.apply(name, args, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}
