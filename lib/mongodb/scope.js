var Cursor = require('./cursor').Cursor;

var Scope = function(collection, _selector, _fields, _scope_options) {
  var self = this;

  // Ensure we have at least an empty cursor options object
  _scope_options = _scope_options || {};
  _read_preference = {readPreference: 'primary'};
  _write_concern = _scope_options.write_concern || null;

  // console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
  // console.dir(_scope_options)

  // Set up the cursor
  var _cursor = new Cursor(
        collection.db, collection, _selector
      , _fields, _scope_options
    );

  // Write branch options
  var writeOptions = {
    insert: function(documents, callback) {
      // Merge together options
      var options = _write_concern || {};
      // Execute insert
      collection.insert(documents, options, callback);
    },
    
    save: function(document, callback) {
      // Merge together options
      var save_options = _write_concern || {};
      // Execute save
      collection.save(document, save_options, function(err, result) {
        if(typeof result == 'number' && result == 1) {
          return callback(null, document);
        }

        return callback(null, document);
      });
    },

    find: function(selector) {
      _selector = selector;
      return writeOptions;
    },

    limit: function(limit) {
      _scope_options.limit = limit;
      return writeOptions;
    },

    sort: function(sort) {
      _scope_options.sort = sort;
      return writeOptions;
    },

    upsert: function() {
      _scope_options.upsert = true;
      return writeOptions;
    },

    copy: function() {
      // Copy the scope object
      var options = {};
      for(var name in _scope_options) {
        options[name] = _scope_options[name];
      }
      
      // Return a copied Scope exposing the writeOptions
      return new Scope(collection, _selector, _fields, options).withWriteConcern(_scope_options.write_concern);
    },

    //
    // Update is implicit multiple document update
    update: function(operations, callback) {
      // Merge together options
      var update_options = _write_concern || {};
      
      // Set up options, multi is default operation
      update_options.multi = _scope_options.multi ? _scope_options.multi : true;
      if(_scope_options.upsert) update_options.upsert = _scope_options.upsert;
      
      // Execute options
      collection.update(_selector, operations, update_options, function(err, result, obj) {
        callback(err, obj);
      });
    },

    updateOne: function(operations, callback) {
      // Set as multi
      _scope_options.multi = false;
      // Execute update
      this.update(operations, callback);
    },

    updateOneAndGet: function(operations, callback) {
      // Merge together options
      var update_options = _write_concern || {};
      // If upsert set option
      if(_scope_options.upsert) update_options.upsert = _scope_options.upsert;
      // Set new option
      update_options['new'] = true;
      // execute find and modify
      collection.findAndModify(_selector, _scope_options.sort, operations, update_options, callback);
    },

    getOneAndUpdate: function(operations, callback) {
      // Merge together options
      var update_options = _write_concern || {};
      // If upsert set option
      if(_scope_options.upsert) update_options.upsert = _scope_options.upsert;
      // execute find and modify
      collection.findAndModify(_selector, _scope_options.sort, operations, update_options, callback);      
    },

    replaceOneAndGet: function(document, callback) {
      // Merge together options
      var replace_options = _write_concern || {};
      // If upsert set option
      if(_scope_options.upsert) replace_options.upsert = _scope_options.upsert;
      // Set new option
      replace_options['new'] = true;
      // execute find and modify
      collection.findAndModify(_selector, _scope_options.sort, document, replace_options, callback);      
    },

    replaceOne: function(document, callback) {
      // Merge together options
      var replace_options = _write_concern || {};
      // If upsert set option
      if(_scope_options.upsert) replace_options.upsert = _scope_options.upsert;
      // Execute the update
      collection.update(_selector, document, replace_options, callback);
    },

    getOneAndReplace: function(document, callback) {
      // Merge together options
      var replace_options = _write_concern || {};
      // If upsert set option
      if(_scope_options.upsert) replace_options.upsert = _scope_options.upsert;
      // execute find and modify
      collection.findAndModify(_selector, _scope_options.sort, document, replace_options, callback);            
    },

    getOneAndRemove: function(callback) {
      // Merge together options
      var remove_options = _write_concern || {};
      // execute find and modify
      collection.findAndRemove(_selector, _scope_options.sort, remove_options, callback);
    }
  }

  // Set write concern
  this.withWriteConcern = function(write_concern) {
    // Save the current write concern to the Scope
    _scope_options.write_concern = write_concern;
    _write_concern = write_concern;
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
      _scope_options.readPreference = readPreference;
      _cursor.setReadPreference(_scope_options.readPreference, callback);
      return readOptions;
    },

    batchSize: function(batchSize, callback) {
      _scope_options.batchSize = batchSize;
      _cursor.batchSize(_scope_options.batchSize, callback);
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
      _scope_options.readPreference = readPreference;
      _cursor.setReadPreference(_scope_options.readPreference);
      return readOptions;
    },

    // Internal methods
    limit: function(limit, callback) {
      _scope_options.limit = limit;
      _cursor.limit(_scope_options.limit, callback);
      return readOptions;
    },

    skip: function(skip, callback) {
      _scope_options.skip = skip;
      _cursor.skip(_scope_options.skip, callback);
      return readOptions;
    },

    hint: function(hint) {
      _scope_options.hint = hint;
      _cursor.hint = _scope_options.hint;
      return readOptions;
    },    

    sort: function(keyOrList, direction, callback) {
      _scope_options.sort = keyOrList;
      _cursor.sort(keyOrList, direction, callback);
      return readOptions;
    },

    fields: function(fields) {
      _fields = fields;
      _cursor.fields = _fields;
      return readOptions;
    },

    maxTime: function(maxTime) {
      _scope_options.maxTime = maxTime;
      _cursor.maxTime = _scope_options.maxTime;
      return readOptions;
    },

    withQueryOptions: function(options) {
      // Ensure we record the options
      for(var name in options) {
        _scope_options[options[name]];
      }

      // Set the options
      _cursor.queryOptions(options);
      return readOptions;
    },

    copy: function() {
      // Copy the scope object
      var options = {};
      for(var name in _scope_options) {
        options[name] = _scope_options[name];
      }

      // Return a copied Scope exposing the writeOptions
      return new Scope(collection, _selector, _fields, options).find(_scope_options.selector);
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
  this.find = function(selector, options) {
    // Save the current selector
    _selector = selector;
    // Set the cursor
    _cursor.selector = selector;
    // Return only legal read options
    return readOptions;
  }
}

exports.Scope = Scope;