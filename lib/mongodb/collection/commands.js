var shared = require('./shared')
  , utils = require('../utils')
  , DbCommand = require('../commands/db_command').DbCommand;

var stats = function stats(options, callback) {
  var args = Array.prototype.slice.call(arguments, 0);
  callback = args.pop();
  // Fetch all commands
  options = args.length ? args.shift() || {} : {};

  // Build command object
  var commandObject = {
    collStats:this.collectionName,
  }

  // Check if we have the scale value
  if(options['scale'] != null) commandObject['scale'] = options['scale'];

  // Ensure we have the right read preference inheritance
  options.readPreference = shared._getReadConcern(this, options);

  // Execute the command
  this.db.command(commandObject, options, callback);
}

var count = function count (query, options, callback) {
  var args = Array.prototype.slice.call(arguments, 0);
  callback = args.pop();
  query = args.length ? args.shift() || {} : {};
  options = args.length ? args.shift() || {} : {};
  var skip = options.skip;
  var limit = options.limit;

  // Final query
  var commandObject = {
      'count': this.collectionName
    , 'query': query
    , 'fields': null
  };

  // Add limit and skip if defined
  if(typeof skip == 'number') commandObject.skip = skip;
  if(typeof limit == 'number') commandObject.limit = limit;

  // Set read preference if we set one
  options.readPreference = shared._getReadConcern(this, options);

  // Execute the command
  this.db.command(commandObject, options, function(err, result) {
    if(err) return callback(err, null);
    return callback(null, result.n);
  });
};

var distinct = function distinct(key, query, options, callback) {
  var args = Array.prototype.slice.call(arguments, 1);
  callback = args.pop();
  query = args.length ? args.shift() || {} : {};
  options = args.length ? args.shift() || {} : {};

  var mapCommandHash = {
      'distinct': this.collectionName
    , 'query': query
    , 'key': key
  };

  // Set read preference if we set one
  var readPreference = options['readPreference'] ? options['readPreference'] : false;
  // Create the command
  var cmd = DbCommand.createDbSlaveOkCommand(this.db, mapCommandHash);

  this.db._executeQueryCommand(cmd, {read:readPreference}, function (err, result) {
    if(err)
      return callback(err);
    if(result.documents[0].ok != 1)
      return callback(new Error(result.documents[0].errmsg));
    callback(null, result.documents[0].values);
  });
};

var rename = function rename (newName, options, callback) {
  var self = this;

  if(typeof options == 'function') {
    callback = options;
    options = {}
  }

  // Ensure the new name is valid
  shared.checkCollectionName(newName);
  // Execute the command, return the new renamed collection if successful
  self.db._executeQueryCommand(DbCommand.createRenameCollectionCommand(self.db, self.collectionName, newName, options), function(err, result) {
    if(err == null && result.documents[0].ok == 1) {
      if(callback != null) {
        // Set current object to point to the new name
        self.collectionName = newName;
        // Return the current collection
        callback(null, self);
      }
    } else if(result.documents[0].errmsg != null) {
      if(null != callback) {
        if (null == err) {
          err = utils.toError(result.documents[0]);
        }
        callback(err, null);
      }
    }
  });
};

var options = function options(callback) {
  this.db.collectionsInfo(this.collectionName, function (err, cursor) {
    if (err) return callback(err);
    cursor.nextObject(function (err, document) {
      callback(err, document && document.options || null);
    });
  });
};

var isCapped = function isCapped(callback) {
  this.options(function(err, document) {
    if(err != null) {
      callback(err);
    } else {
      callback(null, document && document.capped);
    }
  });
};

exports.stats = stats;
exports.count = count;
exports.distinct = distinct;
exports.rename = rename;
exports.options = options;
exports.isCapped = isCapped;