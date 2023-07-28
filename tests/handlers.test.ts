import {ERRORS} from "../src/constants.js";
import {validateCustomLocale, validateCustomDateTemplate, validateCustomTimezone, validateFlairConfig} from "../src/handlers.js";
import * as validTestConfig from "./validtestconfig.json";

describe("validateFlairConfig", () => {
    test("validateFlairConfig should return nothing for a valid config", async () => {
        expect(await validateFlairConfig({value: JSON.stringify(validTestConfig["default"]), isEditing: false})).toBeUndefined();
    });
    test("validateFlairConfig should return nothing for an empty array", async () => {
        expect(await validateFlairConfig({value: "[]", isEditing: false})).toBeUndefined();
    });
    test("validateFlairConfig should return a string for an empty config", async () => {
        expect(await validateFlairConfig({value: "", isEditing: false})).toEqual(ERRORS.INVALID_JSON);
    });
    test("validateFlairConfig should return a string for invalid JSON", async () => {
        expect(await validateFlairConfig({value: "][23[123;2'1]]2140-112)9(){}213.sd/3", isEditing: false})).toEqual(ERRORS.INVALID_JSON);
    });
    test("validateFlairConfig should return a string for no templateId in config entry", async () => {
        expect(await validateFlairConfig({value: "[{}]", isEditing: false})).toEqual(ERRORS.INVALID_SCHEMA);
    });
});

test("validateCustomTimeformat should return nothing for a valid timeformat", async () => {
    expect(await validateCustomDateTemplate({value: "yyyy-MM-dd HH:mm:ss", isEditing: false})).toBeUndefined();
});

describe("validateCustomTimezone", () => {
    test.each([
        "+02:00",
        "-07:00",
        "+00:15",
        "America/New_York",
        "Europe/London",
    ])("validateCustomTimezone(%s) should return undefined", async input => {
        expect(await validateCustomTimezone({value: input, isEditing: false})).toBeUndefined();
    });

    test.each([
        "00:00",
        "0",
    ])("validateCustomTimezone(%s) should return string", async input => {
        expect(await validateCustomTimezone({value: input, isEditing: false})).toEqual(ERRORS.INVALID_TIMEZONE);
    });
});

describe("validateCustomLocale", () => {
    test.each([
        "enUS",
        "enGB",
        "DE",
    ])("validateCustomLocale(%s) should return undefined", async input => {
        expect(await validateCustomLocale({value: input, isEditing: false})).toBeUndefined();
    });

    test.each([
        "_lib",
        "aww",
    ])("validateCustomLocale(%s) should return string", async input => {
        expect(await validateCustomLocale({value: input, isEditing: false})).toEqual(ERRORS.INVALID_LOCALE);
    });
});
