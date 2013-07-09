//
// https://wiki.10gen.com/display/10GEN/Fluent+Interface
//
exports['should correctly perform simple insert with default write concern'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');
  
  // Simple insert
  col.insert({a:1}, function(err, result) {
    test.equal(null, err);
    test.done();
  });
}

exports['start with withWriteConcern and perform insert'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Insert with write concern
  col
    .withWriteConcern({j:true})
    .insert({a:1}, function(err, result) {
      test.equal(null, err);
      test.done();
    });
}

exports['start with withWriteConcern and perform save'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // With write concern
  col
    .withWriteConcern({j:true})
    .save({a:1}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result.a);
      test.done();
    });
}
