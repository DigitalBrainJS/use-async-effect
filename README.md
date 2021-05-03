[![Build Status](https://travis-ci.com/DigitalBrainJS/use-async-effect.svg?branch=master)](https://travis-ci.com/DigitalBrainJS/use-async-effect)
![npm](https://img.shields.io/npm/dm/use-async-effect2)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-async-effect)
![David](https://img.shields.io/david/DigitalBrainJS/use-async-effect)
[![Stars](https://badgen.net/github/stars/DigitalBrainJS/use-async-effect)](https://github.com/DigitalBrainJS/use-async-effect/stargazers)

## useAsyncEffect2 :snowflake:
This library provides `useAsyncEffect` and `useAsyncCallback` React hooks that make possible to cancel async code
inside it and unsubscribe the internal routines if needed (request, timers etc.).
These hooks are very useful for data fetching, since you don't have to worry about request
cancellation when components unmounts. So just forget about `isMounted` flag and `AbortController`, 
which were used to protect your components from React leak warning, these hooks do that for you automatically.
Writing cancellable async code becomes easy.
## Installation :hammer:
- Install for node.js using npm/yarn:

```bash
$ npm install use-async-effect2
```

```bash
$ yarn add use-async-effect2
```

## Why
Every asynchronous procedure in your component that changes its state must properly handle the unmount event
and stop execution in some way before attempting to change the state of the unmounted component, otherwise
you will get the well-known React leakage warning:
````
Warning: Can't perform a React state update on an unmounted component. 
This is an no-op, but it indicates a memory leak in your application. 
To fix, cancel all subscriptions and asynchronous task in "a useEffect cleanup function".
````

It uses [c-promise2](https://www.npmjs.com/package/c-promise2) to make it work. 
When used in conjunction with other libraries from CPromise ecosystem,
such as [cp-fetch](https://www.npmjs.com/package/cp-fetch) and [cp-axios](https://www.npmjs.com/package/cp-axios),
you get a powerful tool for building asynchronous logic of React components.

`useAsyncEffect` & `useAsyncCallback` hooks make cancelable async functions from generators,
providing the ability to cancel async sequence in any stage in automatically way, when the related component unmounting.
It's totally the same as async functions, but with cancellation- you need use 'yield' instead of 'await'. That's all.

A tiny `useAsyncEffect` demo with JSON fetching using internal states: 

[Live demo to play](https://codesandbox.io/s/use-async-effect-fetch-tiny-ui-states-g5qd7)

````javascript
export default function JSONViewer(props) {
    const [cancel, done, result]= useAsyncEffect(function*(){
      return (yield cpAxios(props.url)).data;
    }, {states: true})

    return (
        <div className="component">
            <div className="caption">useAsyncEffect demo:</div>
            <div>{done? JSON.stringify(result) : "loading..."}</div>
            <button onClick={cancel}>Cancel async effect</button>
        </div>
    );
}
````

[Another demo](https://codesandbox.io/s/use-async-effect-fetch-tiny-ui-xbmk2?file=/src/TestComponent.js)

````jsx
import React from "react";
import {useState} from "react";
import {useAsyncEffect} from "use-async-effect2";
import cpFetch from "cp-fetch";

function JSONViewer(props) {
    const [text, setText] = useState("");

    useAsyncEffect(function* () {
            setText("fetching..."); 
            const response = yield cpFetch(props.url); // will throw a CanceledError if component get unmounted
            const json = yield response.json();
            setText(`Success: ${JSON.stringify(json)}`);
    }, [props.url]);

    return <div>{text}</div>;
}
````
Notice: the related network request will be aborted, when unmounting.

Live search for character from the `rickandmorty` universe using `rickandmortyapi.com`:

[Live demo](https://codesandbox.io/s/use-async-effect-axios-rickmorty-search-ui-sd2mv?file=/src/TestComponent.js)
````jsx
import React, { useState } from "react";
import {
  useAsyncCallback,
  E_REASON_UNMOUNTED,
  CanceledError
} from "use-async-effect2";
import { CPromise } from "c-promise2";
import cpAxios from "cp-axios";

export default function TestComponent(props) {
  const [text, setText] = useState("");

  const handleSearch = useAsyncCallback(
    function* (event) {
      const { value } = event.target;
      if (value.length < 3) return;
      yield CPromise.delay(1000);
      setText("searching...");
      try {
        const response = yield cpAxios(
          `https://rickandmortyapi.com/api/character/?name=${value}`
        ).timeout(props.timeout);
        setText(response.data?.results?.map(({ name }) => name).join(","));
      } catch (err) {
        CanceledError.rethrow(err, E_REASON_UNMOUNTED);
        setText(err.response?.status === 404 ? "Not found" : err.toString());
      }
    },
    { cancelPrevious: true }
  );

  return (
    <div className="component">
      <div className="caption">
        useAsyncCallback demo: Rickandmorty universe character search
      </div>
      Character name: <input onChange={handleSearch}></input>
      <div>{text}</div>
      <button className="btn btn-warning" onClick={handleSearch.cancel}>
        Cancel request
      </button>
    </div>
  );
}
````
This code handles the cancellation of the previous search sequence (including aborting the request) and
canceling the sequence when the component is unmounted to avoid the React leak warning.

An example with a timeout & error handling ([Live demo](https://codesandbox.io/s/async-effect-demo1-vho29?file=/src/TestComponent.js)):
````jsx
import React, { useState } from "react";
import { useAsyncEffect, E_REASON_UNMOUNTED, CanceledError} from "use-async-effect2";
import cpFetch from "cp-fetch";

export default function TestComponent(props) {
  const [text, setText] = useState("");
  const [isPending, setIsPending] = useState(true);

  const cancel = useAsyncEffect(
    function* ({ onCancel }) {
      console.log("mount");

      this.timeout(props.timeout);

      onCancel(() => console.log("scope canceled"));

      try {
        setText("fetching...");
        const response = yield cpFetch(props.url);
        const json = yield response.json();
        setIsPending(false);
        setText(`Success: ${JSON.stringify(json)}`);
      } catch (err) {
        CanceledError.rethrow(err, E_REASON_UNMOUNTED); //passthrough for UNMOUNTED rejection
        setIsPending(false);
        setText(`Failed: ${err}`);
      }

      return () => {
        console.log("unmount");
      };
    },
    [props.url]
  );

  return (
    <div className="component">
      <div className="caption">useAsyncEffect demo:</div>
      <div>{text}</div>
      <button onClick={cancel} disabled={!isPending}>
        Cancel request
      </button>
    </div>
  );
}
````
`useAsyncCallback` example: fetch with progress capturing & cancellation 
 ([Live demo](https://codesandbox.io/s/use-async-callback-axios-catch-ui-l30h5?file=/src/TestComponent.js)):
````javascript
import React, { useState } from "react";
import { useAsyncCallback, E_REASON_UNMOUNTED } from "use-async-effect2";
import { CPromise, CanceledError } from "c-promise2";
import cpAxios from "cp-axios";
import { ProgressBar } from "react-bootstrap";

export default function TestComponent(props) {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUrl = useAsyncCallback(
    function* (options) {
      try {
        setIsFetching(true);
        this.innerWeight(3); // for progress calculation
        this.progress(setProgress);
        setText("fetching...");
        const response = yield cpAxios(options).timeout(props.timeout);
        yield CPromise.delay(500); // just for fun
        yield CPromise.delay(500); // just for fun
        setText(JSON.stringify(response.data));
        setIsFetching(false);
      } catch (err) {
        CanceledError.rethrow(err, E_REASON_UNMOUNTED);
        setText(err.toString());
        setIsFetching(false);
      }
    },
    [props.url]
  );

  return (
    <div className="component">
      <div className="caption">useAsyncEffect demo:</div>
      <div>{isFetching ? <ProgressBar now={progress * 100} /> : text}</div>
      {!isFetching ? (
        <button
          className="btn btn-success"
          onClick={() => fetchUrl(props.url)}
          disabled={isFetching}
        >
          Fetch data
        </button>
      ) : (
        <button
          className="btn btn-warning"
          onClick={() => fetchUrl.cancel()}
          disabled={!isFetching}
        >
          Cancel request
        </button>
      )}
    </div>
  );
}
````

To learn more about available features, see the c-promise2 [documentation](https://www.npmjs.com/package/c-promise2).

### Wiki

See the [Project Wiki](https://github.com/DigitalBrainJS/use-async-effect/wiki) to get the most exhaustive guide.

## Playground

To get it, clone the repository and run `npm run playground` in the project directory or
just use the codesandbox [demo](https://codesandbox.io/s/async-effect-demo1-vho29) to play with the library online.

## API

### useAsyncEffect(generatorFn, deps?: []): (cancel():boolean)
### useAsyncEffect(generatorFn, options?: object): (cancel():boolean)
A React hook based on [`useEffect`](https://reactjs.org/docs/hooks-effect.html), that resolves passed generator as asynchronous function. 
The asynchronous generator sequence and its promise of the result will be canceled if 
the effect cleanup process started before it completes.
The generator can return a cleanup function similar to the `useEffect` hook. 
- `generatorFn(scope: CPromise)` : `GeneratorFunction` - generator to resolve as an async function. 
Generator context (`this`) refers to the CPromise instance.
- `deps?: any[] | UseAsyncEffectOptions` - effect dependencies

#### UseAsyncEffectOptions:
- `options.deps?: any[]` - effect dependencies
- `options.skipFirst?: boolean` - skip first render
- `options.states: boolean= false` - use states

#### Available states vars:
- `done: boolean` - the function execution is completed (with success or failure)
- `result: any` - refers to the resolved function result
- `error: object` - refers to the error object. This var is always set when an error occurs.
- `canceled:boolean` - is set to true if the function has been failed with a `CanceledError`.

All these vars are defined on the returned `cancelFn` function and can be alternative reached through
the iterator interface in the following order: 
````javascript
const [cancelFn, done, result, error, canceled]= useAsyncEffect(/*code*/);
````

### useAsyncCallback(generatorFn, deps?: []): CPromiseAsyncFunction
### useAsyncCallback(generatorFn, options?: object): CPromiseAsyncFunction
This hook makes an async callback that can be automatically canceled on unmount or by user request.
- `generatorFn([scope: CPromise], ...userArguments)` : `GeneratorFunction` - generator to resolve as an async function. 
Generator context (`this`) and the first argument (if `options.scopeArg` is set) refer to the CPromise instance.
- `deps?: any[] | UseAsyncCallbackOptions` - effect dependencies
#### UseAsyncCallbackOptions:
- `deps: any[]` - effect dependencies 
- `combine:boolean` - subscribe to the result of the async function already 
running with the same arguments or run a new one. 
- `cancelPrevious:boolean` - cancel the previous pending async function before running a new one. 
- `threads: number=0` - set concurrency limit for simultaneous calls. `0` mean unlimited.
- `queueSize: number=0` - set max queue size.
- `scopeArg: boolean=false` - pass `CPromise` scope to the generator function as the first argument.
- `states: boolean=false` - enable state changing. The function must be single threaded to use the states.

#### Available states vars:
- `pending: boolean` - the function is in the pending state
- `done: boolean` - the function execution is completed (with success or failure)
- `result: any` - refers to the resolved function result
- `error: object` - refers to the error object. This var is always set when an error occurs.
- `canceled:boolean` - is set to true if the function has been failed with a `CanceledError`.

All these vars are defined on the decorated function and can be alternative reached through
the iterator interface in the following order: 
````javascript
const [decoratedFn, cancelFn, pending, done, result, error, canceled]= useAsyncCallback(/*code*/);
````

## Related projects
- [c-promise2](https://www.npmjs.com/package/c-promise2) - promise with cancellation, decorators, timeouts, progress capturing, pause and user signals support
- [cp-axios](https://www.npmjs.com/package/cp-axios) - a simple axios wrapper that provides an advanced cancellation api
- [cp-fetch](https://www.npmjs.com/package/cp-fetch) - fetch with timeouts and request cancellation
- [cp-koa](https://www.npmjs.com/package/cp-koa) - koa with middlewares cancellation

## License

The MIT License Copyright (c) 2021 Dmitriy Mozgovoy robotshara@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
