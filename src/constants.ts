export const DEFAULT_HEADER_TEMPLATE = "Hi {{author}}! Thanks for posting to /r/{{subreddit}}. Unfortunately, [your {{kind}}]({{permalink}}) was removed for the following reason:";

export const DEFAULT_FOOTER_TEMPLATE = "If you have questions about this, please [contact our mods via moderator mail](https://www.reddit.com/message/compose?to={{subreddit}}) rather than replying here. Thank you!";

export const DEFAULT_CUSTOM_TIMEFORMAT = "yyyy-MM-dd hh-mm-ss";

export const DEFAULT_ACTION_DEBOUNCE = 10;

export const DEFAULT_FLAIR_CONFIG = "[]";

export const SCHEMA_VALIDATOR_URL = "https://www.jsonschemavalidator.net/s/bq0mGGhP";

export const ERROR_INVALID_JSON = "Failed to parse JSON, the syntax is likely invalid.";

export const ERROR_INVALID_SCHEMA = `Failed to validate against config schema, try it at: ${SCHEMA_VALIDATOR_URL}`;

export const ERROR_INVALID_TIMEFORMAT = "Invalid timeformat, see: https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table";

export const ERROR_INVALID_ACTION_DEBOUNCE = "Action debounce must be a positive number.";
