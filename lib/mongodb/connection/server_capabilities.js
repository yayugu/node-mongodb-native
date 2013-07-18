var ServerCapabilities = function(buildInfo) {  
  var _buildInfo = buildInfo
  var _buildVersion = parseInt(buildInfo.version.replace(/\./g, ''), 10);

  // Capabilities
  var aggregationCursor = false;
  var writeCommands = false;
  var textSearch = false;

  if(_buildVersion >= 240) {
    textSearch = true;
  }

  // Set capabilities
  if(_buildVersion >= 251) {
    aggregationCursor = true;
    writeCommands = true;
  }

  // Map up read only parameters
  setup_get_property(this, "hasAggregationCursor", aggregationCursor);
  setup_get_property(this, "hasWriteCommands", writeCommands);
  setup_get_property(this, "hasTextSearch", textSearch);
}

var setup_get_property = function(object, name, value) {
  Object.defineProperty(object, name, {
      enumerable: true
    , get: function () { return value; }
  });  
}

ServerCapabilities.determine = function(db, callback) {
  db.command({buildInfo:true}, {readPreference:'primary'}, function(err, result) {
    if(err) return callback(err, null);    
    callback(null, new ServerCapabilities(result));
  });
}

exports.ServerCapabilities = ServerCapabilities;