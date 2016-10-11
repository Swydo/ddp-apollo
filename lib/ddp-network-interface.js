class DDPNetworkInterface {
    constructor({
        connection,
        noRetry = true,
        method = '/graphql' } = {}
    ) {
        this.connection = connection;
        this.noRetry = noRetry;
        this.method = method;
    }

    query(request) {
        return new Promise((resolve, reject) => {
            this.connection.apply(this.method, [request], { noRetry: this.noRetry }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}

export { DDPNetworkInterface };
