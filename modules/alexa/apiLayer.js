var express = require("express");
var path = require('path')
var config = require(path.resolve('.', 'config.js'))

var alexaController=require(path.resolve('.','modules/alexa/controller.js'));
var router = express.Router();

router.post(config.ADAPTER.ALEXA.ALEXA_WEBHOOK,alexaController.validateRequest,alexaController.alexaPostRequest);


module.exports = router;