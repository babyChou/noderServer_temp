const express = require('express');
const http = require('http');
const querystring = require("querystring");
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');
const logger = require('../shared/logger');

const router = express.Router();
const awsDB = db.docClient;

const API_KEY = 'key=';
const SENDER_ID = '';
//https://fcm.googleapis.com/fcm/send
const HOSTNAME = 'android.googleapis.com';
const PATH = '/gcm/send';

router.post('/', function(req, res, next) {
	let headersChecker = helper.checkHeaders(req);
	let bodyChecker;
	
	let deviceID = '';
	let roomID = '';
	let message = '';
	let url = '';

	if(headersChecker.result !== 0) {
		logger.log('debug', 'Headers lack of parameter');

		let errCode = errorCode("0xC0010003");
		let errors = headersChecker.errors;
		
		res.status(errCode.Status);
		res.json({
			"Message": errCode.Message,
			"Code": errCode.Code,
			"Errors": errors
		});

		
	}else{

		bodyChecker = helper.checkBodyParameters(req, ['IOT_DEVICE_ID','ROOM_ID','MESSAGE','URL']);

		if(bodyChecker.result === 0) {
			deviceID = req.body.IOT_DEVICE_ID;
			roomID = req.body.ROOM_ID;
			message = (req.body.MESSAGE).replace(/[\n\r\t]/g,'').replace(/[\']/g,'\"');
			url = req.body.URL;

			helper.checkIotDeviceToken(deviceID, req.token)
					.then(data => {
						if(data.result === 0) {
							//query UUID
							queryDB({
								TableName: 'IotAccountInfo',
								ProjectionExpression: "#UUID",
								FilterExpression: "IOT_DEVICE_ID = :deviceID",
								ExpressionAttributeNames:{
									"#UUID": "UUID",
								},
								ExpressionAttributeValues: {
									':deviceID' : req.body.IOT_DEVICE_ID
								}
							}, 'scan', 'scan UUID')
								.then(data => {

									if(data.Count > 0) {
										//query FCM_ID
										return queryDB({
											TableName : 'DeviceInfo',
											ProjectionExpression: 'FCMID',
											FilterExpression: "#UUID = :uuID",
											ExpressionAttributeNames:{
												"#UUID": "UUID",
											},
											ExpressionAttributeValues: {
												':uuID' : data.Items[0]['UUID']
											}
										}, 'scan', 'scan FCMID');

									}else{
										let errCode = errorCode("0xC0060006");
										sendResponse(res, errCode.Status, {
											"Message": errCode.Message,
											"Code": errCode.Code
										});
									}

								})
								.then(data => {
									if(data.Count > 0) {
										//curl to mobile
										let fcmID = data.Items[0]['FCMID']
										let buffer = '';
										if(typeof message === 'string') {
											message = JSON.parse(message);
										}

										Object.assign(message, {
											registration_id: fcmID
										})

										let postData = querystring.stringify(message);

										let req = http.request({
											hostname: HOSTNAME,
											port: 80,
											path: PATH,
											method: 'POST',
											headers:{
												'Authorization' : API_KEY,
												'Content-Type': 'application/x-www-form-urlencoded',
												'Content-Length' : postData.length
											}
										}, curlRes => {
											curlRes.on('data', function (chunk) {
												buffer += chunk;
											});
											curlRes.on('end', function() {
												res.status(204)
													.end();
													// .send(buffer);
											});
										});

										req.write(postData);
										req.end();

									}else{
										let errCode = errorCode("0xC0060003");
										sendResponse(res, errCode.Status, {
											"Message": errCode.Message,
											"Code": errCode.Code
										});
									}
								})
								.catch(err => {
									let errCode = errorCode("0xC0010002");
									if(err === -1) {
										errCode = errorCode("0xC0010001");
										err = '';
									}

									sendResponse(res, errCode.Status, {
										"Message": errCode.Message + '. ' + err,
										"Code": errCode.Code
									});

								});


						}else{

							let errCode = errorCode("0xC0050001");

							res.status(errCode.Status);
							res.json({
								"Message": errCode.Message + '. ' + data.message,
								"Code": errCode.Code
							});

							logger.log('debug', data.message);
						}

					})
					.catch(err => {
						let errCode = errorCode("0xC0010002");

						res.status(errCode.Status);
						res.json({
							"Message": errCode.Message + '. ' + err,
							"Code": errCode.Code
						});

						logger.log('debug', 'Check Token error');
					});

		}else{
			let errCode = errorCode("0xC0010004");
			
			let respResult = {
				"Message": errCode.Message,
				"Code": errCode.Code,
				"Errors": []
			};
			
			for(let k in bodyChecker.field) {
				respResult.Errors.push({
					"Message": "Parameters invalid",
					"Field": bodyChecker.field[k]
				});
			}

			logger.log('debug', errCode.Message);

			res.status(errCode.Status)
				.json(respResult);

		}
	}

});

function queryDB(params, method, myLog) {

	return new Promise((resolve, reject) => {

		function _callback(err, data) {
			if(err) {
				reject(err);
				logger.log('debug', myLog);
			}else{
				resolve(data);
			}
		}

		switch(method) {
			case 'put':
				awsDB.put(params, _callback);
				break;
			case 'delete':
				awsDB.delete(params, _callback);
				break;
			case 'update':
				awsDB.update(params, _callback);
				break;
			case 'scan':
				awsDB.scan(params, _callback);
				break;
			case 'query':
				awsDB.query(params, _callback);
				break;
			case 'batchWrite':
				awsDB.batchWrite(params, _callback);
				break;
			case 'batchGet':
				awsDB.batchGet(params, _callback);
				break;
			case 'createSet':
				awsDB.createSet(params, _callback);
				break;
			default:
				reject(-1);
				logger.log('debug', 'No this method!!!');
				break;
		}


	});
}

function sendResponse(res, status, response) {
	res.status(status)
		.json(response);
}


module.exports = router;
