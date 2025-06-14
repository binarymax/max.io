const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wraps a promise with a timeout. If the promise doesn't resolve within the given time,
 * it resolves with a timeout indicator.
 * @param {Promise} promise - The promise to wrap.
 * @param {number} ms - Timeout in milliseconds.
 * @param {string} name - Identifier for the source.
 * @returns {Promise<object>} - Resolves with either the promise result or a timeout indicator.
 */
function withTimeout(name, promise, ms) {
    return Promise.race([
        promise.then((data) => ({ name, data, timedOut: false })),
        new Promise((resolve) =>
            setTimeout(() => resolve({ name, timedOut: true }), ms)
        )
    ]);
}

const utils = {
    withTimeout,
    sleep
}

module.exports = utils;