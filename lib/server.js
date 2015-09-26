module.exports.relayConnected = function(happn, connection, relaySpec, callback) {

  var componentName = relaySpec.component.name;
  var componentDescription = relaySpec.component.description;

  callback();

}

module.exports.relayEvented = function(happn, relaySpec, callback) {

  var componentName = relaySpec.component.name;
  var componentDescription = relaySpec.component.description;

}
