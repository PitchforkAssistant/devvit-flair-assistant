import {ModAction} from "@devvit/protos";
import {Locale} from "date-fns";
import {isValidDate, safeTimeformat} from "./dateHelpers.js";
import {domainFromUrlString} from "./miscHelpers.js";

// Devvit does not support string.replaceAll() even if ES2021.String is specified in tsconfig.json.
function replaceAll (text: string, placeholder: string, replacement:string) : string {
    return text.replace(new RegExp(placeholder, "g"), replacement);
}

export function hasPlaceholders (text: string): boolean {
    return !!text && text.includes("{{") && text.includes("}}");
}

export function replacePlaceholders (text: string, modAction: ModAction, timeformat: string, timezone: string, locale: Locale, header = "", footer = ""): string {
    // Skip everything if inputs are empty or contain no placeholders.
    if (!hasPlaceholders(text) && !hasPlaceholders(header) && !hasPlaceholders(footer)) {
        return text;
    }

    // Replace moderator placeholders first to prevent exploits revealing moderator names.
    text = replaceAll(text, "{{mod}}", modAction.moderator?.name ?? "");

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
        "{{time_custom}}": "",
        "{{created_iso}}": isValidDate(createdAt) ? createdAt.toISOString() : "",
        "{{created_unix}}": isValidDate(createdAt) ? (time.getTime() / 1000).toString() : "",
        "{{created_custom}}": "",
        "{{actioned_iso}}": isValidDate(actionedAt) ? createdAt.toISOString() : "",
        "{{actioned_unix}}": isValidDate(actionedAt) ? (time.getTime() / 1000).toString() : "",
        "{{actioned_custom}}": "",
    };

    if (timeformat) {
        replacements["{{time_custom}}"] = safeTimeformat(time, timeformat, timezone, locale);
        replacements["{{actioned_custom}}"] = safeTimeformat(actionedAt, timeformat, timezone, locale);
        replacements["{{created_custom}}"] = safeTimeformat(createdAt, timeformat, timezone, locale);
    }

    for (const [placeholder, replacement] of Object.entries(replacements)) {
        text = replaceAll(text, placeholder, replacement);
    }

    if (header || footer) {
        return `${replacePlaceholders(header, modAction, timeformat, timezone, locale)}\n\n${text}\n\n${replacePlaceholders(footer, modAction, timeformat, timezone, locale)}`;
    } else {
        return text;
    }
}
