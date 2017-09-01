const express = require('express');
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');
const logger = require('../shared/logger');

const router = express.Router();
const awsDB = db.docClient;

router.get('/:UUID/:DEVICE_ID', function(req, res, next) {
	let headersChecker = helper.checkHeaders(req);
	
	let uuid = req.params.UUID;
	let deviceID = req.params.DEVICE_ID;

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

	helper.checkDeviceToken(deviceID, req.token)
			.then(data => {
				
				if(data.result === 0) {
					awsDB.scan({
						TableName:"IotAccountInfo",
						ProjectionExpression: "IOT_DEVICE_ID",
						FilterExpression: "#UUID = :uuid",
						ExpressionAttributeNames:{
							"#UUID": "UUID"
						},
						ExpressionAttributeValues: {
							":uuid": uuid
						}
					},(err, data) => {
						if(err) {
							let errCode = errorCode("0xC0010002");

							res.status(errCode.Status);
							res.json({
								"Message": errCode.Message + ' ' + err,
								"Code": errCode.Status
							});

							logger.log('debug', err);

						}else{
							let deviceList = [];

							data.Items.map(obj => {
								deviceList.push({
									IotDeviceID : obj.IOT_DEVICE_ID,
									IotDeviceType : obj.TYPE
								});
							});

							res.status(200)
								.json({
									"TotalDeviceCount" : data.Count,
									"DeviceList" : deviceList
								});
						}
					});

				}else{
					
					let errCode = errorCode("0xC0050001");

					res.status(errCode.Status);
					res.json({
						"Message": errCode.Message + '. ' + data.message,
						"Code": errCode.Status
					});

					logger.log('debug', data.message);
				}
			})
			.catch(err => {
				let errCode = errorCode("0xC0010002");

				res.status(errCode.Status);
				res.json({
					"Message": errCode.Message + '. ' + err,
					"Code": errCode.Status
				});


				logger.log('debug', 'Check Token error');
			});

});


module.exports = router;
