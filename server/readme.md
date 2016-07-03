Server Configuration
---------------------

The server will support only simple operations like:
 - `GET /select`
 - `POST /create` - {title}
 - `POST /update` - {title, ID}
 - `POST /delete` - {ID}

Server will respond with whole todo list, or exception which looks like:
```js
[{title: "hello world 1", at: 12212212}, {title: "hello world 2", at: 23232323}]
```
