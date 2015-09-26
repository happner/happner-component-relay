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
