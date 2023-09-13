import {ERRORS} from "../src/constants.js";
import {validateFlairConfig} from "../src/handlers/validators.js";
import * as validTestConfig from "./validtestconfig.json";

describe("validateFlairConfig", () => {
    test("validateFlairConfig should return nothing for a valid config", async () => {
        expect(await validateFlairConfig({value: JSON.stringify(validTestConfig.default), isEditing: false})).toBeUndefined();
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
