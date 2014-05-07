/*global define, module*/

( function ( factory ) {

    var lib = factory( );

    if ( typeof window !== 'undefined' )
        window.APIClient = lib;

    if ( typeof module !== 'undefined' )
        module.exports = lib;

    if ( typeof define === 'function' && define.amd )
        define( 'jscomm-apiclient', [ ], function ( ) { return lib; } );

} )( function ( ) {

    return function ( target, self ) {

        if ( typeof self === 'undefined' )
            self = window;

        var requestIdCounter = 0;
        var pendingRequests = { };

        var API = function ( instanceId, members ) {

            members.forEach( function ( name ) {

                this[ name ] = function ( ) {

                    var requestId = requestIdCounter ++;

                    var args = Array.prototype.slice.call( arguments );
                    var callback = args.pop( );

                    pendingRequests[ requestId ] = callback.bind( this );

                    target.postMessage( {
                        type : 'api.request',
                        instanceId : instanceId,
                        requestId : requestId,
                        member : name,
                        arguments : args
                    }, '*' );

                };

            }.bind( this ) );

        };

        this.use = function ( name, options, callback ) {

            if ( arguments.length < 3 ) {
                callback = options;
                options = undefined;
            }

            var requestId = requestIdCounter ++;

            pendingRequests[ requestId ] = function ( err, instanceId, members ) {

                if ( err ) {
                    callback.call( this, err );
                } else {
                    callback.call( this, null, new API( instanceId, members ) );
                }

            }.bind( this );

            target.postMessage( {
                type : 'api.initialize',
                requestId : requestId,
                name : name
            }, '*' );

        };

        self.addEventListener( 'message', function ( e ) {

            if ( e.data.type !== 'api.initialize.result' && e.data.type !== 'api.request.result' )
                return ;

            if ( ! Object.prototype.hasOwnProperty.call( pendingRequests, e.data.requestId ) )
                return ;

            pendingRequests[ e.data.requestId ].apply( null, e.data.results );

        } );

    };

} );
