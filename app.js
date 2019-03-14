/**
 * Created by Chetan Mekha on 22/07/16.
 * Base class for handling request from Bot(Skype/365/Directline/Web)
 */
var fs = require('fs');
var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var bothelper = require('./utility/bothelper');
var botConfig = require('./config/bot.config');
var buttonstyle = builder.ListStyle['button'];
var btnstyle = builder.ListStyle.button;
// var maximizerHelper = require('./utility/maximizerhelper.js');
// var maximizerApiReq = require('./apiRequest/maximizerApiRequest.js');


//========================= ================================
// BOT SETUP  
//=========================================================

var server = restify.createServer(/*serverOptions*/);
//SET PORT
server.listen(process.env.port || process.env.PORT || botConfig.hostport, function () {
    console.log('%s listening to %s', server.name, server.url);
});


// CREATE BOT CONNECTOR
var connector = new builder.ChatConnector({
    appId: botConfig.appId,
    appPassword: botConfig.appPassword
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


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
bot.dialog('/', intents);

//INTENT HANDLER FROM LUIS
intents.matches(bothelper.intentGreet, bothelper.intentGreet);
// intents.matches(bothelper.intentHelp, bothelper.intentHelp);
// intents.matches(bothelper.intentClose, bothelper.intentClose);
// intents.matches(bothelper.intentCallme, bothelper.intentCallme);
// intents.matches(bothelper.intentGetPremiumByModel, bothelper.intentGetPremiumByModel);
// intents.matches(bothelper.intentSearch, bothelper.intentSearch);

intents.onDefault(function (session) {
    // session.endDialog("You seem to be lost, You can say 'hi'")
    callSmallTalkApi(session, session.message.text);
});

var notAvailableForDemo = "Answer not available for Demo, please choose another option";
var exitMessage = "It was nice talking to you. Have a nice day ahead!";
bot.endConversationAction('exit', exitMessage, { matches: /^exit|quit/i, });
var MainMenu = "MainMenu";

/*------------------------------------DIALOG-------------------------------------*/
var greetDialogCalled = true;
bot.dialog(bothelper.intentGreet, [
    function (session, results) {

        //RESET FLAGS
        Protest = true;
        Foul = true;
        DropSomeKnowledge = true;
        Facetime = true;
        AllStar = true;
        WindSprint = true;
        BungeeJump = true;
        LetsDoItNow = true;
        EncourageMaria = true;
        alreadyPro = true;
        dialogA = true;
        DigDeeper = true;
        ofcourse = true;
        BornReadySelected = true;
        BringToCoach = true;
        TacoTuesday = true;
        Fair = true;
        Foul = true;
        DishwithBrian = true;
        BringToCoach = true;

        session.send("Hey " + session.message.user.name + "!");
        session.sendTyping();
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("PLAY IX, Powered by Womens' Sports Foundation")
                    .subtitle("")
                    .images([builder.CardImage.create(session, "http://winjitstaging.cloudapp.net/botimages/SkilledV2/4b.png")])
                // .images([builder.CardImage.create(session, "http://winjitstaging.cloudapp.net/botimages/skilledcreative/4.png")])
                // .tap(builder.CardAction.openUrl(session, bothelper.BotReferenceSite))
            ]);
        session.send(msg);
        // session.send(createImageCard(session, "title_ix_logo.png"));
        //session.sendTyping();
        //session.send("Hey " + session.message.user.name + "!");
        session.sendTyping();
        session.send("Welcome to PLAY IX: Empowered Actions Through Education. Title IX has been helping to create equality in education for over 45 years. This game will help you learn your");
        builder.Prompts.choice(session, "You can either hit 'Start' to play the game, or head to the Menu to learn more about your rights under Title IX.", ["Start", "Menu"], { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result, next) {
        if (result.response != undefined) {
            if (result.response.entity === 'Start') {
                greetDialogCalled = false;
                session.endDialog();
                session.beginDialog("Start");
            } else {
                greetDialogCalled = true;
                session.endDialog(notAvailableForDemo);
                session.beginDialog(bothelper.intentGreet);
            }
        }

    }
]);

bot.dialog("Start", [
    function (session, result) {
        session.sendTyping();
        session.send("Before you pick your player, we want to learn more about you:");
        builder.Prompts.text(session, "What school do you go to?");
    }, function (session, result) {
        session.sendTyping();
        session.userData.schoolName = result.response;
        builder.Prompts.text(session, "What sport do you play?");
    }, function (session, result) {
        session.userData.sportName = result.response;
        session.sendTyping();
        builder.Prompts.text(session, "What's a word that your best friend would use to describe you?");
    },
    function (session, result) {
        session.sendTyping();
        session.userData.friendsDescription = result.response;
        session.send("Got it! Complete the characters to unclock exclusive content from your favorite athletes.  Time to play the game:");
        var array = [];
        var ChoiceList;
        var playCorousalType = ['Choose Kara', 'Choose Brett', 'Choose Coach J', 'Choose Ron'];
        var genderType = ['/Female Athlete', '/Male Athlete', '/Female Coach', '/Male Sports Administrator'];
        var playCorousalSelectName = ['Lets Go Kara', 'Lets Go Brett', 'Lets Go Coach J', 'Lets Go Ron'];
        var playCorousalUrls = [
            'http://winjitstaging.cloudapp.net/botimages/SkilledV3/kara_half.png',
            'http://winjitstaging.cloudapp.net/botimages/SkilledV3/brett_half.png',
            'http://winjitstaging.cloudapp.net/botimages/SkilledV2/coach%20D.png',
            'http://winjitstaging.cloudapp.net/botimages/SkilledV2/ron.png'
        ];

        for (var count = 0; count < playCorousalType.length; count++) {
            var thumbnailCard = new builder.ThumbnailCard(session);
            thumbnailCard.title(playCorousalType[count]);
            thumbnailCard.images([builder.CardImage.create(session, playCorousalUrls[count])]);
            thumbnailCard.subtitle(genderType[count])
            // thumbnailCard.tap(builder.CardAction.openUrl(session, playCorousalUrls[count]));
            thumbnailCard.buttons([builder.CardAction.imBack(session, playCorousalType[count], playCorousalSelectName[count])]);
            array.push(thumbnailCard);

            if (ChoiceList) {
                ChoiceList = ChoiceList + '|' + playCorousalType[count];
            } else {
                ChoiceList = playCorousalType[count];
            }
        }

        if (array != undefined && array.length > 0) {
            var msg = new builder.Message(session)
                .textFormat(builder.TextFormat.xml)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(array);
            builder.Prompts.choice(session, msg, ChoiceList, { listStyle: btnstyle, maxRetries: 2, retryPrompt: "Please choose another option" });
            array = undefined;
        }
    }, function (session, results, next) {
        session.sendTyping();
        var array = [];
        if (results.response != undefined) {
            if (results.response.entity === "Choose Kara") {
                setTimeout(function () {
                    session.sendTyping();
                    session.send(createImageCardWithV3(session, "kara.png"));
                }, 0);
                setTimeout(function () {
                    session.send("Nice choice! You're Kara, a soccer player on scholarship at WSF University. As if that's not enough, you also work part-time at the school bookstore");
                }, 2000);

                setTimeout(function () {
                    session.sendTyping();
                    //session.send(" #werk 💪🏼💰📚");
                    session.send(" #werk 💪💰📚 ");
                }, 6000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("But you're not all business. You also love to go out with your teammates on the weekend, and constantly snap them funny pictures");
                }, 8000);

                setTimeout(function () {
                    session.sendTyping();
                    // var msg = new builder.Message(session).addAttachment(createImageCard(session,));
                    // session.send(msg);
                    session.send(createImageCard(session, "17.jpg"));
                }, 12000);

                setTimeout(function () {
                    next();
                }, 16000);
            }
            else {
                session.endDialog(notAvailableForDemo);
                session.beginDialog("Start");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Start");
        }
    }, function (session, result) {
        session.endDialog();
        session.beginDialog("BornReady");
    }
]);


/**
 * function used for loading bornready dialog
 */
bot.dialog("BornReady", [
    function (session) {
        builder.Prompts.choice(session, "Throughout this experience, you'll learn how to navigate the unique situations a student athlete like Kara deals with. Ready to gain a new perspective?", "Born ready|No, I don't like fun stuff", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Born ready") {
                session.endDialog();
                session.beginDialog("BornReadySelected");
            } else {
                // s
                // session.endDialog(notAvailableForDemo);
                session.endDialog();
                session.beginDialog("DntLikeFunStuff");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("BornReady");
        }

    }
]);

bot.dialog("DntLikeFunStuff", [
    function (session) {
        builder.Prompts.choice(session, "Really?! Don't sit on the bench.  Do you want to keep playing or return to the main menu?", "Keep playing|Main menu", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Keep playing") {
                session.endDialog();
                session.beginDialog("BornReadySelected");
            } else {
                // s
                session.endDialog(MainMenu);
                // session.beginDialog("MainMenu");
            }
        } else {
            session.endDialog(MainMenu);
            // session.beginDialog("MainMenu");
        }

    }
]);

var BornReadySelected = true;
bot.dialog("BornReadySelected", [
    function (session, result, next) {
        if (BornReadySelected) {
            setTimeout(function () {
                session.sendTyping();
                session.send("I knew you were smart. Here we go!");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "24.gif"));
                session.send(msg);
            }, 3000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Welcome to day one! The sun's out and the dining hall is making waffles. It's been a great week, and you're feelin' yourself");
            }, 6000);


            setTimeout(function () {
                session.sendTyping();
                session.send("On the way back to your dorm, you see your teammate, Shannon. She does not look happy");
            }, 9500);

            setTimeout(function () {
                session.sendTyping();
                next();
            }, 12000);

        } else {
            next();
        }

        // builder.Prompts.choice(session, "Do you ask her what's wrong?", "Of course!|No, I'm busy", { maxRetries: 3, retryPrompt: "Please choose another option" }, { listStyle: btnstyle });

    }, function (session, result) {
        builder.Prompts.choice(session, "Do you ask her what's wrong?", "Of course!|No, I'm busy", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    },
    function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Of course!') {
                session.endDialog();
                session.beginDialog("Ofcourse");
            } else {
                BornReadySelected = false;
                // session.endDialog(notAvailableForDemo);
                session.endDialog();
                session.beginDialog("NoIAmBusy");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("BornReadySelected");
        }
    }
]);

