objective.only('Server', function() {

  before(function() {
    // mock('GroupConfig',  require('./_group_config').config);
    // mock('PersonConfig', require('./_person_config').config);
    // mock('Promise', require('bluebird'));
    mock('expect', require('chai').expect);
    mock('should', new require('chai').should());
  });

  context('createDynamicModule()', function() {

    context('Using Connection', function() {

      it('');
      
    });

    context('Unsing Event Api', function() {

      it('');

    });

  });

  context('relayConnected()', function() {

    before(function() {

      mock('$happn', {
        _mesh: {}
      });

      mock('connection', {

      });

      mock('relaySpec', {
        component: {
          name: 'relay_component_name',
          description: {
            
            'methods': {
              exchangeMethod1: {
                // parameters: []   - NOT SUPPORTING other than standard (arg1, ..., argN, callback)
                // callback: {
                //   parameters: [] - NOT SUPPORTING other than standard (error, results)
                // }
              },
              exchangeMethod2: {
              },
            },

            'routes': {
              '/thing1/method1': {},
              '/thing1/method2': {},
            }

          }
        }
      });

    });

    context('exchange methods', function() {

      it('inserts a representative component into the mesh',

        function(done, Server, expect, $happn, connection, relaySpec) {

          mock($happn._mesh).does(

            // Ensure _createElement is called with all the right bits.

            function _createElement(spec, writeSchema, callback) {

              writeSchema.should.equal(true);

              spec.component.name.should.equal('relay_component_name');
              spec.component.config.should.eql({
                module: 'relay_component_name'
              });

              spec.module.name.should.equal('relay_component_name');

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
