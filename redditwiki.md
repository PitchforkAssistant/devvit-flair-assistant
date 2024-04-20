

# About

/u/FlairAssistant is an app built on the Reddit Developer Platform designed to replace /u/Flair_Helper. It replicates most of its functionality, however their configurations are not compatible. This wiki page is primarily meant to help you configure this application.

App: https://developers.reddit.com/apps/flairassistant

Source: https://github.com/PitchforkAssistant/devvit-flair-assistant

Flair Assistant Config Tool: https://pitchforkassistant.github.io/devvit-flair-assistant/

Schema Validator/Example: https://www.jsonschemavalidator.net/s/TCCwFOBp

# Change Log

This section summarizes the changes made for each published version of the app, unpublished versions are not listed, but you can always view the full changes to the code on [GitHub](https://github.com/PitchforkAssistant/devvit-flair-assistant).

## 0.3.1

This update may fix some odd behavior with the order of actions.

## 0.3.0

This update added multiple new possible actions that flairs can trigger:

- [`clearUserFlair`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_clearuserflair) - Clears the user flair of the post's author. This was possible before by setting the `userFlair` field to an empty object, but now it has its own field for clarity.
- [`postFlair`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_userflair) - Changes the post's flair.
- [`removalReason`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_removalreason) - Applies a native Reddit removal reason to the post.
- [`userNote`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_usernote) - Adds a user note to the author of the post.
- [`message`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_message) - Sends a message to the post's author or the subreddit.


# Configuration

This app has configurable settings for each of its subreddits. If you have installed it on your subreddit, you can find its settings at `https://developers.reddit.com/r/subreddit/apps/flairassistant` or by going to Mod Tools -> Installed Apps on new Reddit and clicking the Settings button next to Flair Assistant.


## Header and Footer

The first two fields in the app settings are the header and footer templates. These function similarly to Toolbox's header and footer text. Flairs configured to leave a comment with `headerFooter` set to `true` will prepend a header and append a footer to the comment body using two new lines as a separator. These fields support the same [placeholders](#placeholders) as Toolbox and Flair_Helper.



## Action Debounce

The app skips certain actions if the moderator that set the post's flair already performed them. This field defines the maximum age in seconds that a moderator action can be for it to be skipped. This is necessary to prevent Toolbox removals that also set a flair from duplicating the actions linked to that flair. A cutoff of 10 seconds worked well in my testing and is the default. The actions that are checked and may be skipped are listed below.


| Action         | Skip Condition                                                                                                  |
| :------------- | :-------------------------------------------------------------------------------------------------------------- |
| Approve        | Skipped if the moderator already approved the flaired post in the past X seconds.                               |
| Remove         | Skipped if the moderator already removed the flaired post in the past X seconds.                                |
| Spam           | Skipped if the moderator already spammed the flaired post in the past X seconds.                                |
| Ignore Reports | Skipped if the moderator already ignored reports on the post in the past X seconds.                             |
| Lock           | Skipped if the moderator already locked the flaired post in the past X seconds.                                 |
| Ban User       | Skipped if the moderator already banned the post's author in the past X seconds.                                |
| Comment        | Skipped if the moderator already stickied or distinguished a comment on the flaired post in the past X seconds. |


## Flair Config

This field accepts the configuration for each flair using a specific JSON structure. You can generate it using the [Flair Assistant Config Tool](https://pitchforkassistant.github.io/devvit-flair-assistant/).

If you wish to manually edit or create this config, I would recommend familiarizing yourself with the JSON syntax and then looking at [an example config](https://github.com/PitchforkAssistant/devvit-flair-assistant/blob/main/tests/validtestconfig.json) and then [validating your own config using a JSON schema validator](https://www.jsonschemavalidator.net/s/TCCwFOBp). 

The FlairAssistant configuration is a list of objects, where each object contains the flair's template ID and the desired actions. The most basic valid configuration that does nothing is an empty array or `[]`. 

As a brief rundown of JSON, lists are defined with square brackets and items inside them are separated by commas. Objects are defined with curly brackets, unlike lists, values inside objects are named. The name of a value is called its key. The key is just text written in quotes, followed by a colon, followed by its value, followed by a comma to separate different key-value pairs. The value can be text surrounded by quotes, true, false, a number, or another list/object.


### Fields

These are the keys and values that a flair configuration object can/must have. Some string fields may support [placeholders](#wiki_placeholders).

---

&nbsp;


#### `templateId`

| Key          | templateId |
| :----------- | :--------- |
| Value        | string     |
| Optional     | No         |
| Placeholders | No         |

This is a **required** field for every object in the configuration list. It is the template ID of the flair that triggers the actions in this object. The templateId should look like this: `099e12cb-6da5-4c9b-831d-7316dd18a3d6`.

The easiest way to find a post flair template ID is to go to Mod Tools -> Post Flair on new Reddit and click on copy ID.

---

&nbsp;


#### `action`

| Key      | `action`                             |
| :------- | :----------------------------------- |
| Value    | `"approve"`, `"spam"`, or `"remove"` |
| Optional | Yes                                  |

This is an optional field that defines the basic moderation action taken on the post. If the field is defined, it must be one of the valid values.

---

&nbsp;


#### `lock`

| Key      | `lock`  |
| :------- | :------ |
| Value    | boolean |
| Required | No      |

This is an optional field that defines whether the post should be locked. If it is omitted or false, the thread is not locked, but already locked threads will not be unlocked.

---

&nbsp;


#### `ignoreReports`

| Key      | `lock`  |
| :------- | :------ |
| Value    | boolean |
| Required | No      |

This is an optional field that defines whether the post's reports should be set to ignored. If it is omitted or false, the reports are not ignored, but already ignored reports will not be unignored.

---

&nbsp;


#### `contributor`

| Key      | `contributor`         |
| :------- | :-------------------- |
| Value    | `"add"` or `"remove"` |
| Optional | Yes                   |

This is an optional field that defines whether the post author should be added or removed from the list of approved submitters. Omitting means the user's contributor status is not changed.

---

&nbsp;


#### `clearUserFlair`

| Key      | `clearPostFlair` |
| :------- | :--------------- |
| Value    | boolean          |
| Optional | Yes              |

This is an optional field that defines whether the user flair of the post's author should be cleared. Omitting it is the same as setting it to false.

If you also specify the `userFlair` field, this flag will be ignored.

---

&nbsp;


#### `clearPostFlair`

| Key      | `clearPostFlair` |
| :------- | :--------------- |
| Value    | boolean          |
| Optional | Yes              |

This is an optional field that defines whether the post flair that triggered the action should be cleared. Omitting it is the same as setting it to false.

If you also specify the `postFlair` field, this flag will be ignored.

---

&nbsp;


#### `userFlair`

| Key      | `userFlair` |
| :------- | :---------- |
| Value    | object      |
| Optional | Yes         |

This is an optional field that defines a flair that should be applied to the author. This value is an object with the keys `templateId`, `cssClass`, and `text`.

Please note that defining the `userFlair` field will cause `clearUserFlair` flag to be ignored.

&nbsp;


##### `userFlair.templateId`

| Key          | `templateId` |
| :----------- | :----------- |
| Value        | string       |
| Optional     | No           |
| Placeholders | No           |

This is a required field that defines the flair template ID that will be applied to the author. It can also be an empty string if you do not wish to apply a template.

The easiest way to find a user flair template ID is to go to Mod Tools -> User Flair on new Reddit and click on copy ID.

&nbsp;


##### `userFlair.cssClass`

| Key          | `cssClass` |
| :----------- | :--------- |
| Value        | string     |
| Optional     | No         |
| Placeholders | No         |

This is a required field that defines the flair CSS class that is applied to the author. It can be an empty string if you do not wish to include a CSS class in the flair.

&nbsp;


##### `userFlair.text`

| Key          | `text` |
| :----------- | :----- |
| Value        | string |
| Optional     | No     |
| Placeholders | Yes    |

This is a required field that defines the flair text that is applied to the author. It can be an empty string if you do not wish to include text in the flair.

---

&nbsp;


#### `postFlair`

| Key      | `postFlair` |
| :------- | :---------- |
| Value    | object      |
| Optional | Yes         |

This is an optional field that defines a flair that should be applied to the original post after the flair action is triggered. This value is an object with the required keys `templateId`, `cssClass`, and `text`.

Please note that defining the `postFlair` field will cause `clearPostFlair` to be ignored.

&nbsp;


##### `postFlair.templateId`

| Key          | `templateId` |
| :----------- | :----------- |
| Value        | string       |
| Optional     | No           |
| Placeholders | No           |

This is a required field that defines the flair template ID that will be applied to the post. It can also be an empty string if you do not wish to apply a template.

The easiest way to find a user flair template ID is to go to Mod Tools -> Post Flair on new Reddit and click on copy ID.

&nbsp;


##### `postFlair.cssClass`

| Key          | `cssClass` |
| :----------- | :--------- |
| Value        | string     |
| Optional     | No         |
| Placeholders | No         |

This is a required field that defines the flair CSS class that is applied to the post. It can be an empty string if you do not wish to include a CSS class in the flair.

&nbsp;


##### `postFlair.text`

| Key          | `text` |
| :----------- | :----- |
| Value        | string |
| Optional     | No     |
| Placeholders | Yes    |

This is a required field that defines the flair text that is applied to the post. It can be an empty string if you do not wish to include text in the flair.

---

&nbsp;


#### `ban`

| Key      | `ban`  |
| :------- | :----- |
| Value    | object |
| Optional | Yes    |

This is an optional field that determines whether the author should be banned.  This value is an object with the keys `message`, `note`, `reason`, and optionally `duration`.

&nbsp;


##### `ban.duration`

| Key      | `duration` |
| :------- | :--------- |
| Value    | number     |
| Optional | Yes        |

This is an optional field to define the length of a temporary ban in days. Omitting it sets the ban to permanent.

&nbsp;


##### `ban.message`

| Key          | `message` |
| :----------- | :-------- |
| Value        | string    |
| Optional     | No        |
| Placeholders | Yes       |

This is a required field that defines the message that will be included in the ban notification sent to the author. It can be an empty string.

&nbsp;


##### `ban.note`

| Key          | `note` |
| :----------- | :----- |
| Value        | string |
| Optional     | No     |
| Placeholders | Yes    |

This is a required field that defines the private ban note that will be visible to moderators. It can be an empty string.

&nbsp;


##### `ban.reason`

| Key          | `reason` |
| :----------- | :------- |
| Value        | string   |
| Optional     | No       |
| Placeholders | No       |

This is a required field that defines the ban reason shown in the moderation log. It can be an empty string.

&nbsp;


---


#### `comment`

| Key      | `comment` |
| :------- | :-------- |
| Value    | object    |
| Optional | Yes       |

This is an optional field that defines the comment that will be left as a reply to the post.  This value is an object with the keys `body`, `lock`, `distinguish`, `sticky`, and `headerFooter`.

&nbsp;


##### `comment.body`

| Key          | `body` |
| :----------- | :----- |
| Value        | string |
| Optional     | No     |
| Placeholders | Yes    |

This is a required field that defines the body of the comment reply. Comments cannot be empty, so it can only be an empty string if headerFooter is set to true.

&nbsp;


##### `comment.headerFooter`

| Key      | `headerFooter` |
| :------- | :------------- |
| Value    | boolean        |
| Optional | Yes            |

This is an optional field that defines whether the comment should have the [header and footer](#wiki_header_and_footer) applied. Placeholders are also applied to the header and footer. Omitting this is equivalent to setting it to false.

&nbsp;


##### `comment.lock`

| Key      | `lock`  |
| :------- | :------ |
| Value    | boolean |
| Optional | Yes     |

This is an optional field that defines whether the comment should be locked. This only locks replies to the comment, not to the post itself. Omitting this is equivalent to setting it to false.

&nbsp;


##### `comment.distinguish`

| Key      | `distinguish` |
| :------- | :------------ |
| Value    | boolean       |
| Optional | Yes           |

This is an optional field that defines whether the comment should be distinguished. Omitting this is equivalent to setting it to false.

&nbsp;


##### `comment.sticky`

| Key      | `sticky` |
| :------- | :------- |
| Value    | boolean  |
| Optional | Yes      |

This is an optional field that defines whether the comment should be distinguished and stickied. Please note that it is not possible to sticky a comment without also distinguishing it. Omitting this is equivalent to setting it to false.

&nbsp;


---


#### `removalReason`

| Key      | `removalReason` |
| :------- | :-------------- |
| Value    | object          |
| Optional | Yes             |

This is an optional field that allows you to apply a native Reddit removal reason to the post. This value is an object that takes the removal reason's ID and an optional mod note.

&nbsp;


##### `removalReason.reasonId`

| Key          | `reasonId` |
| :----------- | :--------- |
| Value        | string     |
| Optional     | No         |
| Placeholders | No         |

This is a required field that defines the ID of the removal reason that will be applied to the post. As of writing this, there is no easy way to find the ID of a removal reason, you'll either need to use your browser's dev tools, Reddit's API or a Devvit app like [Show Removal Reason IDs](https://developers.reddit.com/apps/removalreasonids) to find it.

&nbsp;


##### `removalReason.note`

| Key          | `note` |
| :----------- | :----- |
| Value        | string |
| Optional     | Yes    |
| Placeholders | Yes    |


This is an optional field that defines the private mod note that will be attached to the removal reason. Please note that this note is [not visible to the user](https://i.imgur.com/EpFkMks.png), you'll need to use the other fields for a proper removal message.

&nbsp;


---


#### `userNote`

| Key      | `userNote` |
| :------- | :--------- |
| Value    | object     |
| Optional | Yes        |

This is an optional field that allows you to add a user note to the post's author.

&nbsp;


##### `userNote.label`

| Key      | `label`                                                                                                                              |
| :------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| Value    | `"BOT_BAN"`, `"PERMA_BAN"`, `"BAN"`, `"ABUSE_WARNING"`, `"SPAM_WARNING"`, `"SPAM_WATCH"`, `"SOLID_CONTRIBUTOR"`, or `"HELPFUL_USER"` |
| Optional | No                                                                                                                                   |

This is a required field that defines the label that is used for the added user note. If a userNote object is defined, this field must be present.

&nbsp;


##### `userNote.note`

| Key          | `note` |
| :----------- | :----- |
| Value        | string |
| Optional     | No     |
| Placeholders | Yes    |


This field specifies the text of the user note. It supports placeholders. If a userNote object is defined, this field must be present.

&nbsp;


---


#### `message`

| Key      | `message` |
| :------- | :-------- |
| Value    | object    |
| Optional | Yes       |

This field allows you to send a message to the post's author or the subreddit itself.

&nbsp;


##### `message.to`

| Key      | `label`                     |
| :------- | :-------------------------- |
| Value    | `"author"` or `"subreddit"` |
| Optional | No                          |

This is a required field that defines the recipient of the message. All messages are sent as modmails, so the author will receive a message from the subreddit with the bot's name hidden. If the recipient is the subreddit, the message will be created under mod discussions.

&nbsp;


##### `message.subject`

| Key          | `subject` |
| :----------- | :-------- |
| Value        | string    |
| Optional     | No        |
| Placeholders | Yes       |


This is a required field under the message objec that specifies the subject line of the message. It supports placeholders, but the final subject must be shorter than 100 characters.

&nbsp;


##### `message.body`

| Key          | `note` |
| :----------- | :----- |
| Value        | string |
| Optional     | No     |
| Placeholders | Yes    |


This required message field specifies the text content of the message. Supports placeholders.

&nbsp;


##### `message.archive`

| Key      | `archive` |
| :------- | :-------- |
| Value    | boolean   |
| Optional | Yes       |


This is an optional field that defines whether the message should be marked as read and automatically archived after sending. Archiving mod discussions is not possible, but setting this to true will still mark them as read. Omitting this is equivalent to setting it to false.

&nbsp;


### Placeholders

Placeholders are keywords surrounded by double curly brackets, they are case-sensitive. Placeholders are replaced with their values when an action is performed. 

The ``{{mod}}`` placeholder is populated first to prevent crafted inputs from revealing the identity of the moderator that triggered the action. The rest are populated in no particular order. 

Any placeholders that are not applicable to the post are replaced with an empty string (ie. removed). Placeholder values are based on the values of the post at the time the flair was set, meaning they will not reflect any changes made to the post (such as editing flairs) by the bot.

Below is a list of all supported placeholders:

| Placeholder                    | Description                                                                                                       |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `{{author}}`                   | Username of the author                                                                                            |
| `{{subreddit}}`                | Display name of the subreddit                                                                                     |
| `{{body}}`                     | Post's body (*not recommended*)                                                                                   |
| `{{title}}`                    | Title of the post                                                                                                 |
| `{{kind}}`                     | Type of the post, always "submission"                                                                             |
| `{{permalink}}`                | Permalink to the post                                                                                             |
| `{{url}}`                      | Alias for `{{permalink}}`                                                                                         |
| `{{link}}`                     | The URL that the post links to, `{{permalink}}` for text posts                                                    |
| `{{domain}}`                   | The domain that the post links to, blank for text posts                                                           |
| `{{id}}`                       | Post ID                                                                                                           |
| `{{author_id}}`                | Author's User ID                                                                                                  |
| `{{subreddit_id}}`             | Subreddit's ID                                                                                                    |
| `{{mod}}`                      | Username of the mod that set the flair                                                                            |
| `{{author_flair_text}}`        | Text of the post author's user flair                                                                              |
| `{{author_flair_css_class}}`   | CSS class of the post author's user flair                                                                         |
| `{{author_flair_template_id}}` | Template ID of the post author's user flair                                                                       |
| `{{link_flair_text}}`          | Text of the post's flair                                                                                          |
| `{{link_flair_css_class}}`     | CSS class of the post's flair                                                                                     |
| `{{link_flair_template_id}}`   | Template ID of the post's flair                                                                                   |
| `{{time_iso}}`                 | Current time in the ISO 8601 format                                                                               |
| `{{time_unix}}`                | Current time as the unix epoch in seconds                                                                         |
| `{{time_custom}}`              | Current time as defined by the [custom date placeholder options](#wiki_custom_date_placeholder_options)           |
| `{{created_iso}}`              | Post's creation time in the ISO 8601                                                                              |
| `{{created_unix}}`             | Post's creation time as the unix epoch in seconds                                                                 |
| `{{created_custom}}`           | Post's creation time as defined by the [custom date placeholder options](#wiki_custom_date_placeholder_options)   |
| `{{actioned_iso}}`             | When the flair was set in the ISO 8601 format                                                                     |
| `{{actioned_unix}}`            | When the flair was set as the unix epoch in seconds                                                               |
| `{{actioned_custom}}`          | When the flair was set as defined by the [custom date placeholder options](#wiki_custom_date_placeholder_options) |


### Example 

Let's dissect the following example:

    [
        {
            "templateId": "4ff98458-2231-11ee-8bc8-3e2644471d60",
            "action": "remove",
            "comment": {
                "body": "Your post has been removed for violating rule 1, remember you're on {{subreddit}} and content must be on topic!",
                "lock": false,
                "sticky": true,
                "distinguish": true,
                "headerFooter": true
            },
            "lock": false
        },
        {
            "templateId": "29bd080e-2232-11ee-8223-56701dbb8ce0",
            "action": "remove",
            "comment": {
                "body": "Your post has been removed for violating rule 2:\n* No vulgar posts!",
                "lock": true,
                "distinguish": true,
                "headerFooter": true
            },
            "ban": {
                "duration": 7,
                "message": "You have been banned for 7 days due to [this post]({{permalink}}). Please [review the rules](/r/{{subreddit}}/about/rules) before posting again.",
                "note": "Post ID: {{id}}",
                "reason": "R2"
            },
            "lock": true
        },
        {
            "templateId": "1365f30e-2232-11ee-b77e-ca429d4a5660",
            "action": "spam",
            "lock": true,
            "clearPostFlair": true,
            "ban": {
                "message": "You have been permanently banned for being a spammer.",
                "note": "Post ID: {{id}}",
                "reason": "SP"
            }
        },
        {
            "templateId": "099e12cb-6da5-4c9b-831d-7316dd18a3d6",
            "action": "approve",
            "clearPostFlair": true,
            "userFlair": {
                "templateId": "",
                "text": "Good Contributor",
                "cssClass": ""
            },
            "contributor": "add"
        }
    ]

The example above has configurations for four different flairs, this is what they would do:

1. The post is removed with a stickied removal reason. The removal reason includes a header and footer.

2. The post is locked and removed with a stickied removal reason. The removal reason comment is locked and distinguished, but not stickied. The author of the post is banned for 7 days.

3. The post is locked and marked as spam. The flair set on the post is also removed. No comment is left. The user is permanently banned.

4. The post is approved. The user is given a flair with a blank templateId and cssClass and the text "Good Contributor". The user is added to the approved submitters list.

Please note that flair template IDs are different for each flair on every subreddit.

## Custom Date Placeholder Options

### Date Format Template

This date template is used for `{{created_custom}}`, `{{actioned_custom}}`, and `{{time_custom}}` placeholders. The application uses date-fns to format custom dates, the patterns for these are different from the Python timeformat Flair_Helper used. It uses the date formatting specified in the Unicode Technical Standard #35 with a few extra options, [view a full list of patterns supported by date-fns](https://date-fns.org/v2.30.0/docs/format). The default value is `yyyy-MM-dd HH-mm-ss`, below is a list of some common patterns:


| Name   | Pattern(s)          | Example(s)           |
| :----- | :------------------ | :------------------- |
| Year   | yy, yyyy            | 23, 2023             |
| Month  | M, MM, MMM, MMMM    | 7, 07, Jul, July     |
| Day    | d, dd, E, EEEE      | 1, 01, Sat, Saturday |
| Hour   | h, hh, H, HH        | 1, 01, 13, 13        |
| Minute | m, mm               | 3, 03                |
| Second | s, ss               | 2, 02                |
| Text   | yyyy'y' MMMM 'text' | 2023y July text      |

### Timezone

This is the timezone used for `{{created_custom}}`, `{{actioned_custom}}`, and `{{time_custom}}` placeholders. The default value is `UTC`. This field can accept both timezone identifiers and offsets. [View a full list of supported timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) or simply provide it in the format `+HH:mm` or `-HH:mm` (ie. `+05:30` or `-08:00`).

### Locale

This field is used for `{{created_custom}}`, `{{actioned_custom}}`, and `{{time_custom}}` placeholders. It affects locale specific values such as the first day of the week, month names, abbrivations, etc. The default value is `enUS`. 

Below is a table of all supported locales in the options dropdown and their corresponding values:

| Name                      | Value      |
| :------------------------ | :--------- |
| Afrikaans                 | `af`       |
| Arabic                    | `ar`       |
| Arabic - Algeria          | `arDZ`     |
| Arabic - Egypt            | `arEG`     |
| Arabic - Morocco          | `arMA`     |
| Arabic - Saudi Arabia     | `arSA`     |
| Arabic - Tunisia          | `arTN`     |
| Azeri                     | `az`       |
| Belarusian                | `be`       |
| Belarusian - Taraškievica | `beTarask` |
| Bulgarian                 | `bg`       |
| Bengali                   | `bn`       |
| Bosnian                   | `bs`       |
| Catalan                   | `ca`       |
| Czech                     | `cs`       |
| Welsh                     | `cy`       |
| Danish                    | `da`       |
| German                    | `de`       |
| German - Austria          | `deAT`     |
| Greek                     | `el`       |
| English - Australia       | `enAU`     |
| English - Canada          | `enCA`     |
| English - Great Britain   | `enGB`     |
| English - Ireland         | `enIE`     |
| English - India           | `enIN`     |
| English - New Zealand     | `enNZ`     |
| English - United States   | `enUS`     |
| English - Zimbabwe        | `enZA`     |
| Esperanto                 | `eo`       |
| Spanish                   | `es`       |
| Estonian                  | `et`       |
| Basque                    | `eu`       |
| Farsi - Iran              | `faIR`     |
| Finnish                   | `fi`       |
| French                    | `fr`       |
| French - Canada           | `frCA`     |
| French - Switzerland      | `frCH`     |
| Frisian                   | `fy`       |
| Gaelic                    | `gd`       |
| Galician                  | `gl`       |
| Gujarati                  | `gu`       |
| Hebrew                    | `he`       |
| Hindi                     | `hi`       |
| Croatian                  | `hr`       |
| Haitian Creole            | `ht`       |
| Hungarian                 | `hu`       |
| Armenian                  | `hy`       |
| Indonesian                | `id`       |
| Icelandic                 | `is`       |
| Italian                   | `it`       |
| Italian - Switzerland     | `itCH`     |
| Japanese                  | `ja`       |
| Japanese - Hiragana       | `jaHira`   |
| Georgian                  | `ka`       |
| Kazakh                    | `kk`       |
| Khmer                     | `km`       |
| Kannada                   | `kn`       |
| Korean                    | `ko`       |
| Luxembourgish             | `lb`       |
| Lithuanian                | `lt`       |
| Latvian                   | `lv`       |
| Macedonian                | `mk`       |
| Mongolian                 | `mn`       |
| Malay                     | `ms`       |
| Maltese                   | `mt`       |
| Norwegian - Bokml         | `nb`       |
| Dutch                     | `nl`       |
| Dutch - Belgium           | `nlBE`     |
| Norwegian - Nynorsk       | `nn`       |
| Occitan                   | `oc`       |
| Polish                    | `pl`       |
| Portuguese                | `pt`       |
| Portuguese - Brazil       | `ptBR`     |
| Romanian                  | `ro`       |
| Russian                   | `ru`       |
| Slovak                    | `sk`       |
| Slovenian                 | `sl`       |
| Albanian                  | `sq`       |
| Serbian - Cyrillic        | `sr`       |
| Serbian - Latin           | `srLatn`   |
| Swedish                   | `sv`       |
| Tamil                     | `ta`       |
| Telugu                    | `te`       |
| Thai                      | `th`       |
| Turkish                   | `tr`       |
| Uyghur                    | `ug`       |
| Ukrainian                 | `uk`       |
| Uzbek - Latin             | `uz`       |
| Uzbek - Cyrillic          | `uzCyrl`   |
| Vietnamese                | `vi`       |
| Chinese                   | `zhCN`     |
| Chinese - Hong Kong       | `zhHK`     |
| Chinese - Taiwan          | `zhTW`     |
