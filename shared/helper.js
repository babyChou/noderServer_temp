const crypto = require('crypto');
const db = require('../shared/db');

const awsDB = db.docClient;
const HEADERS = {
	'content-type' : ['application/x-www-form-urlencoded', 'application/json'],
	'authorization' : ''
};

const helper = {
	checkBodyParameters : checkBodyParameters,
	checkHeaders : checkHeaders,
	deviceIDgenerator : deviceIDgenerator,
	tokenGen : tokenGen,
	checkDeviceToken : checkDeviceToken,
	checkIotDeviceToken : checkIotDeviceToken
};


/*
	req : Object,
	params : Array
*/
function checkBodyParameters(req, params) {
	let resp = {
		result : 0
	};

	let body;

	if(req.hasOwnProperty('body')) {
		body = req.body;

		for(let i in params) {
			if(body[params[i]] === undefined) {
				resp.result = -1;
				if(!resp.hasOwnProperty('field')) {
					resp.field = [];
				}
				resp.field.push(params[i]); 
			}
			
		}
	}else{
		resp.result = -1;
		resp.field = [];
		resp.field.push('body'); 
	}

	return resp;
}



function checkHeaders(req) {
	let resp = {
		result : 0,
		errors : []
	};

	let contentType = req.headers['content-type'];
	let typeCorrected = false;


	if(contentType === undefined) {
		resp.result = -1;
		resp.errors.push({
			"Message": "Lack of parameter",
			"Field": "Content-Type"
		});
	}else{
		contentType = contentType.toLowerCase();
	}

	//check content-type
	for(let i = 0; i < HEADERS['content-type'].length; i++) {
		let patt = new RegExp(HEADERS['content-type'][i]);
		if(patt.test(contentType)) {
			typeCorrected = true;
			break;
		}
	}

	if(!typeCorrected) {
		resp.errors.push({
			"Message": "Not accepted type",
			"Field": "Content-Type"
		});
		resp.result = -1;
	}

	if(resp.errors.length === 0) {
		delete resp.errors;
	}

	return resp;
}

/*
	uuid : String
	return : Promise
*/
function deviceIDgenerator(uuid) {
	let deviceID = encrypt('aes-256-cbc', uuid + '_' + Date.now(), 'deviceID');

	let _checkDuplicate = function(deviceID, resolve, reject) {
		awsDB.query({
			TableName:"DeviceInfo",
			KeyConditionExpression: '#DEVICE_ID = :deviceID',
			ExpressionAttributeNames:{
				"#DEVICE_ID": "DEVICE_ID"
			},
			ExpressionAttributeValues: {
				':deviceID': deviceID
			}
		}, function(err, data) {

			if (err) {
				reject(err);
			} else {
				if(Number(data.Count) === 0 || !data) {
					resolve(deviceID);
				}else{
					deviceID = encrypt('aes-256-cbc', uuid + '_' + Date.now(), 'deviceID');
					_checkDuplicate(encrypt('aes-256-cbc' , deviceID ), resolve, reject);
				}
			}
		});

	};
	

	return new Promise((resolve, reject) => {
		_checkDuplicate(deviceID, resolve, reject);
	});

}


/*
	algorithm : String,
	secret : String,
	password : password
	return : String
*/
function encrypt(algorithm, secret, password) {

	let cipher = crypto.createCipher(algorithm, password);
	let crypted = cipher.update(secret,'utf8','hex');

	crypted += cipher.final('hex');

	return crypted;

}

/*
	algorithm : String,
	secret : String,
	password : password
	return : String
*/
function decrypt(algorithm, crypted, password) {
	let decipher = crypto.createDecipher(algorithm, password);
	let dec = decipher.update(crypted,'hex','utf8');

	dec += decipher.final('utf8');

	return dec;

}

/*
	return : Promise 
*/
function tokenGen() {
	const source = '0123456789abcdefghijklmnopqrstuvwxyz'.split("");
	let txt = '';
	let r = '';

	do {
		r = Math.floor((Math.random() * 35));
		txt += source[r];
	}while(txt.length < 4);

	return new Promise((resolve, reject) => {

		crypto.randomBytes(128, function (err, salt) {
			if (err) {
				reject(err);
			}
			salt = salt.toString('hex');

			resolve(crypto.pbkdf2Sync (txt, salt, 1000, 64,'sha1').toString('hex'));

		});
	});
}


/*
	Check token exist and expire or not
	deviceID : String
	token : String
	return : Promise

*/
function checkDeviceToken(deviceID, token) {

	return new Promise((resolve, reject) => {

		let resp = {
			result : 0
		};

		awsDB.query({
			TableName:"DeviceInfo",
			ProjectionExpression:"EXPIRES_TIME",
			KeyConditionExpression: '#DEVICE_ID = :deviceID',
			FilterExpression: "DEVICE_TOKEN = :token",
			ExpressionAttributeNames:{
				"#DEVICE_ID": "DEVICE_ID"
			},
			ExpressionAttributeValues: {
				':deviceID': deviceID,
				':token' : token
			}
		}, (err, data) => {
			if(err) {
				reject(err);
				
			}else{
				if(data.Count > 0) {
					let currTime = Date.now()/1000;
					let expireTime = Number(data.Items[0]['EXPIRES_TIME']);

					if(currTime < expireTime) {
						resp.result = 0;
					}else{
						resp.result = -1;
						resp.message = 'Token expired';
					}

				}else{
					resp.result = -2;
					resp.message = 'Token incorrect';
				}

				resolve(resp);
				
			}

		});

	});
}

/*
	Check token exist and expire or not
	deviceID : String
	token : String
	return : Promise

*/
function checkIotDeviceToken(deviceID, token) {

	return new Promise((resolve, reject) => {

		let resp = {
			result : 0
		};

		awsDB.query({
			TableName:"IotDeviceInfo",
			ProjectionExpression:"EXPIRES_TIME",
			KeyConditionExpression: '#IOT_DEVICE_ID = :deviceID',
			FilterExpression: "IOT_TOKEN = :token",
			ExpressionAttributeNames:{
				"#IOT_DEVICE_ID": "IOT_DEVICE_ID"
			},
			ExpressionAttributeValues: {
				':deviceID': deviceID,
				':token' : token
			}
		}, (err, data) => {
			if(err) {
				reject(err);
				
			}else{
				if(data.Count > 0) {
					let currTime = Date.now()/1000;
					let expireTime = Number(data.Items[0]['EXPIRES_TIME']);

					if(currTime < expireTime) {
						resp.result = 0;
					}else{
						resp.result = -1;
						resp.message = 'Token expired';
					}

				}else{
					resp.result = -2;
					resp.message = 'Token incorrect';
				}

				resolve(resp);
				
			}

		});

	});
}


module.exports = helper;