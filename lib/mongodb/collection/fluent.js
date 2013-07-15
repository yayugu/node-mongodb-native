var Scope = require('../scope').Scope;

var withWriteConcern = function(write_concern) {
  var scope = new Scope(this);
  return scope.withWriteConcern(write_concern);
}

exports.withWriteConcern = withWriteConcern;