import React, {useEffect, useCallback, useState} from "react";
import {CPromise} from "c-promise2";
import {
  useAsyncWatcher,
} from "../../lib/use-async-effect";

export default function TestComponent7(props) {
  const [counter, setCounter] = useState(0);
  const [text, setText] = useState("");

  const textWatcher = useAsyncWatcher(text);

  useEffect(() => {
    setText(`Counter: ${counter}`);
  }, [counter]);

  const inc = useCallback(() => {
    (async () => {
      await CPromise.delay(1000);
      setCounter((counter) => counter + 1);
      const updatedText = await textWatcher();
      console.log(updatedText);
    })();
  }, []);

  return (
    <div className="component">
      <div className="caption">useAsyncWatcher demo</div>
      <div>{counter}</div>
      <button onClick={inc}>Inc counter</button>
    </div>
  );
}
