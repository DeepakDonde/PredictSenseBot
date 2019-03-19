var path = require('path');
const Alexa = require('ask-sdk');
const requestTypes = require(path.resolve('.', 'modules/alexa/requestTypes.js'));
const defaultIntent = require(path.resolve('.', 'modules/alexa/defaultIntent.js'));
var defaultMessages = require(path.resolve('.', 'modules/common/defaultMessages.js'));
var messageType = require(path.resolve('.', 'modules/common/messageType.js'));
var platform = require(path.resolve('.', 'modules/common/platform.js'));
var platformType = require(path.resolve('.', 'modules/common/platformType.js'));
var apiHelper = require(path.resolve('.', 'modules/common/apiHelper.js'));
var messageAction = require(path.resolve('.', 'modules/common/messageAction.js'));
let skill;


const intentRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type == requestTypes.INTENT;
    },

    handle(handlerInput) {
        logMessage(messageType.NONE, messageAction.SEND, handlerInput.requestEnvelope.context.System.user.userId, handlerInput.requestEnvelope.message);
        console.log("intent name : " + handlerInput.requestEnvelope.request.intent.name,"shouldEndSession:"+handlerInput.requestEnvelope.shouldEndSession);
        return handlerInput.responseBuilder
            .speak(handlerInput.requestEnvelope.message)
            .withSimpleCard("Alexa", handlerInput.requestEnvelope.message)
            .withShouldEndSession(handlerInput.requestEnvelope.shouldEndSession)
            .getResponse();
    }
}

const launchRequestHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type == requestTypes.LAUNCH);
    },
    handle(handlerInput) {
        logMessage(messageType.NONE, messageAction.RECEIVE, handlerInput.requestEnvelope.context.System.user.userId, "Launch");
        const speechTitle = "Convee"
        console.log("Launch intent");
        var conversation = require(path.resolve('.', 'modules/alexa/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
        conversation.emit("clear_user_data", handlerInput.requestEnvelope.session.user.userId);
        return handlerInput.responseBuilder
            .speak(defaultMessages.ALEXA_LAUNCH_SKILL)
            .withSimpleCard(speechTitle, defaultMessages.ALEXA_LAUNCH_SKILL)
            .withShouldEndSession(false)
            .getResponse();
    }
};



const sessionEndRequestHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type == requestTypes.END_SESSION);
    },
    handle(handlerInput) {
        const speechTitle = "Convee"
        //clear user data
        var conversation = require(path.resolve('.', 'modules/alexa/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
        conversation.emit("clear_user_data", handlerInput.requestEnvelope.session.user.userId);
        console.error("Session Ended");
        return handlerInput.responseBuilder
            .speak("Bye!")
            .withSimpleCard(speechTitle, "Bye!")
            .withShouldEndSession(true)
            .getResponse();

    }
};


const audioRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type == requestTypes.START_AUDIO ||
            handlerInput.requestEnvelope.request.type == requestTypes.AUDIO_STARTED ||
            handlerInput.requestEnvelope.request.type == requestTypes.AUDIO_FINISHED ||
            handlerInput.requestEnvelope.request.type == requestTypes.AUDIO_STOPPED ||
            handlerInput.requestEnvelope.request.type == requestTypes.AUDIO_NEARLY_FINISHED ||
            handlerInput.requestEnvelope.request.type == requestTypes.AUDIO_FAILED||
            handlerInput.requestEnvelope.request.type == requestTypes.STOP_AUDIO;
    },

    handle(handlerInput) {
        switch (handlerInput.requestEnvelope.request.type) {

            case requestTypes.START_AUDIO:
                var jwt = require('jsonwebtoken');
                var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
                return handlerInput.responseBuilder
                    .speak(handlerInput.requestEnvelope.message)
                    .withSimpleCard("Audio", handlerInput.requestEnvelope.message)
                    .addAudioPlayerPlayDirective("REPLACE_ALL", handlerInput.requestEnvelope.audio_url, token, 0, null, null)
                    .withShouldEndSession(true)
                    .getResponse();

            case requestTypes.STOP_AUDIO:
                var jwt = require('jsonwebtoken');
                var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
                return handlerInput.responseBuilder
                    .speak(handlerInput.requestEnvelope.message)
                    .withSimpleCard("Audio", handlerInput.requestEnvelope.message)
                    .addAudioPlayerStopDirective()
                    .withShouldEndSession(false)
                    .getResponse();

            case requestTypes.AUDIO_STARTED:
                return handlerInput.responseBuilder
                    .withShouldEndSession(false)
                    .getResponse();

            case requestTypes.AUDIO_FINISHED:
                return handlerInput.responseBuilder
                    //.speak("Audio finished")
                    //.withSimpleCard("Audio", "Audio finished")
                    .withShouldEndSession(false)
                    .getResponse();

            case requestTypes.AUDIO_FAILED:
                return handlerInput.responseBuilder
                    //.speak("Audio finished")
                    //.withSimpleCard(speechTitle, "Audio finished")
                    .withShouldEndSession(false)
                    .getResponse();
        }

    }
}


