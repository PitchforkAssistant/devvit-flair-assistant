// Field labels
export const LABELS = {
    HEADER_TEMPLATE: "Header template",
    FOOTER_TEMPLATE: "Footer template",
    FLAIR_CONFIG: "Flair configuration (JSON)",
    ACTION_DEBOUNCE: "Action debounce (seconds)",
    CUSTOM_DATE_GROUP: "Options for custom date placeholders",
    CUSTOM_DATE_TEMPLATE: "Date format template (e.g. yyyy-MM-dd hh-mm-ss)",
    CUSTOM_TIMEZONE: "Timezone offset or identifier (e.g. UTC, +02:00, America/New_York, etc)",
    CUSTOM_LOCALE: "Locale (e.g enUS, de, etc)",
};

// Help labels
export const HELP_TEXT = {
    FLAIR_CONFIG: "Read more: https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_flair_config",
};

// Default values

export const DEFAULTS = {
    HEADER_TEMPLATE: "Hi {{author}}! Thanks for posting to /r/{{subreddit}}. Unfortunately, [your {{kind}}]({{permalink}}) was removed for the following reason:",
    FOOTER_TEMPLATE: "If you have questions about this, please [contact our mods via moderator mail](https://www.reddit.com/message/compose?to={{subreddit}}) rather than replying here. Thank you!",
    FLAIR_CONFIG: "[]",
    ACTION_DEBOUNCE: 10,
    CUSTOM_DATE_TEMPLATE: "yyyy-MM-dd hh-mm-ss",
    CUSTOM_TIMEZONE: "UTC",
    CUSTOM_LOCALE: "enUS",
};

// Links
export const LINKS = {
    SCHEMA_VALIDATOR: "https://www.jsonschemavalidator.net/s/gp4q1VrH",
    TIMEFORMAT: "https://date-fns.org/v2.30.0/docs/format",
};

// Errors
export const ERRORS = {
    INVALID_JSON: "Failed to parse JSON, the syntax is likely invalid.",
    INVALID_SCHEMA: `Failed to validate against config schema, try it at: ${LINKS.SCHEMA_VALIDATOR}`,
    INVALID_ACTION_DEBOUNCE: "Action debounce must be a positive number.",
    INVALID_TIMEFORMAT: `Invalid timeformat, see: ${LINKS.TIMEFORMAT}`,
    INVALID_TIMEZONE: "That is not a valid UTC offset or TZ identifier.",
    INVALID_LOCALE: "That is not a valid locale.",
};
