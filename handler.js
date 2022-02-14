const mongoose = require('mongoose');
var Schema = mongoose.Schema;  
var cachedDBS = {};

function connectToDatabase (_tenant,_mongoDB) {
  return new Promise(async (resolve) =>{
    console.log(JSON.stringify({state: "[CACHED-CONNECTIONS]", cachedConnection: Object.keys(cachedDBS) }));
    if (cachedDBS[_tenant]) {
      console.log(JSON.stringify({state: "[USING_CACHE_MONGO_CONN]"}));
      return resolve(cachedDBS[_tenant]);
    };
    console.log(JSON.stringify({state: "[CREATE_NEW_MONGO_CONN]"}));
    const conn_db = mongoose.createConnection(_mongoDB, {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      socketTimeoutMS: 2000000, 
      keepAlive: true
    }); 
    await conn_db;
    conn_db.model('DB_LOGS', new mongoose.Schema({
      eventAction: {type:String, require: true},
      eventID: {type:String, require: true}
    }, {collection: 'logs', minimize: false}));;
    cachedDBS[_tenant] = conn_db;

    return resolve(cachedDBS[_tenant]);
  });
};

module.exports.hello = async function(event, context, callback) {
  //context.callbackWaitsForEmptyEventLoop = false;
  console.log("About to connect to the database")
  let $conn = await connectToDatabase('application_id_1', "mongodb://credentials:credentials@my-document-db-cluster.aslsdfgsdfgs.sa-east-1.docdb.amazonaws.com:2707/sample-database?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false");
  console.log("Connected")


  return callback(null, {
	  statusCode: 200,
	  headers: { 
		  "Access-Control-Allow-Origin" : "*", 
		  "Access-Control-Allow-Credentials" : true
	  },
	  body: JSON.stringify({status: true})
	});
};
