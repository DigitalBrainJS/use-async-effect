import React, {useState} from "react";
import {
  useAsyncCallback
} from "../../lib/use-async-effect";
import {CPromise} from "c-promise2";

export default function TestComponent7(props) {
  const [text, setText] = useState("one two three four five");
  const [word, setWord] = useState("");

  const go = useAsyncCallback(
    function* (text, delay) {
      const words = text.split(/\s+/);
      for (const word of words) {
        setWord(word);
        yield CPromise.delay(delay);
      }
    },
    { states: true, cancelPrevious: true }
  );

  return (
    <div className="component">
      <div className="caption">useAsyncEffect demo</div>
      <input
        value={text}
        onChange={({ target }) => {
          setText(target.value);
        }}
      />
      <div>{go.error ? go.error.toString() : word}</div>
      {go.pending ? (
        go.paused ? (
          <button className="btn btn-warning" onClick={go.resume}>
            Resume
          </button>
        ) : (
          <button className="btn btn-warning" onClick={go.pause}>
            Pause
          </button>
        )
      ) : (
        <button className="btn btn-warning" onClick={() => go(text, 1000)}>
          Run
        </button>
      )}
      {go.pending && (
        <button className="btn btn-warning" onClick={go.cancel}>
          Cancel request
        </button>
      )}
    </div>
  );
}
