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

const asyncEffectFactory= (options) => {
    if (options != null) {
        if (typeof options !== 'object') {
            throw TypeError('options must be an object');
        }

        if (options.threads === undefined) {
            options.threads = options.cancelPrevious || options.states ? 1 : 0;
        } else {
            if (!Number.isFinite(options.threads) || options.threads < 0) {
                throw Error('threads must be a positive number');
            }

            if (options.states && options.threads !== 1) {
                throw Error(`Can not use states in not single threaded async function`);
            }
        }

        if (options.queueSize !== undefined && (!Number.isFinite(options.queueSize) || options.queueSize < -1)) {
            throw Error('queueSize must be a finite number >=-1');
        }
    }

    const promises= [];

    return {
        promises,
        queue: [],
        pending: 0,
        args: null,
        cancel : (reason) => {
            const _reason = isEvent(reason) ? undefined : reason;
            promises.forEach(promise => promise.cancel(_reason));
            promises.length = 0;
        },
        pause: (data)=> promises.forEach(promise=> promise.pause(data)),
        resume: (data)=> promises.forEach(promise=> promise.resume(data)),
        initialState: {
            done: false,
            result: undefined,
            error: undefined,
            canceled: false,
            pending: false
        },
        options: {
            deps: [],
            combine: false,
            cancelPrevious: false,
            threads: 0,
            queueSize: -1,
            scopeArg: false,
            states: false,
            catchErrors: false,
            ...(Array.isArray(options) ? {deps: options} : options)
        }
    };
}

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
    const current = useFactory(asyncEffectFactory, [options]);

    let {
        initialState,
        options: {
            deps,
            combine,
            cancelPrevious,
            threads,
            queueSize,
            scopeArg,
            states,
            catchErrors
        }
    } = current;

    const [state, setState] = states ? useAsyncDeepState(initialState, {watch: false}) : [];

    const callback = useMemo(() => {
        const {
            promises,
            queue,
            cancel,
            pause,
            resume
        } = current;

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

                        if (states) {
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

                    states && setState({
                        pending: false,
                        done: true,
                        error: isRejected ? value : undefined,
                        result: isRejected ? undefined : value,
                        canceled
                    });

                    return isRejected ? undefined : value;
                }).weight(0).aggregate();

                if(states){
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

        if(states) {
            const makeDescriptor = (name) => ({
                get() {
                    return state[name];
                }
            })

            Object.defineProperties(fn, {
                done: makeDescriptor('done'),
                pending: makeDescriptor('pending'),
                result: makeDescriptor('result'),
                error: makeDescriptor('error'),
                canceled: makeDescriptor('canceled'),
                paused: makeDescriptor('paused'),
                [Symbol.iterator]: {
                    value: function*() {
                        yield* [
                            fn,
                            cancel,
                            state.pending,
                            state.done,
                            state.result,
                            state.error,
                            state.canceled,
                            state.paused
                        ];
                    }
                }
            })
        } else{
            fn[Symbol.iterator] = function*() {
                yield* [fn, cancel];
            }
        }

        fn.cancel = cancel;

        fn.pause= pause;

        fn.resume= resume;

        return fn;
    }, deps);

    useEffect(() => {
        return () => callback.cancel(E_REASON_UNMOUNTED);
    }, []);

    return callback;
}

const initialized= new WeakSet();

const useFactory = (factory, args) => {
    const {current} = useRef({});

    if (initialized.has(current)) return current;

    initialized.add(current);

    Object.assign(current, factory.apply(null, args));

    return current;
}

const assignState= (obj, target)=>{
    Object.assign(obj, target);
    const symbols = Object.getOwnPropertySymbols(target);
    let i = symbols.length;
    while (i-- > 0) {
        const symbol = symbols[i];
        obj[symbol] = target[symbol];
    }
    return obj;
}

class ProtoState {
    constructor(initialState) {
        initialState && assignState(this, initialState);
    }

    toJSON() {
        const obj = {};
        let target = this;
        do {
            assignState(obj, target);
        } while ((target = Object.getPrototypeOf(target)) && target !== Object.prototype);
        return obj;
    }
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

        const state = new ProtoState(initialValue);

        Object.assign(current, {
            state,
            oldState: new ProtoState(initialValue),
            callbacks: new Map()
        })
    }

    const [state, setState] = useState(!current.inited && Object.freeze(Object.create(current.state)));

    watch && useEffect(()=>{
        if (!current.inited) return;
        const data= [state, current.oldState];
        current.callbacks.forEach(cb=> cb(data));
        current.callbacks.clear();
        current.oldState= new ProtoState(current.state);
    }, [state]);

    current.inited= true;

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
                    if(newState == null || isEqualObjects(assignState(current.state, newState), current.oldState)){
                        scope && cb([state, current.oldState]);
                        return state;
                    }

                    if (scope) {
                        current.callbacks.set(scope, cb);
                        scope.onDone(() => current.callbacks.delete(scope))
                    }

                    return Object.freeze(Object.create(current.state));
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