var NoIAmBusy = true;
bot.dialog("NoIAmBusy", [
    function (session, result, next) {
        if (NoIAmBusy) {
            setTimeout(function () {
                session.sendTyping();
                session.send("You decide not to bother your roommate. If something is wrong, she'll tell you.");
            }, 000);
            setTimeout(function () {
                session.sendTyping();
                next();
            }, 3000);

        } else {
            next();
        }

        // builder.Prompts.choice(session, "Do you ask her what's wrong?", "Of course!|No, I'm busy", { maxRetries: 3, retryPrompt: "Please choose another option" }, { listStyle: btnstyle });

    }, function (session, result) {
        builder.Prompts.choice(session, "After doing homework for a few minutes, Shannon taps you on the shoulder. Can she talk to you for a sec?", "Of course!", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    },
    function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Of course!') {
                session.endDialog();
                session.beginDialog("Ofcourse");
            }
        }
    }
]);

var DigDeeperFirstLine = true;
var ofcourse = true;
bot.dialog("Ofcourse", [
    function (session, result, next) {
        if (ofcourse) {

            setTimeout(function () {
                session.sendTyping();
                session.send("Shannon is upset that the men's soccer team gets amazing warm ups, customized game jerseys, and practice jerseys. Meanwhile, your team hasn't gotten anything new all year");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                session.send("To be honest, you'd never really thought about it before... but Shannon has a point. Your uniform is super beat up and you had to buy new cleats with your own money.");
            }, 7000);

            setTimeout(function () {
                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "32.jpg"));
                // session.send(msg);
                session.send(createImageCardWithV3(session, "32.png"));
            }, 13000);


            setTimeout(function () {
                session.sendTyping();
                session.send("You work hard for that 🎽 💰 🙄!");
            }, 17000);

            setTimeout(function () {
                session.sendTyping();
                session.send("This whole situation seems unfair. So, you decide to team up and brainstorm. After some good, hard thinking... and a cat video detour on Youtube... you decide to talk to Coach");
            }, 21000);

            setTimeout(function () {
                session.sendTyping();
                session.send(createImageCard(session, "34a.jpg"));
            }, 24000);


            setTimeout(function () {
                session.sendTyping();
                session.send("The next day, you both approach Coach J after practice. She's in a rush, so you spit it out. 'The men's team gets way better gear, and it's unfair. We deserve the same equipment");
            }, 28000);

            setTimeout(function () {
                session.sendTyping();
                session.send("You said it! 😶");
            }, 32000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "36.gif"));
                session.send(msg);

            }, 35000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Unfortunately, the situation isn't fixed that easily. Coach J tells you that she agrees, but she already spent this year's budget. However, she was able to get your team coach buses, which are better than most");
            }, 37000);

            setTimeout(function () {
                next();
            }, 41000);

        } else {
            next();
        }

    }, function (session, result) {
        setTimeout(function () {

            session.sendTyping();
            //session.send("Hmmm.... does that seem reasonable? Do you really have anything to complain about?");
            //builder.Prompts.choice(session, "Hmmm.... does that seem reasonable? Do you really have anything to complain about?", "I guess not|Dig Deeper", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 0);
        setTimeout(function () {

            session.sendTyping();
            // var msg = new builder.Message(session).addAttachment(createImageCard(session, "38.png"));
            // session.send(msg);
            session.send(createImageCard(session, "38.png"));

            builder.Prompts.choice(session, "Hmmm.... does that seem reasonable? Do you really have anything to complain about?", "I guess not|Dig Deeper", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });


        }, 2000);


    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Dig Deeper') {
                session.endDialog();
                DigDeeperFirstLine = true;
                session.beginDialog("DigDeeper");

            } else {
                ofcourse = false;
                session.endDialog();
                DigDeeperFirstLine = false;
                session.beginDialog("IGuessNot");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Ofcourse");
        }

    }
]);

var IGuessNot = true;

bot.dialog("IGuessNot", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("You tell your teammates that you couldn't do anything 😬. Of course, they won't settle for that 😏");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("After a long talk, you collectively decide to rally together and take more action. But wait....what do you do?");
            next();
        }, 2000);
    }, function (session, result, next) {
        session.endDialog();
        session.beginDialog("DigDeeper");

    }
]);

var DigDeeper = true;
bot.dialog("DigDeeper", [
    function (session, result, next) {
        if (DigDeeper) {
            if (DigDeeperFirstLine) {
                setTimeout(function () {
                    session.sendTyping();
                    session.send("Awwwww, yeah! Don't settle for that answer– trust your gut! But wait... what do you do?");
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Choose from the list below");
                }, 2000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("A.) Research to see what other teams are doing  \n\nB.) Alert the school paper \n\nC.) Never mind. Accept that there isn't a budget for new uniforms");
                    builder.Prompts.choice(session, "Please choose options from below list", "A|B|C", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
                }, 5000);

            } else {

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Choose from the list below");
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("A.) Research to see what other teams are doing  \n\nB.) Alert the school paper \n\nC.) Never mind. Accept that there isn't a budget for new uniforms");
                    builder.Prompts.choice(session, "Please choose options from below list", "A|B|C", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
                }, 1000);

            }

        } else {
            builder.Prompts.choice(session, "Please choose options from below list", "A|B|C", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }
    },
    function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'A') {
                session.endDialog();
                session.beginDialog("A");
            } else if (result.response.entity === 'B') {
                session.endDialog();
                session.beginDialog("B");
            }

            else {
                DigDeeper = false;
                session.endDialog();
                session.beginDialog("C");
            }
        }
    }
]);

