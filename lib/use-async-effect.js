const {useEffect} = require("react");
const {CPromise, CanceledError} = require("c-promise2");

const {E_REASON_UNMOUNTED} = CanceledError.registerErrors({
    E_REASON_UNMOUNTED: 'unmounted'
})

const isGeneratorFn = (thing) => typeof thing === 'function' &&
    thing.constructor &&
    thing.constructor.name === 'GeneratorFunction';

const useAsyncEffect = (generator, deps) => {
    let promise;

    useEffect(() => {
        if (!isGeneratorFn(generator)) {
            throw TypeError('useAsyncEffect requires a generator as the first argument');
        }

        promise = CPromise.resolveGenerator(generator, {resolveSignatures: true});

        let cb;

        promise.then(_cb => {
            if (_cb !== undefined && typeof _cb !== 'function') {
                throw TypeError('useAsyncEffect handler should return a function');
            }
            cb = _cb;
        });

        return () => {
            promise.cancel(E_REASON_UNMOUNTED);
            promise = null;
            cb && cb();
        }
    }, deps);

    return [
        (reason) => !!promise && promise.cancel(reason)
    ]
}

module.exports = {
    useAsyncEffect,
    E_REASON_UNMOUNTED
}