var alexaPostRequest = function (req, res) {
    console.log("alexaPostRequest");
    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                launchRequestHandler,
                intentRequestHandler,
                sessionEndRequestHandler,
                audioRequestHandler
            )
            .create();
    }


    switch (req.body.request.type) {
        case requestTypes.INTENT:
            var envelope = {
                "sender_id": req.body.session.user.userId,
                "message": { text: "hi" },
                "requestEnvelope": req.body,
                "res": res
            };
            checkForIntentRequest(req.body, envelope);
            break;

        case requestTypes.LAUNCH:
            skill.invoke(req.body)
                .then(function (responseBody) {
                    console.error(JSON.stringify(responseBody));
                    res.json(responseBody);
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send('Error during the request');
                });
            break;

        case requestTypes.END_SESSION:
            skill.invoke(req.body)
                .then(function (responseBody) {
                    console.error(JSON.stringify(responseBody));
                    res.json(responseBody);
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send('Error during the request');
                });
            break;

        case requestTypes.AUDIO_STARTED:
            console.error("Audio is started");
            break;

        case requestTypes.AUDIO_FINISHED:
            console.error("Audio is finished");


            skill.invoke(req.body)
                .then(function (responseBody) {
                    console.error(JSON.stringify(responseBody));
                    res.json(responseBody);
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send('Error during the request');
                });
            break;

        case requestTypes.AUDIO_STOPPED:
            console.error("Audio is stopped");
            break;

        case requestTypes.AUDIO_NEARLY_FINISHED:
            console.error("Audio is Nearly finished");
            break;

        case requestTypes.AUDIO_FAILED:
            console.error("Audio is failed");
            break;

        case requestTypes.EXCEPTION:
            console.error("Exception", req.body.request.error.message);
            break;

        default:
            console.error("Unknown request", req.body.request.type);
            break;
    }

}


function checkForIntentRequest(body, envelope) {

    switch (body.request.intent.name) {
        case defaultIntent.CANCEL:

            break;

        case defaultIntent.FALLBACK:
            sendTextMessage(envelope, defaultMessages.NONE_INTENT_MESSAGE, false);
            break;

        case defaultIntent.HELP:
            sendTextMessage(envelope, "How can I help you?", true);
            break;

        case defaultIntent.STOP:
            sendTextMessage(envelope, "Bye!", true);
            break;

        case defaultIntent.NAVIGATE_HOME:
            sendTextMessage(envelope, "Bye!", true);
            break;

        case defaultIntent.PAUSE:
            console.error("in pause intent");
            //check if audio player is running now
            if (body.context.AudioPlayer && body.context.AudioPlayer.playerActivity && body.context.AudioPlayer.playerActivity == "PLAYING")
             {
                //Stop audio player
                envelope.requestEnvelope.request.type = requestTypes.STOP_AUDIO;
                envelope.requestEnvelope.message = "Stopping....";
                envelope.requestEnvelope.shouldEndSession = true;
                skill.invoke(envelope.requestEnvelope)
                    .then(function (responseBody) {
                        envelope.res.json(responseBody);
                    })
                    .catch(function (error) {
                        console.log(error);
                        envelope.res.status(500).send('Error during the request');
                    });
            }
            break;

        default:
            //this is a user defined intent, we need to get value from slots
            if (body.request.intent.slots && body.request.intent.slots.text && body.request.intent.slots.text.value) {
                var conversation = require(path.resolve('.', 'modules/alexa/conversation.js'));//dont do this globally as it will create circular dependency and export wont work
                envelope.message.text = body.request.intent.slots.text.value;
                logMessage(messageType.NONE, messageAction.RECEIVE, body.context.System.user.userId, envelope.message.text);
                conversation.emit("text_message", envelope);
            } else {
                console.error("slot value is not present")
                sendTextMessage(envelope, defaultMessages.NONE_INTENT_MESSAGE, false);
            }
            break;
    }
}

