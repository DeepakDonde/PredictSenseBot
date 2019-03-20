module.exports = {

    HTTP_PORT: 3000,
    HTTPS_PORT: 443,

    CONVEE: {
        BOT_ID: "5c8a1b144565006ba3a95286",
        USER_ID: "5bd16aacae55ddb9c224e42b",
        SERVER_URL: "https://convee.ai:1992",
        BOT_HOST:"https://predictsensebot.azurewebsites.net"
    },
    ADAPTER: {
        FACEBOOK: {
            ENABLED: true,
            MESSENGER_WEBHOOK:"/fb_webhook",
            MESSENGER_APP_ID: "413262699438631",
            MESSENGER_ACCESS_TOKEN:"EAAF33DhmIicBANXoPOdGJZC3cuBW4Y4jgSYS3pIEFcq91oUe4GwcJElAyMTWgGDMlbzUdzojIbRW4kL8LKolRjfVQ0OA5d9EyMPBGiiPDO9CFQUbj76B64L51LuvQngKllBgFYLLE6vytmhi1r9UemhY1XI2O5MA9ooZAwsgZDZD",
            MESSENGER_APP_SECRET: "e4fdb8305dd31dec88959eb83ba9e42c",
            MESSENGER_VERIFY_TOKEN: "convee_adapter"
        },

        TELEGRAM:{
            ENABLED: false,
            MESSENGER_WEBHOOK:"/tg_webhook",
            TOKEN:""
        },

        ALEXA: {
            ENABLED: true,
            SKILL_ID: "amzn1.ask.skill.06053975-77bc-42d0-9393-6853a0da2583",
            ALEXA_WEBHOOK: "/alexa_adapter"
        }

    }

}