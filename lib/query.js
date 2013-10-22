/**
 * Module dependencies.
 */

var Stream = require('stream');

/**
 * Export `LiveQuery`.
 */

module.exports = LiveQuery;

/**
 * Initialize a new `LiveQuery`.
 *
 * @param {MongoWatch} conn Mongo watch object.
 * @param {String} coll The collection name.
 * @param {Object} options The options object.
 * @return {LiveQuery} self
 * @api public
 */

function LiveQuery (conn, coll, options) {
  options = options || {};
  this.conn = conn;
  this.collection = coll;
  this.action(options.action);
  this.select(options.select);
  this.ids(options.ids);
}

/**
 * Inherits from `Stream`.
 */

LiveQuery.prototype.__proto__ = Stream.prototype;

/**
 * Set the selected fields to return.
 *
 * @param {String|Array} select Could be string of 
 * fields separated by space or array.
 * @return {LiveQuery} self
 * @api public
 */

LiveQuery.prototype.select = function (select) {
  this._select = select;
  return this;
};

/**
 * Set the action to watch, `insert`,`update` or `remove`.
 *
 * @param {String} action The action name
 * @return {LiveQuery} self
 * @api public
 */

LiveQuery.prototype.action = function (action) {
  this._action = action;
  return this;
};

/**
 * Set the ids to match when returning results.
 *
 * @param {Array} ids The set of ids.
 * @return {LiveQuery} self
 * @api public
 */

LiveQuery.prototype.ids = function (ids) {
  this._ids = ids;
  return this;
};

/**
 * Enable stream returning stream object.
 *
 * @param {Fundtion} fn Callback
 * @return {LiveQuery} self
 * @api public
 */

LiveQuery.prototype.stream = function (fn) {
  return this._exec(fn, true);
};

/**
 * Execute query.
 *
 * @param {Fundtion} fn Callback
 * @return {LiveQuery} self
 * @api public
 */

LiveQuery.prototype.exec = function (fn) {
  return this._exec(fn);
};

/**
 * Do the actuall execute of the query.
 *
 * @param {Fundtion} fn Callback
 * @param {Stream} stream The stream object
 * @return {LiveQuery} self
 * @api private
 */

LiveQuery.prototype._exec = function (fn, stream) {
  var fields = this._select || [];
  var select = {};
  var query = this;

  fn = fn || function () {};

  if ('string' === typeof fields) {
    fields = fields.split(' ');
  }

  if (!isArray(fields)) {
    return this;
  }

  fields.forEach(function (field) {
    select[field] = !!field;
  });

  this.conn.watcher.query({
    collName: this.collection,
    select: select,
    idSet: this._ids
  }, stream ? fn : function (error, stream) {
    
    if (error) {
      query.emit('error', error);
      return fn(error);
    }

    stream.on('error', function (error) {
      query.emit('error', error);
      fn(error);
    });

    stream.on('data', function (data) {
      
      query.emit(data.operation, data.data, data);
      query.emit('data', data.data, data);
      
      if (query._action === data.operation) {
        return fn(null, data);
      }

      fn(null, data);
    });
  });

  return this;
};

/**
 * Check if object is an array.
 * @param {Object} obj The object to compare
 * @return {Boolean}
 * @api private
 */

function isArray (obj) {
  return '[object Array]' === Object.prototype.toString.call(obj);
}
