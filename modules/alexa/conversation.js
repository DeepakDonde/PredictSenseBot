var path = require('path');
var alexaController = require(path.resolve('.', 'modules/alexa/controller.js'));
//define event emitter
const EventEmitter = require('events');
var kvs = require(path.resolve('.', 'modules/database/kvs.js'));
var kvsTags = require(path.resolve('.', 'modules/database/tags.js'));
var stringUtils = require(path.resolve('.', 'modules/common/stringUtils.js'));
var defaultMessages = require(path.resolve('.', 'modules/common/defaultMessages.js'));
var config = require(path.resolve('.', 'config.js'));
var apiHelper = require(path.resolve('.', 'modules/common/apiHelper.js'));
var genericHelper = require(path.resolve('.', 'modules/common/genericHelper.js'));
var validationHelper = require(path.resolve('.', 'modules/common/validationHelper.js'));
var messageType = require(path.resolve('.', 'modules/common/messageType.js'));
class AlexaEvent extends EventEmitter { }

const alexaEvent = new AlexaEvent();

alexaEvent.on("clear_user_data", function (sender_id) {
    console.log("clear_user_data from session end");
    clearUserData(sender_id);
})

/**
 * This is a intent message, discard old flow and continue new intent flow
 */
alexaEvent.on("intent_message", function (envelope) {
    console.log("Intent message");
    clearUserData(envelope.sender_id);
    startBotFlow(envelope);
})

alexaEvent.on("text_message", function (envelope) {
    console.log("text message is received:" + envelope.message.text);
    if (stringUtils.checkIfExitMessage(envelope.message.text)) {
        exitConversation(envelope);
    } else {
        //check if data already present in kvs
        if (!kvs.get(envelope.sender_id + kvsTags.TAG_ARRAY)) {
            //data is not present
            //process this message using Luis and botintentflow
            console.log("NO DATA IN CACHE")
            startBotFlow(envelope);
        } else {
            //data is already present
            console.log("DATA FOUND IN CACHE")
            continueBotFlow(envelope);
        }
    }

});

alexaEvent.on("attachment_message", function (sender_id, message) {
    console.log("attachment message is received");
});


function startBotFlow(envelope) {
    apiHelper.GetMessagesForVoiceIntent(config.CONVEE.BOT_ID, config.CONVEE.USER_ID, envelope.message.text, function (intentName, result, resultMenuTrigger) {
        if (result&&result.length>0) {
            kvs.set(envelope.sender_id + kvsTags.TAG_INTENT, intentName);
            kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, result);
            kvs.set(envelope.sender_id + kvsTags.TAG_MENU, resultMenuTrigger);
            ManageFlows(envelope);
        }
        else {
            if (resultMenuTrigger) {
                SendMenuTrigger(envelope, resultMenuTrigger);
            }
            else {
                console.log("no data for user input");
                alexaController.sendTextMessage(envelope, defaultMessages.NOT_SURE, false);
            }
        }
    });
}

function continueBotFlow(envelope) {
    var result_MessageArray = kvs.get(envelope.sender_id + kvsTags.TAG_ARRAY);
    var result_MenuTrigger = kvs.get(envelope.sender_id + kvsTags.TAG_MENU);
    CheckMessageSendByUser(envelope, result_MessageArray, function (ValdiationResponse) {
        console.log("CheckMessageSendByUser:ValdiationResposne\n" + JSON.stringify(ValdiationResponse));
        if (ValdiationResponse.StartMenuTrigger) {
            SendMenuTrigger(envelope, result_MenuTrigger);
        }
        else if (ValdiationResponse.isValid === false) {
            alexaController.sendTextMessage(envelope, ValdiationResponse.ReturnMessage,false);
        } else if (ValdiationResponse.exitConversation===true) {
            alexaController.sendTextMessage(envelope, defaultMessages.ALEXA_SESSION_END,false);
        }
        else {
            kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, result_MessageArray);
            kvs.set(envelope.sender_id + kvsTags.TAG_MENU, result_MenuTrigger);
            ManageFlows(envelope);
        }
    })
}





function SendMenuTrigger(envelope, resultMenuTrigger) {
    console.error("Alexa:Sending menu trigger....");
    clearUserData(envelope.sender_id);

    if (resultMenuTrigger.MenuMessage) {
        alexaController.SendMenuTrigger(envelope, resultMenuTrigger, true);
    } else {
        alexaController.sendTextMessage(envelope, defaultMessages.NONE_INTENT_MESSAGE,false);
    }


   
}

