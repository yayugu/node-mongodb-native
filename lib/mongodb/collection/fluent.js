var Scope = require('../scope').Scope;

var withWriteConcern = function(write_concern) {
  var scope = new Scope(this, {}, null, null);
  return scope.withWriteConcern(write_concern);
}

exports.withWriteConcern = withWriteConcern;