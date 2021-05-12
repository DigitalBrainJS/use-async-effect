import React, { useState } from "react";
import { useAsyncCallback } from "../../lib/use-async-effect";
import { CPromise } from "c-promise2";

function TestComponent(props) {
  const [combine, setCombine] = useState(false);
  const [cancelPrevious, setCancelPrevious] = useState(false);
  const [randomDelay, setRandomDelay] = useState(false);
  const [queueSize, setQueueSize] = useState(-1);
  const [list, setList] = useState([]);

  const [callback, cancel, pending, done, result, err] = useAsyncCallback(
    function* (...args) {
      this.timeout(props.timeout);
      console.log(`start [${args}]`);
      yield CPromise.delay(randomDelay ? 2000 + Math.random() * 5000 : 4000);
      if (args[1]) {
        throw args[1];
      }
      console.log(`end [${args}]`);
      return new Date().toLocaleTimeString();
    },
    {
      states: true,
      deps: [props.url, combine, cancelPrevious, randomDelay, queueSize],
      combine,
      cancelPrevious,
      queueSize
    }
  );

  const pushTask = (...args) => {
    const promise = callback(...args)
      .catch((err) => {
        setList((list) =>
          list.map((item) =>
            item.task === promise
              ? {
                ...item,
                title: `Task with [${args}] argument failed ${err.toString()}`,
                err
              }
              : item
          )
        );
        return CPromise.delay(3000);
      })
      .then(() => {
        setList((list) => list.filter((entry) => promise !== entry.task));
      });
    setList((list) => [
      ...list,
      {
        title: `Task with [${args}] argument queued at ${new Date().toLocaleTimeString()}`,
        arg: args,
        task: promise
      }
    ]);
  };

  return (
    <div className="component">
      <div className="caption">useAsyncCallback combine demo:</div>
      <div>
        {done ? (err ? err.toString() : result) : pending ? "pending..." : ""}
      </div>
      <button onClick={() => pushTask("🍊")}>Make a call with 🍊</button>
      <button onClick={() => pushTask("🍓")}>Make a call with 🍓</button>
      <button onClick={() => pushTask("🍏")}>Make a call with 🍏</button>
      <button onClick={() => pushTask("🍑")}>Make a call with 🍑</button>
      <button onClick={() => pushTask("🍇", new Error("my error"))}>
        Make a call with 🍇 that will fail after 4000ms
      </button>
      <button className="btn btn-danger" onClick={cancel} disabled={!pending}>
        Cancel all running calls
      </button>
      <div>
        useAsyncCallback Options:
        <ul>
          <li>
            <label>
              combine
              <input
                type="checkbox"
                onChange={({ target }) => setCombine(target.checked)}
              />
            </label>
          </li>
          <li>
            <label>
              cancelPrevious
              <input
                type="checkbox"
                onChange={({ target }) => setCancelPrevious(target.checked)}
              />
            </label>
          </li>
          <li>
            <label>
              Queue size:&nbsp;
              <input
                type="number"
                min="-1"
                max="100"
                value={queueSize}
                step="1"
                onChange={({ target }) => setQueueSize(target.value * 1)}
              />
            </label>
          </li>
          <li>
            <label>
              use random delay for tasks
              <input
                type="checkbox"
                onChange={({ target }) => setRandomDelay(target.checked)}
              />
            </label>
          </li>
        </ul>
      </div>
      <div>
        Requested calls [{list.length}]:
        <ul>
          {list.map(({ title, err, task }) => (
            <li style={{ color: err && "red" }}>
              {title}&nbsp;
              {!err && (
                <button
                  onClick={() => {
                    task.cancel();
                  }}
                >
                  ❌
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TestComponent;


