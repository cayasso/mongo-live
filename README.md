# Mongo Live

[![Build Status](https://travis-ci.org/cayasso/mongo-live.png?branch=master)](https://travis-ci.org/cayasso/mongo-live)
[![NPM version](https://badge.fury.io/js/mongo-live.png)](http://badge.fury.io/js/mongo-live)

Listening to MongoDB live changes using oplog.

## Instalation

``` bash
$ npm install mongo-live
```

## Usage

``` javascript
var MongoLive = require('mongo-live');
var live = new MongoLive({
  host: '127.0.0.1',
  port: 27017,
  database: 'blog'
});

var posts = live
.query('posts')
.select('title body comments')
.exec(function (error, stream) {

  stream.on('data', function (data) {

    if (error) {
      // handle error
      return;
    }
      
    if ('insert' === data.operation) {
      console.log('inserted', data);
    }

    if ('update' === data.operation) {
      console.log('updated', data);
    }

    if ('remove' === data.operation) {
      console.log('removed', data);
    }

    console.log('======== result ======>', data);

  });

});

```

You can also listen to events like this:

```javascript
var posts = live
.query('posts')
.select('title body')
.exec();

posts.on('insert', function(data){
  console.log('inserted', data);
});

posts.on('update', function(data){
  console.log('updated', data);
});

posts.on('remove', function(data){
  console.log('removed', data);
});

posts.on('data', function(data){
  if ('insert' === data.operation) {
    console.log('inserted', data);
  }

  if ('update' === data.operation) {
    console.log('updated', data);
  }

  if ('remove' === data.operation) {
    console.log('removed', data);
  }
});
```

Then later any `find` query will be cached for 60 seconds.

You can also enable caching programatically by using the `cache` method directly from the query instance:

``` javascript
var Person = mongoose.model('Person');

Person.find({ active: true })
.cache(50000) // cache for 50 seconds
.exec(function (err, docs) { /* ... */
  
  if (err) throw error;

  console.log(docs.ttl) // time left for expiration in ms
  console.log(docs.stored); // timestamp this query was cached
  console.log(docs);

});

```

## TODO

Add tests.

## Credits

This module use [mongo-watcher](https://github.com/torchlightsoftware/mongo-watcher) for watching the mongodb oplog.

## Run tests

``` bash
$ make test
```

## License

(The MIT License)

Copyright (c) 2013 Jonathan Brumley &lt;cayasso@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
