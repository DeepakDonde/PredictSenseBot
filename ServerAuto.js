/**
 * Created by Chetan Mekha on 22/07/16.
 * Base class for handling request from Bot(Skype/365/Directline/Web)
 */
var restify = require('restify');
var builder = require('botbuilder');
var botConfig = require('./config/bot.config');
var btnstyle = builder.ListStyle.button;
var dataHelper = require('./utility/dataHelper');
var msgType = "";
// var apiAiHelper = require('./utility/apiAiHelper');


//========================= ================================
// BOT SETUP  
//=========================================================

var server = restify.createServer(/*serverOptions*/);
//SET PORT
server.listen(process.env.port || process.env.PORT || botConfig.hostport, function () {
    console.log('%s listening to %s', server.name, server.url);
    console.error("Predict sense bot started !!!");

});


// CREATE BOT CONNECTOR
var connector = new builder.ChatConnector({
    appId: botConfig.appId,
    appPassword: botConfig.appPassword
});

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);
server.post('/api/messages', connector.listen());

// var inMemoryStorage = new builder.MemoryBotStorage();
// var bot = new builder.UniversalBot(connector, [..waterfall steps..])
// .set('storage', inMemoryStorage); // Register in-memory storage


//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// BOTS DIALOGS
//=========================================================

// CREATE LUIS RECOGNIZER THAT POINTS AT OUR MODEL AND ADD IT AS THE ROOT '/' DIALOG FOR OUR CORTANA BOT.
var recognizer = new builder.LuisRecognizer(botConfig.model);
console.error("INTENT : " + new builder.IntentDialog({ recognizers: [recognizer] }));
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
// bot.dialog('/', intents);

//INTENT HANDLER FROM LUIS
// intents.matches(bothelper.intentGreet, bothelper.intentGreet);

intents.onDefault(function (session) {
    console.log("default intent")
});

var exitMessage = "Thank you, visit again";
bot.endConversationAction('exit', exitMessage, { matches: /^exit|quit/i, });

//bot.endConversationAction('hi',"Welcome to wealth management system",{matches:/^hi|hello/i,});

bot.dialog("/", [
    function (session, results) {
        session.sendTyping();
        session.userData.isPrompts = 0;
        var botMessage = "";
        if (session.message.text.length > 0)
            botMessage = session.message.text;
        else
            botMessage = "hi";
        console.log(session.message.text);
        //session.send("Welcome to demo");
        // console.log(session.message.source)
        dataHelper.getDataFromServer(botConfig.botId, botMessage, function (recordset) {
            // console.log(recordset);
            if (recordset != null && recordset != undefined) {
                if (recordset.result != null && recordset.result.BotIntentFlow != undefined && recordset.result.BotIntentFlow.length > 0) {
                    recordset.result.BotIntentFlow.forEach(element => {
                        var name = element.name;
                        var message = "";
                        var buttonOptions = "";
                        var Delay = "";
                        if (name != "Gallery") {
                            message = element.data.trim();
                            buttonOptions = element.buttonoptions;
                            Delay = parseInt(element.duration, 10) * 1000;
                        }

                        if (name.toUpperCase() === "TEXT") {
                            setTimeout(function () {
                                session.sendTyping();
                                //console.log("TEXT DELAYED ")
                                session.send(message);
                                msgType = "TEXT";
                            }, Delay);
                        }
                        if (name.toUpperCase() === "BUTTON") {
                            setTimeout(function () {
                                msgType = "BUTTON";
                                session.sendTyping();
                                builder.Prompts.choice(session, message, buttonOptions, { listStyle: btnstyle, maxRetries: 2 });
                            }, Delay);
                        }

                        if (name.toUpperCase() === "IMAGE") {
                            setTimeout(function () {
                                msgType = "IMAGE";
                                session.sendTyping();
                                session.send(createImageCard(session, message))
                            }, Delay);
                        }

                        if (name.toUpperCase() === "PROMPTS") {
                            setTimeout(function () {
                                msgType = "PROMPTS";
                                session.sendTyping();
                                session.userData.isPrompts = 1;

                                if(message.indexOf('email')>-1){
                                session.userData.emailPrompt = 1
                                }
                                builder.Prompts.text(session, message);
                                //builder.Prompts.confirm(session, message);
                            }, Delay);
                        }
                        // if (name.toUpperCase() === "CAROUSEL") {
                        //     setTimeout(function () {
                        //         msgType = "CAROUSEL";
                        //         session.sendTyping();
                        //         session.send(createCarousel(session, message))
                        //     }, Delay);
                        // }
                    });
                } else {
                    if (recordset && recordset.result.menutrigger != undefined&&recordset.result.menutrigger.length>0) {
                        var commonMessage = recordset.result.menutrigger.MenuMessage;
                        var ChoiceList = "";
                        for (var count = 0; count < recordset.result.menutrigger.MenuIntent.length; count++) {
                            if (ChoiceList) {
                                console.error("Choice list created with  : " + recordset.result.menutrigger.MenuIntent[count].IntentName);
                                ChoiceList = ChoiceList + '|' + recordset.result.menutrigger.MenuIntent[count].IntentName;
                            }
                            else {
                                ChoiceList = recordset.result.menutrigger.MenuIntent[count].IntentName;
                                console.error("Choice list created with  : " + recordset.result.menutrigger.MenuIntent[count].IntentName);
                            }
                        }
                        session.userData.isPrompts = 0;
                        builder.Prompts.choice(session, commonMessage, ChoiceList, { listStyle: btnstyle, maxRetries: 2 });
                    } else {
                        session.endDialog("Sorry, We don't have any information ragarding this.\n\nSay 'Hi' to startover");
                    }

                }
            }

        }, this);
    }, function (session, results) {
        console.log(JSON.stringify(results))
        session.sendTyping();
        if (session.userData.isPrompts === 0) {
            if (results.response != undefined) {
                session.endDialog();
                session.beginDialog("/");
            }
        } else {
           if( session.userData.emailPrompt === 1){
            session.userData.emailPrompt = 0;
            session.endDialog("Thank you, visit again");
           }else{

            dataHelper.updateInitial(results.response, function (response) {
                session.message.text = "hi";
                session.endDialog("Inititals updated successfully.\n\n Thank you, visit again");
                //session.beginDialog("/");
            })
        }
        }

    }
]);

