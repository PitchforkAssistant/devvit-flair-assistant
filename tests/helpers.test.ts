import {de, enUS} from "date-fns/locale";
import {domainFromUrlString, toNumberOrDefault} from "../src/helpers/miscHelpers.js";
import {hasPlaceholders} from "../src/helpers/placeholderHelpers.js";
import {getLocaleFromString, isValidDate, safeTimeformat, getTimeDeltaInSeconds} from "../src/helpers/dateHelpers.js";

// Date object, timeformat, expected output.
test.each([
    [new Date(""), "", "UTC", enUS, ""], // Invalid date with missing timeformat should return empty string.
    [new Date(""), "yyyy-MM-dd HH-mm-ss", "UTC", enUS, ""], // Invalid date with valid timeformat should return empty string.
    [new Date("2021-01-01T00:00:00.000Z"), "", "UTC", enUS, ""], // Valid date with missing timeformat should return empty string.
    [new Date(1494634269000), "", "UTC", enUS, ""], // Timestamp with missing timeformat should return empty string.
    [new Date(1494634269000), "yyyy-MM-dd HH-mm-ss", "UTC", enUS, "2017-05-13 00-11-09"], // Timestamp with valid timeformat should return known string.
    [new Date("2017-05-13T00:11:09.000Z"), "yyyy-MM-dd HH-mm-ss", "UTC", enUS, "2017-05-13 00-11-09"], // Valid known date with valid timeformat should return known string.
    [new Date("2023-06-09T17:44:13.123Z"), "yyyy/'W'w hh-mm-ssa", "UTC", enUS, "2023/W23 05-44-13PM"], // Valid known date with valid timeformat should return known string.
    [new Date("2023-06-09T17:44:13.123Z"), "yyyy/'Q'Q HH-mm-ss.SSS", "UTC", enUS, "2023/Q2 17-44-13.123"], // Valid known date with valid timeformat should return known string.
    [new Date("2017-05-13T00:11:09.000Z"), "yyyy-MM-dd HH-mm-ss", "+10:00", enUS, "2017-05-13 10-11-09"], // Valid known date with valid timeformat and different timezone should return known string.
    [new Date("2017-05-13T00:11:09.000Z"), "yyyy-MM-dd HH-mm-ss", "-07:00", enUS, "2017-05-12 17-11-09"], // Valid known date with valid timeformat and different timezone should return known string.
    [new Date("2017-05-13T00:11:09.000Z"), "yyyy-MM-dd HH-mm-ss", "+02:00", enUS, "2017-05-13 02-11-09"], // Valid known date with valid timeformat and different timezone should return known string.
    [new Date("2017-05-13T00:11:09.000Z"), "yyyy-MM-dd HH-mm-ss", "UTC", enUS, "2017-05-13 00-11-09"], // Valid known date with valid timeformat and different timezone should return known string.
    [new Date("2017-05-13T00:11:09.000Z"), "yyyy-MM-dd HH-mm-ss", "", enUS, "2017-05-13 00-11-09"], // Valid known date with valid timeformat and no timezone should return known UTC string.
])("safeTimeformat(%s, %s, %s, %s) -> %s", (date, timeformat, timezone, locale, expected) => {
    expect(safeTimeformat(date, timeformat, timezone, locale)).toEqual(expected);
});

// URL, expected output.
test.each([
    ["", ""],
    ["not a valid url", ""],
    ["https://i.imgur.com/CykNguI.png", "i.imgur.com"],
    ["https://i.redd.it/pctkxfqn4u9b1.png", "i.redd.it"],
    ["https://github.com/PitchforkAssistant/devvit-flair-assistant", "github.com"],
    ["https://old.reddit.com/r/modnews/comments/6auyq9/reddit_is_procss/", "old.reddit.com"],
    ["https://cdn.discordapp.com/attachments/1122823169997295626/1129349737477320734/image.png", "cdn.discordapp.com"],
])("domainFromUrlString(%s) -> %s", (url, expected) => {
    expect(domainFromUrlString(url)).toEqual(expected);
});

test.each([
    ["", false],
    ["any text", false],
    ["only {{", false],
    ["only }}", false],
    ["single pair {}", false],
    ["a{l{l }over}}}", false],
    ["a{{{{l{l }over}{}", false],
    ["ooo {{anypossibilityofatag}} abcdef", true],
])("hasPlaceholders(%s) -> %s", (input, expected) => {
    expect(hasPlaceholders(input)).toEqual(expected);
});

test.each([
    ["21421", 10, 21421],
    ["any text", 10, 10],
    ["234.4", 10, 234.4],
    ["-2", 10, -2],
    ["43310d", 10, 10],
])("toNumberOrDefault(%s, %s) -> %s", (input, fallback, expected) => {
    expect(toNumberOrDefault(input, fallback)).toEqual(expected);
});

test.each([
    ["enUS", enUS],
    ["ENUS", enUS],
    ["EN-US", enUS],
    ["EN_US", enUS],
    [" -EN_US", enUS],
    ["potato", undefined],
    ["DE", de],
])("getLocaleFromString(%s) -> %s", (input, expected) => {
    expect(getLocaleFromString(input)).toEqual(expected);
});

test.each([
    [new Date(40000), new Date(20000), 20],
    [new Date(""), new Date(20000), Infinity],
    [new Date(""), new Date(""), Infinity],
    [new Date(20000), new Date(""), Infinity],
    [new Date("2023-06-09T17:44:13.123Z"), new Date("2021-01-01T00:00:00.000Z"), 76873453.123],
])("getTimeDeltaInSeconds(%s, %s) -> %s", (dateA, dateB, expected) => {
    expect(getTimeDeltaInSeconds(dateA, dateB)).toEqual(expected);
});

test.each([
    [new Date(1494634269000), true],
    [new Date(40000), true],
    [new Date(""), false],
    [new Date("potato"), false],
    [new Date("2023-06-09T17:44:13.123Z"), true],
])("isValidDate(%s) -> %s", (date, expected) => {
    expect(isValidDate(date)).toEqual(expected);
});

// TODO: Tests for replacePlaceholders, hasPerformedActions, and hasPerformedAction
