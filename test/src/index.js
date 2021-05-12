import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";
import {useAsyncEffect, useAsyncCallback} from "../../lib/use-async-effect";
import {CPromise, CanceledError} from "c-promise2";

const measureTime = () => {
    let timestamp = Date.now();
    return () => Date.now() - timestamp;
}

const {E_REASON_QUEUE_OVERFLOW}= CanceledError;

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve, ms, value));

const noop= ()=>{}

const stateSnapshots= (reject, ...states)=>{
    let index= 0;
    const {length}= states;
    return (state)=>{
        try {
            assert.deepStrictEqual(state, states[index], `States at index [${index}] do not match`);
            index++;
        }catch(err){
            reject(err);
            return;
        }

        return index >= length;
    }
}

describe("useAsyncEffect", function () {

    it("should support generator resolving", function (done) {
        let counter = 0;
        let time = measureTime();

        function TestComponent() {
            const [value, setValue] = useState(0);

            useAsyncEffect(function* () {
                yield CPromise.delay(100);
                setValue(123);
            }, []);

            try {
                switch (counter++) {
                    case 0:
                        assert.strictEqual(value, 0);
                        break;
                    case 1:
                        if (time() < 100) {
                            assert.fail('Early remount detected');
                        }
                        assert.strictEqual(value, 123);
                        setTimeout(done, 500);
                        break;
                    default:
                        assert.fail('Unexpected state change');
                }
            } catch (err) {
                done(err);
            }

            return <div>Test</div>
        }

        ReactDOM.render(
            <TestComponent/>,
            document.getElementById('root')
        );
    })

    it("should handle cancellation", function (done) {

        let counter = 0;

        function TestComponent() {
            const [value, setValue] = useState(0);

            const cancel = useAsyncEffect(function* () {
                yield CPromise.delay(200);
                setValue(123);
                yield CPromise.delay(200);
                setValue(456);
                yield CPromise.delay(200);
                setValue(789);
            }, []);

            (async () => {
                switch (counter++) {
                    case 0:
                        assert.strictEqual(value, 0);
                        break;
                    case 1:
                        assert.strictEqual(value, 123);
                        break;
                    case 2:
                        assert.strictEqual(value, 456);
                        await delay(250);
                        done();
                        break;
                    default:
                        assert.fail('Unexpected state change');
                }
            })().catch(done);

            setTimeout(cancel, 500);

            return <div>Test</div>
        }

        ReactDOM.render(
            <TestComponent/>,
            document.getElementById('root')
        );

    });

    it("should able to catch cancellation error with E_REASON_UNMOUNTED code", function (done) {
        function TestComponent() {
            useAsyncEffect(function*(){
                try{
                    yield CPromise.delay(500);
                }catch(err){
                    CanceledError.rethrow(err, E_REASON_UNMOUNTED);
                    assert.fail('E_REASON_UNMOUNTED was not caught');
                }
                done();
            });

            return <div>Test</div>;
        }

        ReactDOM.render(
          <TestComponent/>,
          document.getElementById('root')
        );
    });
    describe('states', function (){
        it("should handle success case", function () {
            return new Promise((resolve, reject)=>{
                const matchState= stateSnapshots(reject, {
                    done: false,
                    result: undefined,
                    error: undefined,
                    canceled: false
                },{
                    done: true,
                    result: 123,
                    error: undefined,
                    canceled: false
                })

                function TestComponent() {
                    const [cancelFn, done, result, error, canceled]= useAsyncEffect(function*(){
                        return yield CPromise.delay(100, 123);
                    }, {states: true});

                    matchState({
                        done, result, error, canceled
                    }) && resolve();

                    return <div>Test</div>;
                }

                ReactDOM.render(
                  <TestComponent/>,
                  document.getElementById('root')
                );
            });
        });

        it("should handle failure case", function () {
            return new Promise((resolve, reject)=>{
                const targetError= new Error('test');

                const matchState= stateSnapshots(reject, {
                    done: false,
                    result: undefined,
                    error: undefined,
                    canceled: false
                },{
                    done: true,
                    result: undefined,
                    error: targetError,
                    canceled: false
                })

                function TestComponent() {
                    const [cancelFn, done, result, error, canceled]= useAsyncEffect(function*(){
                        yield CPromise.delay(100);
                        throw targetError;
                    }, {states: true});

                    matchState({
                        done, result, error, canceled
                    }) && resolve();

                    return <div>Test</div>;
                }

                ReactDOM.render(
                  <TestComponent/>,
                  document.getElementById('root')
                );
            });
        });

        it("should handle cancellation case", function () {
            return new Promise((resolve, reject)=>{
                const targetError= new CanceledError('test');

                const matchState= stateSnapshots(reject, {
                    done: false,
                    result: undefined,
                    error: undefined,
                    canceled: false
                },{
                    done: true,
                    result: undefined,
                    error: targetError,
                    canceled: true
                })

                function TestComponent() {
                    const [cancelFn, done, result, error, canceled]= useAsyncEffect(function*(){
                        yield CPromise.delay(100);
                        throw targetError;
                    }, {states: true});

                    useState(()=>{
                        setTimeout(()=> cancelFn(targetError), 50);
                    })

                    matchState({
                        done, result, error, canceled
                    }) && resolve();

                    return <div>Test</div>;
                }



                ReactDOM.render(
                  <TestComponent/>,
                  document.getElementById('root')
                );
            });
        });
    });
});

