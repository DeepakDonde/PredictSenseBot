module.exports = {

    HTTP_PORT: 3000,
    HTTPS_PORT: 443,

    CONVEE: {
        BOT_ID: process.env.BOT_ID,
        USER_ID: process.env.USER_ID,
        SERVER_URL: process.env.SERVER_URL,
        BOT_HOST:"https://"+process.env.BOT_NAME+".herokuapp.com/"
    },
    ADAPTER: {
        FACEBOOK: {
            ENABLED: process.env.FACEBOOK_ENABLED,
            MESSENGER_WEBHOOK:"/fb_webhook",
            MESSENGER_APP_ID: process.env.MESSENGER_APP_ID,
            MESSENGER_ACCESS_TOKEN:process.env.MESSENGER_ACCESS_TOKEN,
            MESSENGER_APP_SECRET: process.env.MESSENGER_APP_SECRET,
            MESSENGER_VERIFY_TOKEN: "convee_adapter"
        },

        TELEGRAM:{
            ENABLED: process.env.TELEGRAM_ENABLED,
            MESSENGER_WEBHOOK:"/tg_webhook",
            TOKEN:process.env.TELEGRAM_TOKEN
        },

        ALEXA: {
            ENABLED: process.env.ALEXA_ENABLED,
            SKILL_ID: process.env.ALEXA_SKILL_ID,
            ALEXA_WEBHOOK: "/alexa_adapter"
        }

    }

}