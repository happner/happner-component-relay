module.exports = Client;

function Client() {
  this.running = {};   // list of components being relayed
  this.starting = {};  // list of components attempting to the relayed
  this.stopping = {};  // list of components attempting to stop being relayed
}

Client.prototype.createRelay = function($happn, opts, callback) {

  var localComponentName  = opts.local;
  var remoteComponentName = opts.remote;

  if (!localComponentName || ! $happn.exchange[localComponentName]) {
    return callback(new Error('Missing local component'));
  }

  if (!remoteComponentName) {
    return callback(new Error('Missing remote component'));
  }

  opts.relay = opts.relay || '/relay';
  var relay = opts.relay.split('/');
  var endpoint = relay[0];
  var relay = relay[1] || 'relay';

  if (endpoint == '') {
    var endpoints = Object.keys($happn._mesh.endpoints);
    if (endpoints.length > 1) {
      return callback(new Error('Too many endpoint to guess'));
    }
    endpoint = endpoints[0];
  }

  if (!endpoint || ! $happn.exchange[endpoint]) {
    return callback(new Error('Missing endpoint'));
  }

  $happn.exchange[endpoint][relay]();

}

Client.prototype.destroyRelay = function($happn, opts, callback) {
  
}
