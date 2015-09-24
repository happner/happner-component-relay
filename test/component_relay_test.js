objective('ComponentRelay', function() {

  before(function() {
    mock('GroupConfig',  require('./_group_config').config);
    mock('PersonConfig', require('./_person_config').config);
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

    before(function(done, bluebird, happner, GroupConfig, PersonConfig) {
      this.timeout(2000);
      bluebird.all([
        happner.create(GroupConfig(1)),
        happner.create(PersonConfig(1, 1)),
      ])
      .spread(function(group1, person1) {
        mock('group1', group1);
        mock('person1', person1);
      })
      .then(done)./*catch(done)*/catch(function(e) {
        if (! e instanceof Error) {
          console.log('ERROR', e); // <----------------------------------- TODO: getting errors that are not instanceof Error out of happn/happner, eradicate this behaviour.
          return done(new Error());
        }
        done(e);
      });
    });

    after(function(done, bluebird, group1, person1) {
      bluebird.all([
        group1.stop(),
        person1.stop()
      ]).then(done).catch(done);
    })


    it('creates only one connection for multiple relays to the same remote',

      function(done, group1, person1) {

        // person initiates relay to his/her first private thing

        var $happn = person1._mesh.elements.thing1.component.instance; // as injected

        var relaySpec = {
          target: $happn.info.datalayer.address,
          component: {
            name: 'person1_thing1',
            description: $happn.description,
          }
        }

        person1.exchange.group1.relay.create(relaySpec)

        .then(function() {

        })

        .then(done).catch(done);
      }
    )

    

  });


});
