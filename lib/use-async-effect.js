const {useEffect, useCallback, useRef} = require("react");
const {CPromise, CanceledError} = require("c-promise2");

const {E_REASON_UNMOUNTED} = CanceledError.registerErrors({
    E_REASON_UNMOUNTED: 'unmounted'
})

const isGeneratorFn = (thing) => typeof thing === 'function' &&
    thing.constructor &&
    thing.constructor.name === 'GeneratorFunction';

const isEvent = (thing) => !!(thing && typeof thing === 'object' && thing.type);

const useAsyncEffect = (generator, deps) => {
    let ref = useRef(null);

    const cancel = (reason) => {
        const promise = ref.current;
        if (promise) {
            ref.current = null;
            return promise.cancel(isEvent(reason) ? undefined : reason)
        }
        return false;
    }

    useEffect(() => {
        if (!isGeneratorFn(generator)) {
            throw TypeError('useAsyncEffect requires a generator as the first argument');
        }

        let promise = ref.current = CPromise.resolveGenerator(generator, {resolveSignatures: true});

        let cb;

        promise.then(_cb => {
            if (_cb !== undefined && typeof _cb !== 'function') {
                throw TypeError('useAsyncEffect handler should return a function');
            }
            cb = _cb;
        }, err => {
            if (!CanceledError.isCanceledError(err)) {
                console.error(err);
            }
        });

        return () => {
            cancel(E_REASON_UNMOUNTED);
            cb && cb();
        }
    }, deps);

    return cancel;
}

const useAsyncCallback = (generator, options) => {
    let dataRef = useRef({
        promises: [],
        queue: [],
        pending: 0
    });

    const {
        current
    } = dataRef;

    const {
        deps = [],
        combine = false,
        cancelPrevious = false,
        concurrency = 0
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    const callback = useCallback((...args) => {
        const {promises, queue} = current;

        if (combine && promises.length) {
            return promises[0].finally(() => {
            });
        }

        const resolveGenerator = () => CPromise.resolveGenerator(generator, {args, resolveSignatures: true});

        if (concurrency) {
            const promise = new CPromise(resolve => {
                if (current.pending === concurrency) {
                    return queue.push(resolve);
                }

                current.pending++;
                resolve();
            })
                .then(() => resolveGenerator())
                .then((value) => {
                    current.pending--;
                    queue.length && queue.shift()();
                    return value;
                });

            promises.push(promise);

            return promise;
        } else if (cancelPrevious) {
            cancel();
        }

        const promise = resolveGenerator().finally(() => {
            const index = promises.indexOf(promise);
            index !== -1 && promises.splice(index, 1);
        });

        promises.push(promise);

        return combine ? promise.finally(() => {
        }) : promise;
    });

    const cancel = (reason) => {
        current.promises.forEach(promise => promise.cancel(reason));
        current.promises = [];
    }

    useEffect(() => {
        return () => cancel(E_REASON_UNMOUNTED);
    }, deps);

    if (options != null && typeof options !== 'object') {
        throw TypeError('options must be an object or array');
    }

    callback.cancel = cancel;

    return callback;
}

module.exports = {
    useAsyncEffect,
    useAsyncCallback,
    E_REASON_UNMOUNTED
}
