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
      test.done();
    });
}

exports['start with withWriteConcern and perform limit, isolate and update'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert([{g:1}, {g:1}], function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({j:true})
      .limit(10)
      .isolated()
      .find({g:1})
      .update({$set:{c:1}}, function(err, result) {
        test.equal(null, err);
        test.equal(true, result.updatedExisting);
        test.equal(2, result.n);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single document update'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({b:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({j:true})
      .find({b:1})
      .updateOne({$set:{c:1}}, function(err, result) {
        test.equal(null, err);
        test.equal(true, result.updatedExisting);
        test.equal(1, result.n);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single updateOneAndGet'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({d:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({d:1})
      .updateOneAndGet({$set:{e:1}}, function(err, doc) {
        test.equal(null, err);
        test.equal(1, doc.e);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single updateOneAndGetOriginal'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({d:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({d:1})
      .updateOneAndGetOriginal({$set:{e:1}}, function(err, doc) {
        test.equal(null, err);
        test.equal(null, doc.e);
        test.equal(1, doc.d);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single replaceOneAndGet'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({d:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({d:1})
      .replaceOneAndGet({d:2, e:10}, function(err, doc) {
        test.equal(null, err);
        test.equal(10, doc.e);
        test.equal(2, doc.d);
        test.done();
      });
  });
}