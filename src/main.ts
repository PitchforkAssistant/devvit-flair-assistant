import {Devvit} from "@devvit/public-api";
import {handleFlairUpdate} from "./handlers/events.js";
import {validateActionDebounce, validateCustomLocale, validateCustomDateTemplate, validateCustomTimezone, validateFlairConfig} from "./handlers/validators.js";
import {LABELS, HELP_TEXT, DEFAULTS} from "./constants.js";

Devvit.configure({
    redditAPI: true,
});

Devvit.addSettings([
    {
        type: "paragraph",
        name: "headerTemplate",
        defaultValue: DEFAULTS.HEADER_TEMPLATE,
        label: LABELS.HEADER_TEMPLATE,
    },
    {
        type: "paragraph",
        name: "footerTemplate",
        defaultValue: DEFAULTS.FOOTER_TEMPLATE,
        label: LABELS.FOOTER_TEMPLATE,
    },
    {
        type: "paragraph",
        name: "flairConfig",
        defaultValue: DEFAULTS.FLAIR_CONFIG,
        label: LABELS.FLAIR_CONFIG,
        helpText: HELP_TEXT.FLAIR_CONFIG,
        onValidate: validateFlairConfig,
    },
    {
        type: "number",
        name: "actionDebounce",
        defaultValue: DEFAULTS.ACTION_DEBOUNCE,
        label: LABELS.ACTION_DEBOUNCE,
        onValidate: validateActionDebounce,
    },
    {
        type: "group",
        label: LABELS.CUSTOM_DATE_GROUP,
        helpText: HELP_TEXT.CUSTOM_DATE_GROUP,
        fields: [
            {
                type: "string",
                name: "customDateTemplate",
                defaultValue: DEFAULTS.CUSTOM_DATE_TEMPLATE,
                label: LABELS.CUSTOM_DATE_TEMPLATE,
                onValidate: validateCustomDateTemplate,
            },
            {
                type: "string",
                name: "customTimezone",
                defaultValue: DEFAULTS.CUSTOM_TIMEZONE,
                label: LABELS.CUSTOM_TIMEZONE,
                onValidate: validateCustomTimezone,
            },
            {
                type: "string",
                name: "customLocale",
                defaultValue: DEFAULTS.CUSTOM_LOCALE,
                label: LABELS.CUSTOM_LOCALE,
                onValidate: validateCustomLocale,
            },
        ],
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
