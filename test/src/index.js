import React, {useState} from "react";
import ReactDOM from "react-dom";
import {useAsyncEffect} from "../../lib/use-async-effect";
import CPromise from "c-promise2";

const measureTime = () => {
    let timestamp = Date.now();
    return () => Date.now() - timestamp;
}

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve, ms, value));


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
            <TestComponent></TestComponent>,
            document.getElementById('root')
        );

    })

    it("should handle cancellation", function (done) {

        let counter = 0;
        let time = measureTime();

        function TestComponent() {
            const [value, setValue] = useState(0);

            const [cancel] = useAsyncEffect(function* () {
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
            <TestComponent></TestComponent>,
            document.getElementById('root')
        );

    })
});
