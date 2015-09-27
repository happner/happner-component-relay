var path = require('path');

// The module definition (to be relayed)

var thing = {
  exchangeMethod: function($happn, opts, callback) {
    opts.ReplyFrom = $happn.info.mesh.name + '.' + $happn.name;
    callback(null, opts);
  },
  webMethod: function($happn, req, res) {
    res.end('reply for ' + req.method + ' from ' + $happn.info.mesh.name + '.' + $happn.name + '.' + 'webMethod() with ' + req.url);
  },
  $happner: {
    config: {
      component: {
        web: {
          routes: {
            'method': 'webMethod'
          }
        },
        events: {
          'event1': {},
          'event2/*': {},
          'done': {},
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
      },
      'component-relay': {
        path: path.normalize(__dirname + '/../') // get at __this__ module
      }
    },
    components: {
      'thing1': {
        module: 'thing'
      },
      'thing2': {
        module: 'thing'
      },
      'relay': {
        module: 'component-relay'
      }
    }
  }
}
