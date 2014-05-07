# JSComm

These libraries allow to easily share JS interfaces between a 'client' (a window) and a 'server' (another window), using secure postMessages.

## Usage

### Server

What we call *server* here is the window which will expose the API. Any class can be exposed using the `register()` method, but all of its methods have to take a callback as last parameter so that they can notify the client when they return.

A new instance of the API will be created for each window requesting it.

```js
var MathAPI = function ( ) { };
MathAPI.prototype.addition = function ( a, b, callback ) { callback( null, a + b ); };

var server = new APIServer( );
server.register( 'math', MathAPI );
```

### Client

The *client* is the window which will use the API. Before getting an hold on an API, you will have to open it before, by using the `use()` method of the APIClient class and passing it a callback. This callback will then be called when a bridge toward the server will be established. From this point, you will be able to use the remote API just like you would use a standard JS object (check the Limitations section for more informations).

```html
<iframe id="api-server" src="http://example.org"></iframe>
```

The client will be able to request then use an API exposed by `#api-server` using the following code :

```js
window.addEventListener( 'load', function ( ) {

    var target = document.getElementById( 'api-server' ).contentWindow;
    var client = new APIClient( target );

    client.use( 'math', function ( err, api ) {

        if ( err )
            throw err;

        // The API can be used here, using the `api` parameter.

        api.addition( 10, 10, function ( err, result ) {
            alert( '10 + 10 = ' + result );
        } );

    } );

} );
```

## Limitations

- Exported API prototypes cannot be changed after beeing registered (they're frozen).
- You cannot return non-serializable values (ie. they have to be JSON-compatible).
- There is no way to have a synchronous communication between the client and the server.
