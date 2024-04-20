# FlairAssistant

FlairAssistant is a Devvit app that allows moderators to configure predefined actions that are executed when they set a specific flair on a post. This can be used to leave removal reasons, ban the author, or perform one of many other actions.

Documentation: [https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant/](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant/)

Config Generator: [https://pitchforkassistant.github.io/devvit-flair-assistant/](https://pitchforkassistant.github.io/devvit-flair-assistant/)

Schema Validator/Example: [https://www.jsonschemavalidator.net/s/TCCwFOBp/](https://www.jsonschemavalidator.net/s/TCCwFOBp/)

## Change Log

This section summarizes the changes made for each published version of the app, unpublished versions are not listed, but you can always view the full changes to the code on [GitHub](https://github.com/PitchforkAssistant/devvit-flair-assistant).

### 0.3.3

This update may fix some odd behavior with the order of actions and improves settings loading.

### 0.3.0

This update added multiple new possible actions that flairs can trigger:

- [`clearUserFlair`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_clearuserflair) - Clears the user flair of the post's author. This was possible before by setting the `userFlair` field to an empty object, but now it has its own field for clarity.
- [`postFlair`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_userflair) - Changes the post's flair.
- [`removalReason`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_removalreason) - Applies a native Reddit removal reason to the post.
- [`userNote`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_usernote) - Adds a user note to the author of the post.
- [`message`](https://www.reddit.com/r/PitchforkAssistant/wiki/flairassistant#wiki_message) - Sends a message to the post's author or the subreddit.