var dialogB = true;
bot.dialog("B", [
    function (session, result, next) {

        setTimeout(function () {
            session.sendTyping();
            session.send("Your school's reporters are excited to get such a good scoop");
        }, 0);
        setTimeout(function () {
            session.sendTyping();
            session.send(createImageCard(session, "45b_alt.png"));
        }, 3000);

        setTimeout(function () {
            session.sendTyping();
            session.send("They do some research, and learn that under Title IX, men and women's teams are entitled to equal resources");
        }, 5000);

        setTimeout(function () {
            session.sendTyping();
            session.send("And it turns out, the men's soccer team rides luxury buses to away games, plus their jerseys are crazy nice");
        }, 10000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 15000);


    }, function (session, result) {
        setTimeout(function () {
            session.sendTyping();
            builder.Prompts.choice(session, "The school paper just shed some light on the situation.  Want to bring the new info to coach?", "Bring to Coach|Ummmmmm, No", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 0);
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Bring to Coach") {
                dialogA = true;
                session.endDialog();
                session.beginDialog("BringToCoach");

            } else {
                dialogA = false;
                session.endDialog();
                session.beginDialog("UmmnnnnNo");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("C");
        }
    }
]);

var dialogC = true;
bot.dialog("C", [
    function (session, result, next) {

        setTimeout(function () {
            session.sendTyping();
            session.send("You take Coach at her word. Besides, you have that big test coming up. You need to study! 📕📕📒");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("On your way to the library, you overhear some players on your team talking about the situation. They've decided to tell the school paper, themselves.");
        }, 3000);

        setTimeout(function () {
            session.sendTyping();
            session.send("And they did it! Later that week, there's a front page story about gender equality in the athletic department");
        }, 6000);

        setTimeout(function () {
            session.sendTyping();
            // var msg = new builder.Message(session).addAttachment(createImageCard(session, "45b_alt.png"));
            // session.send(msg);
            session.send(createImageCard(session, "45b_alt.png"));
        }, 10000);

        setTimeout(function () {
            session.sendTyping();
            session.send("The reporters did some research, and learned that under Title IX, men and women's teams are entitled to the same resources");
        }, 15000);
        setTimeout(function () {
            session.sendTyping();
            session.send("And! It turns out that the men's soccer team rides luxury buses, PLUS their jerseys are crazy nice");
        }, 22000);
        setTimeout(function () {
            next();
        }, 28000);

    }, function (session, result) {
        setTimeout(function () {
            session.sendTyping();
            builder.Prompts.choice(session, "The school paper just shed some light on the situation.  Want to bring the new info to coach?", "Bring to Coach|Ummmmmm, No", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 0);
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Bring to Coach") {
                dialogA = true;
                session.endDialog();
                session.beginDialog("BringToCoach");

            } else {
                dialogA = false;
                session.endDialog();
                session.beginDialog("UmmnnnnNo");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("C");
        }
    }
]);

var dialogA = true;
bot.dialog("A", [
    function (session, result, next) {
        if (dialogA) {

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "46.gif"));
                session.send(msg);
            }, 0);
            setTimeout(function () {
                session.sendTyping();
                session.send("You have a feeling that your swanky bus doesn't even things out between the teams, so you do some more research. You learn that under Title IX, men and women's teams are entitled to equal resources");
            }, 6000);


            setTimeout(function () {
                session.sendTyping();
                session.send("The men's soccer team rides luxury buses to away games, plus their jerseys are crazy nice");
            }, 12000);

            setTimeout(function () {

                session.sendTyping();
                session.send("It's a thin line, but that doesn't sound like an equal distribution of resources, am I right?!");
            }, 16000);

            setTimeout(function () {

                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "50.jpg"));
                // session.send(msg);
                session.send(createImageCard(session, "50.jpg"));

            }, 19000);

            setTimeout(function () {
                next();
            }, 22000);

        } else {
            next();
        }

    }, function (session, result) {
        setTimeout(function () {
            session.sendTyping();
            builder.Prompts.choice(session, "You just shed some new light on the situation.  Want to bring the new info to coach?", "Bring to Coach|Ummmmmm, No", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 1000);
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Bring to Coach") {
                dialogA = true;
                session.endDialog();
                session.beginDialog("BringToCoach");

            } else {
                dialogA = false;
                session.endDialog();
                session.beginDialog("UmmnnnnNo");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("A");
        }
    }
]);

var UmmnnnNo = true;
bot.dialog("UmmnnnnNo", [
    function (session, result, next) {
        builder.Prompts.choice(session, "Going to take a pass on this one?  You've got all the facts behind you.  When there is a clear cut case of inequality, it is a great opportunity to even the playing field.  Do you want to take another swing at that choice?", "Bring to Coach", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        session.endDialog();
        session.beginDialog("BringToCoach");
    }
]);

var BringToCoach = true;
bot.dialog("BringToCoach", [
    function (session, result, next) {
        if (BringToCoach) {
            setTimeout(function () {
                session.sendTyping();
                session.send("You tell coach you're taking this info to your sports administrator. He understands that this is a reasonable concern, and decides to get involved.");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                session.send("He wants to help get the budget reallocated for next year. Of course, you're going to hold him to that");
            }, 8000);

            setTimeout(function () {
                session.sendTyping();
                session.send("In the meantime, you take matters into your own hands and host a fundraising soccer tournament. It's not the same as compliance, but it'll do for now– that money pays for your jerseys and cleats. Tough situation, but you handled it with style.......");
            }, 10000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "56.gif"));
                session.send(msg);
            }, 15000);

            setTimeout(function () {
                session.sendTyping();
                session.send("For being such an all star, you've unlocked this quote:");
            }, 18000);

            setTimeout(function () {
                session.sendTyping();
                //session.send("QUOTE HERE: Focus on being balanced-- success is a balance." + " --Laila Ali");
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "58.png"));
                // session.send(msg);
                session.send(createImageCard(session, "58.png"));

            }, 20000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Remember-hit the 'share' button to send some inspiration to your friends! 🔆🔆🔆");

            }, 24000);

            /*  setTimeout(function () {
                  session.sendTyping();
                  session.send("Hit the 'share' button to send some inspiration to your friends! 🔆🔆🔆");
              }, 23000);*/

            /*setTimeout(function () {
                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "58.png"));
                // session.send(msg);
                session.send(createImageCard(session, "58.png"));
            }, 22000);*/

            setTimeout(function () {
                session.sendTyping();
                session.send("Your day doesn't end there! You still have a SAAC meeting");
            }, 25000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Info Timeout!!!");
                session.send(createImageCardWithV3(session, "62.jpg"));
            }, 28000);

            setTimeout(function () {
                next();
            }, 32000);

        } else {
            next();
        }

    }, function (session, result) {
        setTimeout(function () {
            session.sendTyping();
            builder.Prompts.choice(session, "Do you want to learn more about the Student-Athlete Advisory Committee (SAAC)?", "Fill me in|No, I'm already pro", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 1000);
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "No, I'm already pro") {
                BringToCoach = true;
                session.endDialog();
                session.beginDialog("AlreadyPro");

            } else {
                BringToCoach = false;
                session.endDialog();
                session.beginDialog("FillMeIn");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("BringToCoach");
        }
    }
]);

var FillMeIn = true;
bot.dialog("FillMeIn", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send(createImageCard(session, "65c.jpg"));
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("Right on! Knowledge is power. SAAC is a committee of student-athletes, assembled to provide insight on the student-athlete experience and offer input on the rules, regulations and policies that affect student-athletes' lives on campus 📝📝📝");
        }, 6000);

        setTimeout(function () {
            session.sendTyping();
            session.send("You're probably thinking, what are the functions of SAAC on my campus? I've got you covered!");
        }, 12000);

        setTimeout(function () {
            session.sendTyping();
            session.send("That's a nice little nugget to save.  Now, back to the meeting!");
        }, 15000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Within a few minutes, a big issue comes up");
        }, 18000);

        setTimeout(function () {
            session.sendTyping();
            session.send(createImageCardWithV3(session, "68.png"));
        }, 22000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 25000);
    }, function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("Your friend RosaMaria mentions that a lot of the athletes on her Rugby team are only on partial scholarship. Many don't have financial assistance at all 👎🏾");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("Meanwhile, the men's team seems to have way more scholarships-- and full ones, at that");
        }, 7000);

        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "69.gif"));
            session.send(msg);
        }, 12000);

        setTimeout(function () {
            next();
        }, 18000);

    }, function (session, result) {
        builder.Prompts.choice(session, "Even though this isn't your sport, you decide to help RosaMaria with some research. After a lil' Googling, you find the Women's Sports Foundation website. Do you encourage Maria to call the WSF, or leave it alone and go cram for a test? 📖", "Encourage RosaMaria|Study Time", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Encourage RosaMaria') {
                session.endDialog();
                session.beginDialog("EncourageRosaMaria");

            } else {
                alreadyPro = false;
                session.endDialog();
                session.beginDialog("StudyTime")
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("FillMeIn")
        }
    }
]);

