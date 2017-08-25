var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.sendStatus(403);
  res.send('sada');
});

module.exports = router;
