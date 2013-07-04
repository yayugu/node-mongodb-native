var Cursor = require('./cursor').Cursor;

var PreCursor = function(collection) {
  var self = this;
  // Internal state
  var _write_concern = {w:1};
  var _limit = null;
  var _isolated = false;
  var _multi = true;
  var _sort = null;
  var _selector = {};

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
      collection.save(document, options, callback);
    },

    find: function(selector) {
      _selector = selector;
      return writeOptions;
    },

    limit: function(limit) {
      _limit = limit;
      return writeOptions;
    },

    isolated: function() {
      _isolated = true;
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
      // Execute options
      collection.update(_selector, operations, options, function(err, result, obj) {
        callback(err, obj);
      });
    },

    updateOne: function(operations, callback) {
      // Set as multi
      _multi = false;
      // Execute update
      this.update(operations, callback);
    },

    updateOneAndGet: function(operations, callback) {
      // Merge together options
      var options = _write_concern;
      // Set new option
      options['new'] = true;
      // execute find and modify
      collection.findAndModify(_selector, _sort, operations, options, callback);
    },

    getOneAndUpdate: function(operations, callback) {
      // Merge together options
      var options = _write_concern;
      // execute find and modify
      collection.findAndModify(_selector, _sort, operations, options, callback);      
    },

    replaceOneAndGet: function(document, callback) {
      // Merge together options
      var options = _write_concern;
      // Set new option
      options['new'] = true;
      // execute find and modify
      collection.findAndModify(_selector, _sort, document, options, callback);      
    },

    getOneAndReplace: function(document, callback) {
      // Merge together options
      var options = _write_concern;
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
    // Save the current write concern to the PreCursor
    _write_concern = write_concern;

    // Only allow legal options
    return writeOptions;
  }
}

exports.PreCursor = PreCursor;