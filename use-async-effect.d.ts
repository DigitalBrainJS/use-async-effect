export interface UseAsyncFnOptions {
    /**
     * @default []
     */
    deps?: any[],
    /**
     * @default false
     */
    combine?: boolean,
    /**
     * @default false
     */
    cancelPrevious?: boolean,
    /**
     * @default 0
     */
    threads?: number,
    /**
     * @default 0
     */
    queueSize?: number,
    /**
     * @default false
     */
    scopeArg?: boolean,
    /**
     * @default false
     */
    states?: boolean,
    /**
     * @default false
     */
    catch?: boolean
}

export interface UseAsyncEffectOptions {
    /**
     * @default false
     */
    skipFirst: boolean,
    /**
     * @default []
     */
    deps?: any[],
    /**
     * @default false
     */
    states?: boolean,
    /**
     * @default false
     */
    once?: boolean
}

export type CancelReason = string | Error;

export type pendingState = boolean;
export type doneState = boolean;
export type resultState = boolean;
export type errorState = boolean;
export type canceledState = boolean;
export type pausedState = boolean;

export interface AsyncEffectCancelFn {
    (reason?: CancelReason): boolean,
    pause: (data: any)=> boolean,
    resume: (data: any)=> boolean,
    0: doneState,
    1: resultState,
    2: errorState,
    3: canceledState,
    4: pausedState
}

export interface DecoratedCallback {
    (...args: any[]): any

    cancel: (reason?: CancelReason)=> void,
    pause: (data: any)=> boolean,
    resume: (data: any)=> boolean,
    0: DecoratedCallback,
    1: (reason?: CancelReason)=> void,
    2: pendingState,
    3: doneState,
    4: resultState,
    5: errorState,
    6: canceledState,
    7: pausedState
}

export type CPromiseGeneratorYield = null | PromiseLike<any> | CPromiseGeneratorYield[];

export interface CPromiseGenerator {
    (...args: any[]): Generator<CPromiseGeneratorYield>
}

export interface UseAsyncDeepStateOptions {
    /**
     * @default true
     */
    watch?: boolean;
    /**
     * @default true
     */
    defineSetters?: boolean;
}

export function useAsyncEffect(generator: CPromiseGenerator, deps?: any[]): AsyncEffectCancelFn
export function useAsyncEffect(generator: CPromiseGenerator, options?: UseAsyncEffectOptions): AsyncEffectCancelFn
export function useAsyncCallback(generator: CPromiseGenerator, deps?: any[]): DecoratedCallback
export function useAsyncCallback(generator: CPromiseGenerator, options?: UseAsyncFnOptions): DecoratedCallback

export function useAsyncDeepState(initialValue?: object, options?: UseAsyncDeepStateOptions): [object, (newState?: object)=> Promise<unknown>|void]
export function useAsyncWatcher(...values: any): (grabPrevValue?: boolean)=> Promise<any>



export const E_REASON_UNMOUNTED: 'E_REASON_UNMOUNTED'
export const E_REASON_QUEUE_OVERFLOW: 'E_REASON_QUEUE_OVERFLOW'
export const E_REASON_RESTART: 'E_REASON_RESTART'

