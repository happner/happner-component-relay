objective.only('Client', function() {

  before(function() {
    mock('$happn', {
      _mesh: {
        endpoints: {
          'endpoint_name': {},
          'another': {},
        }
      },
      exchange: {
        'local_component': {},
        'endpoint_name': {},
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

      mock($happn.exchange.endpoint_name).does(
        function relay() {
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
        expect(e).to.match(/Too many endpoint to guess/);

        delete $happn._mesh.endpoints.another;

        mock($happn.exchange.endpoint_name).does(
          function relay() {
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

      mock($happn.exchange.endpoint_name).does(
        function remote_relay_component_name() {
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

})