import {Devvit} from "@devvit/public-api";
import {handleFlairUpdate, validateActionDebounce, validateCustomTimeformat, validateFlairConfig} from "./handlers.js";
import {DEFAULT_ACTION_DEBOUNCE, DEFAULT_CUSTOM_TIMEFORMAT, DEFAULT_FLAIR_CONFIG, DEFAULT_FOOTER_TEMPLATE, DEFAULT_HEADER_TEMPLATE} from "./constants.js";

Devvit.configure({
    redditAPI: true,
});

Devvit.addSettings([
    {
        type: "paragraph",
        name: "headerTemplate",
        defaultValue: DEFAULT_HEADER_TEMPLATE,
        label: "Enter your header template:",
    },
    {
        type: "paragraph",
        name: "footerTemplate",
        defaultValue: DEFAULT_FOOTER_TEMPLATE,
        label: "Enter your footer template:",
    },
    {
        type: "string",
        name: "customTimeformat",
        defaultValue: DEFAULT_CUSTOM_TIMEFORMAT,
        label: "Enter your custom timeformat:",
        onValidate: validateCustomTimeformat,
    },
    {
        type: "number",
        name: "actionDebounce",
        defaultValue: DEFAULT_ACTION_DEBOUNCE,
        label: "Skip certain actions if they were already performed in the last X seconds:",
        onValidate: validateActionDebounce,
    },
    {
        type: "paragraph",
        name: "flairConfig",
        defaultValue: DEFAULT_FLAIR_CONFIG,
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
