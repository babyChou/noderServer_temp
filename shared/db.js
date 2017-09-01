const AWS = require('aws-sdk');

// AWS.config.update({
//   region: "us-east-2",  
//   accessKeyId: "AKIAJV3P5SQ5G553WAPQ",
//   secretAccessKey: "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"  
// });


AWS.config.update({
  region: "ap-southeast-1",  
  accessKeyId: "AKIAJV3P5SQ5G553WAPQ",
  secretAccessKey: "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"  
});



module.exports = {
	docClient : new AWS.DynamoDB.DocumentClient(),
	dynamodb : new AWS.DynamoDB()
};