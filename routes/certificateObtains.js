const express = require('express');
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');
const logger = require('../shared/logger');
const crypto = require('crypto');

const router = express.Router();
const awsDB = db.docClient;

const EXPIRES_DAY = 7;
const TOKEN_TYPE = "Bearer";
const ON_LOGIN = 1;
const ON_LOGOUT = 0;

router.post('/', function(req, res, next) {

	let headersChecker = helper.checkHeaders(req);
	let bodyChecker;

	let uuID = '';
	let deviceID = '';
	

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

		return false;
	}


	bodyChecker = helper.checkBodyParameters(req, ['UUID']);

	uuID = req.body.UUID;

	if(!!req.body.DEVICE_ID) {
		deviceID = req.body.DEVICE_ID;
	}

	if(bodyChecker.result === 0) {
		let queryParams = {
			TableName:"DeviceAccountInfo",
			KeyConditionExpression: '#UUID = :uuid',
			ExpressionAttributeNames:{
				"#UUID": "UUID"
			},
			ExpressionAttributeValues: {
				':uuid': uuID
			}
		};

		
		awsDB.query(queryParams, function(err, data) {
			if (err) {

				let errCode = errorCode("0xC0010002");

				res.status(errCode.Status);
				res.json({
					"Message": errCode.Message,
					"Code": "0xC0010002",
					"Errors": [{
						"Message": "DB error - " + err
					}]
				});

				logger.log('debug', 'Query UUID Error');

			}else{

				if(data.Count > 0) {


					//It will only one uuid
					//Check deviceID account is exist
					if(deviceID !== '' && data.Items[0]['DEVICE_ID'] !== deviceID) {
						//deviceID not exit in this account
						let errCode = errorCode("0xC0050001");

						res.status(errCode.Status);
						res.json({
							"Message": errCode.Message,
							"Code": "0xC0050001",
							"Errors": [{
								"Message": "Not exist in this account",
								"Field": "DEVICE_ID"
							}]
						});

						logger.log('debug', 'deviceID not exit in this account');
					}else{

						/* 	**Allow get token condition
							**** If no DeviceID. ACTIVE status must to ON_LOGOUT.
							**** If DeviceID is matched
						*/
						
						if((deviceID === '' && data.Items[0]['ACTIVE'] === ON_LOGOUT) || data.Items[0]['DEVICE_ID'] === deviceID) {
							

							deviceID = data.Items[0]['DEVICE_ID'];

							Promise.all([helper.tokenGen(), helper.tokenGen()])
									.then( pList => {

										let d = new Date();
										let expires;
										let token = pList[0];
										let refreshToken = pList[1];

										d.setDate(d.getDate() + EXPIRES_DAY);
										expires =  Math.round(d.getTime()/1000);

										//update token to DB DeviceInfo
										awsDB.update({
											TableName:"DeviceInfo",
											Key:{
												"DEVICE_ID" : deviceID,
											},
											UpdateExpression: "set DEVICE_TOKEN = :token, REFRESH_TOKEN = :refToken, EXPIRES_TIME = :expires",
											ExpressionAttributeValues:{
												":token": token,
												":refToken": refreshToken,
												":expires": expires
											},
											ReturnValues:"UPDATED_NEW"
										}, (err, data) => {
											if (err) {
												let errCode = errorCode("0xC0010002");

												res.status(errCode.Status);
												res.json({
													"Message": "DB error - " + err,
													"Code": "0xC0010002"
												});

												logger.log('debug', 'Add Device ID Error');

											}else{
												//Update active status
												awsDB.update({
													TableName:"DeviceAccountInfo",
													Key:{
														"UUID" : uuID,
														"DEVICE_ID" : deviceID
													},
													UpdateExpression: "set ACTIVE = :active",
													ExpressionAttributeValues:{
														":active": 1
													},
													ReturnValues:"UPDATED_NEW"
												}, (err, data) => {
													if (err) {
														let errCode = errorCode("0xC0010002");

														res.status(errCode.Status);
														res.json({
															"Message": "DB error - " + err,
															"Code": "0xC0010002"
														});

														logger.log('debug', 'Update active status Error');

													}else{

														res.status(200);
														res.json({
															"Token" : token,
															"ExpiresIn" : expires,
															"TokenType": TOKEN_TYPE,
															"RefreshToken": refreshToken,
															"DeviceID": deviceID
														});

													}

												});

											}

										});

									})
									.catch(err => {
										let errCode = errorCode("0xC0010001");

										res.status(errCode.Status);
										res.json({
											"Message": errCode.Message + '. ' + err,
											"Code": errCode.Code
										});

										logger.log('debug', 'Creates Token error');
									});

						}else{
	
							let errCode = errorCode("0xC0060004");

							res.status(errCode.Status);
							res.json({
								"Message": errCode.Message,
								"Code": "0xC0060004",
							});

							logger.log('debug', 'Not allow to login');
						}

					}

				}else{
					// no account

					let errCode = errorCode("0xC0060005");

					res.status(errCode.Status);
					res.json({
						"Message": errCode.Message,
						"Code": "0xC0060005",
					});

					logger.log('debug', errCode.Message);
				}


			}
		});


	}else{
		let errCode = errorCode("0xC0010004");
		
		let respResult = {
			"Message": errCode.Message,
			"Code": "0xC0010004",
			"Errors": []
		};
		
		for(let k in bodyChecker.field) {
			respResult.Errors.push({
				"Message": "Parameters invalid",
				"Field": bodyChecker.field[k]
			});
		}

		logger.log('debug', errCode.Message);

		res.status(errCode.Status);
  		res.json(respResult);
	}
	
});


module.exports = router;
