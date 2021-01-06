import React from "react";
import {useState} from "react";
import {useAsyncCallback} from "../../lib/use-async-effect";
import {CPromise} from "c-promise2";

export default function TestComponent2() {
    const [text, setText] = useState("");

    const asyncRoutine= useAsyncCallback(function*(v){
        setText(`Stage1`);
        yield CPromise.delay(1000);
        setText(`Stage2`);
        yield CPromise.delay(1000);
        setText(`Stage3`);
        yield CPromise.delay(1000);
        setText(`Done`);
        return v;
    })

    const onClick= ()=>{
        asyncRoutine(123).then(value=>{
            console.log(`Result: ${value}`)
        }, console.warn);
    }

    return <div className="component"><div className="caption">useAsyncCallback demo:</div><button onClick={onClick}>Run async job</button><div>{text}</div></div>;
}
