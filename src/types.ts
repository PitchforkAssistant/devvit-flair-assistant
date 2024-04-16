import {UserNoteLabel} from "@devvit/public-api";

export type FlairComment = {
    body: string;
    sticky?: boolean;
    lock?: boolean;
    distinguish?: boolean;
    headerFooter?: boolean;
}

export type FlairChangeOptions = {
    templateId: string;
    cssClass: string;
    text: string;
}

export type FlairBan = {
    duration?: number;
    message: string;
    note: string;
    reason: string;
}

export type FlairRemovalReason = {
    reasonId: string;
    note?: string;
}

export type FlairNote = {
    label: UserNoteLabel,
    note: string;
}

export type FlairAction = "remove" | "spam" | "approve";

export type FlairContributor = "add" | "remove";

export interface FlairEntry {
    templateId: string;
    action?: FlairAction;
    contributor?: FlairContributor;
    comment?: FlairComment;
    ban?: FlairBan;
    lock?: boolean;
    ignoreReports?: boolean;
    clearPostFlair?: boolean;
    clearUserFlair?: boolean;
    postFlair?: FlairChangeOptions;
    userFlair?: FlairChangeOptions;
    removalReason?: FlairRemovalReason;
    userNote?: FlairNote;
}

export type FlairEntries = FlairEntry[];
