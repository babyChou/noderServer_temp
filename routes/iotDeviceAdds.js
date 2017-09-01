const express = require('express');
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');
const logger = require('../shared/logger');


const router = express.Router();
const awsDB = db.docClient;

router.post('/:UUID', function(req, res, next) {
	let headersChecker = helper.checkHeaders(req);
	let bodyChecker;
	
	let uuid = req.params.UUID;
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


	bodyChecker = helper.checkBodyParameters(req, ['DEVICE_ID','IOT_DEVICE_ID','IOT_DEVICE_TYPE']);

	if(bodyChecker.result === 0) {
		deviceID = req.body.DEVICE_ID;
		helper.checkDeviceToken(deviceID, req.token)
				.then(data => {
					if(data.result === 0) {
						awsDB.query({
							TableName:"DeviceAccountInfo",
							KeyConditionExpression: '#UUID = :uuid',
							ExpressionAttributeNames:{
								"#UUID": "UUID"
							},
							ExpressionAttributeValues: {
								':uuid': uuid
							}

						}, (err, data) => {
							let resp = {};
							let status = 200;
							let errCode = {};

							if (err) {

								errCode = errorCode("0xC0010002");
								resp.Errors = [{
									"Message": "DB error - " + err
								}];
								logger.log('debug', 'Query UUID Error');

							}else{

								if(data.Count > 0) {
									if(data.Items[0]['DEVICE_ID'] !== deviceID) {
										errCode = errorCode("0xC0060003");
										logger.log('debug', errCode.Message);
									}else{
										//update IotAccountInfo
										awsDB.batchWrite({
											RequestItems: {
												'IotAccountInfo' : [{
													PutRequest: {
														Item: {
															"UUID" : uuid,
															"IOT_DEVICE_ID" : req.body.IOT_DEVICE_ID,
															"IOT_DEVICE_TYPE" : req.body.IOT_DEVICE_TYPE
														}
													}
												}],
												'IotDeviceInfo' : [{
													PutRequest: {
														Item: {
															"IOT_DEVICE_ID" : req.body.IOT_DEVICE_ID,
														}
													}
												}]
											}

										}, (err, data) => {
											if(err) {
												errCode = errorCode("0xC0010002");
												resp.Errors = [{
													"Message": "DB error - " + err
												}];
												logger.log('debug', 'Add data error');

											}else{
												status = 201;
												resp = {
													Message : "The item was added successfully"
												};
											}

											if(Object.keys(errCode).length > 0) {
												Object.assign(resp, {
													"Message": errCode.Message,
													"Code": errCode.Code
												});
												status = errCode.Status;
											}

											res.status(status);
											res.json(resp);

										});
									}

								}else{
									errCode = errorCode("0xC0060005");
									logger.log('debug', errCode.Message);
								}

							}

							if(Object.keys(errCode).length > 0) {
								Object.assign(resp, {
									"Message": errCode.Message,
									"Code": errCode.Code
								});
								status = errCode.Status;
								res.status(status);
								res.json(resp);
							}


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


});


module.exports = router;
