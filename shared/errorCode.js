const errorCode = [];


errorCode.push({
	Code : "0xC0010001",
	Status : 500,
	Message : "Internal Error"
});

errorCode.push({
	Code : "0xC0010002",
	Status : 500,
	Message : "DB internal Error "
});

errorCode.push({
	Code : "0xC0010003",
	Status : 400,
	Message : "Headers invalid"
});


errorCode.push({
	Code : "0xC0010004",
	Status : 400,
	Message : "Validation errors in your request body"
});


errorCode.push({
	Code : "0xC0010005",
	Status : 404,
	Message : "The requested URL could not be retrieved"
});


errorCode.push({
	Code : "0xC0050001",
	Status : 401,
	Message : "Authentication was incorrect"
});


errorCode.push({
	Code : "0xC0060001",
	Status : 409,
	Message : "Data was Duplicated or conflicted while created"
});

errorCode.push({
	Code : "0xC0060002",
	Status : 409,
	Message : "Data was conflicted while updated"
});

errorCode.push({
	Code : "0xC0060003",
	Status : 404, //or 400
	Message : "DeviceID not exist in this account"
});

errorCode.push({
	Code : "0xC0060004",
	Status : 403,
	Message : "Not allow to sign in. This account has been sign in another device"
});

errorCode.push({
	Code : "0xC0060005",
	Status : 404,//or 400
	Message : "Account(UUID) not exist"
});

errorCode.push({
	Code : "0xC0060006",
	Status : 404,//or 400
	Message : "IOT Device not exist"
});


function getCode(code) {
	var result;
	for(var k in errorCode) {
		if(errorCode[k]['Code'] === code) {
			result = errorCode[k];
		}
	}

	return result;
}

module.exports = getCode;