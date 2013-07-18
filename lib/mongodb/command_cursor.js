var Long = require('bson').Long
  , GetMoreCommand = require('./commands/get_more_command').GetMoreCommand;

var CommandCursor = function(db, collection, command, options) {  
  // Ensure empty options if no options passed
  options = options || {};
  // Default cursor id is 0
  var cursorId = Long.fromInt(0);

  // Hardcode batch size
  command.cursor.batchSize = 1;

  // BatchSize
  var batchSize = command.cursor.batchSize || 0;
  var raw = options.raw || false;
  var readPreference = options.readPreference || 'primary';

  // Checkout a connection
  var connection = db.serverConfig.checkoutReader(readPreference);

  // Get all the elements
  this.get = function(callback) {
    console.log("+++++++++++++++++++++++++++++++++++++++ COMMANDCURSOR GET")
    console.dir(command)

    // Execute the internal command first
    db.command(command, {connection:connection}, function(err, result) {
      if(err) return callback(err, null);

      console.log("================================================ 0")
      console.dir(err)
      console.dir(result)

      if(result.cursor.id.toString() == "0") {
        callback(null, result.cursor.firstBatch);
      } else {
        // Retrieve the cursor id
        cursorId = result.cursor.id;

        // Resolve more of the cursor using the getMore command
        var getMoreCommand = new GetMoreCommand(db
          , db.databaseName + "." + collection.collectionName
          , batchSize
          , cursorId
        );

        console.dir(getMoreCommand)

        // Set up options
        var command_options = { connection:connection };

        // Execute the getMore Command
        db._executeQueryCommand(getMoreCommand, command_options, function(err, result) {
          console.log("++++++++++++++++++++++++++++++++++++++++++ GETMORE")
          console.dir(err)
          console.dir(result)
        });
      }
    });
  }
}

var getAllByGetMore = function(self, callback) {
  getMore(self, {noReturn: true}, function(err, result) {
    if(err) return callback(utils.toError(err));
    if(result == null) return callback(null, null);
    if(self.cursorId.toString() == "0") return callback(null, null);
    getAllByGetMore(self, callback);
  })
}

exports.CommandCursor = CommandCursor;