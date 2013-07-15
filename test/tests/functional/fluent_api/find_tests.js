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
        // test.equal(null, err);
        // test.equal(1, docs.length);
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

exports['Should correctly execute count'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // With write concern
  col
    .find({count: {$gt: 0}})
    .withReadPreference(ReadPreference.SECONDARY)    
    .limit(1)
    .skip(1)
    .sort({count: -1})
    .count(function(err, count) {
      test.equal(null, err);
      test.equal(0, count);
      test.done();
    });
}

exports['Should correctly perform a simple getOne using fields to limit returned fields'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert([{fields:1, b:1}], function(err, result) {
    test.equal(null, err);

    // With write concern
    col
      .find({fields: {$gt: 0}})
      .sort({fields: -1})
      .fields({b:1})
      .getOne(function(err, doc) {
        test.equal(undefined, doc.fields);
        test.equal(1, doc.b);
        test.done();
      });
  });
}

exports['Should correctly execute query explain using hint'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Simple insert
  col.insert([{hint:1, b:1}], function(err, result) {
    test.equal(null, err);

    col.ensureIndex({hint:1}, function(err, result) {
      // With write concern
      col
        .find({findOne: {$gt: 0}})
        .withReadPreference(ReadPreference.SECONDARY)    
        .limit(1)
        .skip(1)
        .hint({_id:1})
        .sort({hint: -1})
        .explain(function(err, doc) {
          test.equal(null, err);
          test.ok(doc.cursor.indexOf('_id_') != -1);
          test.done();
        });
    });
  });
}

exports['Should correctly execute query explain using maxScan'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Insert 100 documents
  var docs = [];
  for(var i = 0; i < 100; i++) {
    docs.push({maxScan:1, i: i});
  }

  // Simple insert
  col.insert(docs, function(err, result) {
    test.equal(null, err);

    col.ensureIndex({maxScan:1}, function(err, result) {
      // With write concern
      col
        .find({maxScan: 1})
        .withQueryOptions({maxScan: 10})
        .maxTime(1000)
        .get(function(err, docs) {
          test.equal(null, err);
          test.equal(10, docs.length);
          test.done();
        });
    });
  });
}

exports['Should correctly execute query explain using min and max'] = function(configuration, test) {
  var ReadPreference = configuration.getMongoPackage().ReadPreference;
  var db = configuration.db();
  var col = db.collection('fluent_api');
  // Insert 100 documents
  var docs = [
      { "_id" : 6, "item" : "apple", "type" : "cortland", "price" : 1.29 }
    , { "_id" : 2, "item" : "apple", "type" : "fuji", "price" : 1.99 }
    , { "_id" : 1, "item" : "apple", "type" : "honey crisp", "price" : 1.99 }
    , { "_id" : 3, "item" : "apple", "type" : "jonagold", "price" : 1.29 }
    , { "_id" : 4, "item" : "apple", "type" : "jonathan", "price" : 1.29 }
    , { "_id" : 5, "item" : "apple", "type" : "mcintosh", "price" : 1.29 }
    , { "_id" : 7, "item" : "orange", "type" : "cara cara", "price" : 2.99 }
    , { "_id" : 10, "item" : "orange", "type" : "navel", "price" : 1.39 }
    , { "_id" : 9, "item" : "orange", "type" : "satsuma", "price" : 1.99 }
    , { "_id" : 8, "item" : "orange", "type" : "valencia", "price" : 0.99 }    
  ];

  // Simple insert
  col.insert(docs, function(err, result) {
    test.equal(null, err);

    col.ensureIndex({ "item" : 1, "type" : 1 }, function(err, result) {
      test.equal(null, err);

      col.ensureIndex({ "item" : 1, "type" : -1 }, function(err, result) {
        test.equal(null, err);

        col.ensureIndex({ "prices" : 1}, function(err, result) {
          test.equal(null, err);

          // With write concern
          col
            .find()
            .withQueryOptions({
                min: { item: 'apple', type: 'jonagold' }
              , max: { item: 'apple', type: 'navel' }
            })
            // .min( { item: 'apple', type: 'jonagold' } )
            // .max( { item: 'apple', type: 'navel' } )
            .hint( { item: 1, type: 1 } )
            .get(function(err, docs) {
              test.equal(null, err);
              test.equal(3, docs.length);
              test.done();
            });
        });
      });
    });
  });
}

exports['start a find chain and copy it then morph the existing without modifying existing'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api');

  // Insert a couple of docs
  var docs = [];
  for(var i = 0; i < 20; i++) docs.push({scope_find: i});

  // Simple insert
  col.insert(docs, function(err, result) {
    test.equal(null, err);

    // Scope one
    var scope1 = col
                  .find()
                  .limit(10);
    // Scope two
    var scope2 = scope1.copy();

    // Modify scope one
    scope1.limit(1);

    // Execute the queries
    scope1.get(function(err, docs) {
      test.equal(null, err);
      test.equal(1, docs.length);

      // Execute query 2
      scope2.get(function(err, docs) {
        test.equal(null, err);
        test.equal(10, docs.length);
        test.done();
      });
    });
  });
}
