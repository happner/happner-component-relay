// "Public" node

var path = require('path');

module.exports.config = function(i) {
  return {
    name: 'group' + i,
    port: 10000 + i,
    modules: {
      'component-relay': {
        path: path.normalize(__dirname + '/../') // get at __this__ module
      }
    },
    components: {
      'relay': {
        module: 'component-relay'
      }
    }
  }
}
