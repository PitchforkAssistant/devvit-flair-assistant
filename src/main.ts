import {Devvit, SettingScope} from "@devvit/public-api";
import {handleFlairUpdate} from "./handlers/events.js";
import {validateFlairConfig} from "./handlers/validators.js";
import {LABELS, HELP_TEXT, DEFAULTS} from "./constants.js";
import {LOCALE_OPTIONS, validateCustomDateformat, validateCustomLocale, validateCustomTimezone, validateMultiple, validateNumber, validatePositive} from "devvit-helpers";

Devvit.configure({
    redditAPI: true,
});

Devvit.addSettings([
    {
        type: "paragraph",
        name: "headerTemplate",
        defaultValue: DEFAULTS.HEADER_TEMPLATE,
        label: LABELS.HEADER_TEMPLATE,
        scope: SettingScope.Installation,
    },
    {
        type: "paragraph",
        name: "footerTemplate",
        defaultValue: DEFAULTS.FOOTER_TEMPLATE,
        label: LABELS.FOOTER_TEMPLATE,
        scope: SettingScope.Installation,
    },
    {
        type: "paragraph",
        name: "flairConfig",
        defaultValue: DEFAULTS.FLAIR_CONFIG,
        label: LABELS.FLAIR_CONFIG,
        helpText: HELP_TEXT.FLAIR_CONFIG,
        scope: SettingScope.Installation,
        onValidate: validateFlairConfig,
    },
    {
        type: "number",
        name: "actionDebounce",
        defaultValue: DEFAULTS.ACTION_DEBOUNCE,
        label: LABELS.ACTION_DEBOUNCE,
        scope: SettingScope.Installation,
        onValidate: async (event, context) => validateMultiple<number>([validateNumber, validatePositive], event, context),
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
                scope: SettingScope.Installation,
                onValidate: validateCustomDateformat,
            },
            {
                type: "string",
                name: "customTimezone",
                defaultValue: DEFAULTS.CUSTOM_TIMEZONE,
                label: LABELS.CUSTOM_TIMEZONE,
                scope: SettingScope.Installation,
                onValidate: validateCustomTimezone,
            },
            {
                type: "select",
                name: "customLocale",
                defaultValue: DEFAULTS.CUSTOM_LOCALE,
                label: LABELS.CUSTOM_LOCALE,
                options: LOCALE_OPTIONS,
                multiSelect: false,
                scope: SettingScope.Installation,
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
            await handleFlairUpdate(event, context);
        }
    },
});

export default Devvit;
