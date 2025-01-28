import makeFetchCookie, { type FetchCookieImpl } from 'fetch-cookie';

// Types
interface LoginPayload {
    username_or_email: string;
    password: string;
}

// Core workout interfaces
interface WorkoutResponse {
    data: Workout[];
    limit: number;
    page: number;
    total: number;
    count: number;
    page_count: number;
    show_previous: boolean;
    show_next: boolean;
    sort_by: string;
    next: NextPage;
    summary: Record<string, number>;
    aggregate_stats: any[];
    total_heart_rate_zone_durations: null;
}

interface NextPage {
    workout_id: string;
    created_at: number;
}

interface Workout {
    created_at: number;
    device_type: string;
    end_time: number;
    fitness_discipline: string;
    has_pedaling_metrics: boolean;
    has_leaderboard_metrics: boolean;
    id: string;
    is_total_work_personal_record: boolean;
    is_outdoor: boolean;
    metrics_type: string | null;
    name: string;
    peloton_id: string;
    platform: string;
    start_time: number;
    status: string;
    timezone: string;
    title: string | null;
    total_work: number;
    user_id: string;
    workout_type: string;
    total_video_watch_time_seconds: number;
    total_video_buffering_seconds: number;
    v2_total_video_watch_time_seconds: number;
    v2_total_video_buffering_seconds: number;
    total_music_audio_play_seconds: null;
    total_music_audio_buffer_seconds: null;
    service_id: null;
    ride: Ride;
    created: number;
    device_time_created_at: number;
    strava_id: null;
    fitbit_id: null;
    effort_zones: null;
    is_splits_personal_record: boolean;
}

interface Ride {
    has_closed_captions: boolean;
    content_provider: string;
    content_format: string;
    description: string;
    difficulty_rating_avg: number;
    difficulty_rating_count: number;
    difficulty_level: string | null;
    distance: null;
    distance_display_value: null;
    distance_unit: null;
    duration: number;
    dynamic_video_recorded_speed_in_mph: number;
    extra_images: any[];
    fitness_discipline: string;
    fitness_discipline_display_name: string;
    has_pedaling_metrics: boolean;
    home_peloton_id: string | null;
    id: string;
    image_url: string;
    instructor_id: string;
    is_archived: boolean;
    is_closed_caption_shown: boolean;
    is_dynamic_video_eligible: boolean;
    is_explicit: boolean;
    is_fixed_distance: boolean;
    is_live_in_studio_only: boolean;
    language: string;
    length: number;
    live_stream_id: string;
    live_stream_url: null;
    location: string;
    metrics: string[];
    origin_locale: string;
    original_air_time: number;
    overall_rating_avg: number;
    overall_rating_count: number;
    pedaling_start_offset: number;
    pedaling_end_offset: number;
    pedaling_duration: number;
    rating: number;
    ride_type_id: string;
    ride_type_ids: string[];
    title: string;
    total_ratings: number;
    total_in_progress_workouts: number;
    total_workouts: number;
    vod_stream_url: string | null;
    vod_stream_id: string;
    class_type_ids: string[];
    difficulty_estimate: number;
    overall_estimate: number;
    availability: {
        is_available: boolean;
        reason: null;
    };
    explicit_rating: number;
    flags: string[];
    instructor: Instructor;
}

interface Instructor {
    id: string;
    bio: string;
    short_bio: string;
    coach_type: string;
    is_active: boolean;
    is_filterable: boolean;
    is_instructor_group: boolean;
    individual_instructor_ids: any[];
    is_visible: boolean;
    is_announced: boolean;
    list_order: number;
    featured_profile: boolean;
    music_bio: string;
    spotify_playlist_uri: string;
    background: string;
    ordered_q_and_as: [string, string][];
    quote: string;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    user_id: string;
    image_url: string;
    instructor_hero_image_url: string;
    fitness_disciplines: string[];
    default_cross_fade: number;
    default_cue_delay: number;
}

interface TagDetailResponse {
    data: {
        tag: Tag;
    };
}

interface Tag {
    name: string;
    followingCount: number;
    assets: TagAssets;
    users: UserPaginatedList;
    __typename: 'Tag';
}

