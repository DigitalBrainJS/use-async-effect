import React from "react";
import { useState } from "react";
import { useAsyncCallback, useAsyncEffect, E_REASON_UNMOUNTED } from "../../lib/use-async-effect";
import { CPromise, CanceledError } from "c-promise2";
import cpAxios from "cp-axios";

export default function TestComponent3(props) {
    const [fetch, cancel, pending, done, result, error]= useAsyncCallback(function*(){
      return (yield cpAxios(props.url)).data;
    }, {threads: 1, states: true})

    return (
        <div className="component">
            <div className="caption">useAsyncCallback demo:</div>
            <div>{done? error? error.toString() : JSON.stringify(result) : pending? "loading..." : "Press fetch"}</div>
          {pending ? <button onClick={cancel}>Cancel</button> :  <button onClick={fetch}>Fetch</button>}
        </div>
    );
}
