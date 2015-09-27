module.exports = Relay;

var format = require('util').format;
var Server = require('./server');
var Client = require('./client');

function Relay() {
  this.connections = {};
  this.server = new Server();
  this.client = new Client();
}

Relay.prototype.$happner = {
  config: {
    component: {
      accessLevel: 'mesh'
    }
  }
}

Relay.prototype.addConnection = function(id, connection) {
  this.connections[id] = connection;
}

Relay.prototype.addConnection.$happner = {ignore: true};


Relay.prototype.create = function($happn, opts, callback) {

}

Relay.prototype.destroy = function($happn, opts, callback) {

}

Relay.prototype.list = function(callback) {
  callback(null, this.client.list);
}


Relay.prototype.destroyServer = function($happn, key, callback) {
  this.server.destroyRelay($happn, key, callback);
}

Relay.prototype.createServer = function($happn, relaySpec, callback) {

  var _this = this;
  var MeshClient = $happn.Mesh.MeshClient;
  var target = relaySpec.target;
  var id, interval;

  if (typeof target == 'undefined' || !target.address || !target.port) {
    return this.server.createRelayEvented($happn, relaySpec, callback);
  };


  // TODO: with security, connections may need more than addr:port as storage key

  id = format('%s:%d', target.address, target.port);

  target.logger = $happn.log;

  if (!this.connections[id]) {

    // Make new connection

    _this.addConnection(id, {
      target: target,
      connecting: true,
    });


    return MeshClient(target, function(e, client) {

      if (e) {

        // connection failed... (fallback to relay over event api)

        // TODO: ensure login failure falls through here too.

        delete _this.connections[id];
        return _this.server.createRelayEvented($happn, relaySpec, callback);
      }

      _this.connections[id].endpoint = client;
      _this.connections[id].connecting = false;
      _this.server.createRelayConnected($happn, _this.connections[id], relaySpec, callback);
    });
  }

  if (!this.connections[id].endpoint) {
    
    // Already connecting, a previous call to relay.create(), wait...

    interval = setInterval(function() {

      if (!_this.connections[id]) {

        // Meanwhile... the connection failed

        clearInterval(interval);
        return _this.server.createRelayEvented($happn, relaySpec, callback);
      }

      if (_this.connections[id].endpoint) {
        
        // Meanwhile... the connection succeeded

        clearInterval(interval);
        return _this.server.createRelayConnected($happn, _this.connections[id], relaySpec, callback);
      }

    }, 100);
    return;
  }

  return _this.server.createRelayConnected($happn, _this.connections[id], relaySpec, callback);

}
