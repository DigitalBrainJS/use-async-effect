const {useEffect, useMemo, useRef, useState} = require("react");
const {CPromise, CanceledError, E_REASON_UNMOUNTED} = require("c-promise2");
const isEqualObjects = require('is-equal-objects/dist/is-equal-objects.cjs');

const {E_REASON_QUEUE_OVERFLOW, E_REASON_RESTART} = CanceledError.registerErrors({
    E_REASON_QUEUE_OVERFLOW: 'overflow',
    E_REASON_RESTART: 'restarted'
})

function isGeneratorFn(thing) {
    return typeof thing === 'function' && thing[Symbol.toStringTag] === 'GeneratorFunction';
}

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
 * @typedef {function} UseAsyncEffectCancelFn
 * @param {string} [reason]
 * @property {PauseFn} pause
 * @property {ResumeFn} resume
 * returns {boolean}
 */

/**
 * @typedef {function} PauseFn
 * @param {*} [data]
 * returns {boolean}
 */

/**
 * @typedef {function} ResumeFn
 * @param {*} [data]
 * returns {boolean}
 */

/**
 * AsyncEffect hook to define cancellable effects
 * @param {GeneratorFunction} generator
 * @param {object} [options]
 * @param {deps} [options.deps= []]
 * @param {boolean} [options.skipFirst= false]
 * @param {boolean} [options.states= false]
 * @returns {UseAsyncEffectCancelFn}
 */
