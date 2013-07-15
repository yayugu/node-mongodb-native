var Cursor = require('./cursor').Cursor;

var Scope = function(collection, options) {
  var self = this;

  // Ensure we have an empty options object
  options = options || {}

  // Scope options
  var _options = {};
  
  // Map any params from the options
  _options.selector = options.selector || {};
  _options.fields = options.fields || null;
  
  // Cursor options
  var _cursor_options = options.options || {};
  
  // Set up the cursor
  var _cursor = new Cursor(
        collection.db, collection, _options.selector
      , _options.fields, _cursor_options
    );

  // Write branch options
  var writeOptions = {
    insert: function(documents, callback) {
      // Merge together options
      var options = _options.write_concern;      
      // Execute insert
      collection.insert(documents, options, callback);
    },
    
    save: function(document, callback) {
      // Merge together options
      var save_options = _options.write_concern;      
      // Execute save
      collection.save(document, save_options, function(err, result) {
        if(typeof result == 'number' && result == 1) {
          return callback(null, document);
        }

        return callback(null, document);
      });
    },

    find: function(selector) {
      _options.selector = selector;
      return writeOptions;
    },

    limit: function(limit) {
      _options.limit = limit;
      return writeOptions;
    },

    sort: function(sort) {
      _options.sort = sort;
      return writeOptions;
    },

    upsert: function() {
      _options.upsert = true;
      return writeOptions;
    },

    copy: function() {
      var options = {};
      for(var name in _options) {
        options[name] = _options[name];
      }

      // Return a copied Scope exposing the writeOptions
      return new Scope(collection, options).withWriteConcern(_options.write_concern);
    },

    //
    // Update is implicit multiple document update
    update: function(operations, callback) {
      // console.log("#################################### 0")
      // if(operations == null || typeof operations == 'object') throw new Error()
      // Merge together options
      var update_options = _options.write_concern;
      
      // Set up options, multi is default operation
      update_options.multi = _options.multi ? _options.multi : true;
      if(_options.upsert) update_options.upsert = _options.upsert;
      // console.log("#################################### 1")
      // console.dir(_options)
      // console.dir(operations)
      // console.dir(update_options)
      
      // Execute options
      collection.update(_options.selector, operations, update_options, function(err, result, obj) {
      // console.log("#################################### 2")
      // console.dir(err)
      // console.dir(obj)
        callback(err, obj);
      });
    },

    updateOne: function(operations, callback) {
      // Set as multi
      _options.multi = false;
      // Execute update
      this.update(operations, callback);
    },

    updateOneAndGet: function(operations, callback) {
      // Merge together options
      var update_options = _options.write_concern;
      // If upsert set option
      if(_options.upsert) update_options.upsert = _options.upsert;
      // Set new option
      update_options['new'] = true;
      // execute find and modify
      collection.findAndModify(_options.selector, _options.sort, operations, update_options, callback);
    },

    getOneAndUpdate: function(operations, callback) {
      // Merge together options
      var update_options = _options.write_concern;
      // If upsert set option
      if(_options.upsert) update_options.upsert = _optionsupsert;
      // execute find and modify
      collection.findAndModify(_options.selector, _options.sort, operations, update_options, callback);      
    },

    replaceOneAndGet: function(document, callback) {
      // Merge together options
      var replace_options = _options.write_concern;
      // If upsert set option
      if(_options.upsert) replace_options.upsert = _options.upsert;
      // Set new option
      replace_options['new'] = true;
      // execute find and modify
      collection.findAndModify(_options.selector, _options.sort, document, replace_options, callback);      
    },

    replaceOne: function(document, callback) {
      // Merge together options
      var replace_options = _options.write_concern;
      // If upsert set option
      if(_options.upsert) replace_options.upsert = _options.upsert;
      // Execute the update
      collection.update(_options.selector, document, replace_options, callback);
    },

    getOneAndReplace: function(document, callback) {
      // Merge together options
      var replace_options = _options.write_concern;
      // If upsert set option
      if(_options.upsert) replace_options.upsert = _options.upsert;
      // execute find and modify
      collection.findAndModify(_options.selector, _options.sort, document, replace_options, callback);            
    },

    getOneAndRemove: function(callback) {
      // Merge together options
      var remove_options = _options.write_concern;      
      // execute find and modify
      collection.findAndRemove(_options.selector, _options.sort, remove_options, callback);
    }
  }

  // Set write concern
  this.withWriteConcern = function(write_concern) {
    // Save the current write concern to the Scope
    _options.write_concern = write_concern;
    // Only allow legal options
    return writeOptions;
  }

  // All the read options
  var readOptions = {
    //
    // Backward compatible methods
    toArray: function(callback) {
      _cursor.toArray(callback);
    },

    each: function(callback) {
      _cursor.each(callback);
    },    

    nextObject: function(callback) {
      _cursor.nextObject(callback);
    },    

    setReadPreference: function(readPreference, callback) {
      _options.readPreference = readPreference;
      _cursor.setReadPreference(_options.readPreference, callback);
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
      _options.readPreference = readPreference;
      _cursor.setReadPreference(_options.readPreference);
      return readOptions;
    },

    // Internal methods
    limit: function(limit, callback) {
      _options.limit = limit;
      _cursor.limit(_options.limit, callback);
      return readOptions;
    },

    skip: function(skip, callback) {
      _options.skip = skip;
      _cursor.skip(_options.skip, callback);
      return readOptions;
    },

    hint: function(hint) {
      _options.hint = hint;
      _cursor.hint = _options.hint;
      return readOptions;
    },    

    sort: function(keyOrList, direction, callback) {
      _options.sort = keyOrList;
      _cursor.sort(keyOrList, direction, callback);
      return readOptions;
    },

    fields: function(fields) {
      _options.fields = fields;
      _cursor.fields = _options.fields;
      return readOptions;
    },

    maxTime: function(maxTime) {
      _options.maxTime = maxTime;
      _cursor.maxTime = _options.maxTime;
      return readOptions;
    },

    withQueryOptions: function(options) {
      _options.queryOptions = options || {};
      _cursor.queryOptions(_options.queryOptions);
      return readOptions;
    },

    //
    // Find methods
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
    // Save the current selector
    _options.selector = selector;
    // Return only legal read options
    return readOptions;
  }
}

exports.Scope = Scope;