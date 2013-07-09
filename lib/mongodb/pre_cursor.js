var Cursor = require('./cursor').Cursor;

var PreCursor = function(collection, options) {
  var self = this;

  // Ensure we have an empty options object
  options = options || {}
  // Internal state
  var _write_concern = {w:1};
  var _limit = null;
  var _skip = null;
  var _isolated = false;
  var _multi = true;
  var _sort = null;
  var _readPreference = null;  
  var _options = options || {};
  var _selector = options.selector || {};
  var _fields = options.fields || null;  
  var _cursor_options = options.options || {};
  var _readPreference = null;
  var _upsert = null;

  // Set up the cursor
  var _cursor = new Cursor(
        collection.db, collection, _selector
      , _options.fields, _cursor_options
    );

  // Write branch options
  var writeOptions = {
    insert: function(documents, callback) {
      // Merge together options
      var options = _write_concern;      
      // Execute insert
      collection.insert(documents, options, callback);
    },
    
    save: function(document, callback) {
      // Merge together options
      var options = _write_concern;      
      // Execute save
      collection.save(document, options, function(err, result) {
        if(typeof result == 'number' && result == 1) {
          return callback(null, document);
        }

        return callback(null, document);
      });
    },

    find: function(selector) {
      console.log("======================= find")
      _selector = selector;
      return writeOptions;
    },

    limit: function(limit) {
      _limit = limit;
      return writeOptions;
    },

    sort: function(sort) {
      _sort = sort;
      return writeOptions;
    },

    isolated: function() {
      _isolated = true;
      return writeOptions;
    },

    upsert: function() {
      _upsert = true;
      return writeOptions;
    },

    //
    // Update is implicit multiple document update
    update: function(operations, callback) {
      // Merge together options
      var options = _write_concern;
      // Asking for isolated support
      if(_isolated) _selector['$isolated'] = true;
      if(_multi) options.multi = true;
      if(_upsert) options.upsert = _upsert;
      // Execute options
      collection.update(_selector, operations, options, function(err, result, obj) {
        callback(err, obj);
      });
    },

    updateOne: function(operations, callback) {
      // Set as multi
      _multi = false;
      // If upsert set option
      if(_upsert) options.upsert = _upsert;
      // Execute update
      this.update(operations, callback);
    },

    updateOneAndGet: function(operations, callback) {
      // Merge together options
      var options = _write_concern;
      // If upsert set option
      if(_upsert) options.upsert = _upsert;
      // Set new option
      options['new'] = true;
      // execute find and modify
      collection.findAndModify(_selector, _sort, operations, options, callback);
    },

    getOneAndUpdate: function(operations, callback) {
      // Merge together options
      var options = _write_concern;
      // If upsert set option
      if(_upsert) options.upsert = _upsert;
      // execute find and modify
      collection.findAndModify(_selector, _sort, operations, options, callback);      
    },

    replaceOneAndGet: function(document, callback) {
      // Merge together options
      var options = _write_concern;
      // If upsert set option
      if(_upsert) options.upsert = _upsert;
      // Set new option
      options['new'] = true;
      // execute find and modify
      collection.findAndModify(_selector, _sort, document, options, callback);      
    },

    replaceOne: function(document, callback) {
      // Merge together options
      var options = _write_concern;
      // If upsert set option
      if(_upsert) options.upsert = _upsert;
      // Execute the update
      collection.update(_selector, document, options, callback);
    },

    getOneAndReplace: function(document, callback) {
      // Merge together options
      var options = _write_concern;
      // If upsert set option
      if(_upsert) options.upsert = _upsert;
      // execute find and modify
      collection.findAndModify(_selector, _sort, document, options, callback);            
    },

    getOneAndRemove: function(callback) {
      // Merge together options
      var options = _write_concern;      
      // execute find and modify
      collection.findAndRemove(_selector, _sort, options, callback);
    }
  }

  // Set write concern
  this.withWriteConcern = function(write_concern) {
    console.log("======================= withWriteConcern")
    // Save the current write concern to the PreCursor
    _write_concern = write_concern;

    // Only allow legal options
    return writeOptions;
  }

  // All the read options
  var readOptions = {
    //
    // Backward compatible methods
    toArray: function(callback) {
      // console.dir(_cursor_options)
      _cursor.toArray(callback);
    },

    each: function(callback) {
      _cursor.each(callback);
    },    

    nextObject: function(callback) {
      _cursor.nextObject(callback);
    },    

    setReadPreference: function(readPreference, callback) {
      _readPreference = readPreference;
      _cursor.setReadPreference(readPreference, callback);
      return readOptions;
    },

    count: function(applySkipLimit, callback) {
      _cursor.count(applySkipLimit, callback);
    },

    stream: function(options) {
      return _cursor.stream(options);
    },

    close: function(callback) {
      return _cursor.close(callback);
    },

    explain: function(callback) {
      return _cursor.explain(callback);
    },

    isClosed: function(callback) {
      return _cursor.isClosed();
    },

    rewind: function() {
      return _cursor.rewind();
    },
    // !------------------------------

    withReadPreference: function(readPreference) {
      _readPreference = readPreference;
      _cursor.setReadPreference(readPreference);
      return readOptions;
    },

    // Internal methods
    limit: function(limit, callback) {
      console.log("----------------- limit")
      _limit = limit;
      // _cursor_options.limit = limit;
      _cursor.limit(limit, callback);
      return readOptions;
    },

    skip: function(skip, callback) {
      console.log("----------------- skip")
      _skip = skip;
      // _cursor_options.skip = skip;
      _cursor.skip(skip, callback);
      return readOptions;
    },

    sort: function(keyOrList, direction, callback) {
      console.log("----------------- sort")
      _sort = keyOrList;
      // _cursor_options.sort = sort;
      _cursor.sort(keyOrList, direction, callback);
      return readOptions;
    },

    batchSize: function(batchSize, callback) {
      // console.log("----------------- batchSize")
      _batchSize = batchSize;
      // _cursor_options.batchSize = batchSize;
      _cursor.batchSize(batchSize, callback);
      return readOptions;
    },

    fields: function(fields) {
      _fields = fields;
      _cursor.fields = fields;
      return readOptions;
    },

    //
    // Find methods
    withReadPreference: function(readPreference) {
      _readPreference = readPreference;
      return readOptions;
    },

    get: function(callback) {
      _cursor.toArray(callback);
    },

    getOne: function(callback) {
      _cursor.limitValue = -1;
      _cursor.nextObject(callback);
    }
  }

  //
  // Backward compatible settings
  Object.defineProperty(readOptions, "timeout", {
    get: function() {
      return _cursor.timeout;
    }
  });

  Object.defineProperty(readOptions, "read", {
    get: function() {
      return _cursor.read;
    }
  });

  Object.defineProperty(readOptions, "items", {
    get: function() {
      return _cursor.items;
    }
  });
  // !------------------------------

  // Start find
  this.find = function(selector) {
    // console.log("----------------- find")
    // Save the current selector
    _selector = selector;
    // Return only legal read options
    return readOptions;
  }
}

exports.PreCursor = PreCursor;