module.exports = ComponentRelay;

var format = require('util').format;

function ComponentRelay() {

  this.connections = {};

}

ComponentRelay.prototype.create = function($happn, relaySpec, callback) {

  var _this = this;
  var MeshClient = $happn.Mesh.MeshClient;
  var target = relaySpec.target;
  var componentName = relaySpec.component.name;
  var componentDescription = relaySpec.component.description;
  var connectionId, interval;

  if (!target && !target.address && !target.port) {
    console.log('TODO: proceed to relay setup with event layer');
    return;
  };

  connectionId = format('%s:%d', target.address, target.port);

  target.logger = $happn.log;

  if (!this.connections[connectionId]) {

    // Make new connection

    _this.connections[connectionId] = {
      target: target
    };
    
    MeshClient(target)

    .then(function(client) {
      _this.connections[connectionId].endpoint = client;

      console.log('TODO: proceed to relay setup with connection');
      callback();
    })

    .catch(function() {
      console.log('TODO: proceed to relay setup with event layer');
      callback();
    });
  
    return;
  }


  if (!this.connections[connectionId].endpoint) {
    
    // Already connecting, a previous call to relay.create(), wait...

    interval = setInterval(function() {

      if (!_this.connections[connectionId]) {

        // Meanwhile... the connection failed

        clearInterval(interval);
        console.log('TODO: proceed to relay setup with event layer');
        callback();
        return;
      }

      if (_this.connections[connectionId].endpoint) {
        
        // Meanwhile... the connection succeeded

        clearInterval(interval);
        console.log('TODO: proceed to relay setup with connection');
        callback();
        return;
      }

    }, 100);
    return;
  }

  console.log('TODO: proceed to relay setup with connection');
  callback();

}

ComponentRelay.prototype.$happner = {
  config: {
    component: {
      accessLevel: 'mesh'
    }
  }
}












