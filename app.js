const express = require('express');
const helmet = require('helmet');
const path = require('path');

const bearerToken = require('express-bearer-token');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const logger = require('./shared/logger');
const errorCode = require('./shared/errorCode');

const index = require('./routes/index');
const accountsCreates = require('./routes/accountsCreates');
const deviceUpdates = require('./routes/deviceUpdates');
const deviceUnbinds = require('./routes/deviceUnbinds');
const iotDeviceObtains = require('./routes/iotDeviceObtains');
const iotDeviceAdds = require('./routes/iotDeviceAdds');
const certificateObtains = require('./routes/certificateObtains');

const iotCertificateObtains = require('./routes/iotCertificateObtains');
const iotTriggerSns = require('./routes/iotTriggerSns');


const app = express();


//https://www.npmjs.com/package/express-bearer-token

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(bearerToken());

app.use(require("morgan")("combined", { 
	stream: logger.stream,
	skip: function (req, res) {
        return res.statusCode > 300
    }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', index);
app.use('/device_api/v1/account/creates', accountsCreates);
app.use('/device_api/v1/account/device/updates', deviceUpdates);
app.use('/device_api/v1/account/device/unbinds', deviceUnbinds);
app.use('/device_api/v1/iotDeviceID', iotDeviceObtains);
app.use('/device_api/v1/iotDeviceID', iotDeviceAdds);
app.use('/device_api/v1/certificate/obtains', certificateObtains);

//IoT Device 
app.use('/iot_device_api/v1/certificate/obtains', iotCertificateObtains);
app.use('/iot_device_api/v1/triggerSns', iotTriggerSns );





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  if(err.status === 404) {

  	let errCode = errorCode("0xC0010005");

  	res.json({
  		"Message": errCode.Message,
  		"Code": errCode.Code
  	});
  }else{
  	res.render('error');
  }
  
});

module.exports = app;
