import {ModAction, PostV2} from "@devvit/protos";
import {BanUserOptions, TriggerContext, SetUserFlairOptions, SetPostFlairOptions} from "@devvit/public-api";
import {FlairEntries} from "../types.js";
import {DEFAULTS} from "../constants.js";
import {validateFlairEntriesSchema} from "./validators.js";
import {getLocaleFromString, toNumberOrDefault, hasPerformedAction, hasPerformedActions, replacePlaceholders, getRecommendedPlaceholdersFromModAction, assembleRemovalReason, submitPostReply, ignoreReportsByPostId, setLockByPostId} from "devvit-helpers";
import {enUS} from "date-fns/locale";

export async function handleFlairUpdate (event: ModAction, context: TriggerContext) {
    if (event.action !== "editflair") {
        return;
    }

    // Check that all required fields are present.
    if (!event.targetPost) {
        throw new Error(`Missing targetPost in editflair action: ${JSON.stringify(event)}`);
    }
    if (!event.subreddit) {
        throw new Error(`Missing targetPost in editflair action: ${JSON.stringify(event)}`);
    }
    if (!event.targetUser) {
        throw new Error(`Missing targetPost in editflair action: ${JSON.stringify(event)}`);
    }
    if (!event.moderator) {
        throw new Error(`Missing moderator in editflair action: ${JSON.stringify(event)}`);
    }

    // Shorter variable names for frequently used properties.
    const postId = event.targetPost.id;
    const subreddit = event.subreddit.name;
    const author = event.targetUser.name;
    const authorId = event.targetUser.id;
    const moderatorName = event.moderator.name;

    // The config is based on flair template IDs, so check that the post has one.
    const templateId = event.targetPost.linkFlair?.templateId ?? "";
    if (!templateId) {
        throw new Error(`Missing data in flair update event: ${JSON.stringify(event)}`);
    }

    // Skip flair updates performed by the app user.
    // Currently the config only supports clearing post flair, so the preceding template check should prevent us from getting this far.
    const appUserId = context.appAccountId;
    if (event.moderator.id === appUserId) {
        console.log(`Skipping flair update for ${postId} because it was performed by the app user.`);
        return;
    }

    // Get all settings and validate the flair config. We have no point in continuing if we can't trust the config.
    const allSettings = await context.settings.getAll();
    const fullFlairConfig = JSON.parse(allSettings.flairConfig?.toString() ?? "") as FlairEntries;
    if (!validateFlairEntriesSchema(fullFlairConfig)) {
        throw new Error(`Invalid flair config: ${JSON.stringify(fullFlairConfig)}`);
    }

    // Get the flair config for the template ID. Again, no point in continuing if there's no config for the template.
    const flairConfig = fullFlairConfig.find(entry => entry.templateId === templateId);
    if (!flairConfig) {
        console.log(`No config for template id ${templateId}`);
        return;
    }
    console.log(`Handling flair update for template id: ${templateId}`);

    // Get some other settings we need.
    const actionDebounce = toNumberOrDefault(allSettings.actionDebounce, DEFAULTS.ACTION_DEBOUNCE);
    const customDateformat = {
        dateformat: allSettings.customDateTemplate?.toString() ?? "",
        timezone: allSettings.customTimezone?.toString() ?? "",
        locale: getLocaleFromString(allSettings.customLocale?.toString() ?? "") ?? enUS,
    };

    // Convert the mod action to a list of placeholders. We know targetPost exists because we checked for it at the beginning.
    const placeholders = await getRecommendedPlaceholdersFromModAction(event as ModAction & {targetPost: PostV2}, customDateformat);

    // Handle remove, spam, or approve action
    if (flairConfig.action) {
        // Avoids duplicating actions if the action was already performed.
        if (!await hasPerformedAction(context.reddit, subreddit, postId, `${flairConfig.action}link`, moderatorName, false, actionDebounce)) {
            console.log(`Performing action ${flairConfig.action} on post ${postId}`);
            switch (flairConfig.action) {
            case "remove":
                context.reddit.remove(postId, false).catch(e => console.error(`Failed to remove ${postId}`, e));
                break;
            case "spam":
                context.reddit.remove(postId, true).catch(e => console.error(`Failed to spam ${postId}`, e));
                break;
            case "approve":
                context.reddit.approve(postId).catch(e => console.error(`Failed to approve ${postId}`, e));
                break;
            }
        } else {
            console.log(`Skipped ${flairConfig.action} on ${postId} because it got a ${flairConfig.action}link action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle setting or clearing the post flair
    if (flairConfig.postFlair) {
        const postFlairOptions: SetPostFlairOptions = {
            postId,
            subredditName: subreddit,
            flairTemplateId: flairConfig.postFlair.templateId,
            text: replacePlaceholders(flairConfig.postFlair.text, placeholders),
            cssClass: flairConfig.postFlair.cssClass,
        };
        console.log(`Setting post flair for ${postId}`);
        context.reddit.setPostFlair(postFlairOptions).catch(e => console.error(`Failed to set post flair for ${postId}`, e));
    } else if (flairConfig.clearPostFlair) {
        console.log(`Clearing post flair for ${postId}`);
        context.reddit.removePostFlair(subreddit, postId).catch(e => console.error(`Failed to clear post flair for ${postId}`, e));
    }

    // Handle setting or clearing the user flair
    if (flairConfig.userFlair) {
        const userFlairOptions: SetUserFlairOptions = {
            subredditName: subreddit,
            username: author,
            flairTemplateId: flairConfig.userFlair.templateId,
            text: replacePlaceholders(flairConfig.userFlair.text, placeholders),
            cssClass: flairConfig.userFlair.cssClass,
        };
        console.log(`Setting user flair for ${author}`);
        context.reddit.setUserFlair(userFlairOptions).catch(e => console.error(`Failed to set user flair for ${author}`, e));
    } else if (flairConfig.clearUserFlair) {
        console.log(`Clearing user flair for ${author}`);
        context.reddit.removeUserFlair(subreddit, author).catch(e => console.error(`Failed to clear user flair for ${author}`, e));
    }

    // Handle contributor changes
    if (flairConfig.contributor === "add") {
        console.log(`Adding ${author} as approved user`);
        context.reddit.approveUser(author, subreddit).catch(e => console.error(`Failed to add ${author} as contributor`, e));
    } else if (flairConfig.contributor === "remove") {
        console.log(`Removing ${author} as approved user`);
        context.reddit.removeUser(author, subreddit).catch(e => console.error(`Failed to remove ${author} as contributor`, e));
    }

    // Handle ban
    if (flairConfig.ban) {
        // Avoids duplicating bans if the user was already banned.
        if (!await hasPerformedAction(context.reddit, subreddit, authorId, "banuser", moderatorName, false, actionDebounce)) {
            console.log(`Banning ${author}`);
            const message = replacePlaceholders(flairConfig.ban.message, placeholders);
            const note = replacePlaceholders(flairConfig.ban.note, placeholders);
            const banOptions: BanUserOptions = {
                username: author,
                duration: flairConfig.ban.duration,
                context: event.targetPost.id,
                reason: flairConfig.ban.reason,
                subredditName: subreddit,
                message,
                note,
            };
            context.reddit.banUser(banOptions).catch(e => console.error(`Failed to ban ${author}`, e));
        } else {
            console.log(`Skipped ban on ${author} because they got a ban action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle ignoreReports
    if (flairConfig.ignoreReports) {
        if (!await hasPerformedAction(context.reddit, subreddit, postId, "ignorereports", moderatorName, false, actionDebounce)) {
            console.log(`Ignoring reports on ${postId}`);
            await ignoreReportsByPostId(context.reddit, postId, false).catch(e => console.error(`Failed to fetch ${postId} in redditHelpers.ignoreReportsByPostId`, e));
        } else {
            console.log(`Skipped ignore reports on ${postId} because it got an ignore reports action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle locking the post
    if (flairConfig.lock) {
        if (!await hasPerformedAction(context.reddit, subreddit, postId, "lock", moderatorName, false, actionDebounce)) {
            console.log(`Locking ${postId}`);
            await setLockByPostId(context.reddit, postId, true).catch(e => console.error(`Failed to fetch ${postId} in redditHelpers.lockByPostId`, e));
        } else {
            console.log(`Skipped lock on ${postId} because it got a lock action in the past ${actionDebounce} seconds.`);
        }
    }

    // Handle leaving a comment
    if (flairConfig.comment) {
        // Avoids duplicating removal reasons if the post already got a sticky/distinguish action, like when Toolbox is used.
        if (!await hasPerformedActions(context.reddit, subreddit, postId, ["sticky", "distinguish"], moderatorName, false, actionDebounce)) {
            console.log(`Commenting on ${postId}`);
            const commentText = assembleRemovalReason(
                {
                    body: flairConfig.comment.body,
                    header: flairConfig.comment.headerFooter ? allSettings.headerTemplate?.toString() ?? "" : "",
                    footer: flairConfig.comment.headerFooter ? allSettings.footerTemplate?.toString() ?? "" : "",
                    joiner: "\n\n",
                },
                placeholders
            );
            const comment = await submitPostReply(context.reddit, postId, commentText, flairConfig.comment.distinguish, flairConfig.comment.sticky, flairConfig.comment.lock).catch(e => console.error(`Failed to submit comment on ${postId}`, e));
            console.log(`Commented on ${postId} with comment ${comment?.id}`);
        } else {
            console.log(`Skipped comment on ${postId} because it got a sticky/distinguish action in the past ${actionDebounce} seconds.`);
        }
    }
}
