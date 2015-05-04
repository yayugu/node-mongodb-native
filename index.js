// Core module
var core = require('mongodb-core');

// Set up the connect function
var connect = require('./lib/mongo_client').connect;

// Expose error class
connect.MongoError = core.MongoError;

// Actual driver classes exported
connect.MongoClient = require('./lib/mongo_client');
connect.Db = require('./lib/db');
connect.Collection = require('./lib/collection');
connect.Server = require('./lib/server');
connect.ReplSet = require('./lib/replset');
connect.Mongos = require('./lib/mongos');
connect.ReadPreference = require('./lib/read_preference');
connect.GridStore = require('./lib/gridfs/grid_store');
connect.Chunk = require('./lib/gridfs/chunk');
connect.Logger = core.Logger;
connect.Cursor = require('./lib/cursor');

// BSON types exported
connect.Binary = core.BSON.Binary;
connect.Code = core.BSON.Code;
connect.DBRef = core.BSON.DBRef;
connect.Double = core.BSON.Double;
connect.Long = core.BSON.Long;
connect.MinKey = core.BSON.MinKey;
connect.MaxKey = core.BSON.MaxKey;
connect.ObjectID = core.BSON.ObjectID;
connect.ObjectId = core.BSON.ObjectID;
connect.Symbol = core.BSON.Symbol;
connect.Timestamp = core.BSON.Timestamp;

// Add connect method
connect.connect = connect;

// Get prototype
var AggregationCursor = require('./lib/aggregation_cursor'),
  CommandCursor = require('./lib/command_cursor'),
  OrderedBulkOperation = require('./lib/bulk/ordered').OrderedBulkOperation,
  UnorderedBulkOperation = require('./lib/bulk/unordered').UnorderedBulkOperation,
  Admin = require('./lib/admin');

