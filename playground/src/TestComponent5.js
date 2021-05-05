import React, { useState } from "react";
import { useAsyncEffect, useAsyncCallback } from "../../lib/use-async-effect";
import { CPromise } from "c-promise2";

function* doJob2() {
  console.log("job2:begin");
  yield CPromise.delay(4000);
  console.log("job2:end");
}

const doJob3 = CPromise.promisify(function* () {
  console.log("job3:begin");
  yield CPromise.delay(4000);
  console.log("job3:end");
});

function TestComponent(props) {
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [cancel, done, result, err] = useAsyncEffect(
    function* () {
      this.progress((p) => {
        console.log(p);
        setProgress(p);
      });
      this.innerWeight(1);
      setStage("Stage 1");
      yield doJob3();
      /*setStage("Stage 2");
      yield doJob1();
      setStage("Stage 3");
      yield doJob1();*/
      //yield CPromise.delay(5000);
      return "Done";
    },
    { states: true, deps: [props.url] }
  );

  const doJob1 = useAsyncCallback(function* () {
    console.log("job1:begin");
    yield CPromise.delay(5000);
    console.log("job1:end");
  });

  return (
    <div className="component">
      <div className="caption">useAsyncEffect demo:</div>
      <div>
        {done ? (
          err ? (
            err.toString()
          ) : (
            result
          )
        ) : (
          progress
        )}
      </div>
      <button className="btn btn-danger" onClick={cancel} disabled={done}>
        Cancel async effect
      </button>
    </div>
  );
}

export default TestComponent;
