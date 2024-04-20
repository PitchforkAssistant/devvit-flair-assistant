import {SettingsClient} from "@devvit/public-api";
import {FlairEntries} from "./schema/types.js";
import {CustomDateformat, getLocaleFromString, isCustomDateformat} from "devvit-helpers";
import {validateFlairEntriesSchema} from "./handlers/validators.js";
import {DEFAULTS} from "./constants.js";

export type RawFlairAppSettings = {
    headerTemplate?: string;
    footerTemplate?: string;
    flairConfig?: string;
    actionDebounce?: number;
    customDateTemplate?: string;
    customTimezone?: string;
    customLocale?: string;
}

export type FlairAppSettings = {
    headerTemplate: string;
    footerTemplate: string;
    flairConfig: FlairEntries;
    actionDebounce: number;
    customDateformat: CustomDateformat;
}

export async function getFlairAppSettings (settings: SettingsClient): Promise<FlairAppSettings> {
    const rawSettings = await settings.getAll<RawFlairAppSettings>();

    const flairConfig = JSON.parse(rawSettings.flairConfig?.toString() ?? "") as FlairEntries;
    if (!validateFlairEntriesSchema(flairConfig)) {
        throw new Error(`Invalid flair config: ${JSON.stringify(flairConfig)}`);
    }

    const customDateformat: Partial<CustomDateformat> = {
        dateformat: rawSettings.customDateTemplate ?? "YYYY-MM-DD",
        timezone: rawSettings.customTimezone ?? "UTC",
        locale: getLocaleFromString(rawSettings.customLocale ?? "en"),
    };
    if (!isCustomDateformat(customDateformat)) {
        throw new Error(`Invalid custom dateformat: ${JSON.stringify(customDateformat)}`);
    }

    return {
        headerTemplate: rawSettings.headerTemplate ?? "",
        footerTemplate: rawSettings.footerTemplate ?? "",
        flairConfig,
        actionDebounce: rawSettings.actionDebounce ?? DEFAULTS.ACTION_DEBOUNCE,
        customDateformat,
    };
}
