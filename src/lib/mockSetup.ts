import { mocks } from './mocks';

// Extend the Window interface to include our google object
// This is necessary for TypeScript to recognize window.google.script.run
// It must be in this file not global.d.ts to work correctly
declare global {
  interface Window {
    google: {
      script: {
        run: MockProxy;
      };
    };
  }
}
export const setupMock = () => {
  const callbacks = {
    success: null as ((res: any) => void) | null,
    failure: null as ((err: any) => void) | null,
  };

  const proxyMock = new Proxy({}, {
    get: (target, prop: string) => {
      // Handle withSuccessHandler
      if (prop === 'withSuccessHandler') {
        return (fn: any) => {
          callbacks.success = fn;
          return proxyMock; // Return the proxy to keep chaining
        };
      }

      // Handle withFailureHandler
      if (prop === 'withFailureHandler') {
        return (fn: any) => {
          callbacks.failure = fn;
          return proxyMock; // Return the proxy to keep chaining
        };
      }

      // Invoke mock functions
      return (...args: any[]) => {
        console.log(`[MOCK] Calling server function: ${prop}`, args);

        // Simulate async behavior by using setTimeout to mimic 1s server delay
        setTimeout(() => {
          let result;
          let error = null;

          if (mocks[prop]) {
            result = mocks[prop](...args)
          } else {
            error = new Error(`Function ${prop} not found on server.`);
          }

          // Execute callbacks
          if (error && callbacks.failure) {
            callbacks.failure(error);
          } else if (!error && callbacks.success) {
            callbacks.success(result);
          }

          // Reset callbacks
          callbacks.success = null;
          callbacks.failure = null;
        }, 1000);
      };
    },
  });

  window.google = {
    script: {
      run: proxyMock as MockProxy
    }
  };
}
