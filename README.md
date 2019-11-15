The language tool is `tool/`.

The language server is `server/`.

The language client is `client/`.

The terminal is your IDE.


## Usage

From the terminal, start the client.  This simulates how an IDE would start up
an extension.
```
./client/index.js
```
Tell the client to do something for you by sending something into stdin.  It
responds to anything.

The client will show the result in stdout.

## Client Commands

* start server
* stop server
* Anything else will be sent to the server.

