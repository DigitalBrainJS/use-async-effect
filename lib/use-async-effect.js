const {useEffect, useCallback, useRef, useState} = require("react");
const {CPromise, CanceledError, E_REASON_UNMOUNTED} = require("c-promise2");
const isEqualObjects = require('is-equal-objects/dist/is-equal-objects.cjs');

const {E_REASON_QUEUE_OVERFLOW, E_REASON_RESTART} = CanceledError.registerErrors({
    E_REASON_QUEUE_OVERFLOW: 'overflow',
    E_REASON_RESTART: 'restarted',
})

const {hasOwnProperty}= Object.prototype;

const isGeneratorFn = (thing) => typeof thing === 'function' &&
    thing.constructor &&
    thing.constructor.name === 'GeneratorFunction';

const isEvent = (thing) => !!(thing && typeof thing === 'object' && thing.type);

const removeElement = (arr, element) => {
    const index = arr.indexOf(element);
    return (index !== -1) && arr.splice(index, 1);
}

/**
 * @typedef {function} CancelFn
 * @param {string} [reason]
 * returns {boolean}
 */

/**
 * AsyncEffect hook to define cancellable effects
 * @param {GeneratorFunction} generator
 * @param {object} [options]
 * @param {deps} [options.deps= []]
 * @param {boolean} [options.skipFirst= false]
 * @param {boolean} [options.states= false]
 * @returns {CancelFn}
 */
const useAsyncEffect = (generator, options) => {
    let ref = useRef(null);

    let {
        deps = [],
        skipFirst= false,
        states = false
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    const [state, setState]= states? useState({
        done: false,
        result: undefined,
        error: undefined,
        canceled: false
    }) : [];

    if (!isGeneratorFn(generator)) {
        throw TypeError('useAsyncEffect requires a generator as the first argument');
    }

    const cancel = (reason) => {
        const promise = ref.current && ref.current.promise;
        if (promise) {
            ref.current.promise = null;
            return promise.cancel(isEvent(reason) ? undefined : reason)
        }
        return false;
    }

    if(states) {
        cancel.done = state.done;
        cancel.result = state.result;
        cancel.error = state.error;
        cancel.canceled = state.canceled;

        cancel[Symbol.iterator] = function*() {
            yield* [cancel, state.done, state.result, state.error, state.canceled];
        }
    } else{
        cancel[Symbol.iterator] = function () {
            throw Error(`Can not unwrap states. The 'states' option is disabled`);
        }
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

        promise.then(result => {
            if (typeof result === 'function') {
                cb = result;
                states && setState({
                    done: true,
                    canceled: false
                })
                return;
            }

            states && setState({
                done: true,
                result: result,
                canceled: false
            })
        }, err => {
            if (!CanceledError.isCanceledError(err)) {
                if(states){
                    setState({
                        done: true,
                        error: err || new Error(err),
                        canceled: false
                    })
                }else{
                    console.error(err);
                }
                return;
            }

            state && err.code!==E_REASON_UNMOUNTED && setState({
                done: true,
                error: err,
                canceled: true
            })
        });

        return () => {
            cancel(E_REASON_UNMOUNTED);
            cb && cb();
        }
    }, deps);

    return cancel;
}

const argsToPromiseMap = new Map();

/**
 * @typedef {function} UseAsyncCallbackDecoratedFn
 * @param {CPromise} scope
 * @property {CancelFn} cancel
 * @returns {function|*}
 *//**
 * @typedef {function} UseAsyncCallbackDecoratedFn
 * @property {CancelFn} cancel
 * @returns {function|*}
 */

/**
 * useAsyncCallback hook for defining cancellable async routines
 * @param {GeneratorFunction} generator
 * @param {object|array} [options]
 * @param {array} [options.deps= []]
 * @param {boolean} [options.combine= false]
 * @param {number} [options.threads=0]
 * @param {number} [options.queueSize=0]
 * @param {boolean} [options.scopeArg= false]
 * @param {boolean} [options.states= true]
 * @returns {UseAsyncCallbackDecoratedFn}
 */
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
        threads = 0,
        queueSize = 0,
        scopeArg= false,
        states= false
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    if (cancelPrevious && (threads || queueSize)) {
        throw Error('cancelPrevious cannot be used in conjunction with threads or queueSize options');
    }

    if (threads && (!Number.isFinite(queueSize) || threads < 0)) {
        throw Error('threads must be a positive number');
    }

    if (queueSize && (!Number.isFinite(queueSize) || queueSize < 0)) {
        throw Error('queueSize must be a positive number');
    }

    const [state, setState]= states? useState({
        done: false,
        result: undefined,
        error: undefined,
        canceled: false,
        pending: false
    }) : [];

    if(cancelPrevious){
        threads= 1;
        queueSize= 0;
    }

    const singleThreaded= threads === 1 && !combine;

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

        cancelPrevious && cancel(E_REASON_RESTART);

        if (threads) {
            const promise = new CPromise(resolve => {
                if (current.pending === threads) {
                    return queue.push(() => {
                        current.pending++;
                        resolve()
                    });
                }
                current.pending++;

                if(states && singleThreaded){
                    setState({
                        done: false,
                        pending: true,
                        canceled: false
                    })
                }
                resolve();
            }).weight(0)
                .then(resolveGenerator)
                .finally((value, isRejected) => {
                    current.pending--;
                    removeElement(promises, promise);
                    combine && argsToPromiseMap.delete(promise);
                    queue.length && queue.shift()();

                    const canceled= !!(isRejected && CanceledError.isCanceledError(value));

                    if( canceled && value.code===E_REASON_UNMOUNTED){
                        return;
                    }

                    if(states && singleThreaded){
                        setState({
                            done: true,
                            pending: false,
                            error: isRejected? value : undefined,
                            result: isRejected? undefined : value,
                            canceled
                        })
                    }
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

    if(states) {
        if(!singleThreaded){
            throw Error(`Can not use states in not single threaded async function`);
        }
        callback.done = state.done;
        callback.pending = state.pending;
        callback.result = state.result;
        callback.error = state.error;
        callback.canceled = state.canceled;

        callback[Symbol.iterator] = function*() {
            yield* [callback, cancel, state.pending, state.done, state.result, state.error, state.canceled];
        }
    } else{
        callback[Symbol.iterator] = function*() {
            yield* [callback, cancel];
        }
    }

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
    E_REASON_UNMOUNTED,
    E_REASON_RESTART
}
