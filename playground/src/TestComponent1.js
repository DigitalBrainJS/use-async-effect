import React from "react";
import {useState} from "react";
import {useAsyncEffect, E_REASON_UNMOUNTED} from "../../lib/use-async-effect";
import {CanceledError} from "c-promise2";
import cpFetch from "cp-fetch";

export default function TestComponent1(props) {
    const [text, setText] = useState("");

    const cancel = useAsyncEffect(function* ({onCancel}) {
        console.log("mount");

        this.timeout(10000);

        onCancel(() => console.log('scope canceled'));

        try {
            setText("fetching...");
            const response = yield cpFetch(props.url);
            const json = yield response.json();
            setText(`Success: ${JSON.stringify(json)}`);
        } catch (err) {
            CanceledError.rethrow(err, E_REASON_UNMOUNTED); //passthrough
            setText(`Failed: ${err}`);
        }

        return () => {
            console.log("unmount", this.isCanceled);
        };
    }, [props.url]);

    //setTimeout(()=> cancel("Ooops!"), 1000);

    return <div className="component">
        <div className="caption">useAsyncEffect demo:</div>
        <div>{text}</div>
        <button onClick={cancel}>Abort</button>
    </div>;
}

