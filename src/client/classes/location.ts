export interface LocationData {
    name: string;
    flavour: string;
    config: { [setting: string]: boolean };
}

export interface LocationSettings {
    [setting: string]: boolean;
}

export const DEFAULT_LOCATION_SETTINGS: LocationSettings = {
    allow_public_votes: false,
    allow_dead_player_voting: false,
    allow_dead_player_nominating: false,
};

export default class Location {
    constructor(
        public readonly id: string,
        public name: string,
        public flavour: string,
        public config: LocationSettings,
    ) {}
}
