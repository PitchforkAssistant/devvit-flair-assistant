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
}

export type FlairEntries = FlairEntry[];