var alreadyPro = true;
bot.dialog("AlreadyPro", [
    function (session, result, next) {
        if (alreadyPro) {

            setTimeout(function () {
                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "65c.jpg"));
                // session.send(msg);
                session.send(createImageCard(session, "65c.jpg"));
            }, 0);
            setTimeout(function () {
                session.sendTyping();
                session.send("Got it, ya smartie. 🤓 Back to the meeting! Within the first few minutes, a big issue comes up");
            }, 3000);

            setTimeout(function () {
                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "113.png"));
                // session.send(msg);
                session.send(createImageCard(session, "113.png"));
            }, 5000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Your friend RosaMaria mentions that a lot of the athletes on her Rugby team are only on partial scholarship. Many don't have financial assistance at all 👎🏾");
            }, 9000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Meanwhile, the men's team seems to have way more scholarships-- and full ones, at that");
            }, 13000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "69.gif"));
                session.send(msg);
            }, 17000);

            setTimeout(function () {
                session.sendTyping();
                builder.Prompts.choice(session, "Even though this isn't your sport, you decide to help RosaMaria with some research. After a lil' Googling, you find the Women's Sports Foundation website. Do you encourage Maria to call the WSF, or leave it alone and go cram for a test? 📖", "Encourage RosaMaria|Study Time", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
            }, 23000);

        } else {
            builder.Prompts.choice(session, "Even though this isn't your sport, you decide to help RosaMaria with some research. After a lil' Googling, you find the Women's Sports Foundation website. Do you encourage Maria to call the WSF, or leave it alone and go cram for a test? 📖", "Encourage RosaMaria|Study Time", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }

    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Encourage RosaMaria') {
                session.endDialog();
                session.beginDialog("EncourageRosaMaria");

            } else {
                alreadyPro = false;
                session.endDialog();
                session.beginDialog("StudyTime")
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("AlreadyPro")
        }
    }

]);
var studyTime = true;
bot.dialog("StudyTime", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("Gotcha– gotta make those grades. You're reading up for your women's studies class. Chapter 12 is all abut women who have done great things as a team throughout history  👯 💪🏼");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "74.gif"));
            session.send(msg);
        }, 2000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Alright, universe. You can take a take a hint ✨");
        }, 5000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 8000);


    }, function (session, result) {
        // session.endDialog();
        // session.beginDialog("EncourageRosaMaria");
        builder.Prompts.choice(session, "Should we encourage RosaMaria?", "Encourage RosaMaria", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });

    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Encourage RosaMaria') {
                session.endDialog();
                session.beginDialog("ContinueRoseMaria");
            }
        }
    }

]);

bot.dialog('ContinueRoseMaria', [
    function (session, result, next) {

        setTimeout(function () {
            session.sendTyping();
            session.send("You 📱 RosaMaria, and ask if she's started doing research.");
        }, 14000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Turns out, she has! 🤓 🙌");
        }, 17000);

        setTimeout(function () {

            session.sendTyping();
            session.send("She learned that she doens't have to only compare men's and women's tennis teams. In reality, she should look at the school's full athletic program, and compare how the entire scholarship budget is allocated");
        }, 20000);


        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "77.gif"));
            session.send(msg);

        }, 25000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 28000);

    }, function (session, result) {

        session.endDialog();
        session.beginDialog("StudyTimeEncourageRosaMaria");
    }
]);

bot.dialog('StudyTimeEncourageRosaMaria', [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("This sounds hard– but luckily, the WSF points you to your school's EADA report (https://ope.ed.gov/athletics/#/). Data strikes again! You quickly learn that the scholarship dollars are not where they should be.");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("Turns out, while your sports program is 57% women, only 49% of scholarship money goes to female athletes. That's a big difference")

        }, 5000);

        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "79.gif"));
            session.send(msg);
        }, 10000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Not to Burst your bubble but......");
        }, 14000);

        setTimeout(function () {
            session.sendTyping();
            // var msg = new builder.Message(session).addAttachment(createImageCard(session, "80.png"));
            // session.send(msg);
            session.send(createImageCard(session, "80.png"));
        }, 16000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Knowledge is power 💪🏼 , now back to RosaMaria");
        }, 20000);

        setTimeout(function () {
            session.sendTyping();
            session.send("With your encouragement, RosaMaria brings these inequities to her coach. While the program doesn't currently have any money left for scholarships, the coach agrees to request more moolah from the AD");
        }, 25000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Together, you begin to develop a plan that will assure there is an equitible distribution of 💰 between male and female athletes");
        }, 30000);

        setTimeout(function () {
            session.sendTyping();
            session.send("This won't affect you or Maria directly, but you're helping future generations of female athletes at your school. In other words, you're pretty much the Queen🐝 of the athletic department. #Flawless");
        }, 34000);

        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "83.gif"));
            session.send(msg);
        }, 38000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Winners never quit, and quitters never win. You're clearly a winner, and you've complete half of this character journey");
        }, 42000);

        setTimeout(function () {
            next();
        }, 46000);

    }, function (session, result) {
        session.sendTyping();
        // builder.Prompts.choice(session, "Which means you've unlocked a mini game! Are you ready to play would you rather?", "👍🏽|👎🏽", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        builder.Prompts.choice(session, "Which means you've unlocked a mini game! Are you ready to play would you rather?", "Yes|No", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Yes") {
                session.endDialog();
                session.beginDialog("LetsStartIt");
            } else {
                EncourageRosaMaria = false;
                session.endDialog(notAvailableForDemo);
                session.beginDialog("StudyTimeEncourageRosaMaria");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("StudyTimeEncourageRosaMaria");
        }
    }
]);
var EncourageRosaMaria = true;
bot.dialog("EncourageRosaMaria", [
    function (session, result, next) {
        if (EncourageRosaMaria) {

            setTimeout(function () {
                session.sendTyping();
                session.send("Good idea! RosaMaria makes the call to WSF.  She learns that she doens't have to only compare men's and women's tennis teams. She actually needs to look at the school's full athletic program, and compare how the entire scholarship budget is allocated");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "77.gif"));
                session.send(msg);

            }, 3000);

            setTimeout(function () {
                session.sendTyping();
                session.send("This sounds hard– but luckily, the WSF points you to your school's EADA report (https://ope.ed.gov/athletics/#/). Data strikes again! You quickly learn that the scholarship dollars are not where they should be.");
            }, 6000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Turns out, while your sports program is 57% women, only 49% of scholarship money goes to female athletes. That's a big difference")

            }, 10000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "79.gif"));
                session.send(msg);
            }, 13000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Not to Burst your bubble but......");
            }, 17000);

            setTimeout(function () {
                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createImageCard(session, "80.png"));
                // session.send(msg);
                session.send(createImageCard(session, "80.png"));
            }, 19000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Knowledge is power 💪🏼 , now back to RosaMaria");
            }, 23000);

            setTimeout(function () {
                session.sendTyping();
                session.send("With your encouragement, RosaMaria brings these inequities to her coach. While the program doesn't currently have any money left for scholarships, the coach agrees to request more moolah from the AD");
            }, 28000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Together, you begin to develop a plan that will assure there is an equitible distribution of 💰 between male and female athletes");
            }, 33000);

            setTimeout(function () {
                session.sendTyping();
                session.send("This won't affect you or Maria directly, but you're helping future generations of female athletes at your school. In other words, you're pretty much the Queen🐝 of the athletic department. #Flawless");
            }, 37000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "83.gif"));
                session.send(msg);
            }, 42000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Winners never quit, and quitters never win. You're clearly a winner, and you've complete half of this character journey");
            }, 45000);

            setTimeout(function () {
                next();
            }, 50000);

        } else {
            next();
        }

    }, function (session, result) {
        session.sendTyping();
        // builder.Prompts.choice(session, "Which means you've unlocked a mini game! Are you ready to play would you rather?", "👍🏽|👎🏽", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        builder.Prompts.choice(session, "Which means you've unlocked a mini game! Are you ready to play would you rather?", "Yes|No", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === "Yes") {
                session.endDialog();
                session.beginDialog("LetsStartIt");
            } else {
                EncourageRosaMaria = false;
                //session.endDialog(notAvailableForDemo);
                //  session.beginDialog("EncourageRosaMaria");
                session.endDialog();
                session.beginDialog("LetsStopIt");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("EncourageRosaMaria");
        }
    }

]);

bot.dialog('LetsStopIt', [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("That's dedication.....Back to the story.");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 3000);

    }, function (session, result) {
        builder.Prompts.choice(session, "After your SAAC meeting, #realtalk, you decide to take a break. Do you want to watch some TV, or Facetime with your younger sister?", "TV|Facetime", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Facetime') {
                session.endDialog();
                session.beginDialog("Facetime");
            } else {
                session.endDialog();
                session.beginDialog("TV");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("LetsStopIt");
        }
    }
]);

