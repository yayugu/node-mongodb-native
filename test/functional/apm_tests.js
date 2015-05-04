"use strict";

var f = require('util').format;

exports['Should correctly instrument driver with callback=true, promise=false, returns=null, static=false'] = {
  metadata: { requires: { topology: ['single', 'replicaset', 'sharded', 'ssl', 'heap', 'wiredtiger'] } },
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var methodsCalled = {};

    require('../..').instrument(function(err, instrumentations) {
      instrumentations.forEach(function(obj) {
        var object = obj.obj;
        
        // Iterate over all the methods that are just callback with no return
        obj.instrumentations.forEach(function(instr) {
          var options = instr.options;

          if(options.callback 
            && !options.promise 
            && !options.returns && !options.static) {

            // Method name
            instr.methods.forEach(function(method) {
              var applyMethod = function(_method) {
                var func = object.prototype[_method];
                object.prototype[_method] = function() {
                  if(!methodsCalled[_method]) methodsCalled[_method] = 0;
                  methodsCalled[_method] = methodsCalled[_method] + 1;
                  var args = Array.prototype.slice.call(arguments, 0);
                  func.apply(this, args);                
                }                
              }

              applyMethod(method);
            });
          }
        });
      });
    });

    var MongoClient = require('../..');
    MongoClient.connect(configuration.url(), function(err, client) {
      client.collection('apm1').insertOne({a:1}, function(err, r) {
        test.equal(null, err);
        test.equal(1, r.insertedCount);
        test.equal(1, methodsCalled.insertOne);

        client.close();
        test.done();
      });
    });
  }
}

exports['Should correctly instrument driver with all possibilities'] = {
  metadata: { requires: { topology: ['single', 'replicaset', 'sharded', 'ssl', 'heap', 'wiredtiger'] } },
  
  // The actual test we wish to run
  test: function(configuration, test) {
    var methodsCalled = {};

    require('../..').instrument(function(err, instrumentations) {
      instrumentations.forEach(function(obj) {
        var object = obj.obj;
        
        // Iterate over all the methods that are just callback with no return
        obj.instrumentations.forEach(function(instr) {
          var options = instr.options;

          if(options.callback // Prototype Callback no return value
            && !options.promise 
            && options.returns == null && !options.static ) {

            instr.methods.forEach(function(method) {
              var applyMethod = function(_method) {
                var func = object.prototype[_method];
                object.prototype[_method] = function() {
                  console.log(f("================ %s:%s callback:%s, promise:%s, returns:%s, static:%s"
                    , obj.name, _method, options.callback
                    , options.promise
                    , options.returns != null
                    , options.static == null ? false : options.static));
                  if(!methodsCalled[_method]) methodsCalled[_method] = 0;
                  methodsCalled[_method] = methodsCalled[_method] + 1;

                  // Set up and handle the callback
                  var self = this;
                  var args = Array.prototype.slice.call(arguments, 0);
                  var callback = args.pop();

                  // We passed no callback
                  if(typeof callback != 'function') {
                    args.push(callback);
                    return func.apply(this, args);
                  }
                
                  // Intercept the method callback
                  args.push(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    callback.apply(self, args);
                  });

                  // Execute the method
                  func.apply(this, args);                
                }                
              }

              applyMethod(method);
            });

          } else if(options.callback // Static Callback no return value
            && !options.promise 
            && options.returns == null && options.static ) {

            instr.methods.forEach(function(method) {
              var applyMethod = function(_method) {
                var func = object[_method];
                object[_method] = function() {
                  console.log(f("================ %s:%s callback:%s, promise:%s, returns:%s, static:%s"
                    , obj.name, _method, options.callback
                    , options.promise
                    , options.returns != null
                    , options.static == null ? false : options.static));
                  if(!methodsCalled[_method]) methodsCalled[_method] = 0;
                  methodsCalled[_method] = methodsCalled[_method] + 1;

                  // Set up and handle the callback
                  var self = this;
                  var args = Array.prototype.slice.call(arguments, 0);
                  var callback = args.pop();

                  // We passed no callback
                  if(typeof callback != 'function') {
                    args.push(callback);
                    return func.apply(this, args);
                  }
                
                  // Intercept the method callback
                  args.push(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    callback.apply(self, args);
                  });

                  // Execute the method
                  func.apply(this, args);                
                }                
              }

              applyMethod(method);
            });
          
          } else if(options.callback // Prototype Callback returning non-promise value
            && !options.promise
            && options.returns != null && !options.static ){

            instr.methods.forEach(function(method) {
              var applyMethod = function(_method) {
                var func = object.prototype[_method];
                object.prototype[_method] = function() {
                  console.log(f("================ %s:%s callback:%s, promise:%s, returns:%s, static:%s"
                    , obj.name, _method, options.callback
                    , options.promise
                    , options.returns != null
                    , options.static == null ? false : options.static));
                  if(!methodsCalled[_method]) methodsCalled[_method] = 0;
                  methodsCalled[_method] = methodsCalled[_method] + 1;

                  // Set up and handle the callback
                  var self = this;
                  var args = Array.prototype.slice.call(arguments, 0);
                  var callback = args.pop();

                  // We passed no callback
                  if(typeof callback != 'function') {
                    args.push(callback);
                    return func.apply(this, args);
                  }
                
                  // Intercept the method callback
                  args.push(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    callback.apply(self, args);
                  });

                  // Execute the method
                  func.apply(this, args);                
                }                
              }

              applyMethod(method);
            });
          
          } else if(options.callback // Static Callback returning non-promise value
            && !options.promise
            && options.returns != null && options.static ){

            instr.methods.forEach(function(method) {
              var applyMethod = function(_method) {
                var func = object[_method];
                object[_method] = function() {
                  console.log(f("================ %s:%s callback:%s, promise:%s, returns:%s, static:%s"
                    , obj.name, _method, options.callback
                    , options.promise
                    , options.returns != null
                    , options.static == null ? false : options.static));
                  if(!methodsCalled[_method]) methodsCalled[_method] = 0;
                  methodsCalled[_method] = methodsCalled[_method] + 1;

                  // Set up and handle the callback
                  var self = this;
                  var args = Array.prototype.slice.call(arguments, 0);
                  var callback = args.pop();

                  // We passed no callback
                  if(typeof callback != 'function') {
                    args.push(callback);
                    return func.apply(this, args);
                  }
                
                  // Intercept the method callback
                  args.push(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    callback.apply(self, args);
                  });

                  // Execute the method
                  func.apply(this, args);                
                }                
              }

              applyMethod(method);
            });
          
          // } else if(!options.callback // Prototype method returning a promise
          //   && options.promise && !options.static ){

          //   instr.methods.forEach(function(method) {
          //   });
          
          // } else if(!options.callback // Static method returning a promise
          //   && options.promise && options.static ){

          //   instr.methods.forEach(function(method) {
          //   });

          }
        });
      });
    });

    var MongoClient = require('../..');
    MongoClient.connect(configuration.url(), function(err, client) {
      client.collection('apm1').insertOne({a:1}, function(err, r) {
        console.log("--------------------------------------------------")
        // test.equal(null, err);
        // test.equal(1, r.insertedCount);
        // test.equal(1, methodsCalled.insertOne);

        client.close();
        test.done();
      });
    });
  }
}