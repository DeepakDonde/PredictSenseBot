var path = require('path');
//var kvs = require(path.resolve('.','modules/database/kvs.js'));
const Bot = require('messenger-bot')
var config = require(path.resolve('.', 'config.js'))
var formatHelper = require(path.resolve('.', 'modules/facebook/formatHelper.js'))
var messageType = require(path.resolve('.', 'modules/common/messageType.js'));
var platform = require(path.resolve('.', 'modules/common/platform.js'));
var platformType = require(path.resolve('.', 'modules/common/platformType.js'));
var apiHelper = require(path.resolve('.', 'modules/common/apiHelper.js'));
var messageAction = require(path.resolve('.', 'modules/common/messageAction.js'));
const DEFAULT_DELAY = 0;

let bot = new Bot({
  token: config.ADAPTER.FACEBOOK.MESSENGER_ACCESS_TOKEN,
  verify: config.ADAPTER.FACEBOOK.MESSENGER_VERIFY_TOKEN,
  app_secret: config.ADAPTER.FACEBOOK.MESSENGER_APP_SECRET
})

bot.on('error', (err) => {
  console.error(err.message)
})

/**
 * Triggered when a message or quick reply is sent to the bot.
 */
bot.on('message', (payload, reply, actions) => {
  if (payload.message.quick_reply && payload.message.quick_reply.text != "No" && payload.message.quick_reply.text != "Yes") {
    //this is a intent message
    executePostback(payload, reply, actions)
    return;
  }

  //send typing to user
  actions.markRead();
  //actions.setTyping(true);

  // console.log("Received message:" + JSON.stringify(payload.message));
  //now we have recieved message, classify this messages

  var envelope = {
    "sender_id": payload.sender.id,
    "message": payload.message,
  };
  logMessage(messageType.NONE, messageAction.RECEIVE, payload.sender.id, payload.message);
  //get type of the facebook message
  var conversation = require(path.resolve('.', 'modules/facebook/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
  var type = formatHelper.getChannelMessageType(payload.message);
  if (type === messageType.TEXT) {
    conversation.emit("text_message", envelope);
  } else {
    //send default message to user
    conversation.emit("attachment_message", envelope);
  }

})

/**
 * Triggered when a postback is triggered by the sender in Messenger. 
 * */
bot.on('postback', (payload, reply, actions) => {
  executePostback(payload, reply, actions);
})

var fbGetRequest = function (req, res) {
  console.log("Verifying token....");
  return bot._verify(req, res)
}

var fbPostRequest = function (req, res) {
  //console.log("fbPostRequest");
  try {
    bot._handleMessage(req.body)
  } catch (e) { console.error(e) }
  res.end(JSON.stringify({ status: 'ok' }))
}

var sendTextMessage = function (sender_id, message, delay) {
  logMessage(messageType.TEXT, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, { text: message });
  }, delay + DEFAULT_DELAY);
}

/**Type of attachment, may be image, audio, video, file or template. For assets, max file size is 25MB.*/
function sendAudioMessage(sender_id, message, delay) {
  logMessage(messageType.AUDIO, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, formatHelper.constructAndReturnAttachmentFromMessage('audio', message));
  }, delay);

}

function sendVideoMessage(sender_id, message, delay) {
  logMessage(messageType.VIDEO, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, formatHelper.constructAndReturnAttachmentFromMessage('video', message));
  }, delay);

}

function sendImageMessage(sender_id, message, delay) {
  logMessage(messageType.IMAGE, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, formatHelper.constructAndReturnAttachmentFromMessage('image', message));
  }, delay + DEFAULT_DELAY);

}

function sendConfirmPrompt(sender_id, message, delay) {
  logMessage(messageType.PROMPT, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, formatHelper.constructAndReturnConfirmPromptMessage(message));
  }, delay + DEFAULT_DELAY);
}

function sendButtonMessage(sender_id, intentName, message, delay) {
  logMessage(messageType.BUTTON, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, formatHelper.constructAndReturnButtonsFromMessage(intentName, message));
  }, delay + DEFAULT_DELAY);
}


function sendTemplateMessage(sender_id, intentName, message, delay) {
  logMessage(messageType.CAROUSEL, messageAction.SEND, sender_id,message);
  setTimeout(function () {
    bot.sendMessage(sender_id, formatHelper.constructAndReturnTemplateFromMessage(intentName, message));
  }, delay);
}

function sendTyping(sender_id,onOff) {
  bot.sendSenderAction(sender_id, onOff?"typing_on":"typing_off")
}


var test = function () {
  console.log("Testing is done..!!");
}

function executePostback(payload, reply, actions) {
  //send typing to user
  actions.markRead();
  //actions.setTyping(true);

  var text = "";

  if (payload.postback) {
    text = payload.postback.payload;
  } else {
    text = payload.message.quick_reply.payload;
  }
  //reply({ text: 'You have clicked the button' }, (err, info) => { })
  var conversation = require(path.resolve('.', 'modules/facebook/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
  var envelope = {
    "sender_id": payload.sender.id,
    "message": { text: text }
  };
  logMessage(messageType.NONE, messageAction.RECEIVE, payload.sender.id, text);
  conversation.emit("intent_message", envelope);
}

function logMessage(messageType,messageAction,sender_id,message) {
  //console.error("logMessage");
  try {
    var data = {
      Platform: platform.FACEBOOK,
      MessageType: messageType,
      MessageAction: messageAction,
      EndUserId: sender_id,
      Message:message,
      PlatformType:platformType.TEXT
    }
    apiHelper.logMessage(data);
  } catch (e) {
    console.error(e)
  }
}

function SendMenuTrigger(sender_id,message){

  if(message.MenuIntent&&message.MenuIntent.length>0){
    bot.sendMessage(sender_id, formatHelper.constructAndReturnMenuTriggerMessage(message));
  }else{
    bot.sendMessage(sender_id, { text: message.MenuMessage});
  }

}

module.exports = {
  fbPostRequest: fbPostRequest,
  fbGetRequest: fbGetRequest,
  sendTextMessage: sendTextMessage,
  sendButtonMessage: sendButtonMessage,
  sendTemplateMessage: sendTemplateMessage,
  sendImageMessage: sendImageMessage,
  sendAudioMessage: sendAudioMessage,
  sendVideoMessage: sendVideoMessage,
  sendConfirmPrompt: sendConfirmPrompt,
  sendTyping:sendTyping,
  SendMenuTrigger,SendMenuTrigger,
  test: test
}

