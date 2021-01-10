import React from "react";
import { useState } from "react";
import { useAsyncCallback, E_REASON_UNMOUNTED } from "../../lib/use-async-effect";
import { CPromise, CanceledError } from "c-promise2";

export default function TestComponent2() {
    const [text, setText] = useState("");

    const asyncRoutine = useAsyncCallback(
        function* (a, b) {
            setText(`Stage1`);
            yield CPromise.delay(1000);
            setText(`Stage2`);
            yield CPromise.delay(1000);
            setText(`Stage3`);
            yield CPromise.delay(1000);
            setText(`Done`);
            return Math.random();
        },
        { cancelPrevious: true }
    );

    const onClick = () => {
        asyncRoutine(123, 456, Math.random()).then(
            (value) => {
                setText(`Result: ${value}`);
            },
            (err) => {
                console.warn(err);
                CanceledError.rethrow(E_REASON_UNMOUNTED);
                setText(`Fail: ${err}`);
            }
        );
    };

    return (
        <div className="component">
            <div className="caption">useAsyncCallback demo:</div>
            <button onClick={onClick}>Run async job</button>
            <div>{text}</div>
            <button onClick={() => asyncRoutine.cancel()}>Abort</button>
        </div>
    );
}
