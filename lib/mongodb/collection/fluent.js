var PreCursor = require('../pre_cursor').PreCursor;

var withWriteConcern = function(write_concern) {
  var pre_cursor = new PreCursor(this);
  return pre_cursor.withWriteConcern(write_concern);
}

exports.withWriteConcern = withWriteConcern;