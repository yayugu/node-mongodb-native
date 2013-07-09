exports['Should correctly perform a simple get'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert([{find:1}, {find:2}, {find:3}], function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .find({findOne: {$gt: 0}})
      .withReadPreference(ReadPreference.SECONDARY)    
      .limit(1)
      .skip(1)
      .sort({find: -1})
      .get(function(err, docs) {
        test.equal(null, err);
        test.equal(1, docs.length);
        test.done();
      });
  });
}

exports['Should correctly perform a simple getOne'] = function(configuration, test) {
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
      .getOne(function(err, doc) {
        test.equal(null, err);
        test.equal(2, doc.findOne);
        test.done();
      });
  });
}

exports['Should correctly execute query explain'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // With write concern
  col
    .find({findOne: {$gt: 0}})
    .withReadPreference(ReadPreference.SECONDARY)    
    .limit(1)
    .skip(1)
    .sort({findOne: -1})
    .explain(function(err, doc) {
      test.equal(null, err);
      test.ok(doc.cursor != null);
      test.done();
    });
}
