/**
 * Module dependencies.
 */

var MongoWatch = require('mongo-watch')
  , MongoURI = require('mongodb-uri')
  , LiveQuery = require('./query');

/**
 * Export `MongoLive`.
 */

module.exports = MongoLive;

/**
 * Initialize a new `MongoLive`.
 *
 * @param {Object|String} conn Mongo connection string or an object.
 * @param {String} format The output format `pretty`, `raw`,`normal`.
 * @api public
 */

function MongoLive(conn, format) {
  this.format(format || 'pretty');
  if (conn) this.connect(conn);
}

/**
 * Connect to mongodb.
 *
 * @param {Object|String} conn Mongo connection string or an object.
 * @return {MongoLive} self
 * @api public
 */

MongoLive.prototype.connect = function (conn) {

  var options = {};

  if ('string' === typeof conn) {
    conn = MongoURI.parse(conn);
    this.database(conn.database);
    options.host = conn.hosts[0].host;
    options.port = conn.hosts[0].port;
  }

  if ('object' === typeof conn) {
    this.database(conn.database);
  }

  options.db = this._db;
  options.format = this._format;
  this.watcher = new MongoWatch(options);

  return this;
};

/**
 * Setter and getter for database name.
 *
 * @param {String} db The database name
 * @return {MongoLive} self
 * @api public
 */

MongoLive.prototype.database = function (db) {
  if (!arguments.length) return this._db;
  this._db = db;
  return this;
};

/**
 * Setter and getter for output format.
 *
 * @param {String} format
 * @return {MongoLive} self
 * @api public
 */

MongoLive.prototype.format = function (format) {
  if (!arguments.length) return this._format;
  this._format = format;
  return this;
};

/**
 * Broadcast a message to all resource clients.
 *
 * @param {String} coll The collection name
 * @param {Object} options The options
 * @param {Function} fn Callback
 * @return {MongoLive} self
 * @api public
 */

MongoLive.prototype.query = function (coll, options, fn) {
  var query = new LiveQuery(this, coll, options);
  return !fn ? query : query.exec(fn);
};
