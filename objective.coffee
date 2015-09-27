objective
    
    title: 'Happner Relay'
    uuid: '620dddb3-a9bf-4c48-a045-469f5a1e5221'
    description: """

        This component can be requested by remotes (private or public) to dynamically 
        insert a component into the local (public) node that references a component 
        at the remote.

        This inserted component appears as if hosted on the local (public) node but
        transparently relays all calls onward (via the event api) to the component
        at the remote.

        The remote can add and remove this advertised fraction of itself at will.

    """
    repl: listen: '/tmp/socket-620dddb3-a9bf-4c48-a045-469f5a1e5221'
    once: false
    plugins: 
        'objective_dev':
            sourceDir: 'lib'
            testDir: 'test'
            testAppend: '_test'
            timeout: 200
            runAll: true
            showTrace: true
            filterTrace: true

.run ->
