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
	let iotDeviceID = '';
	

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



	bodyChecker = helper.checkBodyParameters(req, ['IOT_DEVICE_ID']);


	if(bodyChecker.result === 0) {
		iotDeviceID = req.body.IOT_DEVICE_ID;
		
		awsDB.query({
			TableName:"IotDeviceInfo",
			KeyConditionExpression: 'IOT_DEVICE_ID = :iotID',
			ExpressionAttributeValues: {
				':iotID': iotDeviceID
			}
		}, (err, data) => {
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

				logger.log('debug', 'Query Error');

			}else{

				if(data.Count > 0) {
					Promise.all([helper.tokenGen(), helper.tokenGen()])
							.then( pList => {
								let d = new Date();
								let expires;
								let token = pList[0];
								let refreshToken = pList[1];

								d.setDate(d.getDate() + EXPIRES_DAY);
								expires =  Math.round(d.getTime()/1000);

								//DB update
								awsDB.update({
									TableName:"IotDeviceInfo",
									Key : {
										"IOT_DEVICE_ID" : iotDeviceID
									},
									UpdateExpression: "set IOT_TOKEN = :token, REFRESH_TOKEN = :refToken, EXPIRES_TIME = :expires",
									ExpressionAttributeValues:{
										":token": token,
										":refToken": refreshToken,
										":expires": expires
									},
									ReturnValues:"UPDATED_NEW"
								}, (err, data) => {
									if(err) {
										let errCode = errorCode("0xC0010002");

										res.status(errCode.Status);
										res.json({
											"Message": "DB error - " + err,
											"Code": "0xC0010002"
										});

										logger.log('debug', 'Update DB Error');

									}else{
										res.status(200);
										res.json({
											"Token" : token,
											"ExpiresIn" : expires,
											"TokenType": TOKEN_TYPE,
											"RefreshToken": refreshToken
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
					// no id

					let errCode = errorCode("0xC0060006");

					res.status(errCode.Status);
					res.json({
						"Message": errCode.Message,
						"Code": errCode.Code,
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
