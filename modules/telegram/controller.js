var path = require('path');
var TelegramBot = require('node-telegram-bot-api');
var config = require(path.resolve('.', 'config.js'));
var formatHelper = require(path.resolve('.', 'modules/telegram/formatHelper.js'));
var messageType = require(path.resolve('.', 'modules/common/messageType.js'));
var platform = require(path.resolve('.', 'modules/common/platform.js'));
var platformType = require(path.resolve('.', 'modules/common/platformType.js'));
var apiHelper = require(path.resolve('.', 'modules/common/apiHelper.js'));
var messageAction = require(path.resolve('.', 'modules/common/messageAction.js'));
// replace the value below with the Telegram token you receive from @BotFather
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.ADAPTER.TELEGRAM.TOKEN, { polling: true });


bot.getUserProfilePhotos
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  console.log(msg.chat.id);
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  //bot.sendChatAction(msg.chat.id, "typing")
  console.log(msg.text);
  // send a message to the chat acknowledging receipt of their message
  //console.log('Received your message');
  var conversation = require(path.resolve('.', 'modules/telegram/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
  var type = formatHelper.getChannelMessageType(msg);
  if (type === messageType.TEXT) {
    var envelope = {
      "sender_id": msg.chat.id,
      "message": { text: msg.text }
    };
    logMessage(messageType.TEXT, messageAction.RECEIVE, envelope.sender_id, envelope.message.text);
    conversation.emit("text_message", envelope);
  } else {
    //send default message to user
    conversation.emit("attachment_message", envelope);
  }
});

bot.on("callback_query", function (callbackQuery) {
  //content will be in string , so convert it into JSON
  var msg = JSON.parse(callbackQuery.data);
  console.log(msg.text);

  /**
   * After the user presses a callback button, 
   * Telegram clients will display a progress bar until you call answerCallbackQuery. 
   * It is, therefore, necessary to react by calling answerCallbackQuery even if no notification to the user is needed (e.g., without specifying any of the optional parameters).
   */
  var options = {
    text: "Please wait....",
    show_alert: false
  }
  bot.answerCallbackQuery(callbackQuery.id, options);
  var conversation = require(path.resolve('.', 'modules/telegram/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
  var envelope = {
    "sender_id": callbackQuery.from.id,
    "message": { text: msg.text }
  };

  //log this message
  logMessage(messageType.TEXT, messageAction.RECEIVE, envelope.sender_id, envelope.message.text);

  //check if this is a intent button or confirmation prompt button
  if (msg.type === messageType.INTENT_BUTTON) {
    conversation.emit("intent_message", envelope);
  } else if (msg.type === messageType.CONFIRM_PROMPT_BUTTON) {
    conversation.emit("text_message", envelope);
  }
});

/**
 * This method is used to send the buttons
 * @param {*} chatId respective chat id to send the buttons
 */
function sendButtonMessage(sender_id, intentName, message, delay) {
  logMessage(messageType.BUTTON, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    bot.sendMessage(sender_id, message.data, formatHelper.constructAndReturnButtonsFromMessage(intentName, message));
  }, delay);
}

/**
 * This method is used to send the image
 * @param {*} chatId respective chat id to send the image
 */
function sendImageMessage(sender_id, message, delay) {
  logMessage(messageType.IMAGE, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    var options = {
      caption: ""
    }
    bot.sendPhoto(sender_id, message, options);
  }, delay);
}


/**
 * This method is used to send the video
 * @param {*} chatId respective chat id to send the video
 */
function sendVideoMessage(sender_id, message, delay) {
  logMessage(messageType.VIDEO, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    var options = {
      caption: "",
      duration: 5000,
      width: 480,
      height: 800
    }
    bot.sendVideo(sender_id, message, options);
  }, delay);
}

/**
 * This method is used to send the Audio
 * @param {*} chatId respective chat id to send the audio
 */
function sendAudioMessage(sender_id, message, delay) {
  logMessage(messageType.AUDIO, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    var options = {
      caption: "",
      duration: 12000,
      title: ""
    }
    bot.sendAudio(sender_id, message, options);
  }, delay);
}

var sendTextMessage = function (sender_id, message, delay) {
  logMessage(messageType.TEXT, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    bot.sendMessage(sender_id, message);
    //test message delay
    //bot.sendMessage(sender_id, require('moment')().toString());
  }, delay);
}

function sendAttachmentMessage(sender_id, type, message, delay) {
  logMessage(messageType.TEXT, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    bot.sendMessage(sender_id, message, formatHelper.constructAndReturnAttachmentFromMessage(type, message));
    // sendImage(sender_id);
  }, delay);

}

function sendTemplateMessage(sender_id, intentName, message, delay) {
  logMessage(messageType.CAROUSEL, messageAction.SEND, sender_id, message);
  //telegram don't support carousel, we need to send custom messages 
  var each = require('sync-each');
  each(message.carousel,
    function (image, next) {
      //send image with title
      var options = {
        caption: "" + image.title
      }
      bot.sendPhoto(sender_id, image.imageUrl, options).then(data => {
        //send buttons
        var data = {
          buttonoptions: image.buttons
        };
        bot.sendMessage(sender_id, image.desc, formatHelper.constructAndReturnButtonsFromMessage(intentName, data));
        setTimeout(() => {
          next();
        }, 1000);

      }, err => {
        console.error(err);
      });
    },
    function (err, intentResponse) {
      console.log("carousel message is sent");
    }
  )
}

function sendConfirmPrompt(sender_id, message, delay) {
  logMessage(messageType.PROMPT, messageAction.SEND, sender_id, message);
  setTimeout(function () {
    bot.sendMessage(sender_id, message.data, formatHelper.constructAndReturnConfirmPromptMessage(message));
  }, delay);
}

function sendTyping(sender_id, onOff) {
  bot.sendChatAction(sender_id, "typing")
  //bot.sendSenderAction(sender_id, onOff?"typing_on":"typing_off")
}

function logMessage(messageType, messageAction, sender_id, message) {
  //console.error("logMessage");
  try {
    var data = {
      Platform: platform.TELEGRAM,
      MessageType: messageType,
      MessageAction: messageAction,
      EndUserId: sender_id,
      Message: message,
      PlatformType: platformType.TEXT
    }
    apiHelper.logMessage(data);
  } catch (e) {
    console.error(e)
  }
}

function SendMenuTrigger(sender_id,message){
  if(message.MenuIntent&&message.MenuIntent.length>0){
    bot.sendMessage(sender_id, message.MenuMessage, formatHelper.constructAndReturnMenuTriggerMessage(message));

  }else{
    bot.sendMessage(sender_id, message.MenuMessage);
  }

}


module.exports = {
  sendTextMessage: sendTextMessage,
  sendAttachmentMessage: sendAttachmentMessage,
  sendButtonMessage: sendButtonMessage,
  sendVideoMessage: sendVideoMessage,
  sendAudioMessage: sendAudioMessage,
  sendImageMessage: sendImageMessage,
  sendTemplateMessage: sendTemplateMessage,
  sendConfirmPrompt: sendConfirmPrompt,
  sendTyping: sendTyping,
  SendMenuTrigger
}