describe("useAsyncCallback", function () {
    it("should decorate user generator to CPromise", function (done) {
        let called = false;
        let time = measureTime();

        function TestComponent() {
            const fn = useAsyncCallback(function* (a, b) {
                called = true;
                yield CPromise.delay(100);
                assert.deepStrictEqual([a, b], [1, 2]);
            });

            fn(1, 2).then(() => {
                assert.ok(called);
                if (time() < 100) {
                    assert.fail('early completion');
                }

                done();
            }, done);

            return <div>Test</div>
        }

        ReactDOM.render(
            <TestComponent/>,
            document.getElementById('root')
        );
    });

    it("should support concurrency limitation", function (done) {
        let pending = 0;
        let counter = 0;
        const threads = 2;

        function TestComponent() {
            const fn = useAsyncCallback(function* () {
                if (++pending > threads) {
                    assert.fail(`threads excess ${pending}>${threads}`);
                }
                yield CPromise.delay(100);
                pending--;
                counter++;
            }, {threads});

            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(fn());
            }

            Promise.all(promises).then(() => {
                assert.strictEqual(counter, 10);
            }).then(() => done(), done);

            return <div>Test</div>
        }

        ReactDOM.render(
            <TestComponent/>,
            document.getElementById('root')
        );
    });

    it("should support combine option", function (done) {
        let pending = 0;
        let counter = 0;
        const concurrency = 1;
        let value = 0;

        function TestComponent() {
            const fn = useAsyncCallback(function* () {
                if (++pending > concurrency) {
                    assert.fail(`threads excess ${pending}>${concurrency}`);
                }
                yield CPromise.delay(100);
                pending--;
                counter++;
                return ++value;
            }, {combine: true});

            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(fn());
            }

            Promise.all(promises).then((results) => {
                assert.strictEqual(counter, 1, "counter fail");
                results.forEach(result => assert.strictEqual(result, value, "result fail"))
            }).then(() => done(), done);

            return <div>Test</div>
        }

        ReactDOM.render(
            <TestComponent/>,
            document.getElementById('root')
        );
    });

    it("should support cancelPrevious option", function (done) {
        let pending = 0;
        const concurrency = 1;

        function TestComponent() {

            const fn = useAsyncCallback(function* (v) {
                yield CPromise.delay(100);
                if (++pending > concurrency) {
                    assert.fail(`threads excess ${pending}>${concurrency}`);
                }
                yield CPromise.delay(200);
                return v;
            }, {cancelPrevious: true});

            Promise.all([
                fn(123).finally(() => {
                    pending--;
                }).then(() => {
                    assert.fail('was not cancelled');
                }, (err) => {
                    assert.ok(err instanceof CanceledError, `not canceled error ${err}`);
                    return true;
                }),
                delay(100).then(() => {
                    return fn(456)
                })
            ])
              .then(values => {
                  assert.deepStrictEqual(values, [true, 456])
                  done();
              }).catch(done);

            return <div>Test</div>
        }

        ReactDOM.render(
            <TestComponent/>,
            document.getElementById('root')
        );
    });

    describe('states', function (){
        it("should handle success case", function () {
            return new Promise((resolve, reject)=>{
                const matchState= stateSnapshots(reject, {
                    done: false,
                    result: undefined,
                    error: undefined,
                    pending: false,
                    canceled: false
                },{
                    done: false,
                    result: undefined,
                    error: undefined,
                    pending: true,
                    canceled: false
                },{
                    done: true,
                    pending: false,
                    result: 123,
                    error: undefined,
                    canceled: false
                });

                function TestComponent() {
                    const [fn, cancelFn, pending, done, result, error, canceled]= useAsyncCallback(function*(){
                        return yield CPromise.delay(100, 123);
                    }, {states: true, threads: 1});

                    matchState({
                        pending, done, result, error, canceled
                    }) && resolve();

                    useEffect(()=>{
                        fn();
                    }, []);

                    return <div>Test</div>;
                }

                ReactDOM.render(
                  <TestComponent/>,
                  document.getElementById('root')
                );
            });
        });

        it("should handle failure case", function () {
            return new Promise((resolve, reject)=>{
                const targetError= new Error('test');

                const matchState = stateSnapshots(reject, {
                    done: false,
                    pending: false,
                    result: undefined,
                    error: undefined,
                    canceled: false
                }, {
                    done: false,
                    result: undefined,
                    error: undefined,
                    pending: true,
                    canceled: false
                }, {
                    done: true,
                    pending: false,
                    result: undefined,
                    error: targetError,
                    canceled: false
                });

                function TestComponent() {
                    const [fn, cancelFn, pending, done, result, error, canceled]= useAsyncCallback(function*(){
                        yield CPromise.delay(100);
                        throw targetError;
                    }, {states: true, threads: 1});

                    matchState({
                        pending, done, result, error, canceled
                    }) && resolve();

                    useEffect(()=>{
                        fn().catch(noop);
                    }, []);

                    return <div>Test</div>;
                }

                ReactDOM.render(
                  <TestComponent/>,
                  document.getElementById('root')
                );
            });
        });

        it("should handle cancellation case", function () {
            return new Promise((resolve, reject)=>{
                const targetError= new CanceledError('test');

                const matchState = stateSnapshots(reject, {
                    done: false,
                    pending: false,
                    result: undefined,
                    error: undefined,
                    canceled: false
                }, {
                    done: false,
                    result: undefined,
                    error: undefined,
                    pending: true,
                    canceled: false
                }, {
                    done: true,
                    pending: false,
                    result: undefined,
                    error: targetError,
                    canceled: true
                });

                function TestComponent() {
                    const [fn, cancelFn, pending, done, result, error, canceled]= useAsyncCallback(function*(){
                        yield CPromise.delay(100);
                        throw targetError;
                    }, {states: true, threads: 1});

                    matchState({
                        pending, done, result, error, canceled
                    }) && resolve();

                    useEffect(()=>{
                        fn().catch(noop);
                        setTimeout(()=>{
                            cancelFn(targetError);
                        }, 50);
                    }, []);

                    return <div>Test</div>;
                }

                ReactDOM.render(
                  <TestComponent/>,
                  document.getElementById('root')
                );
            });
        });
    });

    it("should throw E_REASON_QUEUE_OVERFLOW if queue size exceeded", function (done) {
        let counter = 0;

        function TestComponent() {
            const fn = useAsyncCallback(function* () {
                counter++;
            }, {queueSize: 1, threads: 1});

            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(fn());
            }

            Promise.all(promises).then((results) => {
                assert.fail("doesn't throw an error");
            }, (err)=>{
                assert.ok(CanceledError.isCanceledError(err, E_REASON_QUEUE_OVERFLOW));
                assert.strictEqual(counter, 2);
            }).then(() => done(), done);

            return <div>Test</div>
        }

        ReactDOM.render(
          <TestComponent/>,
          document.getElementById('root')
        );
    });
});
