var redis = require("redis");//,  client = redis.createClient(), 
var sys = require('util');
var url   = require("url").parse(process.env.OPENREDIS_URL);
var client = redis.createClient(url.port, url.hostname);

client.auth(url.auth.split(":")[1]);
var idCounter = "ID:URL";
var urlPattern = "URL:";
var idSetKey ="ID:SET";
/*
 * Functions to access redis
 * Should maybe bind the functions to on a object to better facilitate testing.
 */

client.on("error", function(err) {
	console.log("Error " + err);
});

/**
 * Saves a short url
 * @param uid short url
 * @param url the actual url
 */
function save(uid, url){
	client.set(urlPattern+uid, url, redis.print);
	client.sadd(idSetKey,urlPattern+uid);
}

/**
 * delete a short url
 * @param uid unique short url to delete
 */
function del(uid){
	client.srem(idSetKey,urlPattern+uid);
	client.del(urlPattern+uid);
}

/**
 * get url from redis
 * @param id to look for
 * @param fn for result/err
 * @returns
 */
function get(id, fn){
	return client.get(urlPattern+id, function(err, reply) {
		fn(reply,err);
	});
}

/**
 * list all short url key and associated urls in the db
 * keys are stiored in a set seperately, so that we dont have to run thru all the db to get them.....
 * BUT this is an extremely ewxpensive operation when the db get filled. prog good to remove this functionality.
 * 
 * @param fn fn to get result
 */
function list(fn){
	client.smembers(idSetKey,function (err,keys){
		var valget = function (err,val){
			fn({'keys':keys.map(function(v){
				return v.substring(4);
			}), 'values': val});
		};
		client.mget(keys, valget);
		
	});
}

/**
 * get unique number from redis
 * @param fn fn to call with val
 * 
 */
function getNewId(fn){// todo why dosent client.incr work as i expect!
	client.send_command('INCR',[idCounter], function (err,val){
		fn(val,err);
	});
 
}
/**
 * Just a call back to close the connection on app exit
 */
function shutdown(){
	client.quit();
}

console.log("exporting : redis wrapper");
exports.del = del;
exports.save = save;
exports.print = redis.print;
exports.get = get;
exports.getNewId = getNewId;
exports.list = list;
exports.shutdown=shutdown;