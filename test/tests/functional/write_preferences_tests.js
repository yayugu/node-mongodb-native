/**
 * @ignore
 */
exports['insert with w=1 db level'] = function(configuration, test) {
  configuration.connect("w=1&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1').update({a:1}, {a:1}, {upsert:true}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['insert with w=1 collection level'] = function(configuration, test) {
  configuration.connect("w=0&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1', {w:1}).update({a:1}, {a:1}, {upsert:true}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['insert with w=1 operation level'] = function(configuration, test) {
  configuration.connect("w=0&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1').update({a:1}, {a:1}, {upsert:true, w:1}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['insert with journal db level'] = function(configuration, test) {
  configuration.connect("journal=true&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1').update({a:1}, {a:1}, {upsert:true}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['insert with journal collection level'] = function(configuration, test) {
  configuration.connect("w=1&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1', {journal:true}).update({a:1}, {a:1}, {upsert:true}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['insert with journal collection insert level'] = function(configuration, test) {
  configuration.connect("w=1&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1').update({a:1}, {a:1}, {upsert:true, journal:true}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['insert with journal and w == 1 at db level'] = function(configuration, test) {
  configuration.connect("w=1&wtimeout=1000&maxPoolSize=1", function(err, db) {
    db.collection('insert_with_w_1').update({a:1}, {a:1}, {upsert:true}, function(err, result) {
      test.equal(null, err);
      test.equal(1, result);
      test.done();
      db.close();
    });
  });
}

/**
 * @ignore
 */
exports['throw error when combining w:0 and journal'] = function(configuration, test) {
  try {
    configuration.connect("w=0&wtimeout=1000&maxPoolSize=1&journal=true", function(err, db) {
      test.fail()
    });
  } catch (err) {
    test.equal("w set to -1 or 0 cannot be combined with safe/w/journal/fsync", err.message);
    test.done();
  }
}