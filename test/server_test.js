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
      target: {
        address: '127.0.0.1',
        // address: '127.0.0.2',
        // port: 80,
        // port: 443,
        port: 55555,
        // protocol: 'git+ssh',
        // hostname: 'some.vhost.com',
      },
      endpoint: {
        exchange: {
          'target_component': {} // The module at the 'remote' as visible over the connection.
        }
      }
    });

    mock('relaySpec', {
      component: {
        name: 'relaying_component',
        description: {

          name: 'target_component',
          
          methods: {},
          routes: {},
          events: {},
          data: {},
        }
      }
    });

  });

  context.only('createDynamicModule()', function() {

    context('Using Connection', function() {

      it('creates relay functions according to description.methods',

        function(done, Server, expect, $happn, connection, relaySpec, Promise) {

          // Create expectations on the exchange for the target module's methods 

          mock(connection.endpoint.exchange.target_component).does(
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

          relaySpec.component.description.methods = {
            exchangeMethod1: {},
            exchangeMethod2: {},
            exchangeMethod3: {},
          };
          relaySpec.component.description.routes = {};
          relaySpec.component.description.events = {};
          relaySpec.component.description.data = {};

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

      it('creates relay routes according to description.routes',

        function(done, Server, expect, $happn, connection, relaySpec, Promise) {

          relaySpec.component.description.methods = {};
          relaySpec.component.description.routes = {
            '/target_component/webMethodGet': {},
            // '/target_component/webMethodPut': {},
            // '/target_component/webMethodPost': {},
            // '/target_component/webMethodDelete': {},
            // TODO: the rest of them
          };
          relaySpec.component.description.events = {};
          relaySpec.component.description.data = {};

          Server.createDynamicModule('connected', $happn, connection, relaySpec, function(e, instance, routes) {

            expect(instance['/target_component/webMethodGet'] instanceof Function).to.equal(true);
            expect(routes.webMethodGet).to.equal('/target_component/webMethodGet');
            done();

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