var LetsStartIt = true;
bot.dialog("LetsStartIt", [
    function (session, result) {
        if (LetsStartIt) {
            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "87.gif"));
                session.send(msg);
            }, 0);
            setTimeout(function () {
                session.sendTyping();
                session.send("You know the drill, pick which YOU.....WOULD......RATHER");
            }, 4000);

            setTimeout(function () {
                session.sendTyping();
                //session.send("Would you rather be a summer or winter Olympian?");
                session.send(createImageCardWithV3(session, '90.jpg'));
            }, 7000);

            setTimeout(function () {
                session.sendTyping();
                builder.Prompts.choice(session, "Would you rather be a summer or winter Olympian?", "Summer|Winter", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
            }, 8000);
        } else {
            builder.Prompts.choice(session, "Would you rather be a summer or winter Olympian?", "Summer|Winter", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }


    }, function (session, result) {
        if (result.response.entity === 'Summer' || result.response.entity === 'summer') {
            session.endDialog();
            session.beginDialog("Summer");
        } else if (result.response.entity === 'Winter' || result.response.entity === 'Winter') {
            session.endDialog();
            session.beginDialog("Winter");
        }
        else {
            LetsStartIt = false;
            session.endDialog(notAvailableForDemo);
            session.beginDialog("LetsStartIt");
        }
    }

]);

bot.dialog('Winter', [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("Oooh, Majestic");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "92B.gif"));
            session.send(msg);
        }, 1000);

        setTimeout(function () {
            next();
        }, 5000);
    }, function (session, result) {
        session.endDialog();
        Summer = false;
        session.beginDialog('Summer')
    }
])

var Summer = true;
bot.dialog("Summer", [
    function (session, result, next) {
        if (Summer) {

            setTimeout(function () {
                session.sendTyping();
                session.send("Sun's Out, Guns Out");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "92SUMMER.gif"));
                session.send(msg);
            }, 1000);
            setTimeout(function () {
                session.sendTyping();
                session.send("Nice! 58% of people chose that too.");
            }, 4000);

            setTimeout(function () {
                session.sendTyping();
                //session.send("Would you rather run 200 wind sprints every day for a month, or only be able to eat protein powder for the next 30 days?");
                var msg = createImageCard(session, "93.jpg");
                session.send(msg);
            }, 7000);

            setTimeout(function () {
                next();
            }, 9000);
        } else {
            next();
        }

    }, function (session, result) {
        builder.Prompts.choice(session, "Would you rather run 200 wind sprints every day for a month, or only be able to eat protein powder for the next 30 days?", "Wind sprints|Protein!!!", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Wind sprints' | result.response.entity === 'Protein!!!') {

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "97.gif"));
                    session.send(msg);
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.endDialog();
                    session.beginDialog("WindSprint");
                }, 4000);

            } else {
                Summer = false;
                session.endDialog(notAvailableForDemo);
                session.beginDialog("Summer")
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Summer")
        }
    }
])

var WindSprint = true;
bot.dialog("WindSprint", [
    function (session, result, next) {
        if (WindSprint) {
            setTimeout(function () {
                session.sendTyping();
                session.send("interesting choice! Regardless, your month is going to suuuuck!");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                session.send("Okay, last one:");

            }, 3000);

            setTimeout(function () {
                session.sendTyping();
                //session.send("Would you rather be a celebrity who is terrible at sports, or an all-star who never gets famous?");
                var msg = createImageCard(session, "98.jpg");
                session.send(msg);
            }, 5000);
            setTimeout(function () {
                session.sendTyping();
                next();
            }, 7000);
        } else {
            next();
        }

    }, function (session, result) {
        setTimeout(function () {
            session.sendTyping();
            builder.Prompts.choice(session, "Would you rather be a celebrity who is terrible at sports, or an all-star who never gets famous?", "Celeb|All-star", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 1000);
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'All-star') {
                WindSprint = true;
                session.endDialog();
                session.beginDialog("AllStar");
            } else {
                WindSprint = true;
                session.endDialog();
                session.beginDialog("AllStar");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("WindSprint");
        }
    }
])

var AllStar = true;
bot.dialog("AllStar", [
    function (session, result, next) {
        if (AllStar) {
            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "103.gif"));
                session.send(msg);
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                session.send("Sounds good to me! 60% of people chose that, too");
            }, 4000);


            setTimeout(function () {
                session.sendTyping();
                session.send("Thanks for being a team player– you've earned 50 completely fake points. Anyways, back to Kara's story!");
            }, 7000);

            setTimeout(function () {
                session.sendTyping();
                var msg = createImageCardWithV3(session, "102.png");
                session.send(msg);
            }, 11000);

            setTimeout(function () {
                session.sendTyping();
                next();
            }, 15000);
        } else {
            next();
        }

    }, function (session, result) {
        builder.Prompts.choice(session, "After your SAAC meeting, #realtalk, you decide to take a break. Do you want to watch some TV, or Facetime with your younger sister?", "TV|Facetime", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Facetime') {
                session.endDialog();
                session.beginDialog("Facetime");
            } else {
                AllStar = false;
                session.endDialog();
                session.beginDialog("TV");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("AllStar");
        }
    }
]);
var TV = true;

bot.dialog("TV", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("You decide to binge on some Netflix. After a few episodes, your sister Facetimes you again. Geeze, Louise. (Her name is actually Louise.)");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("It's like she knew you were avoiding studying!");
        }, 5000);



        setTimeout(function () {
            session.sendTyping();
            session.send("You wait until the end of the show you're watching... and then call her back.");
        }, 7000);

        setTimeout(function () {
            session.sendTyping();
            var msg = createImageCard(session, "106.jpg");
            session.send(msg);
        }, 10000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 14000);
    }, function (session, result) {
        session.endDialog();
        TV = false;
        session.beginDialog("Facetime");
    }
]);
var Facetime = true;
bot.dialog("Facetime", [
    function (session, result, next) {
        if (Facetime) {

            if (TV) {
                setTimeout(function () {
                    session.sendTyping();
                    var msg = createImageCard(session, "106.jpg");
                    session.send(msg);
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Good idea– you haven't chatted with her in a while! She's really happy to hear from you 😀😀");
                }, 3000);



                setTimeout(function () {
                    session.sendTyping();
                    session.send("You spend the first five minutes of your call pretending to talk with your family's dog, Cody. He is ADORABLE");
                }, 6000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "109.gif"));
                    session.send(msg);
                }, 10000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("After Cody wanders away 🐕 , you get to talking. Turns out, your sister sprained her ankle a few days ago... and still hasn't managed to get proper treatment for it!");
                }, 14000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Obviously, you're mad 😡 😤. Your little sis deserves better!");
                }, 21000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Apparently, the women's basketball team at her highschool only has student trainers. Meanwhile, the men's team has staff trainers to keep them on their A-game. What?!");
                }, 27000);



                setTimeout(function () {
                    session.sendTyping();
                    session.send("Yesterday, she got her ankle taped at 8 AM... and her game was at 5 PM.");
                }, 30000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "116.gif"));
                    session.send(msg);
                }, 33000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("The men's team got to see their trainer an hour before tip-off! Oh, so the women can only have access to trainers at super inconvenient hours?!");
                }, 35000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("This is clearly not ok");
                }, 40000);

                setTimeout(function () {
                    session.sendTyping();
                    next();
                }, 44000);

            } else {
                /*  setTimeout(function () {
                      session.sendTyping();
                      session.send("Good idea– you haven't chatted with her in a while! She's really happy to hear from you 😀😀");
                  }, 0);
  */


                setTimeout(function () {
                    session.sendTyping();
                    session.send("You spend the first five minutes of your call pretending to talk with your family's dog, Cody. He is ADORABLE");
                }, 2000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "109.gif"));
                    session.send(msg);
                }, 4000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("After Cody wanders away 🐕 , you get to talking. Turns out, your sister sprained her ankle a few days ago... and still hasn't managed to get proper treatment for it!");
                }, 7000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Obviously, you're mad 😡 😤. Your little sis deserves better!");
                }, 15000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Apparently, the women's basketball team at her highschool only has student trainers. Meanwhile, the men's team has staff trainers to keep them on their A-game. What?!");
                }, 20000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Yesterday, she got her ankle taped at 8 AM... and her game was at 5 PM.");
                }, 25000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "116.gif"));
                    session.send(msg);
                }, 29000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("The men's team got to see their trainer an hour before tip-off! Oh, so the women can only have access to trainers at super inconvenient hours?!");
                }, 32000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("This is clearly not ok");
                }, 36000);

                setTimeout(function () {
                    session.sendTyping();
                    next();
                }, 40000);
            }
        } else {
            next();
        }

    }, function (session, result) {
        builder.Prompts.choice(session, "Do you sent your sister a role of extra kinesio tape, or fill her in on what you've learned from being a SAAC member?", "Send tape|Drop some knowledge", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Drop some knowledge') {
                session.endDialog();
                sendTape = true;
                session.beginDialog("DropSomeKnowledge");
            } else {
                Facetime = false;
                session.endDialog();
                session.beginDialog("sendTape");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Facetime");
        }
    }
]);

