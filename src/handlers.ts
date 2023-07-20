import {ModAction} from "@devvit/protos";
import {BanUserOptions, Context, OnTriggerEvent, SetUserFlairOptions, SettingsFormFieldValidatorEvent} from "@devvit/public-api";
import AjvModule from "ajv";
import {FlairEntries} from "./types.js";
import {flairEntriesSchema} from "./schema.js";
import {populateTemplate, safeTimeformat} from "./helpers.js";

const ajv = new AjvModule.default();
const validate = ajv.compile(flairEntriesSchema);

export async function validateFlairConfig (event: SettingsFormFieldValidatorEvent<string>) {
    const config = event?.value?.toString();
    try {
        const valid = validate(JSON.parse(config?.toString() ?? "") as FlairEntries);
        if (!valid) {
            return "Failed to validate against config schema, try it at: https://www.jsonschemavalidator.net/s/rQa5pcWR";
        }
    } catch (e) {
        return "Failed to parse JSON, the syntax is likely invalid.";
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
    if (!templateId || !postId || !subredditName || !author) {
        console.error(`Missing data in flair update event: ${JSON.stringify(event)}`);
    }

    const configString = await context.settings.get("flairConfig");
    const fullConfig = JSON.parse(configString?.toString() ?? "") as FlairEntries;
    if (!validate(fullConfig)) {
        console.log("Invalid config upon flair update!");
        return;
    }

    const flairConfig = fullConfig.find(entry => entry.templateId === templateId);
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
        const message = await populateTemplate(flairConfig.ban.message, false, context.settings, event);
        const note = await populateTemplate(flairConfig.ban.note, false, context.settings, event);
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
    }

    // Handle Comment
    if (flairConfig.comment) {
        const commentOptions = {
            id: postId,
            text: await populateTemplate(flairConfig.comment.body, flairConfig.comment.headerFooter, context.settings, event),
        };
        console.log(`Commenting on post ${postId}`);
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
    }

    // Handle Lock
    if (flairConfig.lock) {
        console.log(`Locking post ${postId}`);
        context.reddit.getPostById(postId).then(post => post.lock()).catch(e => console.error(e));
    }
}