// Instrument Hook
connect.instrument = function(callback) {
  var instrumentations = []

  //
  // GridStore Level instrumentation
  instrumentations.push({
    name: 'GridStore',
    obj: connect.GridStore,
    stream: true, 
    instrumentations: [
      { methods: [
        'open', 'getc', 'puts', 'write', 'writeFile', 'close', 'unlink', 'readlines',
        'rewind', 'read', 'tell', 'seek'
      ], options: { callback: true, promise:false } },
      { methods: [
        'collection' 
      ], options: { callback: true, promise:false, returns: [connect.Collection] } },
      { methods: [
        'exist', 'list', 'read', 'readlines', 'unlink'
      ], options: { callback: false, promise:false, static:true } },
      { methods: [
        'eof', 'destroy', 'chunkCollection'
      ], options: { callback: false, promise:false } }
    ]    
  });

  //
  // Server Level instrumentation
  instrumentations.push({
    name: 'Server',
    obj: connect.Server,
    instrumentations: [
      { methods: [
        'connect', 'command', 'insert', 'update', 'remove', 'auth'
      ], options: { callback: true, promise:false } },
      { methods: [
        'cursor'
      ], options: { callback: false, promise:false, returns: [connect.Cursor, AggregationCursor, CommandCursor] } },
      { methods: [
        'close'
      ], options: { callback: false, promise:false } }
    ]    
  });

  //
  // ReplSet Level instrumentation
  instrumentations.push({
    name: 'ReplSet',
    obj: connect.ReplSet,
    instrumentations: [
      { methods: [
        'connect', 'command', 'insert', 'update', 'remove', 'auth'
      ], options: { callback: true, promise:false } },
      { methods: [
        'cursor'
      ], options: { callback: false, promise:false, returns: [connect.Cursor, AggregationCursor, CommandCursor] } },
      { methods: [
        'close'
      ], options: { callback: false, promise:false } }
    ]    
  });

  //
  // Mongos Level instrumentation
  instrumentations.push({
    name: 'Mongos',
    obj: connect.Mongos,
    instrumentations: [
      { methods: [
        'connect', 'command', 'insert', 'update', 'remove', 'auth'
      ], options: { callback: true, promise:false } },
      { methods: [
        'cursor'
      ], options: { callback: false, promise:false, returns: [connect.Cursor, AggregationCursor, CommandCursor] } },
      { methods: [
        'close'
      ], options: { callback: false, promise:false } }
    ]    
  });

  //
  // OrderedBulkOperation Level instrumentation
  instrumentations.push({
    name: 'OrderedBulkOperation',
    obj: OrderedBulkOperation,
    instrumentations: [
      { methods: [
        'execute'
      ], options: { callback: true, promise:false } }
    ]    
  });

  //
  // UnorderedBulkOperation Level instrumentation
  instrumentations.push({
    name: 'UnorderedBulkOperation',
    obj: UnorderedBulkOperation,
    instrumentations: [
      { methods: [
        'execute'
      ], options: { callback: true, promise:false } }
    ]    
  });

  //
  // CommandCursor Level instrumentation
  instrumentations.push({
    name: 'CommandCursor',
    obj: CommandCursor,
    stream: true,
    instrumentations: [
      { methods: [
        'next', 'forEach', 'each', 'toArray', 'explain', 'close', 'get'
      ], options: { callback: true, promise:false } },
    ]    
  });

  //
  // AggregationCursor Level instrumentation
  instrumentations.push({
    name: 'AggregationCursor',
    obj: AggregationCursor,
    stream: true,
    instrumentations: [
      { methods: [
        'get', 'next', 'forEach', 'each', 'toArray', 'explain', 'close'
      ], options: { callback: true, promise:false } },
    ]
  });

  //
  // Cursor Level instrumentation
  instrumentations.push({
    name: 'Cursor',
    obj: connect.Cursor,
    stream: true,
    instrumentations: [
      { methods: [
        'next', 'toArray', 'nextObject', 'forEach', 'each', 'count', 'close', 'explain'
      ], options: { callback: true, promise:false } },
    ]
  });

  //
  // Collection Level instrumentations
  instrumentations.push({
    name: 'Collection',
    obj: connect.Collection,
    instrumentations: [
      { methods: [
        'insertOne', 'insertMany', 'bulkWrite', 'insert', 'updateOne', 'replaceOne', 'updateMany',
        'update', 'deleteOne', 'deleteMany', 'remove', 'save', 'findOne', 'rename', 'drop',
        'options', 'isCapped', 'createIndex', 'createIndexes', 'dropIndex', 'dropIndexes',
        'reIndex', 'ensureIndex', 'indexExists', 'indexInformation', 'count', 'distinct',
        'indexes', 'stats', 'findOneAndDelete', 'findOneAndReplace', 'findOneAndUpdate',
        'findAndModify', 'findAndRemove', 'parallelCollectionScan', 'geoNear', 'geoHaystackSearch',
        'group', 'mapReduce'
      ], options: { callback: true, promise:false } },
      { methods: [
        'find'
      ], options: { callback:false, promise: false, cursor: true, returns: [connect.Cursor] } },
      { methods: [
        'aggregate'
      ], options: { callback:false, promise: false, cursor: true, returns: [AggregationCursor] } },
      { methods: [
        'listIndexes'
      ], options: { callback:false, promise: false, cursor: true, returns: [CommandCursor] } },
      { methods: [
        'initializeUnorderedBulkOp'
      ], options: { callback:false, promise: false, cursor: false, returns: [UnorderedBulkOperation] } },
      { methods: [
        'initializeOrderedBulkOp'
      ], options: { callback:false, promise: false, cursor: false, returns: [OrderedBulkOperation] } }
    ]
  });

  //
  // Db Level instrumentations
  instrumentations.push({
    name: 'Db',
    obj: connect.Db,
    instrumentations: [
      { methods: [
        'open', 'command', 'close', 'createCollection', 'stats', 'eval', 'renameCollection',
        'dropCollection', 'dropDatabase', 'collections', 'executeDbAdminCommand', 'createIndex',
        'ensureIndex', 'addUser', 'removeUser', 'authenticate', 'logout', 'indexInformation'
      ], options: { callback: true, promise: false } },
      { methods: [
        'admin'
      ], options: { callback:false, promise: false, cursor: false, returns: [Admin] } },
      { methods: [
        'db'
      ], options: { callback:false, promise: false, cursor: false, returns: [connect.Db] } },
      { methods: [
        'collection'
      ], options: { callback:true, promise: false, cursor: false, returns: [connect.Collection] } },
      { methods: [
        'listCollections'
      ], options: { callback:false, promise: false, cursor: true, returns: [CommandCursor] } }
    ]
  });

  // Return the list of instrumentation points
  callback(null, instrumentations);
}

// Set our exports to be the connect function
module.exports = connect;