const AWS = require('aws-sdk');


AWS.config.update({
  region: "",  
  accessKeyId: "",
  secretAccessKey: ""  
});



module.exports = {
	docClient : new AWS.DynamoDB.DocumentClient(),
	dynamodb : new AWS.DynamoDB()
};
