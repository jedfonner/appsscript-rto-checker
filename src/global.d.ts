/* From https://developers.google.com/apps-script/reference/html */
declare const google: {
  script: {
    history: {
      push: function;
      replace: function;
      setChangeHandler: function;
    };
    host: {
      close: function;
      setHeight: function;
      setWidth: function;
      editor: {
        focus: function;
      };
    };
    run: {
      withSuccessHandler: function;
      withFailureHandler: function;
      withUserObject: function;
      [key: string]: function;
    };
    url: {
      getLocation: function;
    };
  };
};

interface GasError {
  message?: string;
  name?: string;
  stack?: string;
  [key: string]: any;
}
