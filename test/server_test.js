objective('Server', function() {

  it('fails if component name already exists');

  it('fails on mountpoint occupied ?? or merge option');

  it('does not allow for insertion of component with accessLevel "mesh" ?? pending security');

  before(function() {
    // mock('GroupConfig',  require('./_group_config').config);
    // mock('PersonConfig', require('./_person_config').config);
    mock('Promise', require('bluebird'));
    mock('expect', require('chai').expect);
    mock('should', new require('chai').should());
  });

  before(function() {

    mock('$happn', {
      _mesh: {
        elements: {
          relaying_component: {
            component: {
              instance: {
                emit: function() {}
              }
            }
          }
        }
      }
    });

    var seq = 0;
    var subscribers = {
      list: {},
      add: function(event, handler, callback) {
        seq++;
        subscribers.list[seq] = {
          event: event,
          handler: handler,
        }
        callback(null, seq);
      }
    };

    mock('subscribers', subscribers);

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
        },
        event: {
          'target_component': {
            on: function(event, handler, callback) {
              subscribers.add(event, handler, callback);
            },
            off: function() {
              // TODO: subscriber flush on _destroyElement()
              // TODO: subscriber flush here.
              // 
              // ie. when a component 'goes away',
              //     - all component subscribed to events from that component remain subscribed
              //     - no events will be received
              //     - but the list of subscribers remains in happn
              //     - getting larger and larger with the comings and goings of modules
              //
            }
          }
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

  context('createDynamicModule()', function() {

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

        function(done, Server, expect, $happn, connection, relaySpec) {

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
            if (e) return done(e);

            expect(instance['/target_component/webMethodGet'] instanceof Function).to.equal(true);
            expect(routes.webMethodGet).to.equal('/target_component/webMethodGet');
            done();

          });
        }
      );

      it('forwards events according to description.events',

        function(done, subscribers, Server, expect, $happn, connection, relaySpec) {

          relaySpec.component.description.methods = {};
          relaySpec.component.description.routes = {};
          relaySpec.component.description.events = {
            'tamecard': {},
            'wildcard/*': {},
          };
          relaySpec.component.description.data = {};

          // ensure subscribers get added from description.events

          subscribers.does(
            function add(path) {
              expect(path).to.equal('tamecard');
              mock.original.apply(this, arguments);
            },
            function add(path) {
              expect(path).to.equal('wildcard/*');
              mock.original.apply(this, arguments);
            }
          );

          // ensure relyed events were emitted

          mock($happn._mesh.elements.relaying_component.component.instance).does(
            function emit(path, data) {
              expect(path).to.equal('tamecard');
              expect(data).to.eql({ source: 'tamecard' });
            },
            function emit(path, data) {
              expect(path).to.equal('wildcard/*');
              expect(data).to.eql({ source: 'wildcard/*' });
              done();
            }
          );

          Server.createDynamicModule('connected', $happn, connection, relaySpec, function(e, instance) {
            if (e) return done(e);

            // Test relay emit

            var emitted = {};
            Object.keys(subscribers.list).forEach(function(id) {
              var event = subscribers.list[id].event;
              if (emitted[event]) return; // emit only one per registered event
              emitted[event] = 1;
              var handler = subscribers.list[id].handler;

              eventBase = '/events/target_mesh/target_component';

              var meta = {
                path: eventBase + '/' + event
              };

              handler({source: event}, meta);


            });
          });
        }
      );

      it('make relay of data possible?');

      it('can disconnect the relay');

  
    });

    context('Unsing Event Api', function() {

      it('');

    });

  });

  context('createRelayConnected()', function() {

    context('exchange methods', function() {

      it('inserts a representative component into the mesh',

        function(done, Server, expect, $happn, connection, relaySpec) {

          mock($happn._mesh).does(

            // Ensure _createElement is called with all the right bits.

            function _createElement(spec, writeSchema, callback) {

              writeSchema.should.equal(true);

              spec.component.name.should.equal('relaying_component');
              // spec.component.config.should.eql({
              //   module: 'relaying_component',
              //   schema: {
              //     methods: {}
              //   },
              //   web: {},
              //   events: {
              //     tamecard: {},
              //     'wildcard/*': {}
              //   },
              //   data: {}
              // });

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

          Server.createRelayConnected($happn, connection, relaySpec, done);
        }
      );

    });

  });

});
