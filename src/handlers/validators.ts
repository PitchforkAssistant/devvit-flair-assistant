import {SettingsFormFieldValidatorEvent} from "@devvit/public-api";
import AjvModule from "ajv";
import {FlairEntries} from "../types.js";
import {flairEntriesSchema} from "../schema.js";
import {getLocaleFromString, safeTimeformat} from "../helpers/dateHelpers.js";
import {ERRORS} from "../constants.js";
import {getTimezoneOffset} from "date-fns-tz";
import {enUS} from "date-fns/locale";

const ajv = new AjvModule.default();
export const validateFlairEntriesSchema = ajv.compile(flairEntriesSchema);

export async function validateFlairConfig (event: SettingsFormFieldValidatorEvent<string>) {
    const config = event?.value?.toString();
    try {
        const valid = validateFlairEntriesSchema(JSON.parse(config?.toString() ?? "") as FlairEntries);
        if (!valid) {
            return ERRORS.INVALID_SCHEMA;
        }
    } catch (e) {
        return ERRORS.INVALID_JSON;
    }
}

export async function validateActionDebounce (event: SettingsFormFieldValidatorEvent<number>) {
    const actionDebounce = Number(event?.value);
    if (isNaN(actionDebounce) || actionDebounce < 0) {
        return ERRORS.INVALID_ACTION_DEBOUNCE;
    }
}

export async function validateCustomDateTemplate (event: SettingsFormFieldValidatorEvent<string>) {
    if (!safeTimeformat(new Date(), event?.value?.toString() ?? "", "UTC", enUS)) {
        return ERRORS.INVALID_TIMEFORMAT;
    }
}

export async function validateCustomTimezone (event: SettingsFormFieldValidatorEvent<string>) {
    if (isNaN(getTimezoneOffset(event?.value?.toString() ?? ""))) {
        return ERRORS.INVALID_TIMEZONE;
    }
}

export async function validateCustomLocale (event: SettingsFormFieldValidatorEvent<string>) {
    if (!getLocaleFromString(event?.value?.toString() ?? "")) {
        return ERRORS.INVALID_LOCALE;
    }
}
