import React from "react";
import {useState} from "react";
import {
  useAsyncCallback,
  useAsyncWatcher,
} from "../../lib/use-async-effect";
import cpAxios from "cp-axios";
import {CPromise} from "c-promise2"

export default function TestComponent7(props) {
  const [text, setText] = useState("");
  const [value, setValue] = useState(0);
  const [input, setInput] = useState("");

  const [fn, cancel, pending, done, result, err, canceled, paused] = useAsyncCallback(function* () {
    for(const stage of ['stage1', 'stage2', 'stage3', 'stage4', 'stage5']){
      setText(`Stage: ${stage}`);
      yield CPromise.delay(1000);
    }
    return "Done";
  }, {states: true, deps: [value]})


  return (
    <div className="component">
      <div className="caption">useAsyncCallback pause demo:</div>
      <div>{text}</div>
      <div>{pending ? "loading..." : (done ? err ? err.toString() : JSON.stringify(result, null, 2) : "")}</div>
      <button onClick={fn} disabled={pending}>Run</button>
      <button onClick={paused? fn.resume : fn.pause} disabled={!pending}>{paused? "Resume" : "Pause"}</button>
      <button onClick={cancel} disabled={!pending}>Cancel async effect</button>
    </div>
  );
}
