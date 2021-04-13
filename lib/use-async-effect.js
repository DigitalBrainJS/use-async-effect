const {useEffect, useCallback, useRef} = require("react");
const {CPromise, CanceledError} = require("c-promise2");
const isEqualObjects = require('is-equal-objects/dist/is-equal-objects.cjs');

const {E_REASON_UNMOUNTED, E_REASON_QUEUE_OVERFLOW} = CanceledError.registerErrors({
    E_REASON_UNMOUNTED: 'unmounted',
    E_REASON_QUEUE_OVERFLOW: 'overflow',
})

const isGeneratorFn = (thing) => typeof thing === 'function' &&
    thing.constructor &&
    thing.constructor.name === 'GeneratorFunction';

const isEvent = (thing) => !!(thing && typeof thing === 'object' && thing.type);

const removeElement = (arr, element) => {
    const index = arr.indexOf(element);
    return (index !== -1) && arr.splice(index, 1);
}

const useAsyncEffect = (generator, options) => {
    let ref = useRef(null);

    let {
        deps = [],
        skipFirst= false
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    const cancel = (reason) => {
        const promise = ref.current && ref.current.promise;
        if (promise) {
            ref.current.promise = null;
            return promise.cancel(isEvent(reason) ? undefined : reason)
        }
        return false;
    }

    if (!isGeneratorFn(generator)) {
        throw TypeError('useAsyncEffect requires a generator as the first argument');
    }

    useEffect(() => {
        if(!ref.current){
            ref.current= {};
            if(skipFirst){
                return;
            }
        }

        let promise = ref.current.promise = CPromise.run(generator, {resolveSignatures: true, scopeArg: true});

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

const argsToPromiseMap = new Map();

const useAsyncCallback = (generator, options) => {
    if (options != null && typeof options !== 'object') {
        throw TypeError('options must be an object or array');
    }

    const {current} = useRef({
        promises: [],
        queue: [],
        pending: 0,
        args: null
    });

    let {
        deps = [],
        combine = false,
        cancelPrevious = false,
        concurrency = 0,
        queueSize = 0,
        scopeArg= false
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    if (cancelPrevious && (concurrency || queueSize)) {
        throw Error('cancelPrevious cannot be used in conjunction with concurrency or queueSize options');
    }

    if (concurrency && (!Number.isFinite(queueSize) || concurrency < 0)) {
        throw Error('concurrency must be a positive number');
    }

    if (queueSize && (!Number.isFinite(queueSize) || queueSize < 0)) {
        throw Error('queueSize must be a positive number');
    }

    if(cancelPrevious){
        concurrency= 1;
        queueSize= 0;
    }

    const callback = useCallback((...args) => {
        const {promises, queue} = current;
        let n;

        if (combine && (n = promises.length)) {
            let promise;
            while (n-- > 0) {
                promise = promises[n];
                if (argsToPromiseMap.has(promise) && isEqualObjects(argsToPromiseMap.get(promise), args)) {
                    return CPromise.resolve(promise);
                }
            }
        }

        if (queueSize && (queueSize - promises.length) <= 0) {
            return CPromise.reject(CanceledError.from(E_REASON_QUEUE_OVERFLOW))
        }

        const resolveGenerator = () => CPromise.run(generator, {args, resolveSignatures: true, scopeArg});

        cancelPrevious && cancel();

        if (concurrency) {
            const promise = new CPromise(resolve => {
                if (current.pending === concurrency) {
                    return queue.push(() => {
                        current.pending++;
                        resolve()
                    });
                }
                current.pending++;
                resolve();
            }).weight(0)
                .then(resolveGenerator)
                .finally((value) => {
                    current.pending--;
                    removeElement(promises, promise);
                    combine && argsToPromiseMap.delete(promise);
                    queue.length && queue.shift()();
                    return value;
                }).weight(0);

            promises.push(promise);

            combine && argsToPromiseMap.set(promise, args);

            return promise;
        }

        const promise = resolveGenerator().finally(() => {
            removeElement(promises, promise);
            combine && argsToPromiseMap.delete(promise);
        }).weight(0);

        promises.push(promise);

        if (combine) {
            argsToPromiseMap.set(promise, args);
            return CPromise.resolve(promise);
        }

        return promise;
    });

    const cancel = (reason) => {
        const _reason = isEvent(reason) ? undefined : reason;
        current.promises.forEach(promise => promise.cancel(_reason));
        current.promises.length = 0;
    };

    useEffect(() => {
        return () => cancel(E_REASON_UNMOUNTED);
    }, deps);

    callback.cancel = cancel;

    return callback;
}

module.exports = {
    useAsyncEffect,
    useAsyncCallback,
    CanceledError,
    E_REASON_UNMOUNTED
}
