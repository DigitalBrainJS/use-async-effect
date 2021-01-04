import React from "react";
import {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {useAsyncEffect, E_REASON_UNMOUNTED} from "../../lib/use-async-effect";
import {CanceledError, CPromise} from "c-promise2";
import cpFetch from "cp-fetch";

export default function TestComponent(props) {
    const [text, setText] = useState("");

    const [cancel, ref]= useAsyncEffect(function* ({onCancel}) {
        console.log("mount");

        //this.timeout(1000);

        onCancel(()=> console.log('scope canceled'));

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

    return <div>{text}</div>;
}
