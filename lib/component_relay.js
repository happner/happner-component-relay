module.exports = ComponentRelay;

var format = require('util').format;
var server = require('./server');

function ComponentRelay() {

  this.connections = {};

}

ComponentRelay.prototype.addConnection = function(id, connection) {
  this.connections[id] = connection;
}

ComponentRelay.prototype.addConnection.$happner = {ignore: true};


ComponentRelay.prototype.create = function($happn, relaySpec, callback) {

  var _this = this;
  var MeshClient = $happn.Mesh.MeshClient;
  var target = relaySpec.target;
  var id, interval;

  if (!target && !target.address && !target.port) {
    console.log('TODO: proceed to relay setup with event layer');
    return;
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
    
    MeshClient(target)

    .then(function(client) {
      _this.connections[id].endpoint = client;
      _this.connections[id].connecting = false;
      return server.relayConnected($happn, _this.connections[id], relaySpec, callback);
    })

    .catch(function() {
      console.log('TODO: proceed to relay setup with event layer');
      callback();
    });
  
    return;
  }


  if (!this.connections[id].endpoint) {
    
    // Already connecting, a previous call to relay.create(), wait...

    interval = setInterval(function() {

      if (!_this.connections[id]) {

        // Meanwhile... the connection failed

        clearInterval(interval);
        console.log('TODO: proceed to relay setup with event layer');
        callback();
        return;
      }

      if (_this.connections[id].endpoint) {
        
        // Meanwhile... the connection succeeded

        clearInterval(interval);
        return server.relayConnected($happn, _this.connections[id], relaySpec, callback);
      }

    }, 100);
    return;
  }

  return server.relayConnected($happn, _this.connections[id], relaySpec, callback);

}

ComponentRelay.prototype.$happner = {
  config: {
    component: {
      accessLevel: 'mesh'
    }
  }
}












