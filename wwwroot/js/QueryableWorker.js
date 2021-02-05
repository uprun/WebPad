lookup.QueryableWorker = function (url, defaultListener, onError) 
{
    var instance = this;
    var worker = new Worker(url);
    var listeners = {};
    var self = this;

    self.defaultListener = defaultListener || function() {};

    if (onError) {worker.onerror = onError;}

    self.postMessage = function(message) {
      worker.postMessage(message);
    }

    self.terminate = function() {
      worker.terminate();
    }

    self.addListener = function(name, listener) {
      listeners[name] = listener;
    }

    self.removeListener = function(name) {
      delete listeners[name];
    }

    /*
      This functions takes at least one argument, the method name we want to query.
      Then we can pass in the arguments that the method needs.
    */
   self.sendQuery = function() {
      if (arguments.length < 1) {
        throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
        return;
      }
      worker.postMessage({
        'queryMethod': arguments[0],
        'queryMethodArguments': Array.prototype.slice.call(arguments, 1)
      });
    }

    worker.onmessage = function(event) {
      if (event.data instanceof Object &&
        event.data.hasOwnProperty('queryMethodListener') &&
        event.data.hasOwnProperty('queryMethodArguments')) 
        {
          if(typeof(listeners[event.data.queryMethodListener]) !== 'undefined')
          {
            setTimeout(function() {
              listeners[event.data.queryMethodListener].apply(instance, event.data.queryMethodArguments);
            }, 1);
          }
          else
          {
            console.log("did not find listener for: " + event.data.queryMethodListener);
          }

          
        } else 
        {
          self.defaultListener.call(instance, event.data);
        }
    }
};