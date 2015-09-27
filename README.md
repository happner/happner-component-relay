[![Build Status](https://travis-ci.org/happner/happner-relay.svg?branch=master)](https://travis-ci.org/happner/happner-relay)

`EXPERIMENTAL`

##### TODO

* Auto destroy relaying component after timeout after target link departed. __For now it's up to the client to destroy__
* Ensure subscripts are properly off'd (using happn refId), even after a 'reconnect' to a restarted remote datalayer.
* Relay over event api when connection to private unavailable / impossible
* Handle http/https
* Handle vhosts (cannot be reached by ipaddress)
* Security


# happner-relay

Relays access to selected components on one mesh node via another mesh node.

`npm install happner-relay --save`

### Usage

A - __2 Mesh Node's Configs__

```javascript

happner.create({
  name: 'group', // <------------- group node
  ...
  components: {
    'relay': {}
  }
  ...
},...

happner.create({
  name: 'person', // <------------ person node
  endpoints: {
    'group': {    // <------------ person endpoint connected to group
      ...
    }
  },
  ...
  components: {
    'relay': {},
    'thing': {},  // <------------ person's thing
  }
  ...
},...

```

B - __person publishes thing on group__

```javascript

$happn.exchange.relay.create({

  local: 'thing',
  remote: 'person_thing',
  // relay: 'group', // can default, only one endpoint

}, function(e, token) {
  
  // use token to destroy (stop) the relay

});

```

Now __person/thing__ is available at __group/person_thing__

C - __person lists relayed components__

```javascript
$happn.exchange.relay.list(function(e, list) {})
```


D - __person removes thing from group__

```javascript
$happn.exchange.relay.destroy(token, function(e) {});
```