/**
 * this function check the last message sent and next message to send
 * @param {*} envelope 
 *
 */
function ManageFlows(envelope) {
    console.log("ManageFlows");
    var MessageArray = kvs.get(envelope.sender_id + kvsTags.TAG_ARRAY);
    // var MenuTrigger=kvs.get(envelope.sender_id+kvsTags.TAG_MENU);
    genericHelper.filterArray(MessageArray, function (FilteredMessageArray) {

        if (FilteredMessageArray.length > 0) {
            console.log("FilteredMessageArray.length > 0")
            //alexa dont support to send multiple responses, we need to concat responses
            //SendMessage(FilteredMessageArray[0].name, envelope, FilteredMessageArray, MessageArray);
            kvs.concat(envelope.sender_id + kvsTags.TAG_CONCAT_DATA, FilteredMessageArray[0]);
            // UPDATE FLAG IN ARRAY
            FilteredMessageArray[0].isSent = 1;

            switch (FilteredMessageArray[0].name) {
                case messageType.TEXT:
                    kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, FilteredMessageArray);
                    ManageFlows(envelope);
                    break;

                case messageType.PROMPT:
                    alexaController.sendConcatedMessage(envelope, kvs.get(envelope.sender_id + kvsTags.TAG_CONCAT_DATA), false);
                    clearConcatedData(envelope.sender_id);
                    kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, FilteredMessageArray);
                    break;

                case messageType.JSON_API:
                    if (genericHelper.checkIfAllAttribSent(FilteredMessageArray[0])) {
                        sendJSONAPIResponse(envelope, FilteredMessageArray[0], function (result) {
                            clearUserData(envelope.sender_id);
                        });
                    } else {
                        alexaController.sendConcatedMessage(envelope, kvs.get(envelope.sender_id + kvsTags.TAG_CONCAT_DATA), false);
                        clearConcatedData(envelope.sender_id);
                    }
                    return;

                case messageType.AUDIO:
                    alexaController.sendAudioMessage(envelope, FilteredMessageArray[0].data /*kvs.get(envelope.sender_id + kvsTags.TAG_CONCAT_DATA)*/, true);
                    clearUserData(envelope.sender_id);
                    return;

                case messageType.BUTTON:
                alexaController.sendConcatedMessage(envelope, kvs.get(envelope.sender_id + kvsTags.TAG_CONCAT_DATA), false);
               // alexaController.sendButtonMessage(envelope, FilteredMessageArray[0],kvs.get(envelope.sender_id + kvsTags.TAG_CONCAT_DATA), true);
                clearUserData(envelope.sender_id);
                break;
                default:
                    clearUserData(envelope.sender_id);
                    break;
            }
        }
        else {
            //send message using concated data
            alexaController.sendConcatedMessage(envelope, kvs.get(envelope.sender_id + kvsTags.TAG_CONCAT_DATA), false);
            console.log("FilteredMessageArray.length <= 0")
            console.log("clear cache called from:ManageFlows");
            clearUserData(envelope.sender_id);
        }
    });
}

function CheckMessageSendByUser(envelope, MessageArray, callback) {

    /*
     * CHECK IF MESSAGE SENT TO USER WAS OF TYPE PROMPTS, IF YES CHECK TEXT ENTERED BY USER 
     * RETURN "isValid" = "TRUE" IF OK ELSE  
     * RETURN "isValid" = "FALSE" AND WITH MESSAGE TO SEND TO USER "ReturnMessage"
     */

    var ResultResponse = {
        isValid: true,
        ReturnMessage: '',
        StartMenuTrigger: false,
        exitConversation: false
    }
    //console.log("Last message:"+JSON.stringify(MessageArray));
    genericHelper.getlastPromptSentToUser(MessageArray, function (SentMessage) {

        // console.log("999999 SentMessage - " + JSON.stringify(SentMessage))

        if (SentMessage) {
            console.log("Last message type is: " + SentMessage.name);
            if (SentMessage.name === 'Prompts') {
                ResultResponse = validationHelper.checkIfPromptInputIsCorrect(envelope.message.text, SentMessage, ResultResponse);
                //LOG ANSWER 
                if (ResultResponse.isValid) {
                    SentMessage.answer = envelope.message.text;
                    // alexaController.sendTextMessage(envelope, defaultMessages.PROMPT_ACKNOWLEDGED, false);
                }
                if (ResultResponse.exitConversation) {
                    clearUserData(envelope.sender_id);
                }
                callback(ResultResponse);

            } else if (SentMessage.name === 'Json API') {
                //if last message is a JSON API message
                // console.log('Last message is a JSON API message');
                bindParameterAnswerToJsonApi(envelope, SentMessage, function () {
                    callback(ResultResponse);
                });

            } else {
                // if last send message is of any other type
                // LAST SENT MESSAGE WAS NOT PROMPTS
                callback(ResultResponse);
            }

        }
        else {
            //NO LAST SENT MESSAGE FOUND, MAY BE FIRST MESSAGE
            console.info('NO LAST SENT MESSAGE FOUND, MAY BE FIRST MESSAGE');
            callback(ResultResponse);
        }
    });
}


