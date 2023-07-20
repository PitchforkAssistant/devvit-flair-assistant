import {domainFromUrlString, hasPlaceholders, safeTimeformat} from "../src/helpers.js";

const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000; // Needed to make tests pass in different timezones.

// Date object, timeformat, expected output.
test.each([
    [new Date(""), "", ""], // Invalid date with missing timeformat should return empty string.
    [new Date(""), "yyyy-MM-dd HH-mm-ss", ""], // Invalid date with valid timeformat should return empty string.
    [new Date("2021-01-01T00:00:00.000Z"), "", ""], // Valid date with missing timeformat should return empty string.
    [new Date(1494634269000 + timezoneOffset), "", ""], // Timestamp with missing timeformat should return empty string.
    [new Date(1494634269000 + timezoneOffset), "yyyy-MM-dd HH-mm-ss", "2017-05-13 00-11-09"], // Timestamp with valid timeformat should return known string.
    [new Date("2017-05-13T00:11:09.000"), "yyyy-MM-dd HH-mm-ss", "2017-05-13 00-11-09"], // Valid known date with valid timeformat should return known string.
    [new Date("2023-06-09T17:44:13.123"), "yyyy/'W'w hh-mm-ssa", "2023/W23 05-44-13PM"], // Valid known date with valid timeformat should return known string.
    [new Date("2023-06-09T17:44:13.123"), "yyyy/'Q'Q HH-mm-ss.SSS", "2023/Q2 17-44-13.123"], // Valid known date with valid timeformat should return known string.
])("safeTimeformat(%s, %s) -> %s", (date, timeformat, expected) => {
    expect(safeTimeformat(date, timeformat)).toEqual(expected);
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

// TODO: Tests for replacePlaceholders and maybe populateTemplate
