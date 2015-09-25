objective('ComponentRelay', function() {

  before(function() {
    mock('GroupConfig',  require('./_group_config').config);
    mock('PersonConfig', require('./_person_config').config);
    mock('Promise', require('bluebird'));
    mock('expect', require('chai').expect);
  });

  context('connections', {

    description: function() {/*

      ### this.connections

      If the requesting remote is accessable from __this_node__ a `MeshClient` connection
      is made to it for transport.

      This `MeshClient` connection is internal to the ComponentRelay component.

      An endpoint from __this_node__ to the requesting remote is very intentionally not
      made because that would then expose the remote's entire component set making detailed
      security configuration a necessity.

      If the remote calls for relay to subsequent components, then the 'MeshClient' already 
      created on the first call (and stored in `this.connections`) is used.

    */}

  }, function() {

    context('MISSING', function() {

      it('has no secure method to enable login to secured remote') // Userbase, keys pairs, TLS/https, etc.

    });

    before(function(done, Promise, happner, GroupConfig, PersonConfig, ComponentRelay) {
      this.timeout(2000);
      Promise.all([
        happner.create(GroupConfig(1)),
        happner.create(PersonConfig(1, 1)),
      ])
      .spread(function(group1, person1) {
        mock('group1', group1);
        mock('person1', person1);
      })
      .then(done)./*catch(done)*/catch(function(e) {
        if (! e instanceof Error) {
          console.log('ERROR1', e); // <----------------------------------- TODO: getting errors that are not instanceof Error out of happn/happner, eradicate this behaviour.
          return done(new Error());
        }
        done(e);
      });
    });

    after(function(done, Promise, group1, person1) {
      Promise.all([
        group1.stop(),
        person1.stop()
      ]).then(done).catch(done);
    })


    it('creates only one connection for multiple relays to the same remote',

      function(done, group1, person1, expect, ComponentRelay, happner) {

        // var relayInstance;
        // mock(ComponentRelay.prototype).spy(
        //   function create($happn) { // TODO: objective_dev: can't mock on function using injection
        //     relayInstance = this;
        //   }
        // )

        var relayInstance = group1._mesh.elements.relay.module.instance;

        // Ensure one call to MeshClient

        happner.does(
          function MeshClient() {
            // console.log('MeshClient()\n', arguments);
            return mock.original.apply(this, arguments);
          }
        );

        var $happn1 = person1._mesh.elements.thing1.component.instance; // as injected
        var $happn2 = person1._mesh.elements.thing2.component.instance;

        var relaySpec1 = {
          target: $happn1.info.datalayer.address,
          component: {
            name: 'person1_thing1',
            description: $happn1.description,
          }
        }

        var relaySpec2 = {
          target: $happn2.info.datalayer.address,
          component: {
            name: 'person1_thing2',
            description: $happn2.description,
          }
        }

        // person initiates relay of his/her private thing

        person1.exchange.group1.relay.create(relaySpec1)

        .then(function() {
          expect(  Object.keys( relayInstance.connections )  ).to.eql(['127.0.0.1:20001']);

          // mark the connection
          relayInstance.connections['127.0.0.1:20001'].mark = 1;

          // relay a second component
          return person1.exchange.group1.relay.create(relaySpec2)
        })

        .then(function() {
          // check for mark (not a new connection)
          expect(  relayInstance.connections['127.0.0.1:20001'].mark  ).to.equal(1);
        })

        .then(done).catch(function(e) {
          console.log('ERROR2', e);
          done(e);
        });
      }
    )
  });


});
