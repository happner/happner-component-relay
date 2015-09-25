objective('ComponentRelay', function() {

  before(function() {
    mock('GroupConfig',  require('./_group_config').config);
    mock('PersonConfig', require('./_person_config').config);
    mock('Promise', require('bluebird'));
    mock('expect', require('chai').expect);
  });


  context('calls server.createConnected() if datalayer connectable', function() {


    before(function(done, Promise, happner, GroupConfig, PersonConfig, ComponentRelay) {
      this.timeout(2000);
      Promise.all([
        happner.create(GroupConfig(1)),
        happner.create(PersonConfig(1, 1)),
        happner.create(PersonConfig(2, 1)),
        happner.create(PersonConfig(3, 1)),
      ])
      .spread(function(group1, person1, person2, person3) {
        mock('group1', group1);
        mock('person1', person1);
        mock('person2', person2);
        mock('person3', person3);
        mock('relay', group1._mesh.elements.relay.module.instance);
      })
      .then(done)./*catch(done)*/catch(function(e) {
        if (! e instanceof Error) {
          console.log('ERROR1', e); // <----------------------------------- TODO: getting errors that are not instanceof Error out of happn/happner, eradicate this behaviour.
          return done(new Error());
        }
        done(e);
      });
    });

    after(function(done, Promise, group1, person1, person2) {
      Promise.all([
        group1.stop(),
        person1.stop(),
        person2.stop(),
      ]).then(done).catch(done);
    });


      
    it('makes new connection',

      function(done, /* ComponentRelay, */ Server, relay, group1, person1, expect) {

        // var relay;
        // mock(ComponentRelay.prototype).spy(
        //   function create($happn) { // TODO: objective_dev: can't mock on function using injection
        //     relay = this;
        //   }
        // );

        var $happn = person1._mesh.elements.thing1.component.instance; // as injected

        var relaySpec1 = {
          target: $happn.info.datalayer.address,
          component: {
            name: 'person1_thing1',
            description: $happn.description,
          }
        }

        // expect 1 call the createConnected()

        Server.does(function createConnected(a, b, callback) {callback()});

        // person initiates relay of his/her private thing

        person1.exchange.group1.relay.create(relaySpec1)

        .then(function() {
          expect(Object.keys(   relay.connections   )).to.eql(['127.0.0.1:20001']);
        })

        .then(done).catch(done);
      }
    );

    it('makes two relays with one connection on concurrent call to relay',

      function(done, Promise, Server, relay, group1, person2, expect) {

        var $happn1 = person2._mesh.elements.thing1.component.instance;
        var $happn2 = person2._mesh.elements.thing2.component.instance;

        var relaySpec1 = {
          target: $happn1.info.datalayer.address,
          component: {
            name: 'person2_thing1',
            description: $happn1.description,
          }
        };
        var relaySpec2 = {
          target: $happn2.info.datalayer.address,
          component: {
            name: 'person2_thing2',
            description: $happn2.description,
          }
        };

        // expect 2 calls to createConnected()

        Server.does(
          function createConnected(happn, connection, relaySpec, callback) {callback()},
          function createConnected(happn, connection, relaySpec, callback) {callback()}
        );

        // expect 1 call to addConnection

        relay.does(
          function addConnection() {
            mock.original.apply(this, arguments);
          }
        );

        Promise.all([
          person2.exchange.group1.relay.create(relaySpec1),
          person2.exchange.group1.relay.create(relaySpec2),
        ])

        .then(done).catch(done);
      }
    );

    it('uses existing connection');

  });


  context('calls server.createEvented() if no connection is possible/available');

});
