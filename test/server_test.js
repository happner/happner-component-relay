objective('Server', function() {

  before(function() {
    // mock('GroupConfig',  require('./_group_config').config);
    // mock('PersonConfig', require('./_person_config').config);
    mock('Promise', require('bluebird'));
    mock('expect', require('chai').expect);
    mock('should', new require('chai').should());
  });

  before(function() {

    mock('$happn', {
      _mesh: {}
    });

    mock('connection', {
      exchange: {
        'target_component': {} // The module at the 'remote' as visible over the connection.
      }
    });

    mock('relaySpec', {
      component: {
        name: 'relaying_component',
        description: {

          name: 'target_component',
          
          'methods': {
            exchangeMethod1: {
              // parameters: []   - NOT SUPPORTING other than standard (arg1, ..., argN, callback)
              // callback: {
              //   parameters: [] - NOT SUPPORTING other than standard (error, results)
              // }
            },
            exchangeMethod2: {},
            exchangeMethod3: {},
          },

          'routes': {
            '/thing1/method1': {},
            '/thing1/method2': {},
          }

        }
      }
    });

  });

  context('createDynamicModule()', function() {

    context('Using Connection', function() {

      it('creates relay functions according to description.methods',

        function(done, Server, expect, $happn, connection, relaySpec, Promise) {

          // Create expectations on the exchange for the target module's methods 

          mock(connection.exchange.target_component).does(
            function exchangeMethod1(arg1, arg2, callback) {
              callback(null, 'RESULT ' + arg1 + ' ' + arg2);
            },
            function exchangeMethod2(arg1, callback) {
              callback(null, 'RESULT ' + arg1);
            },
            function exchangeMethod3(callback) {
              callback(null, 'RESULT');
            }
          )

          Server.createDynamicModule('connected', $happn, connection, relaySpec, function(e, instance) {
            if (e) return done(e);

            // Call the instance which relays, should lead to the above expectations being 'met'

            Promise.promisifyAll(instance);

            Promise.all([
              instance.exchangeMethod1Async('ARG1', 'ARG2'),
              instance.exchangeMethod2Async('ARG1'),
              instance.exchangeMethod3Async(),
            ])

            .then(function(results) {
              expect(results).to.eql([ 'RESULT ARG1 ARG2', 'RESULT ARG1', 'RESULT' ]);
            })

            .then(done).catch(done);
          });
        }
      );
      
    });

    context('Unsing Event Api', function() {

      it('');

    });

  });

  context('relayConnected()', function() {

    context('exchange methods', function() {

      it('inserts a representative component into the mesh',

        function(done, Server, expect, $happn, connection, relaySpec) {

          mock($happn._mesh).does(

            // Ensure _createElement is called with all the right bits.

            function _createElement(spec, writeSchema, callback) {

              writeSchema.should.equal(true);

              spec.component.name.should.equal('relaying_component');
              spec.component.config.should.eql({
                module: 'relaying_component'
              });

              spec.module.name.should.equal('relaying_component');

              // The 'representative' module
              // - dynamically created per relaySpec.component.description
              //
              var instance = spec.module.config.instance;
              
              expect(instance).to.equal('__INSTANCE__');

              callback();
            }
          )

          Server.does(
            function createDynamicModule(type, $happn, connection, relaySpec, callback) {
              callback(null, '__INSTANCE__');
            } 
          )

          Server.relayConnected($happn, connection, relaySpec, done);
        }
      );

      it('the representative component relays method calls across the connection');

      it('fails if component name already exists');

      xit('fails on mountpoint occupied ?? or merge option');

      it('does not allow for insertion of component with accessLevel "mesh" ?? pending security');

    });

    context('web methods', function() {
    });

    context('events', function() {

      context('subscribe to representative');

      context('emits from remote via representative');

    });

    context('data ??');

  });


  context('relayEvented()', function() {

  });

});
