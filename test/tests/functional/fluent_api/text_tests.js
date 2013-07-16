var fs = require('fs')
	, stream = require('stream');

exports['Should fail to run with text search as not enabled'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text2');

  // Insert some documents
  var docs = [{
  	  title: "little red ridding hood"
  	, description: "we have some description"
  }, {
	  title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);
	  
	  // Disable
	  db.admin().command({setParameter: true, textSearchEnabled: false}, function(err, result) {

	  	// Execute a text search command
	  	col.find({id:1})
	  		.limit(1)
	  		.skip(0)
	  		.fields({title:1})
	  		.withSearchOptions({language:'english'})
	  		.text("red").get(function(err, results) {
			  	test.ok(err != null);
			  	test.done();
	  		});
	  });
  });
};

exports['Should correctly perform a simple text search and return all'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text1');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
	
		  	// Execute a text search command
		  	col.find({id:1})
		  		.limit(1)
		  		.skip(0)
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("red").get(function(err, results) {
		  			test.equal(null, err);
		  			test.equal(1, results.length);
		  			test.equal('little red ridding hood', results[0].obj.title);

				  	// Execute a text search command
				  	col.find({id:1})
				  		.fields({title:1})
				  		.withSearchOptions({language:'english'})
				  		.text("red").getOne(function(err, result) {
				  			test.equal(null, err);
				  			test.equal('little red ridding hood', result.obj.title);
				  			test.done();
					  	});
		  		});
	  	});
	  });
	});
};

exports['Should correctly perform a simple text search and perform each'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text3');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
		
				// Results count
				var counter = 0;
		  	// Execute a text search command
		  	col.find({id:1})
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("description").each(function(err, result) {
		  			test.equal(null, err);

		  			if(result == null) {
		  				test.equal(2, counter);
		  				test.done();
		  			} else {
		  				counter += 1;
		  			}
		  		});
	  	});
	  });
	});
};

exports['Should correctly perform a simple text search and perform next'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text4');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
		
				// Results count
				var counter = 0;
		  	// Execute a text search command
		  	var cursor = col.find({id:1})
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("description");
		  	// Excute next until done
		  	cursor.next(function(err, result) {
		  			test.equal(null, err);
		  			test.ok(result != null);
		
				  	cursor.next(function(err, result) {
			  			test.equal(null, err);
			  			test.ok(result != null);

					  	cursor.next(function(err, result) {
				  			test.equal(null, err);
				  			test.equal(null, result);
				  			test.done();
			  			});
		  			});
		  		});
	  	});
	  });
	});
};

exports['Should correctly perform a simple text search and perform each'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text5');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
		
				// Results count
				var counter = 0;
		  	// Execute a text search command
		  	col.find({id:1})
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("description").each(function(err, result) {
		  			test.equal(null, err);

		  			if(result == null) {
		  				test.equal(2, counter);
		  				test.done();
		  			} else {
		  				counter += 1;
		  			}
		  		});
	  	});
	  });
	});
};

exports['Should correctly perform a simple text search and perform stream'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text6');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Create transformer
	var liner = new stream.Transform( { objectMode: true } )

	// Add tranformer
	liner._transform = function(object, encoding, done) {
		this.push(JSON.stringify(object));
		done();
	}

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
		
		  	// Execute a text search command
		  	var stream = col.find({id:1})
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("description").stream();

		    // Execute the aggregation
		    var file_stream = fs.createWriteStream(process.cwd() + '/text.tmp');
		    liner.pipe(file_stream);
		    stream.pipe(liner);
		    file_stream.on('close', function() {

			  	// Execute a text search command
			  	col.find({id:1})
			  		.fields({title:1})
			  		.withSearchOptions({language:'english'})
			  		.text("description").get(function(err, results) {
			  			var str = '';
			  			// Create the stream
			  			for(var i = 0; i < results.length; i++) {
			  				str += JSON.stringify(results[i]);
			  			}

				    	var str2 = fs.readFileSync(process.cwd() + '/text.tmp', 'utf8');
				    	test.equal(str2, str);
				    	test.done();		    	
			  		});
		    });
	  	});
	  });
	});
};

exports['Should correctly perform a simple text search and count'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text7');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
	
		  	// Execute a text search command
		  	col.find({id:1})
		  		.limit(1)
		  		.skip(0)
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("red").count(function(err, results) {
		  			test.equal(null, err);
		  			test.equal(1, results);
		  			test.done();
		  		});
	  	});
	  });
	});
};

exports['Should correctly perform a simple text search and explain'] = function(configuration, test) {
  var db = configuration.db();
  var col = db.collection('fluent_api_text7');

  // Insert some documents
  var docs = [{
  	  id: 1
  	, title: "little red ridding hood"
  	, description: "we have some description"
  }, {
  	  id: 2
		, title: "the brothers grim"
  	, description: "we have some description"
  }];

  // Insert the documents
  col.insert(docs, function(err, result) {
  	test.equal(null, err);

	  // Enable text index
	  db.admin().command({setParameter: true, textSearchEnabled: true}, function(err, result) {

	  	// Create the text index
	  	col.ensureIndex({ "$**": "text" }, {language:'english'}, function(err, result) {
	  		test.equal(null, err);
	
		  	// Execute a text search command
		  	col.find({id:1})
		  		.limit(1)
		  		.skip(0)
		  		.fields({title:1})
		  		.withSearchOptions({language:'english'})
		  		.text("red").explain(function(err, results) {
		  			test.equal(null, err);
		  			test.ok(results.stats);
		  			test.done();
		  		});
	  	});
	  });
	});
};


















