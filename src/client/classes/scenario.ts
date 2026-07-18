import Location from './location';

export interface ScenarioData {
    name: string;
    flavour: string;
    chars: string[];
    roles: string[];
    location: string[]; // TODO should only allow one location
}

export default class Scenario {
    constructor(
        public readonly id: string,
        public name: string,
        public flavour: string,
        public chars: number[],
        public roles: number[],
        public location: Location,
    ) {}
}