function bindParameterAnswerToJsonApi(envelope, SentMessage, callback) {
    //check the last asked question
    //if the issent=1 of last question, it means the current answer is belong to this question
    var binded = false;
    console.log("Last sent Message:" + JSON.stringify(SentMessage));
    var each = require('sync-each');
    each(SentMessage.attribute,
        function (element, next) {
            if (!binded) {
                if (element.isSent === 0) {
                    //bind this answer to the question
                    element.answer = envelope.message.text;
                    console.log("\n Question:" + element.question + "\n Answer:" + envelope.message.text)
                    element.isSent = 1;
                    binded = true;
                    next(null, element);
                } else {
                    next(null, element);
                }
            } else {
                next(null, element)
            }
        },
        function (err, transformedItems) {
            console.log("transformedItems:" + JSON.stringify(transformedItems));
            SentMessage.attribute = transformedItems;
            // console.log("bindParameterAnswerToJsonApi##" + "DB set:" + event.user.id + 'MessageArray' + "::::" + [SentMessage]);
            kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, [SentMessage])
            //Success callback
            callback();
        }
    );

}


function SendMessage(type, envelope, FilteredMessageArray, MainMessageArray, resultMenuTrigger) {
    console.log("SendAlexaMessages")
    var DurationTime = parseInt(FilteredMessageArray[0].duration) * 1000;
    //var DurationTime=genericHelper.getLastSentMsgDuration(MainMessageArray);
    // console.error("DurationTime:"+DurationTime);
    //console.log("Type of receive message is: "+type);
    switch (type) {

        case messageType.TEXT:
            {
                alexaController.sendTextMessage(envelope, FilteredMessageArray[0].data, false);
            }
            break;
        case messageType.PROMPT:
            {
                if (FilteredMessageArray[0].entityType === '@sys.confirm') {
                    alexaController.sendConfirmPrompt(envelope.sender_id, FilteredMessageArray[0], DurationTime);
                }
                else {
                    alexaController.sendTextMessage(envelope, FilteredMessageArray[0].data, DurationTime);
                }
            }
            break;
        case messageType.BUTTON:
            {
                alexaController.sendButtonMessage(envelope.sender_id, kvs.get(envelope.sender_id + kvsTags.TAG_INTENT), FilteredMessageArray[0], DurationTime);
            }
            break;
        case messageType.IMAGE:
            {
                alexaController.sendImageMessage(envelope.sender_id, FilteredMessageArray[0].data, DurationTime);
            }
            break;

        case messageType.AUDIO:
            {
                alexaController.sendAudioMessage(envelope.sender_id, FilteredMessageArray[0].data, DurationTime);
            }
            break;
        case messageType.VIDEO:
            {
                alexaController.sendVideoMessage(envelope.sender_id, FilteredMessageArray[0].data, DurationTime);
            }
            break;

        case messageType.LOCATION:
            {
                bp.messenger.sendText(envelope.user.id, "Please click this button to give me your location",
                    CreateLocationQuestion())
                    .then(() => {
                        console.log("LOCATION ASKED");
                    })

            }
            break;
        case messageType.ACCESS:
            {
                var FaceAccessURL = "https://www.facebook.com/v2.11/dialog/oauth?response_type=token&display=popup" +
                    "&client_id=" + process.env.MESSENGER_APP_ID +
                    "&redirect_uri=" + process.env.SERVER_URL + "/FBcaller.html&state=" + envelope.user.id +
                    "&scope=email,user_about_me,user_birthday,user_education_history,user_friends,user_hometown,user_likes,user_location,user_relationships,user_status,user_videos,user_website,user_work_history,user_actions.books,user_actions.music,user_actions.video,user_actions.fitness,user_actions.news"

                bp.messenger.sendTemplate(envelope.user.id, {
                    template_type: 'generic',
                    elements: [{
                        title: "Click to share some basic info with us",
                        item_url: FaceAccessURL,
                        image_url: "https://130e178e8f8ba617604b-8aedd782b7d22cfe0d1146da69a52436.ssl.cf1.rackcdn.com/8-tips-on-cyber-threat-info-sharing-showcase_image-4-a-7520.jpg"

                    }]
                });
            }
            break;

        case messageType.JSON_API:
            console.log("Json API")
            //send response to fb
            // console.log("Array of message : " + JSON.stringify(FilteredMessageArray));
            var item = FilteredMessageArray[0];
            //check if request has parameters
            if (item.attribute && item.attribute.length > 0) {
                //parameters are associated with this url
                for (var i = 0; i < item.attribute.length; i++) {
                    var attribute = item.attribute[i];
                    if (attribute.isSent === 0) {
                        console.log("" + attribute.question);
                        alexaController.sendTextMessage(envelope, attribute.question, false);
                        break;
                    }
                    //check if this is a last index
                    if (i === item.attribute.length - 1) {
                        //we have got all the parameters value from user
                        console.log("we have got all the parameters value from user");
                        sendJSONAPIResponse(envelope.sender_id, item, function (result) {
                            //mark this message as sent,save in db
                            FilteredMessageArray[0].answer_sent = 1;
                            kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, FilteredMessageArray);
                            ManageFlows(envelope);
                        });
                    }

                }

            } else {
                // no parameters are associated with this url, directly call this api
                console.log("no parameters are associated with this url, directly call this api")
                sendJSONAPIResponse(envelope.sender_id, item, function (result) {
                    //mark this message as sent,save in db
                    FilteredMessageArray[0].answer_sent = 1;
                    kvs.set(envelope.sender_id + kvsTags.TAG_ARRAY, FilteredMessageArray);
                    ManageFlows(envelope);
                });
            }
            break;

        case messageType.CAROUSEL:
            alexaController.sendTemplateMessage(envelope.sender_id, kvs.get(envelope.sender_id + kvsTags.TAG_INTENT), FilteredMessageArray[0], 0);
            break;
    }

}


