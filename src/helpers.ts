import {ModAction} from "@devvit/protos";
import {ModActionType, RedditAPIClient} from "@devvit/public-api";
import {format} from "date-fns";
import {enUS} from "date-fns/locale";

export function domainFromUrlString (urlString: string): string {
    try {
        const url = new URL(urlString);
        return url.hostname;
    } catch (error) {
        return "";
    }
}

export function safeTimeformat (datetime: Date, timeformat: string, locale = enUS): string {
    try {
        return format(datetime, timeformat, {locale});
    } catch (e) {
        return "";
    }
}

export function toNumberOrDefault (input: unknown, defaultValue: number): number {
    try {
        const value = Number(input);
        return isNaN(value) ? defaultValue : value;
    } catch (error) {
        return defaultValue;
    }
}

export function getTimeDeltaInSeconds (a: Date, b: Date): number {
    if (!a || !b) {
        return Infinity;
    }
    return Math.abs(a.getTime() - b.getTime()) / 1000;
}

export async function hasPerformedAction (reddit: RedditAPIClient, subredditName: string, actionTargetId: string, actionType: ModActionType, cutoffSeconds: number, includeParent: boolean, moderatorId?: string,): Promise<boolean> {
    const modLog = await reddit.getModerationLog({subredditName, moderatorId, type: actionType, limit: 100, pageSize: 100}).all();
    for (const modAction of modLog) {
        if (getTimeDeltaInSeconds(new Date(), modAction.createdAt) < cutoffSeconds) {
            if (modAction.target?.id === actionTargetId) {
                return true;
            } else if (includeParent && modAction.target?.permalink?.startsWith(`/r/${subredditName}/comments/${actionTargetId.substring(3)}/`)) {
                return true;
            }
        }
    }
    return false;
}

export async function hasPerformedActions (reddit: RedditAPIClient, subredditName: string, actionTargetId: string, actionTypes: ModActionType[], cutoffSeconds: number, includeParent: boolean, moderatorId?: string,): Promise<boolean> {
    const actionChecks = actionTypes.map(actionType => hasPerformedAction(reddit, subredditName, actionTargetId, actionType, cutoffSeconds, includeParent, moderatorId));
    const results = await Promise.all(actionChecks);
    return results.includes(true);
}

export function hasPlaceholders (text: string): boolean {
    return !!text && text.includes("{{") && text.includes("}}");
}

export function replacePlaceholders (text: string, modAction: ModAction, timeformat: string, header = "", footer = ""): string {
    // Skip everything if inputs are empty or contain no placeholders.
    if (!hasPlaceholders(text) && !hasPlaceholders(header) && !hasPlaceholders(footer)) {
        return text;
    }

    // Replace moderator placeholders first to prevent exploits revealing moderator names.
    text = text.replace("{{mod}}", modAction.moderator?.name ?? "");

    const postId = modAction.targetPost?.id.substring(3) ?? "";
    const time = new Date();
    const actionedAt = new Date(modAction.actionedAt ?? "");
    const createdAt = new Date(modAction.targetPost?.createdAt ?? "");
    const replacements = {
        "{{author}}": modAction.targetUser?.name ?? "",
        "{{subreddit}}": modAction.subreddit?.name ?? "",
        "{{body}}": modAction.targetPost?.selftext ?? "",
        "{{title}}": modAction.targetPost?.title ?? "",
        "{{kind}}": "submission",
        "{{permalink}}": `https://redd.it/${postId}`,
        "{{url}}": `https://redd.it/${postId}`,
        "{{link}}": modAction.targetPost?.url ?? "",
        "{{domain}}": domainFromUrlString(modAction.targetPost?.url ?? ""),
        "{{author_id}}": modAction.targetPost?.authorId.substring(3) ?? "",
        "{{subreddit_id}}": modAction.subreddit?.id.substring(3) ?? "",
        "{{id}}": postId,
        "{{author_flair_text}}": modAction.targetPost?.authorFlair?.text ?? "",
        "{{author_flair_css_class}}": modAction.targetPost?.authorFlair?.cssClass ?? "",
        "{{author_flair_template_id}}": modAction.targetPost?.authorFlair?.templateId ?? "",
        "{{link_flair_text}}": modAction.targetPost?.linkFlair?.text ?? "",
        "{{link_flair_css_class}}": modAction.targetPost?.linkFlair?.cssClass ?? "",
        "{{link_flair_template_id}}": modAction.targetPost?.linkFlair?.templateId ?? "",
        "{{time_iso}}": time.toISOString(),
        "{{time_unix}}": (time.getTime() / 1000).toString(),
    };

    // These might be invalid dates.
    if (createdAt) {
        replacements["{{created_iso}}"] = createdAt.toISOString();
        replacements["{{created_unix}}"] = (createdAt.getTime() / 1000).toString();
    }
    if (actionedAt) {
        replacements["{{actioned_iso}}"] = actionedAt.toISOString();
        replacements["{{actioned_unix}}"] = (actionedAt.getTime() / 1000).toString();
    }
    if (timeformat) {
        replacements["{{time_custom}}"] = safeTimeformat(time, timeformat);
        replacements["{{actioned_custom}}"] = safeTimeformat(actionedAt, timeformat);
        replacements["{{created_custom}}"] = safeTimeformat(createdAt, timeformat);
    }

    for (const [placeholder, replacement] of Object.entries(replacements)) {
        text = text.replace(placeholder, replacement);
    }

    if (header || footer) {
        return `${replacePlaceholders(header, modAction, timeformat)}\n\n${text}\n\n${replacePlaceholders(footer, modAction, timeformat)}`;
    } else {
        return text;
    }
}
