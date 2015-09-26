objective('Server', function() {

  context('relayConnected()', function() {

    before(function() {

      mock('connection', {

      });

      mock('happn', {

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

      it('creates a representative component on the exchange api');

      it('the representative component relays method call across the connection');

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
