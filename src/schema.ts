import {JSONSchemaType} from "ajv";
import {FlairEntries} from "./types.js";

export const flairEntriesSchema: JSONSchemaType<FlairEntries> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    items: {
        type: "object",
        additionalProperties: false,
        properties: {
            action: {
                enum: [
                    "approve",
                    "remove",
                    "spam",
                ],
                type: "string",
                nullable: true,
            },
            ban: {
                additionalProperties: false,
                properties: {
                    duration: {
                        type: "number",
                        nullable: true,
                    },
                    message: {
                        type: "string",
                    },
                    note: {
                        type: "string",
                    },
                    reason: {
                        type: "string",
                    },
                },
                required: [
                    "message",
                    "note",
                    "reason",
                ],
                type: "object",
                nullable: true,
            },
            clearPostFlair: {
                type: "boolean",
                nullable: true,
            },
            comment: {
                additionalProperties: false,
                properties: {
                    body: {
                        type: "string",
                    },
                    distinguish: {
                        type: "boolean",
                        nullable: true,
                    },
                    headerFooter: {
                        type: "boolean",
                        nullable: true,
                    },
                    lock: {
                        type: "boolean",
                        nullable: true,
                    },
                    sticky: {
                        type: "boolean",
                        nullable: true,
                    },
                },
                required: [
                    "body",
                ],
                type: "object",
                nullable: true,
            },
            contributor: {
                enum: [
                    "add",
                    "remove",
                ],
                type: "string",
                nullable: true,
            },
            lock: {
                type: "boolean",
                nullable: true,
            },
            ignoreReports: {
                type: "boolean",
                nullable: true,
            },
            templateId: {
                type: "string",
            },
            userFlair: {
                additionalProperties: false,
                properties: {
                    cssClass: {
                        type: "string",
                    },
                    templateId: {
                        type: "string",
                    },
                    text: {
                        type: "string",
                    },
                },
                required: [
                    "cssClass",
                    "templateId",
                    "text",
                ],
                type: "object",
                nullable: true,
            },
        },
        required: [
            "templateId",
        ],
    },
};
