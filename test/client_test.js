objective.only('Client', function() {

  before(function() {
    mock('$happn', {
      info: {
        mesh: {
          name: 'self'
        },
        datalayer: {
          address: {
            address: '127.0.0.1',
            family: 'IPv4',
            port: 20008
          }
        }
      },
      _mesh: {
        endpoints: {
          'self': {},
          'endpoint_name': {
          },
          'another': {},
        },
        elements: {
          'local_component': {
            component: {
              instance: {
                description: 'XXX'
              }
            }
          }
        }
      },
      exchange: {
        'local_component': {},
        'endpoint_name': {
          relay: {}
        },
      }
    });
    mock('expect', require('chai').expect);
  })

  context('defaults', function() {

    it('errors on missing local component', function(done, $happn, Client, expect) {
      c = new Client();
      c.createRelay($happn, {}, function(e) {
        expect(e).to.match(/Missing local component/);
        done();
      });
    });

    it('errors on missing remote', function(done, $happn, Client, expect) {
      c = new Client();
      c.createRelay($happn, {
        local: 'local_component'
      }, function(e) {
        expect(e).to.match(/Missing remote component/);
        done();
      });
    });

    it('defaults relayserver component name', function(done, $happn, Client, expect) {

      mock($happn.exchange.endpoint_name.relay).does(
        function createServer() {
          done();
        }
      );

      c = new Client();
      c.createRelay($happn, {
        local: 'local_component',
        remote: 'remote_component',
        relay: 'endpoint_name'
      }, function() {});
    });

    it('errors on non-existant endpoint', function(done, $happn, Client, expect) {
      c = new Client();
      c.createRelay($happn, {
        local: 'local_component',
        remote: 'remote_component',
        relay: 'non-existant'
      }, function(e) {
        expect(e).to.match(/Missing endpoint/);
        done();
      });
    });

    it('defaults endpoint if there is only one - or errors', function(done, $happn, Client, expect) {
      c = new Client();
      c.createRelay($happn, {
        local: 'local_component',
        remote: 'remote_component',
      }, function(e) {
        expect(e).to.match(/Too many endpoints to guess/);

        delete $happn._mesh.endpoints.another;

        mock($happn.exchange.endpoint_name.relay).does(
          function createServer() {
            done();
          }
        );

        c.createRelay($happn, {
          local: 'local_component',
          remote: 'remote_component',
        }, function(e) {});

      });
    });

    it('can specify remote relay component name', function(done, $happn, Client, expect) {

      $happn.exchange.endpoint_name.remote_relay_component_name = {};
      mock($happn.exchange.endpoint_name.remote_relay_component_name).does(
        function createServer() {
          done();
        }
      );

      c = new Client();
      c.createRelay($happn, {
        local: 'local_component',
        remote: 'remote_component',
        relay: 'endpoint_name/remote_relay_component_name'
      }, function() {});
    });

  });

  context('create() and destroy()', function() {

    before(function() {
      mock('GroupConfig',  require('./_group_config').config);
      mock('PersonConfig', require('./_person_config').config);
      mock('Promise', require('bluebird'));
      mock('expect', require('chai').expect);
      mock('request', require('bluebird').promisifyAll(require('request')))
    });

    before(function(done, GroupConfig, PersonConfig, Promise, happner) {
      this.timeout(5000);
      Promise.all([
        happner.create(GroupConfig(3)),
        happner.create(PersonConfig(8, 3)), // both persons con-
        happner.create(PersonConfig(9, 3)), // nected to group
      ])
      .spread(function(group3, person8, person9) {
        mock('group3', group3);
        mock('person8', person8);
        mock('person9', person9);
      })
      .then(done).catch(done);
    });

    it('creates a relay, uses it and destroys it',

      function(done, group3, person8, person9, expect) {

        person8.exchange.relay.create({
          local: 'thing1',
          remote: 'person8_thing1'
        })

        .then(function(token) {
          // console.log(token);

          // person9 accesses person8's thing view group3
          return person9.exchange.group3.person8_thing1.exchangeMethod({hello:'from world'})
        })

        .then(function(reply) {
          expect(reply).to.eql({ hello: 'from world', ReplyFrom: 'person8.thing1' })
        })

        .then(function() {

          // person8 gets list of relays for delete token
          return person8.exchange.relay.list()
        })

        .then(function(list) {

          // person8 destroys his relay at group3/person8_thing1
          return person8.exchange.relay.destroy(list.running['group3/person8_thing1'].token);
        })

        .then(function() {

          return person8.exchange.relay.list()
        })

        .then(function(list) {

          // empty list of relays
          expect(list.running).to.eql({});

          // person9 can no longer access person8's thing
          expect(person9.exchange.group3.person8_thing1).to.not.exist;
        })

        .then(done).catch(function(e) {
          if (! e instanceof Error) {
            console.log('ERROR', e);
            done(new Error());
          }
          done(e);
        });

      }
    );

  });

})