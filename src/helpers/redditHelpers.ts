import {ModActionType, RedditAPIClient} from "@devvit/public-api";
import {logError} from "./miscHelpers.js";
import {getTimeDeltaInSeconds} from "./dateHelpers.js";

export async function hasPerformedAction (reddit: RedditAPIClient, subredditName: string, actionTargetId: string, actionType: ModActionType, cutoffSeconds: number, includeParent: boolean, moderatorId?: string): Promise<boolean> {
    const modLog = await reddit.getModerationLog({subredditName, moderatorId, type: actionType, limit: 100, pageSize: 100}).all().catch(e => {
        logError(`Failed to fetch ${actionType} log for ${subredditName} by ${moderatorId ?? ""}`, e);
        return [];
    });
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

export async function hasPerformedActions (reddit: RedditAPIClient, subredditName: string, actionTargetId: string, actionTypes: ModActionType[], cutoffSeconds: number, includeParent: boolean, moderatorId?: string): Promise<boolean> {
    const actionChecks = actionTypes.map(actionType => hasPerformedAction(reddit, subredditName, actionTargetId, actionType, cutoffSeconds, includeParent, moderatorId));
    const results = await Promise.all(actionChecks);
    return results.includes(true);
}

export async function ignoreReportsByPostId (reddit: RedditAPIClient, postId: string): Promise<void> {
    const post = await reddit.getPostById(postId).catch(e => logError(`Failed to fetch post ${postId} in redditHelpers.ignoreReportsByPostId`, e));
    if (post) {
        return post.ignoreReports().catch(e => logError(`Failed to ignore reports for post ${postId} in redditHelpers.ignoreReportsByPostId`, e));
    } else {
        return Promise.reject(`Failed to fetch post ${postId} in redditHelpers.ignoreReportsByPostId`);
    }
}

export async function lockByPostId (reddit: RedditAPIClient, postId: string): Promise<void> {
    const post = await reddit.getPostById(postId).catch(e => logError(`Failed to fetch post ${postId} in redditHelpers.lockByPostId`, e));
    if (post) {
        return post.lock().catch(e => logError(`Failed to ignore reports for post ${postId} in redditHelpers.lockByPostId`, e));
    } else {
        return Promise.reject(`Failed to fetch post ${postId} in redditHelpers.lockByPostId`);
    }
}

export async function submitModComment (reddit: RedditAPIClient, postId: string, commentBody: string, distinguish: boolean | undefined, sticky: boolean | undefined, lock: boolean | undefined): Promise<void> {
    const comment = await reddit.submitComment({id: postId, text: commentBody}).catch(e => logError(`Failed to submit comment to post ${postId} in redditHelpers.submitModComment`, e));
    if (comment) {
        if (sticky || distinguish) {
            await comment.distinguish(sticky).catch(e => logError(`Failed to distinguish comment ${comment.id} in redditHelpers.submitModComment`, e));
        }
        if (lock) {
            await comment.lock().catch(e => logError(`Failed to lock comment ${comment.id} in redditHelpers.submitModComment`, e));
        }
    } else {
        return Promise.reject(`Failed to submit comment to post ${postId} in redditHelpers.submitModComment`);
    }
}
