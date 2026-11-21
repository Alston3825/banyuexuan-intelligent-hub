export declare function runVersionedUpdate<T>(fn: () => Promise<T>): Promise<T>;
export declare function retryOnVersionConflict<T>(attemptFn: () => Promise<T>, maxAttempts?: number): Promise<T>;
