import React, {useRef} from "react";
import {
  useAsyncDeepState
} from "../../lib/use-async-effect";

let renderCounter= 0;

export default function TestComponent7(props) {
  const symbol= Symbol('test');

  const [state, setState] = useAsyncDeepState({
    foo: 123,
    bar: 456,
    counter: 0,
    items: [],
    [symbol]: "test"
  });

  console.log('Rendered state: ', JSON.stringify(state));

  return (
    <div className="component">
      <div className="caption">useAsyncState demo:</div>
      <div>renderCounter: {++renderCounter}</div>
      <pre>{JSON.stringify(state, null, 2)}</pre>

      <button onClick={async()=>{
        const newState= await setState((state)=> {
          return {counter: state.counter + 1}
        });

        console.log('Updated state: ', newState);
      }}>Inc foo</button>

      <button onClick={()=>{
        setState((_state)=>{
          return {items: [..._state.items, {timestamp: Date.now()}]};
        })
      }}>Add item</button>

      <button onClick={()=>{
        state.items= [{message: "test"}];
      }}>Replace item using setter</button>

      <button onClick={()=>{
        state.items.push({message: "pushed, render as needed"});
        setState(null);
      }}>Push item and render as needed</button>

      <button onClick={()=>{
        state.items.push({message: "pushed, forced render"});
        setState(true);
      }}>Push item and re-render anyway</button>

      <button onClick={()=>setState((_state)=>{
        console.log('splice', state.items.slice(0));
        return ({
          items: state.items.splice(0)
        })
      })}>Set cloned object as items value</button>
    </div>
  );
}
