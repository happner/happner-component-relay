// "Private" node

// The module definition (to be relayed)

var thing = {
  exchangeMethod: function($happn, opts, callback) {
    opts.from = $happn.info.mesh.name + '.' + $happn.name;
    callback(null, opts);
  },
  webMethod: function($happn, req, res) {
    res.end('reply from ' + $happn.info.mesh.name + '.' + $happn.name);
  },
  $happner: {
    config: {
      component: {
        web: {
          routes: {
            'method': 'webMethod'
          }
        }
      }
    }
  }
}

module.exports.config = function(i, j) {
  return { 
    name: 'person' + i,
    port: 20000 + i,
    endpoints: (
        obj = {},
        obj['group' + j] = 'localhost:1000' + j,
        obj
    ),
    modules: {
      'thing': {
        instance: thing
      }
    },
    components: {
      'thing1': {
        module: 'thing'
      },
      'thing2': {
        module: 'thing'
      },
    }
  }
}