var sendTape = true;
bot.dialog("sendTape", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("You send your sister some Kinesio tape in an awesome care package, including instructions of how to wrap herself up like a kinesio mummy 🎁 😂");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("Turns out, your sister really needed it. The next week, another girl on her team had her ankles badly wrapped!");
        }, 6000);

        setTimeout(function () {
            session.sendTyping();
            session.send("A week later, the same thing has happened to another girl on her team! 😤😤");
        }, 11000);
        /*
                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "121.gif"));
                    session.send(msg);
                }, 14000);
        */
        setTimeout(function () {
            session.sendTyping();
            session.send("You're not gonna take this.");
        }, 18000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 21000);
    }, function (session, result) {
        builder.Prompts.choice(session, "Time to drop some knowledge?", "Drop some knowledge", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Drop some knowledge') {
                sendTape = false;
                session.endDialog();
                session.beginDialog("DropSomeKnowledge");
            }
        } else {
            sendTape = false;
            session.endDialog(notAvailableForDemo);
            session.beginDialog("sendTape");
        }
    }
]);

var DropSomeKnowledge = true;
bot.dialog("DropSomeKnowledge", [
    function (session, result, next) {
        if (DropSomeKnowledge) {

            if (sendTape) {
                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "121.gif"));
                    session.send(msg);
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Alright! Time to share some of those big sis' smarts");
                }, 3000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("You tell your sister that she needs to give her coach proof that this whole trainer situation is sketchy. And that means she's gonna need to do some serious research");
                }, 6000);



                setTimeout(function () {
                    session.sendTyping();
                    session.send("Like you thought, she's down for the challenge. She is related to you, after all!  👯 💪🏼 💯");
                }, 11000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "125.gif"));
                    session.send(msg);
                }, 15000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Since there's strength in numbers, your sister pairs up with some other 🏃‍♀️ on her team. They interview athletes, track the times that their team has access to trainers, and evaluate the overall athletic environment at their school");

                }, 18000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("After a few weeks, she reports back. All that data gathering was hard, but it convinced her coach and athletic director that the girls' teams were getting short changed");

                }, 27000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Now, a new schedule is being installed to give gameday athletes top priority, no matter their gender. Athletes who have practice need to come in when the trainers are less busy 🙌 ");

                }, 36000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "136.gif"));
                    session.send(msg);
                }, 42000);



                setTimeout(function () {
                    session.sendTyping();
                    session.send("While the coaches whined a bit, the boys' team was actually really supportive. Guess they're not so bad, after all. 😜");
                }, 46000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "131.gif"));
                    session.send(msg);
                }, 50000);

                setTimeout(function () {
                    session.sendTyping();
                    next();
                }, 52000);

            } else {

                  setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "121.gif"));
                    session.send(msg);
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("You tell your sister that she needs to give her coach proof that this whole trainer situation is sketchy. And that means she's gonna need to do some serious research");
                }, 2000);



                setTimeout(function () {
                    session.sendTyping();
                    session.send("Like you thought, she's down for the challenge. She is related to you, after all!  👯 💪🏼 💯");
                }, 4000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "125.gif"));
                    session.send(msg);
                }, 8000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Since there's strength in numbers, your sister pairs up with some other 🏃‍♀️ on her team. They interview athletes, track the times that their team has access to trainers, and evaluate the overall athletic environment at their school");

                }, 12000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("After a few weeks, she reports back. All that data gathering was hard, but it convinced her coach and athletic director that the girls' teams were getting short changed");

                }, 18000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Now, a new schedule is being installed to give gameday athletes top priority, no matter their gender. Athletes who have practice need to come in when the trainers are less busy 🙌 ");

                }, 26000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "136.gif"));
                    session.send(msg);
                }, 29000);



                setTimeout(function () {
                    session.sendTyping();
                    session.send("While the coaches whined a bit, the boys' team was actually really supportive. Guess they're not so bad, after all. 😜");
                    //session.send("After the call, you get a knock on your door. It's your friend, Brian. He's bored and wants to chat");
                }, 34000);

                setTimeout(function () {
                    session.sendTyping();

                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "131.gif"));
                    session.send(msg);
                }, 40000);

                setTimeout(function () {
                    session.sendTyping();
                    next();
                }, 45000);
            }
        } else {
            next();
        }

    }, function (session, result) {
        builder.Prompts.choice(session, "After the call, you get a knock on your door. It's your friend, Brian. He's bored and wants to chat", "Dish with Brian|Go Away Bri Bri", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Dish with Brian') {
                DropSomeKnowledge = true;
                session.endDialog();
                session.beginDialog("DishwithBrian");
            } else {
                DropSomeKnowledge = false;
                session.endDialog();
                session.beginDialog("GoAwayBriBri");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("DropSomeKnowledge");
        }
    }
])

var GoAwayBriBri = true;

bot.dialog("GoAwayBriBri", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("Unfortunately, Brian won't go away that easily. He starts singing to you from outside the door");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("Ugh. Bri Bri.  He's annoying, but you love him 💗 so you let him in");
        }, 6000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 13000);

    }, function (session, result) {
        session.endDialog();
        DishwithBrian = true;
        session.beginDialog("DishwithBrian");
    }
])

var DishwithBrian = true;
bot.dialog("DishwithBrian", [
    function (session, result, next) {
        if (DishwithBrian) {
            setTimeout(function () {
                session.sendTyping();
                session.send("After a few minutes, Brian starts bragging about how the men's baseball team just got lights on their field. He's right– it's 9 PM and you can see them from your dorm room 💡💡💡");
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "133.gif"));
                session.send(msg);


            }, 4000);

            /*setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "133.gif"));
                session.send(msg);
            }, 6000);*/

            setTimeout(function () {
                session.sendTyping();
                session.send("Woah, woah, woah, hold on. You KNOW that the women's softball team doesn't have lights. Plus, it's two miles from school!!");
            }, 8000);

            setTimeout(function () {
                session.sendTyping();
                session.send("The men's facility is clearly right on campus.");
            }, 12000);

            setTimeout(function () {
                session.sendTyping();
                session.send("This doesn't feel right. Which means it's time to play...");
            }, 15000);

            setTimeout(function () {


                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "138.gif"));
                session.send(msg);
            }, 19000);

            setTimeout(function () {
                session.sendTyping();
                session.send("You're thinking about about getting night vision goggles for your field, and the men's team just got NEW 💡");
            }, 21000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "144.gif"));
                session.send(msg);
            }, 23000);

            setTimeout(function () {
                session.sendTyping();
                next();
            }, 26000);
        } else {
            next();
        }

    }, function (session, result) {
        builder.Prompts.choice(session, "What do you think? Does this situation seem A-okay, or totally out of bounds?", "Fair|Foul", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Foul') {
                DishwithBrian = true;
                externalFair = true;
                session.endDialog();
                session.beginDialog("Foul");
            } else {
                DishwithBrian = false;
                session.endDialog();
                session.beginDialog("externalFair");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("DishwithBrian");
        }
    }
])

var externalFair = true;
bot.dialog("externalFair", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("I like your positive outlook! 🙌");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("But actually, under Title IX, male and female athletic teams have a right to the same level of facilities. It's good to keep this kind of thing in check. 👀");
        }, 3000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 6000);

    }, function (session, result) {
        session.endDialog();
        externalFair = false;
        session.beginDialog("Foul");
    }
]);

