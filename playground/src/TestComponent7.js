import React from "react";
import {
  useAsyncDeepState
} from "../../lib/use-async-effect";

export default function TestComponent7(props) {
  const symbol= Symbol('test');

  const [state, setState] = useAsyncDeepState({
    foo: 123,
    bar: 456,
    counter: 0,
    [symbol]: "test"
  });

  return (
    <div className="component">
      <div className="caption">useAsyncState demo:</div>
      <div>{state.counter}</div>
      <button onClick={async()=>{
        const [newState, oldState]= await setState((state)=> {
          return {counter: state.counter + 1}
        });

        console.log(`Updated counter: ${newState.counter}, old counter: ${oldState.counter}`);
        console.log('Updated state: ', newState.toJSON(),' old state: ', oldState.toJSON());
      }}>Inc</button>
      <button onClick={()=>setState((state)=>{
         counter: state.counter
      })}>Set the same state value</button>
    </div>
  );
}
