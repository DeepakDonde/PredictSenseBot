/**
 * module used for getting contact details from the maximizer db
 */
var sql = require('mssql');
var botConfig = require('../config/bot.config');
var request = require("request");


module.exports = {
    getDataFromServer:getDataFromServer,
    updateInitial:updateInitial,
    logsUserInteraction:logsUserInteraction
}


/**
 * Function used for getting values from convee
 * @param {*} botId - required for getting values against respected bot id 
 * @param {*} message - message text
 * @param {*} callback 
 */
function getDataFromServer(botId,message,callback){

    var jsonRequest = { "BotId": botId,"message":message,"isLuisCall": 0 }
    request({
        url: botConfig.apiUrl,
        method: 'POST',
        headers: [
            {
                name: 'Content-Type',
                value: 'application/json'
            }],
        body: jsonRequest,
        json: true
    }, function (err, res) {
        if (err) {
            console.error(err);
            if (callback)
                callback(false);
        } else if (res.statusCode == 200) {
            callback(res.body)
        } else {
            if (callback)
                callback(false);
        }
    })
}

/**
 * function used for updating energy plan
 * @param {*} botId 
 * @param {*} message 
 * @param {*} callback 
 */
function updateInitial(initial,callback){

    var jsonRequest = { "initial":initial,id:1}
    request({
        url: botConfig.updateEnergyPlan,
        method: 'POST',
        headers: [
            {
                name: 'Content-Type',
                value: 'application/json'
            }],
        body: jsonRequest,
        json: true
    }, function (err, res) {
        if (err) {
            console.error(err);
            if (callback)
                callback(false);
        } else if (res.statusCode == 200) {
            callback(res.body)
        } else {
            if (callback)
                callback(false);
        }
    })
}


/**
 * function used for storing user interaction with bot
 */
function logsUserInteraction(userLogs){
   
    request({
        url: botConfig.interactionLogs,
        method: 'POST',
        headers: [
            {
                name: 'Content-Type',
                value: 'application/json'
            }],
        body: userLogs,
        json: true
    }, function (err, res) {
        if (err) {
            console.error(err);
        } else {
            console.log("Interaction added successfully");
        }
    })
}

