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

module.exports.createDynamicModule = function(type, $happn, connection, relaySpec, callback) {

  // TODO: per type

  var instance = {};
  var targetName = relaySpec.component.description.name;
  var targetMethods = relaySpec.component.description.methods;
  var ok = true;

  Object.keys(targetMethods).forEach(function(methodName) {

    var argCount = targetMethods[methodName].parameters.length || 2;

    // Need correct amount of args declared for module defaulter to
    // produce a 'correct' description.

    // TODO: Rather make actual config from description.
    //       To replicate useful "usage" info from the remote.
    //       Assuming the remote did not alos default.
    //

    switch (targetMethods[methodName].parameters.length || 2) {

      case 1: 
        return instance[methodName] = function(callback) {
          // TODO: support remote as ""also"" mounted at alt path

                                                                         // I could be mistaken but,
                                                                        //  I don't think this 'this' matters
                                                                       //   (at this time)
                                                                      //
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      case 2: 
        return instance[methodName] = function(arg1, callback) {
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      case 3: 
        return instance[methodName] = function(arg1, arg2, callback) {
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      case 4: 
        return instance[methodName] = function(arg1, arg2, arg3, callback) {
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      case 5: 
        return instance[methodName] = function(arg1, arg2, arg3, arg4, callback) {
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      case 6: 
        return instance[methodName] = function(arg1, arg2, arg3, arg4, arg5, callback) {
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      case 7: 
        return instance[methodName] = function(arg1, arg2, arg3, arg4, arg5, arg6, callback) {
          connection.endpoint.exchange[targetName][methodName].apply(this, arguments);
        };

      default:

        // Silently ignore methods with no arguments or crazy many arguments

        break;

    }

  });
  
  callback(null, instance);
}
