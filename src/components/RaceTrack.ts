class RaceTrack {
    private ducks: string[];
    private trackLength: number;

    constructor(ducks: string[], trackLength: number = 100) {
        this.ducks = ducks;
        this.trackLength = trackLength;
    }

    public displayTrack(): void {
        console.log("Race Track:");
        this.ducks.forEach(duck => {
            console.log(`${duck}: ${this.getDuckPosition(duck)}`);
        });
    }

    private getDuckPosition(duck: string): string {
        const position = Math.floor(Math.random() * this.trackLength);
        return "=".repeat(position) + ">" + " ".repeat(this.trackLength - position);
    }
}

export default RaceTrack;