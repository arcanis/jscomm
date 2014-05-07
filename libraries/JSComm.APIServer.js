/*global define, module*/

( function ( factory ) {

    var lib = factory( );

    if ( typeof window !== 'undefined' )
        window.APIServer = lib;

    if ( typeof module !== 'undefined' )
        module.exports = lib;

    if ( typeof define === 'function' && define.amd )
        define( 'jscomm-apiserver', [ ], function ( ) { return lib; } );

} )( function ( ) {

    return function ( self ) {

        if ( typeof self === 'undefined' )
            self = window;

        var instances = { };
        var definitions = { };

        this.register = function ( name, API ) {

            var prototype = Object.freeze( API.prototype );

            definitions[ name ] = {

                API : API,

                members : Object.keys( prototype ).filter( function ( name ) {
                    return typeof API.prototype[ name ] === 'function';
                } )

            };

        };

        self.addEventListener( 'message', function ( e ) {

            if ( e.data.type !== 'api.initialize' )
                return ;

            try {

                if ( ! Object.prototype.hasOwnProperty.call( definitions, e.data.name ) )
                    throw "No API named '" + e.data.name + "'";

                var definition = definitions[ e.data.name ];
                var API = definition.API, members = definition.members;

                var instance = new definition.API( );

                var instanceId = Math.random( ).toString( );
                instanceId = instanceId.substr( instanceId.indexOf( '.' ) + 1 );
                instances[ instanceId ] = instance;

                e.source.postMessage( {
                    type : 'api.initialize.result',
                    requestId : e.data.requestId,
                    results : [ null, instanceId, members ]
                }, '*' );

            } catch ( error ) {

                e.source.postMessage( {
                    type : 'api.initialize.result',
                    requestId : e.data.requestId,
                    results : [ error ]
                }, '*' );

            }

        } );

        window.addEventListener( 'message', function ( e ) {

            if ( e.data.type !== 'api.request' )
                return ;

            try {

                if ( ! Object.prototype.hasOwnProperty.call( instances, e.data.instanceId ) )
                    throw "Invalid request : instance does not exists";

                var instance = instances[ e.data.instanceId ];
                var prototype = Object.getPrototypeOf( instance );

                if ( ! Object.prototype.hasOwnProperty.call( prototype, e.data.member ) )
                    throw "Invalid request : member function does not exists";

                if ( typeof prototype[ e.data.member ] !== 'function' )
                    throw "Invalid request : member function does not exists";

                var member = prototype[ e.data.member ];

                var args = e.data.arguments.slice( );
                args.length = member.length - 1;

                args.push( function ( ) {
                    e.source.postMessage( {
                        type : 'api.request.result',
                        requestId : e.data.requestId,
                        results : Array.prototype.slice.call( arguments )
                    }, '*' );
                } );

                member.apply( instance, args );

            } catch ( error ) {

                if ( typeof error !== 'string' )
                    error = error.toString( );

                e.source.postMessage( {
                    type : 'api.request.result',
                    requestId : e.data.requestId,
                    results : [ error ]
                }, '*' );

            }

        } );

    };

} );
