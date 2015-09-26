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

Connected to public endpoint, Has private components to selectively publish by relay.

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
  components: {
    thing1: {},
    thing2: {},
    ...
  }
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

  target: $happn.info.datalayer.address, // ?may? need to define / override (
                                         //  - target.hostname
                                         //  - target.port
                                         //  - targer.protocol (http, https)
                                         // ) if mesh node behind vhosting (nginx, apache, etc.)
                                         // dunno (havent looked into it yet)
  
  // component
  // ---------
  // - Present the local component to be relayed to
  // - name (required), the name for the target component's 'representative instance' on the public node
  // - description (required), the description of the target node, used to create the functionality mimic in the 'representative instance'
  component: {
    name: 'person1_thing1', // component accessable at objective.blue/person1_thing1
    description: $happn._mesh.elements.thing2.component.instance.description;
  }

}).then(... // or callback


```
