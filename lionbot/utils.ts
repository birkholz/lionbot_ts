import * as Sentry from "@sentry/bun";
import pluralize from 'pluralize';
import ordinal from 'ordinal';

export function sendDiscordRequest(requestMethod: string, endpoint: string, requestBody: Record<string, unknown>) : Promise<Record<string, unknown>> {
    const messageUrl = `https://discordapp.com/api/${endpoint}`
    const headers = {
        "Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
    }

    const request =  new Request(messageUrl, {
        method: requestMethod,
        headers: headers,
        body: JSON.stringify(requestBody)
    })

    return fetch(request)
        .then((response) => {
            if (!response.ok) {
                Sentry.captureException("Discord Error", {
                    extra: {
                        "source": "Discord",
                        "request.body": requestBody,
                        "response.body": response.body
                    }
                })
            }
            if (response.status != 204) {
                return response.json()
            }
            return {}
        })
}

export function isWithinInterval(timestamp: number, intervalMs: number): boolean {
    const dt = new Date(timestamp * 1000);
    const now = new Date();
    const minDt = new Date(now.getTime() - intervalMs);
    return dt > minDt;
}

export function isPreviousDay(workout: { created_at: number; timezone: string | null }): boolean {
    if (!workout.timezone) {
        return false;
    }

    const dt = new Date(workout.created_at * 1000);
    const now = new Date();

    // Get yesterday's date in user's timezone
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Set to user's timezone
    const userDt = new Date(dt.toLocaleString('en-US', { timeZone: workout.timezone }));
    const userYesterday = new Date(yesterday.toLocaleString('en-US', { timeZone: workout.timezone }));

    // Get start and end of yesterday in user's timezone
    const minDt = new Date(userYesterday.setHours(0, 0, 0, 0));
    const maxDt = new Date(userYesterday.setHours(23, 59, 59, 999));

    return userDt > minDt && userDt < maxDt;
}

export function humanize(i: number): string {
    return ordinal(i + 1);
}
