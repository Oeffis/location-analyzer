import { getDistance } from "geolib";
import { getVrrStops } from "./getVrrStops";

export class LocationAnalyzer {
    private currentLocation?: GeoLocation;
    private status?: Status;

    public constructor(
        private stops: Stop[] = []
    ) { }

    public updateLocation(location?: GeoLocation): void {
        this.currentLocation = location;
        this.invalidateStatus();
    }

    private invalidateStatus(): void {
        this.status = undefined;
    }

    public getStatus(): Status {
        this.status = this.status ?? this.calculateStatus();
        return this.status;
    }

    private calculateStatus(): Status {
        const currentLocation = this.currentLocation;
        if (!currentLocation) {
            return {
                stops: []
            };
        }

        const sortedStops = this.stops
            .map(stop => ({
                id: stop.id,
                distance: getDistance(currentLocation, stop.location)
            }))
            .sort((a, b) => a.distance - b.distance);
        return { stops: sortedStops };
    }

    public updateStops(stops: Stop[]): void {
        this.stops = stops;
        this.invalidateStatus();
    }

    public static async forVRR(): Promise<LocationAnalyzer> {
        return new LocationAnalyzer(await getVrrStops());
    }
}

export interface Status {
    stops: {
        id: string;
        distance: number;
    }[];
}

export interface Stop {
    id: string;
    parent: string;
    location: GeoLocation;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    altitude?: number;
}
