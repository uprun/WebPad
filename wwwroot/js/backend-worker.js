importScripts("../lib/knockout/knockout-latest.debug.js")
importScripts("lookup.js")
importScripts("populateColorPresets.js")

importScripts("model_Card.js")
importScripts("model_ColorPreset.js")
importScripts("model_Connection.js")
importScripts("model_Node.js")
importScripts("Instanciate_model_node.js")
importScripts("GetRandomColor.js")
importScripts("Instanciate_model_connection.js")
importScripts("findNodeById.js")




importScripts("populate.js")

lookup.hashCards = {};

lookup.populateColorPresets();

// system functions

function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

function reply() {
  if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
  postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': Array.prototype.slice.call(arguments, 1) });
}

onmessage = function(oEvent) {
  if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
    lookup[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
    reply(oEvent.data.queryMethod + '.finished');
  } else {
    defaultReply(oEvent.data);
  }
};