function createSingleCard(session, title, url, text) {
    var imageUrl = 'http://winjitstaging.cloudapp.net/botimages/skilledcreative/' + url;
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachments([
            new builder.ThumbnailCard(session)
                .title(title)
                .images([builder.CardImage.create(session, imageUrl)])
        ]);
    return msg;
}

function createAnimationCard(session, url) {
    var imageUrl = url;
    return new builder.AnimationCard(session)
        .media([{
            profile: 'gif',
            url: imageUrl
        }])

}

function createImageCard(session, url) {
    return msg = new builder.Message(session)
        .attachments([{
            contentType: "image/png",
            contentUrl: url
        }]);
}


function createCarousel(session, message) {


    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("Classic White T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "buy classic white t-shirt", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("Classic Gray T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/grayshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "buy classic gray t-shirt", "Buy")
            ])
    ]);



    return msg;
}


/**
 * Method used for tracking user event inside from bot
 */
bot.use({
    receive: function (event, next) {
        if (event.address.channelId !== 'emulator') {
            // GET CURRENT INVOICE ID

            if (event.text !== undefined) {
                var userName = event.user.name.split(" ");
                var firstName = "";
                var lastName = "";
                if (userName[0] != undefined) {
                    firstName = userName[0];
                    if (userName[1] != undefined)
                        lastName = userName[1]
                }


                var interactionModel =
                {
                    platform: event.address.channelId,
                    type: msgType,
                    text: event.text,
                    endUserId: event.address.conversation.id,
                    last_name: lastName,
                    first_name: firstName,
                    botId: botConfig.botId,
                    userID: 1,
                    source: "user",
                    picture_url: "",
                    gender: "",
                    messagetype: "text"
                }

                //dataHelper.logsUserInteraction(interactionModel);

            }
        }
        next();
    },
    send: function (event, next) {
        if (event.address.channelId !== 'emulator') {
            // GET CURRENT INVOICE ID

            var userName = event.address.user.name.split(" ");
            var firstName = "";
            var lastName = "";
            if (userName[0] != undefined) {
                firstName = userName[0];
                if (userName[1] != undefined)
                    lastName = userName[1]
            }

            if (event.text !== undefined) {
                var interactionModel =
                {
                    platform: event.address.channelId,
                    type: msgType,
                    text: event.text,
                    endUserId: event.address.conversation.id,
                    last_name: lastName,
                    first_name: firstName,
                    botId: botConfig.botId,
                    userID: 1,
                    source: "bot",
                    picture_url: "",
                    gender: "",
                    messagetype: "text"
                }
               // dataHelper.logsUserInteraction(interactionModel);
            }
        }
        next();
    }
});