const useAsyncEffect = (generator, options) => {
    let {current} = useRef({});

    let {
        deps = [],
        skipFirst= false,
        states = false
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    const [state, setState]= states? useAsyncDeepState({
        done: false,
        result: undefined,
        error: undefined,
        canceled: false,
        paused: false
    }, {watch: false}) : [];

    if (!isGeneratorFn(generator)) {
        throw TypeError('useAsyncEffect requires a generator as the first argument');
    }

    const cancel = useMemo(()=> {
        const cancel= (reason) => {
            const promise = current && current.promise;
            if (promise) {
                current.promise = null;
                return promise.cancel(isEvent(reason) ? undefined : reason)
            }
            return false;
        };

        cancel.pause= (data)=> current.promise.pause(data);
        cancel.resume= (data)=> current.promise.resume(data);

        if(states) {
            cancel[Symbol.iterator] = function*() {
                yield* [cancel, state.done, state.result, state.error, state.canceled, state.paused];
            }
        }else{
            cancel[Symbol.iterator] = function () {
                 throw Error(`Can not unwrap states. The 'states' option is disabled`);
            }
        }

        return cancel;
    });



    useEffect(() => {
        if (!current.inited) {
            current.inited = true;
            if (skipFirst) {
                return;
            }
        }

        let cb;

        let promise = current.promise = CPromise.run(generator, {resolveSignatures: true, scopeArg: true})
        .then(result => {
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

            state && err.code !== E_REASON_UNMOUNTED && setState({
                done: true,
                error: err,
                canceled: true
            })
        });

        if (states) {
            promise.onPause(() => {
                setState({
                    paused: true
                })
            });

            promise.onResume(() => {
                setState({
                    paused: false
                })
            });
        }

        return () => {
            cancel(E_REASON_UNMOUNTED);
            cb && cb();
        }
    }, deps);

    if(states) {
        cancel.done = state.done;
        cancel.result = state.result;
        cancel.error = state.error;
        cancel.canceled = state.canceled;
        cancel.paused = state.paused;
    }

    return cancel;
}

const argsToPromiseMap = new Map();

/**
 * @typedef {Function} UseAsyncCallbackDecoratedFn
 * @param {CPromise} [scope]
 * @param {*} [...userArgs]
 * @property {CancelFn} cancel
 * @property {PauseFn} pause
 * @property {ResumeFn} pause
 * @returns {*}
 *//**
 * @typedef {Function} UseAsyncCallbackDecoratedFn
 * @param {*} [...userArgs]
 * @property {CancelFn} cancel
 * @property {PauseFn} pause
 * @property {ResumeFn} pause
 * @returns {*}
 */

/**
 * useAsyncCallback hook for defining cancellable async routines
 * @param {GeneratorFunction} generator
 * @param {object|array} [options]
 * @param {array} [options.deps= []]
 * @param {boolean} [options.combine= false]
 * @param {number} [options.threads=0]
 * @param {number} [options.queueSize=0]
 * @param {boolean} [options.cancelPrevious=false]
 * @param {boolean} [options.scopeArg= false]
 * @param {boolean} [options.states= true]
 * @param {boolean} [options.catchErrors= true]
 * @returns {UseAsyncCallbackDecoratedFn}
 */
const useAsyncCallback = (generator, options) => {
    if (options != null && typeof options !== 'object') {
        throw TypeError('options must be an object or array');
    }

    const initialState = {
        done: false,
        result: undefined,
        error: undefined,
        canceled: false,
        pending: false
    };

    const {current} = useRef({
        promises: [],
        queue: [],
        pending: 0,
        args: null,
        callback: null
    });

    let {
        deps = [],
        combine = false,
        cancelPrevious = false,
        threads,
        queueSize = -1,
        scopeArg = false,
        states = false,
        catchErrors = false
    } = options && Array.isArray(options) ? {deps: options} : options || {};

    if (threads === undefined) {
        threads = cancelPrevious || states ? 1 : 0;
    } else {
        if (!Number.isFinite(threads) || threads < 0) {
            throw Error('threads must be a positive number');
        }
    }

    if (queueSize !== -1 && (!Number.isFinite(queueSize) || queueSize < -1)) {
        throw Error('queueSize must be a finite number >=-1');
    }

    const [state, setState] = states ? useAsyncDeepState(initialState, {watch: false}) : [];

    const singleThreaded = threads === 1;

    const callback = useMemo(() => {
        const {promises, queue}= current;

        const cancel = (reason) => {
            const _reason = isEvent(reason) ? undefined : reason;
            promises.forEach(promise => promise.cancel(_reason));
            promises.length = 0;
        };

        const pause= (data)=> promises.forEach(promise=> promise.pause(data));

        const resume= (data)=> promises.forEach(promise=> promise.resume(data));

        const fn = (...args) => {
            let n;

            if (combine && (n = promises.length)) {
                let promise;
                while (n-- > 0) {
                    promise = promises[n];
                    if (argsToPromiseMap.has(promise) && isEqualObjects(argsToPromiseMap.get(promise), args)) {
                        if (cancelPrevious) {
                            promise.cancel(E_REASON_RESTART);
                            break;
                        }
                        return CPromise.resolve(promise);
                    }
                }
            }

            const resolveGenerator = () => CPromise.run(generator, {args, resolveSignatures: true, scopeArg});

            cancelPrevious && !combine && cancel(E_REASON_RESTART);

            if (threads || queueSize !== -1) {
                let started;

                let promise = new CPromise(resolve => {
                    const start = () => {
                        current.pending++;

                        started = true;

                        if (states && singleThreaded) {
                            setState({
                                ...initialState,
                                pending: true,
                            })
                        }
                        resolve();
                    }

                    if (current.pending === threads) {
                        if (queueSize !== -1 && queue.length === queueSize) {
                            throw CanceledError.from(E_REASON_QUEUE_OVERFLOW);
                        }

                        return queue.push(start);
                    }

                    start();
                }).weight(0)
                  .then(resolveGenerator)
                  [catchErrors ? 'done' : 'finally']((value, isRejected) => {
                    started && current.pending--;
                    removeElement(promises, promise);
                    combine && argsToPromiseMap.delete(promise);
                    queue.length && queue.shift()();
                    const canceled = !!(isRejected && CanceledError.isCanceledError(value));

                    if (canceled && (value.code === E_REASON_UNMOUNTED || value.code === E_REASON_RESTART)) {
                        return;
                    }

                    states && singleThreaded && setState({
                        pending: false,
                        done: true,
                        error: isRejected ? value : undefined,
                        result: isRejected ? undefined : value,
                        canceled
                    });

                    return isRejected ? undefined : value;
                }).weight(0).aggregate();

                if(states && singleThreaded){
                    promise.onPause(()=> setState({
                        paused: true
                    }))

                    promise.onResume(()=> setState({
                        paused: false
                    }))
                }

                promises.push(promise);

                combine && argsToPromiseMap.set(promise, args);

                return promise;
            }

            cancelPrevious && cancel(E_REASON_RESTART);

            const promise = resolveGenerator()[catchErrors ? 'done' : 'finally'](() => {
                removeElement(promises, promise);
                combine && argsToPromiseMap.delete(promise);
            }).weight(0).aggregate();

            promises.push(promise);

            if (combine) {
                argsToPromiseMap.set(promise, args);
            }

            return promise;
        }

        fn.cancel = cancel;

        fn.pause= pause;

        fn.resume= resume;

        current.callback= fn;

        Object.defineProperty(fn, 'current', {
           get(){
               return current.callback;
           },
           configurable: true
        });

        return fn;
    }, deps);

    useEffect(() => {
        return () => callback.cancel(E_REASON_UNMOUNTED);
    }, deps);

    if(states) {
        if(!singleThreaded){
            throw Error(`Can not use states in not single threaded async function`);
        }
        callback.done = state.done;
        callback.pending = state.pending;
        callback.result = state.result;
        callback.error = state.error;
        callback.canceled = state.canceled;
        callback.paused = state.paused;

        callback[Symbol.iterator] = function*() {
            yield* [
              callback,
              callback.cancel,
              state.pending,
              state.done,
              state.result,
              state.error,
              state.canceled,
              state.paused
            ];
        }
    } else{
        callback[Symbol.iterator] = function*() {
            yield* [callback, callback.cancel];
        }
    }

    return callback;
}
/**
 * useAsyncDeepState hook whose setter returns a promise
 * @param {*} [initialValue]
 * @param {Boolean} [watch= true]
 * @returns {[any, function(*=, boolean=): (Promise<*>|undefined)]}
 */
const useAsyncDeepState = (initialValue, {watch= true}= {}) => {
    const {current} = useRef({});

    if(!current.inited){
        if (initialValue !== undefined && typeof initialValue !== "object") {
            throw TypeError('initial state must be a plain object');
        }

        const state= initialValue? Object.assign({}, initialValue) : {};

        Object.assign(current, {
            state,
            oldState: null,
            callbacks: new Map()
        })
    }

    const [state, setState] = useState(!current.inited && Object.create(current.state));

    current.inited= true;

    watch && useEffect(()=>{
        const data= [state, current.oldState];
        current.callbacks.forEach(cb=> cb(data));
        current.callbacks.clear();
        current.oldState= Object.assign({}, current.state);
    }, [state]);

    return [
        state,
        /**
         * state async accessor
         * @param {Object} [newState]
         * @returns {Promise<*>|undefined}
         */
        function (newState) {
            const setter= (scope, cb)=>{
                if (typeof newState === 'function') {
                    newState = newState(current.state);
                }

                if (newState != null && typeof newState !== 'object') {
                    throw new TypeError('new state must be a plain object');
                }

                setState((state)=>{
                    if(newState == null || isEqualObjects(Object.assign(current.state, newState), current.oldState)){
                        scope && cb([state, current.oldState]);
                        return state;
                    }

                    if (scope) {
                        current.callbacks.set(scope, cb);
                        scope.onDone(() => current.callbacks.delete(scope))
                    }

                    return Object.create(current.state)
                });
            }

            if (!watch) {
                setter();
                return;
            }

            return new CPromise((resolve, reject, scope) => {
                setter(scope, resolve);
            });
        }
    ]
}

const useAsyncWatcher = (...value) => {
    const ref = useRef({
        oldValue: value
    });

    if (!ref.current.callbacks) {
        ref.current.callbacks = new Map()
    }

    const multiple= value.length > 1;

    useEffect(() => {
        const {current} = ref;
        const data = multiple ? value.map((value, index) => [value, current.oldValue[index]]) :
          [value[0], current.oldValue[0]];
        current.callbacks.forEach(cb => cb(data));
        current.callbacks.clear();
        current.oldValue = value;
    }, value);

    /**
     * @param {Boolean} [grabPrevValue]
     * @returns {Promise}
     */
    return (grabPrevValue) => {
        return new CPromise((resolve, reject, scope) => {
            ref.current.callbacks.set(scope, entry => {
                if (multiple) {
                    resolve(grabPrevValue ? entry : entry.map(values => values[0]))
                }

                resolve(grabPrevValue ? entry : entry[0]);
            });

            scope.onDone(()=>{
                ref.current.callbacks.delete(scope);
            })
        });
    }
}

module.exports = {
    useAsyncEffect,
    useAsyncCallback,
    useAsyncDeepState,
    useAsyncWatcher,
    CanceledError,
    E_REASON_UNMOUNTED,
    E_REASON_RESTART,
    E_REASON_QUEUE_OVERFLOW
}
