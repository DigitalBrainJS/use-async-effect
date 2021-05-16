import React from "react";
import {
  useAsyncCallback,
  useAsyncState
} from "../../lib/use-async-effect";
import cpAxios from "cp-axios";

export default function TestComponent7(props) {

  const [counter, setCounter] = useAsyncState(0);

  const [fn, cancel, pending, done, result, err] = useAsyncCallback(function* (value) {
    console.log('inside callback value is:', value);
    return (yield cpAxios(`https://rickandmortyapi.com/api/character/${value}`)).data;
  }, {states: true})

  return (
    <div className="component">
      <div className="caption">useAsyncState demo:</div>
      <div>{pending ? "loading..." : (done ? err ? err.toString() : JSON.stringify(result, null, 2) : "")}</div>
      <button onClick={async()=>{
        const updatedValue= await setCounter((counter)=> counter + 1);
        await fn(updatedValue);
      }}>Inc</button>
      {<button onClick={cancel} disabled={!pending}>Cancel async effect</button>}
    </div>
  );
}
