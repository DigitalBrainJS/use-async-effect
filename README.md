![Travis (.com)](https://img.shields.io/travis/com/DigitalBrainJS/use-async-effect)
![npm](https://img.shields.io/npm/dm/use-async-effect2)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/use-async-effect)
![David](https://img.shields.io/david/DigitalBrainJS/use-async-effect)
[![Stars](https://badgen.net/github/stars/DigitalBrainJS/use-async-effect)](https://github.com/DigitalBrainJS/use-async-effect/stargazers)

## useAsyncEffect2
The library provides a React hook with ability to automatically cancel asynchronous code inside it.
It just makes it easier to write cancelable asynchronous code that doesn't cause 
the following React issue when unmounting, if your asynchronous tasks that change state are pending:
````
Warning: Can't perform a React state update on an unmounted component. 
This is an no-op, but it indicates a memory leak in your application. 
To fix, cancel all subscriptions and asynchronous task in "a useEffect cleanup function".
````
It uses [c-promise2](https://www.npmjs.com/package/c-promise2) to make it work. 
When it used in conjunction with other libraries that work with the CPromise,
such as [cp-fetch](https://www.npmjs.com/package/cp-fetch) and [cp-axios](https://www.npmjs.com/package/cp-axios),
you get a powerful tool for building asynchronous logic for your components.
You just have to use `generators` instead of an async function to make your code cancellable, 
but basically, that just means you will have to use `yield` instead of `await` keyword.
## Usage example
Minimal example with json request [Live demo](https://codesandbox.io/s/friendly-murdock-wxq8u?file=/src/App.js)
````jsx
import React from "react";
import {useState} from "react";
import {useAsyncEffect} from "use-async-effect2";
import cpFetch from "cp-fetch";

function JSONViewer(props) {
    const [text, setText] = useState("");

    useAsyncEffect(function* () {
            setText("fetching...");
            const response = yield cpFetch(props.url);
            const json = yield response.json();
            setText(`Success: ${JSON.stringify(json)}`);
    }, [props.url]);

    return <div>{text}</div>;
}
````
Example with timeout & error handling ([Live demo](https://codesandbox.io/s/async-effect-demo1-vho29)):
````jsx
import React from "react";
import {useState} from "react";
import {useAsyncEffect, E_REASON_UNMOUNTED} from "use-async-effect2";
import {CanceledError} from "c-promise2";
import cpFetch from "cp-fetch";

export default function TestComponent(props) {
    const [text, setText] = useState("");

    const [cancel]= useAsyncEffect(function* ({onCancel}) {
        console.log("mount");

        this.timeout(5000);

        onCancel(()=> console.log('scope canceled'));

        try {
            setText("fetching...");
            const response = yield cpFetch(props.url);
            const json = yield response.json();
            setText(`Success: ${JSON.stringify(json)}`);
        } catch (err) {
            CanceledError.rethrow(err, E_REASON_UNMOUNTED); //passthrough
            setText(`Failed: ${err}`);
        }

        return () => {
            console.log("unmount", this.isCanceled);
        };
    }, [props.url]);

    //setTimeout(()=> cancel("Ooops!"), 1000);

    return <div>{text}</div>;
}
````
To learn more about available features, see the c-promise2 [documentation](https://www.npmjs.com/package/c-promise2).

## Playground

To get it, clone the repository and run `npm run playground` in the project directory or
just use the codesandbox [demo](https://codesandbox.io/s/async-effect-demo1-vho29) to play with the library online.

## Related projects
- [c-promise2](https://www.npmjs.com/package/c-promise2) - promise with cancellation, decorators, timeouts, progress capturing, pause and user signals support
- [cp-axios](https://www.npmjs.com/package/cp-axios) - a simple axios wrapper that provides an advanced cancellation api
- [cp-fetch](https://www.npmjs.com/package/cp-fetch) - fetch with timeouts and request cancellation

## License

The MIT License Copyright (c) 2021 Dmitriy Mozgovoy robotshara@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
