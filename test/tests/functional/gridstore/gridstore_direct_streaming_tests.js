var fs = require('fs');

/**
 * @ignore
 */
exports.shouldCorrectlyStreamWriteToGridStoreObject = function(configuration, test) {
  var GridStore = configuration.getMongoPackage().GridStore
    , ObjectID = configuration.getMongoPackage().ObjectID;

  configuration.connect("w=0&maxPoolSize=1", function(err, db) {
  // DOC_LINE // Connect to the server using MongoClient
  // DOC_LINE MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
  // DOC_START
    
    // Set up gridStore
    var gridStore = new GridStore(db, "test_stream_write", "w");
    // Create a file reader stream to an object
    var fileStream = fs.createReadStream("./test/tests/functional/gridstore/test_gs_working_field_read.pdf");
    gridStore.on("close", function(err) {
      // Just read the content and compare to the raw binary
      GridStore.read(db, "test_stream_write", function(err, gridData) {
        var fileData = fs.readFileSync("./test/tests/functional/gridstore/test_gs_working_field_read.pdf");
        test.deepEqual(fileData, gridData);
        db.close();
        test.done();
      })
    });

    // Pipe it through to the gridStore
    fileStream.pipe(gridStore);
  })
}

/**
 * @ignore
 */
exports.shouldCorrectlyStreamReadFromGridStoreObject = function(configuration, test) {
  var GridStore = configuration.getMongoPackage().GridStore
    , ObjectID = configuration.getMongoPackage().ObjectID;

  configuration.connect("w=0&maxPoolSize=1", function(err, db) {
  // DOC_LINE // Connect to the server using MongoClient
  // DOC_LINE MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
  // DOC_START
    
    // Set up gridStore
    var gridStore = new GridStore(db, "test_stream_write_2", "w");
    gridStore.writeFile("./test/tests/functional/gridstore/test_gs_working_field_read.pdf", function(err, result) {		
      // Open a readable gridStore
      gridStore = new GridStore(db, "test_stream_write_2", "r");		
      // Create a file write stream
      var fileStream = fs.createWriteStream("./test_stream_write_2.tmp");
      fileStream.on("close", function(err) {			
        // Read the temp file and compare
        var compareData = fs.readFileSync("./test_stream_write_2.tmp");
        var originalData = fs.readFileSync("./test/tests/functional/gridstore/test_gs_working_field_read.pdf");
        test.deepEqual(originalData, compareData);			
        db.close();
        test.done();			
      })
      // Pipe out the data
      gridStore.pipe(fileStream);
    });
  });
}