var Foul = true;
bot.dialog("Foul", [
    function (session, result, next) {
        if (Foul) {
            if (externalFair) {
                setTimeout(function () {
                    session.sendTyping();
                    session.send("*Virtual high five.* Nailed it!");
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Under Title IX, male and female athletic teams have a right to the same level of facilities. It's good to keep this kind of thing in check");
                }, 6000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("While the situation might seem small, it could be a sign that the men's and women's teams have unequal resources overall. And that's no good 👎🏽");
                }, 14000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("But wait! Plot twist!");
                }, 16000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "149.gif"));
                    session.send(msg);
                }, 20000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("After some more research, you realize that the women's soccer team has lights and stadium seating. The men's soccer team doesn't even exist!");
                }, 24000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Since Title IX requires schools to take their full athletic program into account, yours might actually be in compliance. Remember– you can't just compare baseball and softball 😕");
                }, 31000);

                setTimeout(function () {
                    session.sendTyping();
                    next();
                }, 34000);

            } else {

                setTimeout(function () {
                    session.sendTyping();
                    session.send("While the situation might seem small, it could be a sign that the men's and women's teams have unequal resources overall. And that's no good 👎🏽");
                }, 0);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("But wait! Plot twist!");
                }, 4000);

                setTimeout(function () {
                    session.sendTyping();
                    var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "149.gif"));
                    session.send(msg);
                }, 8000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("After some more research, you realize that the women's soccer team has lights and stadium seating. The men's soccer team doesn't even exist!");
                }, 12000);

                setTimeout(function () {
                    session.sendTyping();
                    session.send("Since Title IX requires schools to take their full athletic program into account, yours might actually be in compliance. Remember– you can't just compare baseball and softball 😕");
                }, 16000);

                setTimeout(function () {
                    session.sendTyping();
                    next();
                }, 20000);

            }

        } else {
            next();
        }
    }, function (session, result) {
        builder.Prompts.choice(session, "With all the details, how does this situation seem now? Fair or foul?", "Fair|Foul", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Fair') {
                session.endDialog();
                externalFoul = true;
                session.beginDialog("Fair");
            } else {
                Foul = false;
                session.endDialog();
                session.beginDialog("externalFoul");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Foul");
        }
    }
])

var externalFoul = true;
bot.dialog("externalFoul", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            session.send("Hmm... those lights are really nice. But when you look at the whole picture, it seems like the men and women's teams have equal resources");
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 6000);


    }, function (session, result) {
        session.endDialog();
        externalFoul = false;
        Fair = true;
        session.beginDialog("Fair");

    }
]);
var Fair = true;
bot.dialog("Fair", [
    function (session, result, next) {

        if (Fair) {
            if (externalFoul) {
                setTimeout(function () {
                    session.sendTyping();
                    session.send("You got it! Now that you have all the facts, it's clear that the teams actually have equal resources ");
                }, 0);

            }

            setTimeout(function () {
                session.sendTyping();
                session.send("There are 11 ways that schools need to ensure that their athletic program is equitable.  It would make a nice graphic, but the perfect infographic doesn't exi-");
            }, 2000);

            setTimeout(function () {
                session.sendTyping();
                // var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "157.jpg"));
                session.send(createImageCardWithV3(session, "157.png"));
            }, 8000);

            setTimeout(function () {
                session.sendTyping();
                session.send("If any of these things happen to you IRL, know that you can talk to the athletic department or file a complaint");
            }, 13000);
            setTimeout(function () {
                session.sendTyping();
                session.send("Often times solutions to issues are found internally, and may not need to be escalated, but these resouces are available to you 💻");
            }, 18000);
            setTimeout(function () {
                session.sendTyping();
                session.send("A week later, your sister comes for a visit. She wants to check out a SAAC meeting, try your fancy training room, and oogle some cute college boys 😉");
            }, 23000);

            setTimeout(function () {
                next();
            }, 28000);

        } else {
            next();
        }
    }, function (session, result) {
        builder.Prompts.choice(session, "Want to take sis to the Taco Tuesday Extravaganza or show her the Bibilioteca?", "Taco Tuesday|Library", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result, next) {
        if (result.response != undefined) {
            if (result.response.entity === 'Taco Tuesday') {
                Fair = true;
                next();
            } else {
                Fair = false;
                session.endDialog();
                session.beginDialog("Library");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Fair");
        }
    }, function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "162b.gif"));
            session.send(msg);


        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("We don't even need to tacobout how great tacos are.  ");
        }, 3000);



        setTimeout(function () {
            session.sendTyping();
            session.send("... Sorry about that. Anyways, after some well-deserved taco deliciousness, you take your lil' sis on a tour of the athletic facilities");
        }, 6000);

        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "163.gif"));
            session.send(msg);
        }, 9000);

        setTimeout(function () {
            next();
        }, 13000);

    }, function (session, result) {
        session.endDialog();
        session.beginDialog("TacoTuesday");
    }
]);

var Library = true;
bot.dialog("Library", [
    function (session, result, next) {
        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "162.gif"));
            session.send(msg);
        }, 0);

        setTimeout(function () {
            session.sendTyping();
            session.send("You make fun of your sister, just a lil' bit, for choosing the nerdier option ");
        }, 3000);

        setTimeout(function () {
            session.sendTyping();
            var msg = createImageCard(session, "116.png");
            session.send("Of course, she ends up flirting with one of the cutest guys on campus... and gets his number. She schooled you 💑📚");
        }, 7000);

        setTimeout(function () {
            session.sendTyping();
            session.send("Schooled you....get it?  ");
        }, 9000);
        setTimeout(function () {
            session.sendTyping();
            session.send("... Sorry about that. Anyways, after gettin' your learning on, you take your sister on a tour of the athletic facilities");
        }, 15000);
        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "163.gif"));
            session.send(msg);
            //http://winjitstaging.cloudapp.net/botimages/SkilledV3/163.gif
        }, 20000);
        setTimeout(function () {
            session.sendTyping();
            next();
        }, 25000);

    }, function (session, result) {
        session.endDialog();
        TacoTuesday = true;
        session.beginDialog("TacoTuesday");
    }
]);

var TacoTuesday = true;
bot.dialog("TacoTuesday", [
    function (session, result, next) {
        if (TacoTuesday) {
            setTimeout(function () {
                session.sendTyping();
                session.send("In the training room, your sister asks some athletes if they ever experienced unfair treatment in high school sports");
            }, 0);



            setTimeout(function () {
                session.sendTyping();
                session.send("You're proud of her for asking for advice! 💞 Little did you know, that's when the story floodgates would open: ");
            }, 5000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "168.gif"));
                session.send(msg);
            }, 10000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Morgan says that her swim team had to throw bake sales to fundraise... but the men's team was sponsored by a restaurant.");
            }, 15000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Sarah claims she can beat that. Her fencing team had to fit eight girls into one car. And then drive for THREE hours to a tournament in a beat up VW. But the men's team? They had a Luxury bus paid for 👎🏽  💰");
            }, 20000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCardWithV3(session, "170 (1).gif"));
                session.send(msg);
            }, 25000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Katie says that she can trump everyone. At her school, the women's varsity volleyball team got the biology teacher as their coach– and he never even played the sport before. Meanwhile, the men's coach had ten years of experience 😶");
            }, 30000);

            setTimeout(function () {
                // session.sendTyping();
                next();
            }, 40000);

        } else {
            next();
        }
    }, function (session, result) {
        builder.Prompts.choice(session, "That's 🍌🍌🍌🍌 !!! What do you think Katie did? .", "Switch sports|Protest|Egg the coach's house", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });

    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Protest') {
                TacoTuesday = true;
                session.endDialog();
                session.beginDialog("Protest");
            } else if (result.response.entity === 'Switch sports') {
                TacoTuesday = false;
                session.endDialog();
                session.beginDialog("SwitchSports");
            } else {
                TacoTuesday = false;
                session.endDialog();
                session.beginDialog("EggTheCoachsHouse");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("TacoTuesday");
        }
    }

]);

var SwitchSports = true;
bot.dialog("SwitchSports", [
    function (session, result, next) {
        builder.Prompts.choice(session, "What's that saying? When the going get's tough, the tough change sports? C'mon, Katie's stronger than that! 💪🏽 Want to try again?", "Protest", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });

    }, function (session, result) {
        session.endDialog();
        session.beginDialog("Protest");
    }

]);

