module.exports = ComponentRelay;

function ComponentRelay() {

}

ComponentRelay.prototype.create = function($happn, relaySpec, callback) {

  var MeshClient = $happn.Mesh.MeshClient;

  var target = relaySpec.target;
  var componentName = relaySpec.component.name;
  var componentDescription = relaySpec.component.description;

  callback(null);
}

ComponentRelay.prototype.$happner = {
  config: {
    component: {
      accessLevel: 'mesh'
    }
  }
}