function sendJSONAPIResponse(envelope, item, responseCallback) {
    apiHelper.constructJSONAPIRequestAndGetResponse(item, (err, response) => {
        if (err) {
            console.log("finalAnswer:" + response);
            alexaController.sendTextMessage(envelope, response, false);
            responseCallback(response);
        } else {
            // var finalAnswer = item.answer.replace(/(@@\S+)/gi, response);
            console.log("finalAnswer:" + response);
            alexaController.sendTextMessage(envelope, response, false);
            responseCallback(response);
        }
    });
}


/**
 * cleared all the local data of user
 * @param {*} sender_id 
 */
function clearUserData(sender_id) {
    kvs.remove(sender_id + kvsTags.TAG_INTENT);
    kvs.remove(sender_id + kvsTags.TAG_ARRAY);
    kvs.remove(sender_id + kvsTags.TAG_MENU);
    kvs.remove(sender_id + kvsTags.TAG_CONCAT_DATA);
    console.log("user data is cleared");
}

function clearConcatedData(sender_id) {
    kvs.remove(sender_id + kvsTags.TAG_CONCAT_DATA);
    console.log("user data is cleared");
}

/**
 * Use this method when luis found no intent match
 * @param {*} sender_id 
 */
function sendNoneIntentMessage(envelope) {
    clearUserData(envelope.sender_id);
    alexaController.sendTextMessage(envelope, defaultMessages.NONE_INTENT_MESSAGE, false);
}


/**
 * Use this method when user is stuck or want to start over the conversation
 * @param {*} sender_id 
 */
function exitConversation(envelope) {
    clearUserData(envelope.sender_id);
    alexaController.sendTextMessage(envelope, defaultMessages.EXIT, true);
}

module.exports = alexaEvent;