const express = require('express');
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');
const logger = require('../shared/logger');

const router = express.Router();
const awsDB = db.docClient;

router.post('/', function(req, res, next) {
	let headersChecker = helper.checkHeaders(req);
	let bodyChecker = helper.checkBodyParameters(req, ['DEVICE_ID','DEVICE_NAME']);
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


	if(bodyChecker.result === 0) {
		deviceID = req.body.DEVICE_ID;
		helper.checkDeviceToken(deviceID, req.token)
				.then(data => {
					
					if(data.result === 0) {
						awsDB.update({
							TableName:"DeviceInfo",
							Key:{
								"DEVICE_ID" : deviceID
							},
							UpdateExpression: "set DEVICE_NAME = :name",
							ExpressionAttributeValues:{
								":name": req.body.DEVICE_NAME
							},
							ReturnValues:"UPDATED_NEW"
						},(err, data) => {
							if(err) {
								let errCode = errorCode("0xC0010002");

								res.status(errCode.Status);
								res.json({
									"Message": errCode.Message + ' ' + err,
									"Code": errCode.Code
								});

								logger.log('debug', err);

							}else{
								res.status(204).end();
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

		res.status(errCode.Status);
  		res.json(respResult);
	}

});


module.exports = router;
