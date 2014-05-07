/*global APIClient*/

( function ( ) {

    window.addEventListener( 'load', function ( ) {

        var target = document.getElementById( 'math-frame' ).contentWindow;

        var client = new APIClient( target );

        client.use( 'math', function ( err, api ) {

            if ( err )
                throw err;

            api.fibonacci( 12, function ( err, result ) {
                if ( err ) throw err ;
                console.log( 'Fibonnaci #12 = ' + result );
            } );

        } );

    } );

} )( );
