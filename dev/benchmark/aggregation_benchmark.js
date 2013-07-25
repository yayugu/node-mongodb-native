var MongoClient = require('../../lib/mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {

  var docs = [];
  // Insert 100 docs
  for(var i = 0; i < 100; i++) {
    docs.push({a:i});
  }

  var warm_ups = 100;
  var iterations = 100;

  db.collection('bench').insert(docs, function(err, result) {
    if(err) throw err;

    // Execute find benchmark
    executeBenchmark(function(callback) {
      db.collection('bench').find({}).batchSize(10).toArray(callback);
    }, warm_ups, iterations, function(err, result) {
      console.log("================================ find benchmark")
      console.dir(result);

      // Execute find benchmark
      executeBenchmark(function(callback) {
        db.collection('bench').pipe().find({}).withQueryOptions({batchSize:10}).get(callback);
      }, warm_ups, iterations, function(err, result) {
        console.log("================================ aggregation benchmark")
        console.dir(result);
        test.done();
      });
    });
  });
});

var executeBenchmark = function(test_function, warm_up, iterations, callback) {
  var errors = [];
  var total_left = warm_up;
  var results = {
      warm_up_iterations: warm_up
    , iterations: iterations
  }

  // Execute warm up
  for(var i = 0; i < warm_up; i++) {  
    test_function(function(err, result) {
      total_left = total_left - 1;

      if(total_left == 0) {
        console.log("================================ warm_up done");
        total_left = iterations;
        
        // Execute test
        results.start_time = new Date().getTime();

        for(var i = 0; i < iterations; i++) {
          test_function(function(err, result) {
            if(err) errors.push(err);
            total_left = total_left - 1;

            if(total_left == 0) {
              console.log("================================ benchmark done");
              results.end_time = new Date().getTime();
              results.total_time = results.end_time - results.start_time;
              results.time_pr_iteration = results.total_time/iterations;
              callback(errors, results);
            }
          });
        }
      }
    });
  }
}