var EggTheCoachsHouse = true;
bot.dialog("EggTheCoachsHouse", [
    function (session, result, next) {

        setTimeout(function () {
            session.sendTyping();
            session.send("No way? Yes Way!!! She totally did.");
        }, 0);
        setTimeout(function () {
            session.sendTyping();
            var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "174D.gif"));
            session.send(msg);
        }, 3000);

        setTimeout(function () {
            session.sendTyping();
            session.send("She rolled up to coach's place, eggs in tow. But right when she got out of the car... she heard a noise!");
        }, 6000);

        setTimeout(function () {
            session.sendTyping();
            session.send("It was her coach.... singing a Beyonce song! 😂");
        }, 10000);
        setTimeout(function () {
            session.sendTyping();
            session.send("Coach couldn't hit those high notes like Bey, and that was punishment enough  #dying");
        }, 12000);

        setTimeout(function () {
            session.sendTyping();
            next();
        }, 17000);

    }, function (session, result) {
        builder.Prompts.choice(session, "After she showed mercy in the great egg wars of 2016 , what do you think Katie did?", "Protest", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    }, function (session, result) {
        session.endDialog();
        session.beginDialog('Protest');
    }

]);

var Protest = true;
bot.dialog("Protest", [
    function (session, result, next) {
        if (Protest) {

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "170.gif"));
                session.send(msg);
            }, 0);

            setTimeout(function () {
                session.sendTyping();
                session.send("That's right!! Katie's team– and their families– initiailly tried to address the issues with the school. When they got nowhere, they decided to go all in. We're talking press conferences, editorials, and letters 🙅🏽🙅🏻🙅");
            }, 4000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Katie knew that the protests wouldn't change anything for her senior year. However, her actions helped the next class of female athletes at her school");
            }, 10000);

            setTimeout(function () {
                session.sendTyping();
                session.send("It was an investment– and it worked. The school eventually allocated the funds to improve the quality of the coaching staff for many of the girls' programs. 🔥 🔥 🎉 🎉");
            }, 15000);

            setTimeout(function () {
                session.sendTyping();
                session.send("After that chat, your sister's mind. Is. Blown.");
            }, 20000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "183.gif"));
                session.send(msg);
            }, 22000);

            setTimeout(function () {
                session.sendTyping();
                session.send("She's already Facetiming her teammates about Title IX when you drop her off at the bus station");
            }, 28000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Of course, you don't let her leave without giving her a hug. And a big smooch, just to embarrass her 😘 👯 😳 🚈");
            }, 37000);

            setTimeout(function () {
                session.sendTyping();
                session.send("You dealt with a lot this week– funding fights, scholarship drama, and trainer trouble. Of course, you handled it all like a champ. Plus, you still took the time to be a great sister 🌟");
            }, 39000);

            setTimeout(function () {
                session.sendTyping();
                session.send("Remember, Title IX was enacted to ensure equality in education and has done a lot to level the athletic field. You deserve fair treatment because you're an amazing " + session.userData.sportName + " athlete at " + session.userData.schoolName + ", your friends would you describe you as " + session.userData.friendsDescription + ", OH, and you're a human being ✨✨✨");
            }, 42000);



            setTimeout(function () {
                session.sendTyping();
                session.send("Now that you've finished one of the four avatars, Your status has been raised from bronze to Silver Status  You're moving up in the world.  Pretty soon, they'll be shooting a documentary on your accomplishments. #theyseemeshining.");

            }, 45000);

            setTimeout(function () {
                session.sendTyping();
                var msg = new builder.Message(session).addAttachment(createAnimationCard(session, "184.gif"));
                session.send(msg);
            }, 49000);

            setTimeout(function () {
                session.sendTyping();
                next();
            }, 54000);
        } else {
            next();
        }

    }, function (session, result) {
        setTimeout(function () {
            session.sendTyping();
            session.send("For being such an All Star and finishing your first character, you've unlocked this special message from Laila Ali. Enjoy");
            var msg = new builder.Message(session).addAttachment(createVideoCard(session));
            session.send(msg);
        }, 0);

        setTimeout(function () {
            // builder.Prompts.choice(session, "Keep playing to learn more about your rights under Title IX, and to unlock exclusive content from WSF and some of your favorite athletes.", "Outtie for now|Keep playing|Main menu", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
            //next();
            builder.Prompts.choice(session, "Laila Ali Message Unlocked", "Outtie for now|Keep playing|Main menu", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
        }, 7000);




    }, function (session, result) {
        if (result.response != undefined) {
            if (result.response.entity === 'Outtie for now') {
                // session.endDialog("Awesome! By learning about your rights, you're empowering yourself to make better decisions when you encounter a tough situation. Great job! See you soon. 😃🔥👏🏼💥💯🎖🎗⚾️🎾🏐🏉🎱⛳️🙃");
                session.endDialog();
                session.beginDialog("OuttieForNow");
            } else {
                Protest = false;
                session.endDialog(notAvailableForDemo);
                session.beginDialog("Protest");
            }
        } else {
            session.endDialog(notAvailableForDemo);
            session.beginDialog("Protest");
        }
    }
]);

bot.dialog("OuttieForNow", [
    function (session, result) {
        //builder.Prompts.text(session, "");
        builder.Prompts.choice(session,
            "Submit your email for announcement about Title IX updates, new athlete content, and to be eligable for contests and giveaways",
            "Submit|Nopes", { listStyle: btnstyle, maxRetries: 3, retryPrompt: "Please choose another option" });
    },
    function (session, result) {
        if (result.response.entity === 'Submit') {
            builder.Prompts.text(session, "Please provide your email");
        }
        else {
            session.sendTyping();
            session.endDialog("Awesome! By learning about your rights, you're empowering yourself to make better decisions when you encounter a tough situation. Great job! To start over, you can type in Menu or Start Over.  See you soon. 😃🔥👏🏼💥💯🎖🎗⚾️🎾🏐🏉🎱⛳️🙃");
        }
    }, function (session, result) {
        if (result.response != undefined) {

            var emailId = result.response;
            session.sendTyping();
            session.endDialog("Awesome! By learning about your rights, you're empowering yourself to make better decisions when you encounter a tough situation. Great job! To start over, you can type in Menu or Start Over.  See you soon. 😃🔥👏🏼💥💯🎖🎗⚾️🎾🏐🏉🎱⛳️🙃");
            session.sendTyping();
            var msg = createImageCard(session, "91.png");
            session.send(msg);
        }
    }
]);





var apiai = require("apiai");

var app = apiai("017e9429ac2c4f1d977c862f7645634b");

var options = {
    sessionId: '12345'
}

function callSmallTalkApi(session, msg) {
    var request = app.textRequest(msg, options);

    request.on('response', function (response) {
        console.log(response.result.fulfillment.speech);
        session.endDialog(response.result.fulfillment.speech);

    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
}






function createAnimationCard(session, url) {
    var imageUrl = "http://winjitstaging.cloudapp.net/botimages/SkilledV2/" + url;
    return new builder.AnimationCard(session)
        // .title('BotFramework Hero Card')
        // .subtitle('Your bots — wherever your users are talking')
        // .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
        .media([{
            profile: 'gif',
            url: imageUrl
        }])
}

function createAnimationCardWithV3(session, url) {
    var imageUrl = "http://winjitstaging.cloudapp.net/botimages/SkilledV3/" + url;
    return new builder.AnimationCard(session)
        // .title('BotFramework Hero Card')
        // .subtitle('Your bots — wherever your users are talking')
        // .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
        .media([{
            profile: 'gif',
            url: imageUrl
        }])
}




//session.send(createImageCard(session, message));
function createImageCard(session, url) {
    var imageUrl = "http://winjitstaging.cloudapp.net/botimages/SkilledV2/" + url;
    return msg = new builder.Message(session)
        .attachments([{
            contentType: "image/jpeg",
            contentUrl: imageUrl
        }]);

}

/**
 * New images added for version 3
 * @param {} session 
 * @param {*} url 
 */
function createImageCardWithV3(session, url) {
    var imageUrl = "http://winjitstaging.cloudapp.net/botimages/SkilledV3/" + url;
    return msg = new builder.Message(session)
        .attachments([{
            contentType: "image/jpeg",
            contentUrl: imageUrl
        }]);

}

function createVideoCard(session) {
    var imageUrl = "http://winjitstaging.cloudapp.net/botimages/SkilledV3/VideoToPlay.mp4";
    return new builder.VideoCard(session)
        .title('Title IX')
        .subtitle('Keep playing to learn more about your rights under Title IX')
        .text('To unlock exclusive content from WSF and some of your favorite athletes.')
        .media([{ url: imageUrl }])
}