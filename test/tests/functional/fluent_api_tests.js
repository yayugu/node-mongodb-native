//
// https://wiki.10gen.com/display/10GEN/Fluent+Interface
//
exports['should correctly perform simple insert with default write concern'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');
  // Simple insert
  col.insert({a:1}, function(err, result) {
    test.equal(null, err);

    db.close();
    test.done();
  });
}

// exports['start with withWriteConcern and perform insert'] = function(configuration, test) {
//   var db = configuration.db();
//   var col = db.collection('fluent_api');
//   // Simple insert
//   col
//     .withWriteConcern({j:true})
//     .insert({a:1}, function(err, result) {
//       test.equal(null, err);

//       db.close();
//       test.done();
//     });
// }