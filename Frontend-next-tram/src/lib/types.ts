export type Departure = {
	shortName: string;
	direction: string;
	estimatedTime: string;
	serviceJourney?: string;
	line?: string;
	platform: string;
};
