import React from "react";
import {useState} from "react";
import {
  useAsyncCallback,
  useAsyncWatcher,
} from "../../lib/use-async-effect";
import cpAxios from "cp-axios";
import {CPromise} from "c-promise2"

export default function TestComponent7(props) {
  const [value, setValue] = useState(0);
  const [input, setInput] = useState("");

  const [fn, cancel, pending, done, result, err] = useAsyncCallback(function* () {
    console.log('inside callback the value is:', value);
    return (yield cpAxios(`https://rickandmortyapi.com/api/character/${value}`)).data;
  }, {states: true, deps: [value]})

  const callbackWatcher = useAsyncWatcher(fn);

  const onChange= useAsyncCallback(function*({target}){
    console.log('call', target.value);
    yield CPromise.delay(500);
    setValue(()=>target.value * 1);
    console.log('before');
/*    const [fn]= yield callbackWatcher();
    console.log('after');
    yield fn();*/
  }, {threads: 0})

  const handleTextChange = useAsyncCallback(
    function* (value) {
      yield CPromise.delay(500);
      setInput(value);
      console.log("start:1", value);
      //yield searchFnWatcher();
      console.log("watch");
    },
    { cancelPrevios: true }
  );


  return (
    <div className="component">
      <div className="caption">useAsyncWatcher demo:</div>
      <div>{pending ? "loading..." : (done ? err ? err.toString() : JSON.stringify(result, null, 2) : "")}</div>
      <input type="text" onChange={handleTextChange}/>
      <input value={value} type="number" onChange={onChange}/>
      {<button onClick={cancel} disabled={!pending}>Cancel async effect</button>}
    </div>
  );
}
