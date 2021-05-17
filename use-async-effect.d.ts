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
    states?: boolean
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
    states?: boolean
}

export type CancelReason = string | Error;

export interface CancelFn {
    (reason?: CancelReason): boolean
}

export type pendingState = boolean;
export type doneState = boolean;
export type resultState = boolean;
export type errorState = boolean;
export type canceledState = boolean;

export interface DecoratedCallback {
    (...args: any[]): any

    cancel: (reason?: CancelReason)=> void,
    0: DecoratedCallback,
    1: (reason?: CancelReason)=> void,
    2: pendingState,
    3: doneState,
    4: resultState,
    5: errorState,
    6: canceledState,
}

export type CPromiseGeneratorYield = null | PromiseLike<any> | CPromiseGeneratorYield[];

export interface CPromiseGenerator {
    (...args: any[]): Generator<CPromiseGeneratorYield>
}

export function useAsyncEffect(generator: CPromiseGenerator, deps?: any[]): CancelFn
export function useAsyncEffect(generator: CPromiseGenerator, options?: UseAsyncEffectOptions): CancelFn
export function useAsyncCallback(generator: CPromiseGenerator, deps?: any[]): DecoratedCallback
export function useAsyncCallback(generator: CPromiseGenerator, options?: UseAsyncFnOptions): DecoratedCallback

export function useAsyncState(initialValue: any): [any, (newState?: any)=> Promise<unknown>]
export function useAsyncWatcher(...values: any): (grabPrevValue?: boolean)=> Promise<any>



export const E_REASON_UNMOUNTED: 'E_REASON_UNMOUNTED'
export const E_REASON_QUEUE_OVERFLOW: 'E_REASON_QUEUE_OVERFLOW'
export const E_REASON_RESTART: 'E_REASON_RESTART'

