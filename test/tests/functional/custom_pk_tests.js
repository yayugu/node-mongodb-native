/**
 * @ignore
 */
exports.shouldCreateRecordsWithCustomPKFactory = function(configuration, test) {
  var ObjectID = configuration.getMongoPackage().ObjectID;

  // Custom factory (need to provide a 12 byte array);
  var CustomPKFactory = function() {}
  CustomPKFactory.prototype = new Object();
  CustomPKFactory.createPk = function() {
    return new ObjectID("aaaaaaaaaaaa");
  }

  configuration.connect("w=1&maxPoolSize=1", {db: {pk: CustomPKFactory}}, function(err, db) {
  // DOC_LINE // Connect to the server using MongoClient
  // DOC_LINE MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
  // DOC_START
    
    var collection = db.collection('test_custom_key');

    collection.insert({'a':1}, {w:1}, function(err, doc) {
      
      collection.find({'_id':new ObjectID("aaaaaaaaaaaa")}).toArray(function(err, items) {
        test.equal(1, items.length);

        db.close();
        test.done();
      });
    });
  });
}