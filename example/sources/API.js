var API = ( function ( ) {

    var API = function ( ) {

    };

    API.prototype.fibonacci = function ( n, callback ) {

        var phi = ( 1 + Math.sqrt( 5 ) ) / 2;

        var r = Math.floor( Math.pow( phi, n ) / Math.sqrt( 5 ) + 1 / 2 );

        callback( null, r );

    };

    return API;

} )( );
