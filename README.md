[![Build Status](https://travis-ci.org/happner/happner-component-relay.svg?branch=master)](https://travis-ci.org/happner/happner-component-relay)

# happner-component-relay

A component to enable exposing selected functionalities from nodes on a private branch via a node on a public branch.


### The Public Node

Has the relay component installed and a datalayer accessable to the remote (private node)

```javascript
meshConfig = {
  ...
  name: 'public_endpoint',
  datalayer: {
    host: 'objective.blue',
    port: 919,
    secret: 'så†øЯ',  // pending security / users / etc.
  },
  ...
  components: {
    ...
    'relay': {
      module: 'component-relay'
    }
  }
}

```



### The Private Node

Connected to public endpoint

```javascript
meshConfig = {
  ...
  endpoints: {
    'public_endpoint': {
      config: {
        host: 'objective.blue',
        port: 919,
        secret: 'så†øЯ',
      }
    }
  }
  ...
}
```

#### Initiating Relay

__from the remote__

```javascript

$happn.public_endpoint.relay.create({

  // target (optional)
  // -----------------
  // - Present the local datalayer address as 'relay-to' target
  // - If no target is provided or a connection cannot be established then
  //   relay traffic will be transported across the event api.
  //
  
  target: $happn.info.datalayer.address

  ...

}).then(... // or callback


```
