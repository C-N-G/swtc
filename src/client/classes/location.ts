export interface LocationData {
    name: string;
    flavour: string;
    effect: string;
    config: { [setting: string]: boolean };
}

export const DEFAULT_LOCATION_SETTINGS = {
    allow_public_votes: false,
    allow_dead_player_voting: false,
    allow_dead_player_nominating: false,
};

export type LocationSettings = Record<keyof typeof DEFAULT_LOCATION_SETTINGS, boolean>;

export default class Location {
    constructor(
        public readonly id: string,
        public name: string,
        public flavour: string,
        public effect: string,
        public config: LocationSettings,
    ) {}
}
