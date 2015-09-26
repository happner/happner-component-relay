// ps. implements `ln -s pa/th`

module.exports.relayConnected = function($happn, connection, relaySpec, callback) {

  // TODO: server assigns componentName (esp. when using mount point)
  // TODO: pending mount point

  var componentName = relaySpec.component.name;
  // var componentDescription = relaySpec.component.description;


  // 'Asynchronous' create dynamic module instance. (For extended distributed fancyness later).

  return module.exports.createDynamicModule('connected', $happn, connection, relaySpec, function(e, instance) {

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
          }
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

  // TODO: per type

  var instance = {};
  var targetName = relaySpec.component.description.name;
  var componentExchange = connection.endpoint.exchange[targetName]
  var targetMethods = relaySpec.component.description.methods;

  Object.keys(targetMethods).forEach(function(methodName) {
    instance[methodName] = function() {
      componentExchange[methodName].apply(this, arguments);
    }
  });
  
  callback(null, instance);
}
