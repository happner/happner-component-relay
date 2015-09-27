var request = require('request');
var Promise = require('bluebird');

module.exports.relayConnected = function($happn, connection, relaySpec, callback) {

  // TODO: server assigns componentName (esp. when using mount point)
  // TODO: pending mount point

  var componentName = relaySpec.component.name;
  // var componentDescription = relaySpec.component.description;


  // 'Asynchronous' create dynamic module instance. (For extended distributed fancyness later).

  return module.exports.createDynamicModule('connected', $happn, connection, relaySpec, function(e, instance, routes) {

    if (e) return callback(e);

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

    $happn._mesh._createElement(elementSpec, true, callback);

  });

}

module.exports.relayEvented = function($happn, relaySpec, callback) {

  var componentName = relaySpec.component.name;
  var componentDescription = relaySpec.component.description;

}

module.exports.createDynamicModule = function(type, $happn, connection, relaySpec, callback) {

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

  var relayName = relaySpec.component.name;
  var relayComponent; // does not yet exist

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
            relayComponent = relayComponent || $happn._mesh.elements[relayName].component.instance
          } catch (e) {
            $happn.log.$$DEBUG('relay component \'%s\' to \'%s\' not yet installed', relayName, targetName);
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
        function(e, id) {
          relaySpec.subscriptions = relaySpec.subscriptions || {};

          if (e) {
            // unsub from succeeded so far
            relaySpec.subscriptions.forEach(function(id) {
              targetEventApi.off(id, function() {});
            });
            return reject(e);
          }

          relaySpec.subscriptions[id] = 1;
          resolve(id);
        }
      );
    });
  }))

  .then(function(results) {
  })

  .then(function() {
    callback(null, instance, routes);
  })

  .catch(callback);
  
  
}
