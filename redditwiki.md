

# About

/u/FlairAssistant is an app built on the Reddit Developer Platform designed to replace /u/Flair_Helper. It replicates most of its functionality, however their configurations are not compatible. This wiki page is primarily meant to help you configure this application.

App: https://developers.reddit.com/apps/flairassistant

Source: https://github.com/PitchforkAssistant/devvit-flair-assistant

Schema Validator/Example: https://www.jsonschemavalidator.net/s/bq0mGGhP


# Configuration

This app has configurable settings for each of its subreddits. If you have installed it on your subreddit, you can find its settings at `https://developers.reddit.com/r/subreddit/apps/flairassistant` or by going to Mod Tools -> Installed Apps and clicking the Settings button next to flairassistant on new Reddit.


## Header and Footer

The first two fields in the app settings are the header and footer templates. These function similarly to Toolbox's header and footer text. Flairs configured to leave a comment with `headerFooter` set to `true` will prepend a header and append a footer to the comment body using two new lines as a separator. These fields support the same [placeholders](#placeholders) as Toolbox and Flair_Helper.


## Custom Timeformat

This timeformat is used for `{{created_custom}}`, `{{actioned_custom}}`, and `{{time_custom}}` placeholders. The application uses date-fns to format custom dates, the patterns for these are different from the Python timeformat Flair_Helper used. It uses the date formatting specified in the Unicode Technical Standard #35 with a few extra options, [view a full list of patterns supported by date-fns](https://date-fns.org/v2.30.0/docs/format). The default value is `yyyy-MM-dd HH-mm-ss`, below is a list of some common patterns:


| Name   | Pattern(s)          | Example(s)           |
| :----- | :------------------ | :------------------- |
| Year   | yy, yyyy            | 23, 2023             |
| Month  | M, MM, MMM, MMMM    | 7, 07, Jul, July     |
| Day    | d, dd, E, EEEE      | 1, 01, Sat, Saturday |
| Hour   | h, hh, H, HH        | 1, 01, 13, 13        |
| Minute | m, mm               | 3, 03                |
| Second | s, ss               | 2, 02                |
| Text   | yyyy'y' MMMM 'text' | 2023y July text      |


## Skip Actions Timer

The app skips certain actions if the moderator that set the post's flair already performed them. This field defines the maximum age in seconds that a moderator action can be for it to be skipped. This is necessary to prevent Toolbox removals that also set a flair from duplicating the actions linked to that flair. A cutoff of 10 seconds worked well in my testing and is the default. The actions that are checked and may be skipped are listed below.


| Action   | Skip Condition                                                                                                  |
| :------- | :-------------------------------------------------------------------------------------------------------------- |
| Approve  | Skipped if the moderator already approved the flaired post in the past X seconds.                               |
| Remove   | Skipped if the moderator already removed the flaired post in the past X seconds.                                |
| Spam     | Skipped if the moderator already spammed the flaired post in the past X seconds.                                |
| Lock     | Skipped if the moderator already locked the flaired post in the past X seconds.                                 |
| Ban User | Skipped if the moderator already banned the post's author in the past X seconds.                                |
| Comment  | Skipped if the moderator already stickied or distinguished a comment on the flaired post in the past X seconds. |


## Flair Config

This field accepts the configuration for each flair using a specific JSON structure. I would familiarizing yourself with the JSON syntax and then looking at [an example config](https://github.com/PitchforkAssistant/devvit-flair-assistant/blob/main/tests/validtestconfig.json) and then [validating your own config using a JSON schema validator](https://www.jsonschemavalidator.net/s/lcnf4wjU). 

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


#### `clearPostFlair`

| Key      | `clearPostFlair` |
| :------- | :--------------- |
| Value    | boolean          |
| Optional | Yes              |

This is an optional field that defines whether the post flair that triggered the action should be cleared. Omitting it is the same as setting it to false.

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


#### `userFlair`

| Key      | `userFlair` |
| :------- | :---------- |
| Value    | object      |
| Optional | Yes         |

This is an optional field that defines a flair that should be applied to the author. This value is an object with the keys `templateId`, `cssClass`, and `text`.

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


### Placeholders

Placeholders are keywords surrounded by double curly brackets, they are case-sensitive. Placeholders are replaced with their values when an action is performed. 

The ``{{mod}}`` placeholder is populated first to prevent crafted inputs from revealing the identidy of the moderator that triggered the action. The rest are populated in no particular order. 

Any placeholders that are not applicable to the post are replaced with an empty string (ie. removed). 

Below is a list of all supported placeholders:

| Placeholder                    | Description                                                    |
| :----------------------------- | :------------------------------------------------------------- |
| `{{author}}`                   | Username of the author                                         |
| `{{subreddit}}`                | Display name of the subreddit                                  |
| `{{body}}`                     | Post's body (*not recommended*)                                |
| `{{title}}`                    | Title of the post                                              |
| `{{kind}}`                     | Type of the post, always "submission"                          |
| `{{permalink}}`                | Permalink to the post                                          |
| `{{url}}`                      | Alias for `{{permalink}}`                                      |
| `{{link}}`                     | The URL that the post links to, `{{permalink}}` for text posts |
| `{{domain}}`                   | The domain that the post links to, blank for text posts        |
| `{{id}}`                       | Post ID                                                        |
| `{{author_id}}`                | Author's User ID                                               |
| `{{subreddit_id}}`             | Subreddit's ID                                                 |
| `{{mod}}`                      | Username of the mod that set the flair                         |
| `{{author_flair_text}}`        | Text of the post author's user flair                           |
| `{{author_flair_css_class}}`   | CSS class of the post author's user flair                      |
| `{{author_flair_template_id}}` | Template ID of the post author's user flair                    |
| `{{link_flair_text}}`          | Text of the post's flair                                       |
| `{{link_flair_css_class}}`     | CSS class of the post's flair                                  |
| `{{link_flair_template_id}}`   | Template ID of the post's flair                                |


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