interface TagAssets {
    backgroundImage: Media;
    detailBackgroundImage: Media;
    __typename: 'TagAssets';
}

interface Media {
    location: string;
    __typename: 'Media';
}

interface UserPaginatedList {
    totalCount: number;
    edges: UserEdge[];
    pageInfo: PageInfo;
    __typename: 'UserPaginatedList';
}

interface UserEdge {
    node: User;
    __typename: 'UserEdge';
}

interface User {
    id: string;
    username: string;
    assets: UserAssets;
    followStatus: 'SELF' | 'FOLLOWING' | 'NONE';
    protectedFields: UserProtectedFields | UserPrivacyError;
    __typename: 'User';
}

interface UserAssets {
    image: Media;
    __typename: 'UserAssets';
}

interface UserProtectedFields {
    totalWorkoutCounts: number;
    __typename: 'UserProtectedFields';
}

interface UserPrivacyError {
    code: string;
    message: string;
    __typename: 'UserPrivacyError';
}

interface PageInfo {
    hasNextPage: boolean;
    endCursor: string;
    __typename: 'PageInfo';
}

interface TagDetailVariables {
    tagName: string;
    after?: string;
}

export class PelotonAPI {
    private fetch: FetchCookieImpl<string | URL | Request, RequestInit, Response>;
    private readonly defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    constructor() {
        this.fetch = makeFetchCookie(fetch);
    }

    async login(): Promise<void> {
        const payload: LoginPayload = {
            username_or_email: process.env['PELOTON_USERNAME'] || '',
            password: process.env['PELOTON_PASSWORD'] || ''
        };

        await this.fetch('https://api.onepeloton.com/auth/login', {
            ...this.defaultOptions,
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async getWorkouts(userId: string): Promise<Workout[]> {
        const requestUrl = `https://api.onepeloton.com/api/user/${userId}/workouts?joins=ride,ride.instructor`;

        try {
            const response = await this.fetch(requestUrl, this.defaultOptions);

            if (response.status === 401) {
                await this.login();
                return this.getWorkouts(userId);
            }
            if (response.status === 403) {
                // Private user, must accept follow to view workouts
                return [];
            }
            if (response.status >= 500) {
                console.error(`Peloton API returned ${response.status}.`);
                process.exit(1);
            }

            const data = await response.json() as WorkoutResponse;
            return data.data;
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
            throw error;
        }
    }

    async getUsersInTag(tag: string, after?: string): Promise<{ users: Array<{ id: string; username: string }> }> {
        const requestUrl = 'https://gql-graphql-gateway.prod.k8s.onepeloton.com/graphql';
        const body: { operationName: string; query: string; variables: TagDetailVariables } = {
            operationName: 'TagDetail',
            query: 'query TagDetail($tagName: String!, $after: Cursor) {tag(tagName: $tagName) {name followingCount assets { backgroundImage { location __typename } detailBackgroundImage { location __typename } __typename } users(after: $after) { totalCount edges { node { id username assets { image { location __typename } __typename } followStatus protectedFields { ... on UserProtectedFields { totalWorkoutCounts __typename } ... on UserPrivacyError { code message __typename } __typename } __typename } __typename } pageInfo { hasNextPage endCursor __typename } __typename } __typename } }',
            variables: {
                tagName: tag
            }
        };
        if (after) {
            body.variables.after = after;
        }

        try {
            const response = await this.fetch(requestUrl, {
                ...this.defaultOptions,
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (response.status === 401) {
                await this.login();
                return this.getUsersInTag(tag, after);
            }
            if (response.status === 503) {
                console.error('Peloton API returned 503.');
                process.exit(1);
            }

            const data = await response.json() as TagDetailResponse;
            const users = data.data.tag.users.edges.map(edge => ({
                id: edge.node.id,
                username: edge.node.username
            }));

            // Check if there are more pages
            if (data.data.tag.users.pageInfo.hasNextPage) {
                const nextPage = await this.getUsersInTag(tag, data.data.tag.users.pageInfo.endCursor);
                return {
                    users: [...users, ...nextPage.users]
                };
            }

            return { users };
        } catch (error) {
            console.error('Failed to fetch users in tag:', error);
            throw error;
        }
    }
}
