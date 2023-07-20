import {Devvit} from "@devvit/public-api";
import {handleFlairUpdate, validateCustomTimeformat, validateFlairConfig} from "./handlers.js";

Devvit.configure({
    redditAPI: true,
});

Devvit.addSettings([
    {
        type: "paragraph",
        name: "headerTemplate",
        defaultValue: "Hi {{author}}! Thanks for posting to /r/{{subreddit}}. Unfortunately, [your {{kind}}]({{permalink}}) was removed for the following reason:",
        label: "Enter your header template:",
    },
    {
        type: "paragraph",
        name: "footerTemplate",
        defaultValue: "If you have questions about this, please [contact our mods via moderator mail](https://www.reddit.com/message/compose?to={{subreddit}}) rather than replying here. Thank you!",
        label: "Enter your footer template:",
    },
    {
        type: "string",
        name: "customTimeformat",
        defaultValue: "yyyy-mm-dd hh-mm-ss",
        label: "Enter your custom timeformat:",
        onValidate: validateCustomTimeformat,
    },
    {
        type: "paragraph",
        name: "flairConfig",
        defaultValue: "[]",
        label: "Enter your flair config as raw JSON:",
        onValidate: validateFlairConfig,
    },
]);

Devvit.addTrigger({
    event: "ModAction",
    onEvent: async (event, context) => {
        if (event.action !== "editflair") {
            return;
        }
        if (event.targetPost?.linkFlair?.templateId) {
            await handleFlairUpdate(context, event);
        }
    },
});

export default Devvit;
