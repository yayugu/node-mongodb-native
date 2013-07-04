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
  col.insert([{update:1}, {update:1}], function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({j:true})
      .limit(10)
      .isolated()
      .find({update:1})
      .update({$set:{c:1}}, function(err, result) {
        test.equal(null, err);
        test.equal(true, result.updatedExisting);
        test.equal(2, result.n);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single document updateOne'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({updateOne:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({j:true})
      .find({updateOne:1})
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
  col.insert({updateOneAndGet:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({updateOneAndGet:1})
      .updateOneAndGet({$set:{e:1}}, function(err, doc) {
        test.equal(null, err);
        test.equal(1, doc.e);
        test.equal(1, doc.updateOneAndGet);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single getOneAndUpdate'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({getOneAndUpdate:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({getOneAndUpdate:1})
      .getOneAndUpdate({$set:{e:1}}, function(err, doc) {
        test.equal(null, err);
        test.equal(null, doc.e);
        test.equal(1, doc.getOneAndUpdate);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single replaceOneAndGet'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({replaceOneAndGet:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({replaceOneAndGet:1})
      .replaceOneAndGet({replaceOneAndGet:2, e:10}, function(err, doc) {
        test.equal(null, err);
        test.equal(10, doc.e);
        test.equal(2, doc.replaceOneAndGet);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single getOneAndReplace'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({getOneAndReplace:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({getOneAndReplace:1})
      .getOneAndReplace({getOneAndReplace:2, e:10}, function(err, doc) {
        test.equal(null, err);
        test.equal(null, doc.e);
        test.equal(1, doc.getOneAndReplace);
        test.done();
      });
  });
}

exports['start with withWriteConcern and perform single getOneAndRemove'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert({getOneAndReplace:1}, function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .withWriteConcern({w:1})
      .find({getOneAndReplace:1})
      .getOneAndRemove(function(err, doc) {
        test.equal(null, err);
        test.equal(null, doc.e);
        test.equal(1, doc.getOneAndReplace);
        test.done();
      });
  });
}