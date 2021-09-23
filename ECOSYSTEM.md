# Ecosystem

This is a list of `CPromise` related libraries and resources.

## Libraries

### General

* [c-promise2](https://www.npmjs.com/package/c-promise2) - Advanced cancellable promise that should be used with [`use-async-effect2`](https://www.npmjs.com/package/use-async-effect2) to get the most out of it

### React
* [use-async-effect](https://www.npmjs.com/package/use-async-effect2) (🔴 this library)- Feature-rich React async hooks that built on top of the cancellable promises ([`CPromise`](https://www.npmjs.com/package/c-promise2))

### Data fetching
* [cp-axios](https://www.npmjs.com/package/cp-axios) - Axios cancellable wrapper that supports CPromise context. Can be directly used in [`use-async-effect2`](https://www.npmjs.com/package/use-async-effect2) or general CPromise context
* [cp-fetch](https://www.npmjs.com/package/cp-fetch) - Cross-platform fetch wrapper that can be used in cooperation with [`use-async-effect2`](https://www.npmjs.com/package/use-async-effect2) or general [`CPromise`](https://www.npmjs.com/package/c-promise2) chains

### Server application framework
* [cp-koa](https://www.npmjs.com/package/cp-koa) - Wrapper for [`koa`](https://www.npmjs.com/package/koa), that implements cancellable middlewares/routes to the framework