var sendTextMessage = function (envelope, message, shouldEndSession) {
    envelope.requestEnvelope.message = message;
    envelope.requestEnvelope.shouldEndSession = shouldEndSession;

    // for (var i = 0; i < 4; i++) {
    skill.invoke(envelope.requestEnvelope)
        .then(function (responseBody) {
            envelope.res.json(responseBody);
        })
        .catch(function (error) {
            console.log(error);
            envelope.res.status(500).send('Error during the request');
        });
    // }
}
var sendConcatedMessage = function (envelope, message, shouldEndSession) {

    var concatedMessage = "";
    //check if message is array
    if (message && Array.isArray(message) && message.length > 0) {

        message.forEach(element => {
            if (concatedMessage) {
                concatedMessage = concatedMessage + `<break time="1s"/>`
            }

            //check the message type and then extract the message
            switch (element.name) {
                case messageType.TEXT:
                case messageType.PROMPT:
                    concatedMessage = concatedMessage + element.data
                    break;


                case messageType.BUTTON:
                    concatedMessage = concatedMessage + element.data + `<break time="1s"/>`;
                    for (let index = 0; index < element.buttonoptions.length; index++) {
                        var buttonTitle = element.buttonoptions[index].IntentName;
                        concatedMessage = concatedMessage + buttonTitle + `<break time="0.5s"/>`;
                    }
                    break;

                case messageType.JSON_API:
                    if (element.attribute && element.attribute.length > 0) {
                        for (let index = 0; index < element.attribute.length; index++) {
                            const atr = element.attribute[index];
                            if (atr.isSent == 0) {
                                concatedMessage = concatedMessage + atr.question;
                                break;
                            }
                        }
                    }
                    break;
            }
        });
    }

    console.error("concatedMessage", concatedMessage);
    envelope.requestEnvelope.message = concatedMessage;
    envelope.requestEnvelope.shouldEndSession = false;

    skill.invoke(envelope.requestEnvelope)
        .then(function (responseBody) {
            envelope.res.json(responseBody);
        })
        .catch(function (error) {
            console.log(error);
            envelope.res.status(500).send('Error during the request');
        });
}

var sendAudioMessage = function (envelope, message, shouldEndSession) {
    envelope.requestEnvelope.request.type = requestTypes.START_AUDIO;
    envelope.requestEnvelope.message = "Playing...";
    envelope.requestEnvelope.audio_url = message;
    envelope.requestEnvelope.shouldEndSession = false;
    skill.invoke(envelope.requestEnvelope)
        .then(function (responseBody) {
            envelope.res.json(responseBody);
        })
        .catch(function (error) {
            console.log(error);
            envelope.res.status(500).send('Error during the request');
        });
}

var validateRequest = function (req, res, next) {
    // console.log("validate");
    // if (req.body.session.application.applicationId == config.ADAPTER.ALEXA.SKILL_ID) {
    //     next();
    // } else {
    //     res.sendStatus(403);
    // }
    next();
}


function SendMenuTrigger(envelope, message, shouldEndSession) {

    var concatedMessage = message.MenuMessage;
    concatedMessage = concatedMessage + `<break time="1s"/>`;
    if (message.MenuIntent && message.MenuIntent.length > 0) {
        for (let index = 0; index < message.MenuIntent.length; index++) {
            var buttonTitle = message.MenuIntent[index].IntentName;
            concatedMessage = concatedMessage + buttonTitle + `<break time="0.5s"/>`;
        }
    }

    console.error("concatedMessage", concatedMessage);
    envelope.requestEnvelope.message = concatedMessage;
    envelope.requestEnvelope.shouldEndSession = false;

    skill.invoke(envelope.requestEnvelope)
        .then(function (responseBody) {
            envelope.res.json(responseBody);
        })
        .catch(function (error) {
            console.log(error);
            envelope.res.status(500).send('Error during the request');
        });

}


function logMessage(messageType, messageAction, sender_id, message) {
    console.error("logMessage");
    try {
        var data = {
            Platform: platform.ALEXA,
            MessageType: messageType,
            MessageAction: messageAction,
            EndUserId: sender_id,
            Message: message,
            PlatformType: platformType.VOICE
        }
        apiHelper.logMessage(data);
    } catch (e) {
        console.error(e)
    }
}




module.exports = {
    validateRequest: validateRequest,
    alexaPostRequest: alexaPostRequest,
    sendTextMessage: sendTextMessage,
    sendConcatedMessage: sendConcatedMessage,
    sendAudioMessage: sendAudioMessage,
    SendMenuTrigger: SendMenuTrigger
}