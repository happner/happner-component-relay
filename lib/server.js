var env = process.env.NODE_ENV;
var request = require('request');
var Promise = require('bluebird');
var shortid = require('shortid');

module.exports = Server;

function Server() {
  this.relays = {};
}


Server.prototype.destroyRelay = function($happn, token, callback) {

  var componentName = token.name;
  var code = token.code;

  if (this.relays[componentName].code != code) {
    return new Error('Bad name or code.');
  }

  var targetEventApi;
  var subscriptions;

  if (targetEventApi = this.relays[componentName].targetEventApi) {
    if (subscriptions = this.relays[componentName].subscriptions) {
      Object.keys(subscriptions).forEach(function(refId) { // <--------------------- Assured correct? even after remote restart
        targetEventApi.off(refId, function() {});
      });
    }
  }

  $happn._mesh._destroyElement(componentName, callback);
}

Server.prototype.createRelayConnected = function($happn, connection, relaySpec, callback) {

  // TODO: server assigns componentName (esp. when using mount point)
  // TODO: pending mount point

  var _this = this;
  var componentName = relaySpec.component.name;

  if (env != 'test') {
    if (this.relays[componentName]) {
      return callback(new Error('Component name ' + componentName + ' not available!'));
    }
  }

  this.relays[componentName] = {
    pending: Date.now(),
    subscriptions: {}
  };

  // 'Asynchronous' create dynamic module instance. (For extended distributed fancyness later).

  return this.createDynamicModule('connected', $happn, connection, relaySpec, function(e, instance, routes) {

    if (e) {
      delete _this.relays[componentName];
      return callback(e);
    }

    // Insert 'representative component' into the mesh.

    var elementSpec = {
      module: {
        name: componentName,
        config: {
          instance: instance
        }
      },
      component: {
        name: componentName,
        config: {
          module: componentName,
          schema: {
            methods: relaySpec.component.description.methods
          },
          web: {
            routes: routes
          },
          events: relaySpec.component.description.events,
          data: {} // none!
        }
      }
    };

    $happn._mesh._createElement(elementSpec, true, function(e) {
      if (e) {
        _this.relays[componentName].subscriptions.forEach(function(refId) {
          // TODO: what happens in happn if it restarts, are these
          //       subscription id's still valid after reconnect??
          _this.relays[componentName].targetEventApi.off(refId, function() {});
        });
        delete _this.relays[componentName];
        return callback(e);
      }

      var code = shortid.generate();

      if (env = 'test') {
        _this.relays[componentName] = _this.relays[componentName] || {};
      }

      delete _this.relays[componentName].pending;
      _this.relays[componentName].code = code;
      _this.relays[componentName].created = Date.now();

      callback(null, {
        name: componentName,
        code: code
      });
    });
  });

}

Server.prototype.createRelayEvented = function($happn, relaySpec, callback) {

  return callback(new Error('Relay without reverse connection not yet implemented'));

  // var componentName = relaySpec.component.name;
  // var componentDescription = relaySpec.component.description;

}

Server.prototype.createDynamicModule = function(type, $happn, connection, relaySpec, callback) {

  var _this = this;
  var instance = {};
  var routes = {};

  var address = connection.target.hostname || connection.target.address;
  var port = connection.target.port;
  var protocol = connection.target.protocol;

  var targetName = relaySpec.component.description.name;
  var targetExchangeApi = connection.endpoint.exchange[targetName];
  var targetEventApi = connection.endpoint.event[targetName];
  var targetMethods = relaySpec.component.description.methods;
  var targetRoutes = relaySpec.component.description.routes;
  var targetEvents = relaySpec.component.description.events;

  var componentName = relaySpec.component.name;
  var relayComponent; // does not yet exist

  if (env = 'test') {
    this.relays[componentName] = this.relays[componentName] || {
      subscriptions: {}
    };
  }

  this.relays[componentName].targetEventApi = targetEventApi;

  // Create relay exchange methods

  Object.keys(targetMethods).forEach(function(methodName) {
    instance[methodName] = function() {
      targetExchangeApi[methodName].apply(this, arguments);
    }
  });

  // Create relay webMethods

  var host = address == '127.0.0.1' ? 'localhost' : address;
  var urlBase;
  if (protocol) {
    urlBase = protocol + '://' + host + (port == 80 || port == 443 ? '' : ':' + port);
  }
  else {
    urlBase = port == 80 ? 'http://' + host : port == 443 ? 'https://' + host : 'http://' + host + ':' + port;
  }

  Object.keys(targetRoutes).forEach(function(path) {

    var url = urlBase + path;
    var parts = path.split('/');  // while webroutes are still 1depth 'flat'
    if (parts.length > 3) return; // ignore /meshname/componentname/methodname
    
    var webRoute = path.split('/')[2]; // extract methodname from /componentname/methodname

    // for web.routes in component config

    routes[webRoute] = path;

    // the corresponding method on the module instance

    instance[path] = function(req, res) {

      // supports nothing fancy yet... (only get)

      var options = {
        url: url + req.url,
        method: req.method,
        headers: req.headers,
        // body: req.method == 'POST' || request.method == 'PUT' ? req.body : undefined,
      }

      request(options).pipe(res);
    }

  });

  // Create relay events

  Promise.all(Object.keys(targetEvents).map(function(path) {
    return new Promise(function(resolve, reject) {
      targetEventApi.on(path,
        function(data, meta) {

          try {
            relayComponent = relayComponent || $happn._mesh.elements[componentName].component.instance
          } catch (e) {
            $happn.log.$$DEBUG('relay component \'%s\' to \'%s\' not yet installed', componentName, targetName);
            return;
          }

          // TODO: revisit after feature/mount-point

          // NB: If component.descript.events contains duplicates then events will double-up here
          //
          //  eg:
          //
          //    events: {
          //      '/planets/earth': {},
          //      '/planets/*': {},
          //    }
          //
          //    when target emits '/planets/earth' there will be two listeners here that receive and
          //    relay the event.
          //

          // remove "/events/meshname/componentname' from path.

          var event = meta.path.split('/').slice(4).join('/');

          relayComponent.emit(event, data);

        },
        function(e, refId) {
          

          if (e) {
            // unsub from succeeded so far
            _this.relays[componentName].subscriptions.forEach(function(refId) {
              targetEventApi.off(refId, function() {});
            });
            return reject(e);
          }

          _this.relays[componentName].subscriptions[refId] = 1;
          resolve();
        }
      );
    });
  }))

  .then(function() {
    callback(null, instance, routes);
  })

  .catch(callback);
  
}
