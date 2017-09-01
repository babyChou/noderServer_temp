const express = require('express');
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');
const logger = require('../shared/logger');

const router = express.Router();
const awsDB = db.docClient;


router.post('/', function(req, res, next) {
	
	let resp = {};
	let headersChecker = helper.checkHeaders(req);


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

	let bodyChecker = helper.checkBodyParameters(req, ['FCM_ID', 'UUID']);

	if(bodyChecker.result === 0) {
		let p;
		let deviceID = '';
		let queryParams = {
			TableName:"DeviceAccountInfo",
			KeyConditionExpression: '#UUID = :uuid',
			ExpressionAttributeNames:{
				"#UUID": "UUID"
			},
			ExpressionAttributeValues: {
				':uuid': req.body.UUID
			}
		};

		let putParams = {
			TableName:"DeviceAccountInfo",
			Item:{
				"UUID" : req.body.UUID,
				"DEVICE_ID" : '',
				"ACTIVE" : 0
			}
		};

		p = helper.deviceIDgenerator(req.body.UUID);

		p.then((data)=>{
			deviceID = data;

			//Check UUID duplicate
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

				} else {

					if(Number(data.Count) === 0) {
						putParams.Item.DEVICE_ID = deviceID;

						//Put DeviceAccountInfo
						awsDB.put(putParams, function(err, data) {
							if (err) {
								let errCode = errorCode("0xC0010002");

								res.status(errCode.Status);
								res.json({
									"Message": "DB error - " + err,
									"Code": "0xC0010002"
								});

								logger.log('debug', 'Add  UUID , Device ID Error');
								  
							} else {
								putParams.TableName = 'DeviceInfo';
								putParams.Item = {
									"UUID" : req.body.UUID,
									"DEVICE_ID" : deviceID,
									"FCMID" : req.body.FCM_ID
								};

								//DeviceInfo
								awsDB.put(putParams, function(err, data) {
									if (err) {
										let errCode = errorCode("0xC0010002");

										res.status(errCode.Status);
										res.json({
											"Message": "DB error - " + err,
											"Code": "0xC0010002"
										});

										logger.log('debug', 'Add Device ID Error');

									}else{
										res.status(201);
										res.json({
											"DeviceID": deviceID
										});
									}
								});
								
							}
						});

					}else{

						//UUID duplicate
						let errCode = errorCode("0xC0060001");

						res.status(errCode.Status);
						res.json({
							"Message": errCode.Message,
							"Code": "0xC0060001",
							"Errors": [{
								"Message": "UUID duplicate",
								"Field": "UUID"
							}]
						});

						logger.log('debug', 'UUID duplicate');
					}
					
				}
			});

		}, (err)=>{
			logger.log('debug', 'Create Device ID Error');

			let errCode = errorCode("0xC0010001");

			res.status(errCode.Status);
			res.json({
				"Message": "Create Device ID error - " + err,
				"Code": "0xC0010001"
			});
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

	// res.status(201).end();

	
	
});


module.exports = router;
