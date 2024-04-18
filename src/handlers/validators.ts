import {SettingsFormFieldValidatorEvent} from "@devvit/public-api";
import AjvModule from "ajv";
import {FlairEntries} from "../schema/types.js";
import {flairEntriesSchema} from "../schema/schema.js";
import {ERRORS} from "../constants.js";

const ajv = new AjvModule.default();
export const validateFlairEntriesSchema = ajv.compile(flairEntriesSchema);

export async function validateFlairConfig (event: SettingsFormFieldValidatorEvent<string>) {
    const config = event.value?.toString();
    try {
        const valid = validateFlairEntriesSchema(JSON.parse(config?.toString() ?? "") as FlairEntries);
        if (!valid) {
            return ERRORS.INVALID_SCHEMA;
        }
    } catch (e) {
        return ERRORS.INVALID_JSON;
    }
}
