import {validateCustomTimeformat, validateFlairConfig} from "../src/handlers.js";
import * as validTestConfig from "./validtestconfig.json";

describe("validateFlairConfig", () => {
    test("validateFlairConfig should return nothing for a valid config", async () => {
        expect(await validateFlairConfig({value: JSON.stringify(validTestConfig["default"]), isEditing: false})).toBeUndefined();
    });
    test("validateFlairConfig should return nothing for an empty array", async () => {
        expect(await validateFlairConfig({value: "[]", isEditing: false})).toBeUndefined();
    });
    test("validateFlairConfig should return a string for an empty config", async () => {
        expect(await validateFlairConfig({value: "", isEditing: false})).toBeTypeOf("string");
    });
    test("validateFlairConfig should return a string for invalid JSON", async () => {
        expect(await validateFlairConfig({value: "][23[123;2'1]]2140-112)9(){}213.sd/3", isEditing: false})).toBeTypeOf("string");
    });
    test("validateFlairConfig should return a string for no templateId in config entry", async () => {
        expect(await validateFlairConfig({value: "[{}]", isEditing: false})).toBeTypeOf("string");
    });
});

test("validateCustomTimeformat should return nothing for a valid timeformat", async () => {
    expect(await validateCustomTimeformat({value: "yyyy-MM-dd HH:mm:ss", isEditing: false})).toBeUndefined();
});
