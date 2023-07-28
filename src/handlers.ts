import {ModAction} from "@devvit/protos";
import {BanUserOptions, Context, OnTriggerEvent, SetUserFlairOptions, SettingsFormFieldValidatorEvent} from "@devvit/public-api";
import AjvModule from "ajv";
import {FlairEntries} from "./types.js";
import {flairEntriesSchema} from "./schema.js";
import {hasPerformedAction, hasPerformedActions, replacePlaceholders, safeTimeformat, toNumberOrDefault} from "./helpers.js";
import {DEFAULT_ACTION_DEBOUNCE} from "./constants.js";

const ajv = new AjvModule.default();
const validate = ajv.compile(flairEntriesSchema);

export async function validateFlairConfig (event: SettingsFormFieldValidatorEvent<string>) {
    const config = event?.value?.toString();
    try {
        const valid = validate(JSON.parse(config?.toString() ?? "") as FlairEntries);
        if (!valid) {
            return "Failed to validate against config schema, try it at: https://www.jsonschemavalidator.net/s/MHlvOFJo";
        }
    } catch (e) {
        return "Failed to parse JSON, the syntax is likely invalid.";
    }
}

export async function validateActionDebounce (event: SettingsFormFieldValidatorEvent<number>) {
    const actionDebounce = Number(event?.value);
    if (isNaN(actionDebounce)) {
        return "Action debounce must be a number.";
    } else if (actionDebounce < 0) {
        return "Action debounce must be a positive number.";
    }
}

export async function validateCustomTimeformat (event: SettingsFormFieldValidatorEvent<string>) {
    const config = event?.value?.toString();
    if (!safeTimeformat(new Date(), config?.toString() ?? "")) {
        return "Invalid timeformat, see: https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table";
    }
}

export async function handleFlairUpdate (context: Context, event: OnTriggerEvent<ModAction>) {
    if (event.action !== "editflair") {
        return;
    }
    const postId = event.targetPost?.id ?? "";
    const templateId = event.targetPost?.linkFlair?.templateId ?? "";
    const subredditName = event.subreddit?.name ?? "";
    const author = event.targetUser?.name ?? "";
    const authorId = event.targetUser?.id ?? "";
    if (!templateId || !postId || !subredditName || !author || !authorId) {
        console.error(`Missing data in flair update event: ${JSON.stringify(event)}`);
    }

    const appUserId = context.appAccountId;
    if (event.moderator?.id === appUserId) {
        console.log(`Skipping flair update for post ${postId} because it was performed by the app user.`);
        return;
    }

    const allSettings = await context.settings.getAll();
    const headerTemplate = allSettings["headerTemplate"]?.toString() ?? "";
    const footerTemplate = allSettings["footerTemplate"]?.toString() ?? "";
    const customTimeformat = allSettings["customTimeformat"]?.toString() ?? "";
    const actionDebounce = toNumberOrDefault(allSettings["actionDebounce"], DEFAULT_ACTION_DEBOUNCE);
    const fullFlairConfig = JSON.parse(allSettings["flairConfig"]?.toString() ?? "") as FlairEntries;
    if (!validate(fullFlairConfig)) {
        console.log("Invalid config upon flair update!");
        return;
    }

    const flairConfig = fullFlairConfig.find(entry => entry.templateId === templateId);
    if (!flairConfig) {
        console.log(`No config for template id ${templateId}`);
        return;
    }
    console.log(`Handling flair update for template id: ${templateId}`);

    // Handle Clear Post Flair
    if (flairConfig.clearPostFlair) {
        console.log(`Clearing post flair for post ${postId}`);
        context.reddit.removePostFlair(subredditName, postId).catch(e => console.error(e));
    }

    // Handle Actions
    if (flairConfig.action) {
        // Avoids duplicating actions if the post was already approved/removed/spammed.
        if (!await hasPerformedActions(context.reddit, subredditName, postId, ["removelink", "approvelink", "spamlink"], actionDebounce, false, event.moderator?.id)) {
            if (flairConfig.action === "remove") {
                console.log(`Removing post ${postId}`);
                context.reddit.remove(postId, false).catch(e => console.error(e));
            } else if (flairConfig.action === "spam") {
                console.log(`Spamming post ${postId}`);
                context.reddit.remove(postId, true).catch(e => console.error(e));
            } else if (flairConfig.action === "approve") {
                console.log(`Approving post ${postId}`);
                context.reddit.approve(postId).catch(e => console.error(e));
            }
        } else {
            console.log(`Skipped action on post ${postId} because it got a remove/approve/spam action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle Setting User Flair
    if (flairConfig.userFlair) {
        const userFlairOptions: SetUserFlairOptions = {
            subredditName,
            username: author,
            flairTemplateId: flairConfig.userFlair.templateId,
            text: flairConfig.userFlair.text,
            cssClass: flairConfig.userFlair.cssClass,
        };
        console.log(`Setting user flair for user ${author}`);
        context.reddit.setUserFlair(userFlairOptions).catch(e => console.error(e));
    }

    // Handle Approved User
    if (flairConfig.contributor === "add") {
        console.log(`Adding user ${author} as approved user`);
        context.reddit.approveUser(author, subredditName).catch(e => console.error(e));
    } else if (flairConfig.contributor === "remove") {
        console.log(`Removing user ${author} as approved user`);
        context.reddit.removeUser(author, subredditName).catch(e => console.error(e));
    }

    // Handle Ban
    if (flairConfig.ban) {
        // Avoids duplicating bans if the user was already banned.
        if (!await hasPerformedAction(context.reddit, subredditName, authorId, "banuser", actionDebounce, false, event.moderator?.id)) {
            const message = replacePlaceholders(flairConfig.ban.message, event, customTimeformat);
            const note = replacePlaceholders(flairConfig.ban.note, event, customTimeformat);
            const banOptions: BanUserOptions = {
                subredditName,
                username: author,
                context: event.targetPost?.id,
                duration: flairConfig.ban.duration,
                reason: note,
                message,
                note,
            };
            console.log(`Banning user ${author}`);
            context.reddit.banUser(banOptions).catch(e => console.error(e));
        } else {
            console.log(`Skipped ban on user ${author} because they got a ban action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle Comment
    if (flairConfig.comment) {
        // Avoids duplicating removal reasons if the post already got a sticky/distinguish action, like when Toolbox is used.
        if (!await hasPerformedActions(context.reddit, subredditName, postId, ["sticky", "distinguish"], actionDebounce, true, event.moderator?.id)) {
            console.log(`Commenting on post ${postId}`);
            const commentOptions = {
                id: postId,
                text: replacePlaceholders(
                    flairConfig.comment.body,
                    event,
                    customTimeformat,
                    flairConfig.comment.headerFooter ? headerTemplate : "",
                    flairConfig.comment.headerFooter ? footerTemplate : ""
                ),
            };
            const comment = await context.reddit.submitComment(commentOptions);
            console.log(`Commented on post ${postId} with comment ${comment.id}`);
            if (flairConfig.comment.distinguish) {
                console.log(`Distinguishing comment ${comment.id}`);
                comment.distinguish(flairConfig.comment.sticky).catch(e => console.error(e));
            }
            if (flairConfig.comment.lock) {
                console.log(`Locking comment ${comment.id}`);
                comment.lock().catch(e => console.error(e));
            }
        } else {
            console.log(`Skipped comment on post ${postId} because it got a sticky/distinguish action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle Lock
    if (flairConfig.lock) {
        console.log(`Locking post ${postId}`);
        context.reddit.getPostById(postId).then(post => post.lock()).catch(e => console.error(e));
    }
}
