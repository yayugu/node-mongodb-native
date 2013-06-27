/**
 * @ignore
 */
exports.shouldCorrectlyLogContent = function(configuration, test) {
  if(configuration.db().serverConfig instanceof configuration.getMongoPackage().ReplSet) return test.done();
  var loggedOutput = false;
  var logger = {
    doDebug:true,
    doError:true,
    doLog:true,
    
    error:function(message, object) {},       
    log:function(message, object) {}, 
    
    debug:function(message, object) {
      loggedOutput = true;
    }
  }
      
  configuration.connect("w=1&maxPoolSize=1", {db: {logger: logger}}, function(err, db) {
    db.close();
    test.equal(true, loggedOutput);
    test.done();
  });    
}