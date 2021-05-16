import React from "react";
import {useState} from "react";
import {
  useAsyncCallback,
  useAsyncWatcher,
} from "../../lib/use-async-effect";
import cpAxios from "cp-axios";

export default function TestComponent7(props) {
  const [value, setValue] = useState(0);

  const [fn, cancel, pending, done, result, err] = useAsyncCallback(function* () {
    console.log('inside callback the value is:', value);
    return (yield cpAxios(`https://rickandmortyapi.com/api/character/${value}`)).data;
  }, {states: true, deps: [value]})

  const callbackWatcher = useAsyncWatcher(fn);

  return (
    <div className="component">
      <div className="caption">useAsyncWatcher demo:</div>
      <div>{pending ? "loading..." : (done ? err ? err.toString() : JSON.stringify(result, null, 2) : "")}</div>
      <input value={value} type="number" onChange={async ({target}) => {
        setValue(target.value * 1);
        const [fn]= await callbackWatcher();
        await fn();
      }}/>
      {<button onClick={cancel} disabled={!pending}>Cancel async effect</button>}
    </div>
  );
}
