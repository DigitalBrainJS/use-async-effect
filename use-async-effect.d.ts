interface UseAsyncFnOptions {
    deps?: [],
    combine?: false,
    cancelPrevious?: false,
    concurrency?: 0
}

type CancelReason= string|Error;

export function useAsyncHook(generator: GeneratorFunction, deps?: any[]): ((reason?: CancelReason)=> boolean)
export function useAsyncCallback(generator: GeneratorFunction, deps?: any[]): ((reason?: CancelReason)=> boolean)
export function useAsyncCallback(generator: GeneratorFunction, options?: UseAsyncFnOptions): ((reason?: CancelReason)=> boolean)
export const E_REASON_UNMOUNTED: 'E_REASON_UNMOUNTED'

