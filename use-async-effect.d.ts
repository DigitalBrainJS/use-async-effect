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
    concurrency?: number,
    /**
     * @default 0
     */
    queueSize?: number,
    /**
     * @default false
     */
    scopeArg?: boolean
}

export interface UseAsyncEffectOptions {
    /**
     * @default false
     */
    skipFirst: boolean,
    deps?: any[],
}

export type CancelReason = string | Error;

export interface CancelFn {
    (reason?: CancelReason): boolean
}

export interface DecoratedCallback {
    (...args: any[]): any

    cancel: (reason?: CancelReason)=> void
}

export type CPromiseGeneratorYield = null | PromiseLike<any> | CPromiseGeneratorYield[];

export interface CPromiseGenerator {
    (...args: any[]): Generator<CPromiseGeneratorYield>
}

export function useAsyncEffect(generator: CPromiseGenerator, deps?: any[]): CancelFn
export function useAsyncEffect(generator: CPromiseGenerator, options?: UseAsyncEffectOptions): CancelFn
export function useAsyncCallback(generator: CPromiseGenerator, deps?: any[]): DecoratedCallback
export function useAsyncCallback(generator: CPromiseGenerator, options?: UseAsyncFnOptions): DecoratedCallback

export const E_REASON_UNMOUNTED: 'E_REASON_UNMOUNTED'
export const E_REASON_QUEUE_OVERFLOW: 'E_REASON_QUEUE_OVERFLOW'

