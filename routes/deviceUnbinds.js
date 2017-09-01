const express = require('express');
const errorCode = require('../shared/errorCode');
const helper = require('../shared/helper');
const db = require('../shared/db');

const router = express.Router();
const awsDB = db.docClient;


router.post('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
