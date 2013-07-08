exports['Should correctly perform a simple findOne'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert([{findOne:1}, {findOne:2}, {findOne:3}], function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .find({findOne: {$gt: 0}})
      .withReadPreference(ReadPreference.SECONDARY)    
      .limit(1)
      .skip(1)
      .sort({findOne: -1})
      .get(function(err, docs) {
        test.equal(null, err);
        test.equal(1, docs.length);
        test.done();
      });
  });
}
