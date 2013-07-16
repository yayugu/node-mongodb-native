var Cursor = require('./cursor').Cursor
  , Readable = require('stream').Readable
  , utils = require('./utils')
  , inherits = require('util').inherits;

var TextStream = function(scope) {  
  // Set up
  Readable.call(this, {objectMode: true});

  // Self reference
  var self = this;
  // Results array
  var results = null;

  //
  // Stream method
  //
  this._read = function(n) {
    if(!results) {
      return scope.get(function(err, _results) {
        if(err) {
          self.emit('error', err);
          self.push(null);
        }

        // Return the results
        results = _results;
        // Push the result
        if(results.length > 0) {
          return self.push(results.shift());
        }
    
        // No items     
        return self.push(null);
      });     
    }

    if(results.length > 0) {
      return self.push(results.shift());
    }

    // No items     
    return self.push(null);
  }
}

// Inherit from Readable
inherits(TextStream, Readable);

var Scope = function(collection, _selector, _fields, _scope_options) {
  var self = this;

  // Ensure we have at least an empty cursor options object
  _scope_options = _scope_options || {};
  _write_concern = _scope_options.write_concern || null;

  // Ensure default read preference
  if(!_scope_options.readPreference) _scope_options.readPreference = {readPreference: 'primary'};

  // Text cursor options
  var text_items = null;

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

  var executeTextGetCommand = function(callback) {
    // Null out the cursor
    _cursor = null;
    // Build the command
    var command = {
        text: collection.collectionName
      , search: _scope_options.text
    };

    if(_selector) command.filer = _selector;
    if(_fields) command.project = _fields;
    if(_scope_options.limit) command.limit = Math.abs(_scope_options.limit);
    if(_scope_options.skip) command.skip = _scope_options.skip;
    if(_scope_options.search_options) {
      for(var name in _scope_options.search_options) {
        command[name] = _scope_options.search_options[name];
      }
    }

    // Run the command
    collection.db.command(command, _scope_options.readPreference, function(err, results) {
      if(err) return callback(err, null);
      if(results && results.errmsg) return callback(utils.toError(results), null);
      if(_scope_options.limit == -1) return callback(null, results.results[0]);
      callback(null, results.results);
    });
  }

  // All the read options
  var readOptions = {
    //
    // Backward compatible methods
    toArray: function(callback) {
      this.get(callback);
    },

    each: function(callback) {
      if(!_scope_options.text)
        return _cursor.each(callback);

      // Handle text cursors
      this.get(function(err, results) {
        if(err) return callback(err);

        while(results.length > 0) {
          callback(null, results.shift());
        }

        callback(null, null);
      })
    },    

    next: function(callback) {
      this.nextObject(callback);
    },

    nextObject: function(callback) {
      if(!_scope_options.text)
        return _cursor.nextObject(callback);

      if(!text_items) {
        // Handle text cursors
        return this.get(function(err, results) {
          if(err) return callback(err);
          text_items = results;
          // Ensure we don't issue undefined
          var item = text_items.shift();
          callback(null, item ? item : null);
        });        
      }

      // Ensure we don't issue undefined
      var item = text_items.shift();
      callback(null, item ? item : null);
    },    

    setReadPreference: function(readPreference, callback) {
      _scope_options.readPreference = {readPreference: readPreference};
      _cursor.setReadPreference(readPreference, callback);
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
      if(!_scope_options.text)
        return _cursor.stream(options);

      return new TextStream(this);
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

    withSearchOptions: function(options) {
      _scope_options['search_options'] = options;
      return readOptions;
    },

    text: function(string) {
      _scope_options.text = string;
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
      if(!_scope_options.text)
        return _cursor.toArray(callback);

      // Execute the text command
      executeTextGetCommand(callback);
    },

    getOne: function(callback) {
      if(!_scope_options.text) {
        _cursor.limitValue = -1;
        return _cursor.nextObject(callback);        
      }

      _scope_options.limit = -1;
      // Execute the text command
      executeTextGetCommand(callback);
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