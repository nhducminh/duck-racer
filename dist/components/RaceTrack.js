"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RaceTrack {
    constructor(ducks, trackLength = 100) {
        this.ducks = ducks;
        this.trackLength = trackLength;
    }
    displayTrack() {
        console.log("Race Track:");
        this.ducks.forEach(duck => {
            console.log(`${duck}: ${this.getDuckPosition(duck)}`);
        });
    }
    getDuckPosition(duck) {
        const position = Math.floor(Math.random() * this.trackLength);
        return "=".repeat(position) + ">" + " ".repeat(this.trackLength - position);
    }
}
exports.default = RaceTrack;
