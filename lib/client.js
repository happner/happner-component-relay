module.exports = Client;

function Client() {
  // this.starting = {};  // list of components attempting to be relayed
  this.running = {};   // list of components being relayed
  // this.stopping = {};  // list of components attempting to stop being relayed
}

Client.prototype.createRelay = function($happn, opts, callback) {

  var localComponentName  = opts.local;
  var remoteComponentName = opts.remote;

  if (!localComponentName || ! $happn.exchange[localComponentName]) {
    return callback(new Error('Missing local component \'' + localComponentName + '\''));
  }

  if (!remoteComponentName) {
    return callback(new Error('Missing remote component \'' + remoteComponentName + '\''));
  }

  opts.relay = opts.relay || '/relay';
  var relay = opts.relay.split('/');
  var endpoint = relay[0];
  var relay = relay[1] || 'relay';

  if (endpoint == '') {
    var endpoints = Object.keys($happn._mesh.endpoints).filter(function(name) {
      return name != $happn.info.mesh.name;
    });
    if (endpoints.length > 1) {
      return callback(new Error('Too many endpoints to guess'));
    }
    endpoint = endpoints[0];
  }

  if (!endpoint || ! $happn.exchange[endpoint]) {
    return callback(new Error('Missing endpoint'));
  }


  var relaySpec = {
    target: $happn.info.datalayer.address,
    component: {
      name: remoteComponentName,
      description: $happn._mesh.elements[localComponentName].component.instance.description
    }
  }

  var _this = this;
  $happn.exchange[endpoint][relay].createServer(relaySpec, function(e, token) {

    if (e) return callback(e);

    _this.running[endpoint+'/'+token.name] = {
      created: Date.now(),
      local: localComponentName,
      remote: token.name,
      endpoint: endpoint,
      relay: relay,
      token: token
    }

    callback(null, token);
  });
}

Client.prototype.destroyRelay = function($happn, token, callback) {

  // TODO: destroy all by localname

  var _this = this;
  var code = token.code;
  var destroy = Object.keys(this.running).filter(function(path) {
    var relay = _this.running[path];
    return code == relay.token.code;
  }).map(function(path) {
    return _this.running[path];
  })[0];

  $happn.exchange[destroy.endpoint][destroy.relay].destroyServer(destroy.token, function(e) {

    if (e) {
      // um. TODO: is the relay still there?, try again?
      return callback(e);
    }

    delete _this.running[destroy.endpoint+'/'+destroy.remote];
    callback();
    
  });
  
}
