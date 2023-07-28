export interface FlairComment {
    body: string;
    sticky: boolean;
    lock: boolean;
    distinguish: boolean;
    headerFooter: boolean;
}

export interface FlairUserFlair {
    templateId: string;
    cssClass: string;
    text: string;
}

export interface FlairBan {
    duration?: number;
    message: string;
    note: string;
}

export interface FlairEntry {
    templateId: string;
    action?: "remove" | "spam" | "approve";
    comment?: FlairComment;
    userFlair?: FlairUserFlair;
    contributor?: "add" | "remove";
    ban?: FlairBan;
    lock?: boolean;
    clearPostFlair?: boolean;
}

export type FlairEntries = Array<FlairEntry>;
