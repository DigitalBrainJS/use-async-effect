import React from "react";
import { useState } from "react";
import { useAsyncCallback, useAsyncEffect, E_REASON_UNMOUNTED } from "../../lib/use-async-effect";
import { CPromise, CanceledError } from "c-promise2";
import cpAxios from "cp-axios";

export default function TestComponent3(props) {
    const [cancel, done, result]= useAsyncEffect(function*(){
      return (yield cpAxios(props.url)).data;
    },{states: true})

    return (
        <div className="component">
            <div className="caption">useAsyncEffect demo:</div>
            <div>{done? JSON.stringify(result) : "loading..."}</div>
            <button onClick={cancel}>Cancel async effect</button>
        </div>
    );
}
