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

interface MockProxy {
  withSuccessHandler(fn: (result?: any) => void): MockProxy;
  withFailureHandler(fn: (error: Error) => void): MockProxy;
  [key: string]: any;
}

let mockServerDelay = 1000; // Default delay of 1 second

type LoggerLevel = 'debug' | 'info' | 'warn' | 'error';
let loggerLevel: LoggerLevel = 'info';

const createMock = (state = { success: null as any, failure: null as any }) => {
  return new Proxy({}, {
    get: (target, prop: string) => {
      // Handle withSuccessHandler chaining
      if (prop === 'withSuccessHandler') {
        return (fn: any) => {
          return createMock({ ...state, success: fn });
        };
      }

      // TRAP 2: withFailureHandler
      if (prop === 'withFailureHandler') {
        return (fn: any) => {
          return createMock({ ...state, failure: fn });
        };
      }

      // Invoke mock functions
      return (...args: any[]) => {
        if (loggerLevel === 'debug') console.log(`[MOCK] Calling server function: ${prop}`, args);
        const { success, failure } = state;
        // Simulate async behavior by using setTimeout to mimic 1s server delay
        setTimeout(() => {
          let result;
          let error = null;

          if (mocks[prop]) {
            result = mocks[prop](...args)
          } else {
            console.error(`[MOCK] Function ${prop} not found on server.`);
            error = new Error(`Function ${prop} not found on server.`);
          }

          // Execute callbacks
          // Execute the CAPTURED handlers (safe from other concurrent calls)
          if (error && failure) {
            failure(error);
          } else if (!error && success) {
            success(result);
          }
        }, mockServerDelay);
      };
    },
  });
};

export const setupMock = (delay = 1000, logLevel: LoggerLevel = 'info') => {
  mockServerDelay = delay;
  loggerLevel = logLevel;
  window.google = {
    script: {
      run: createMock() as MockProxy
    }
  };
}
