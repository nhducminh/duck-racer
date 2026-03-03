"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DuckRace {
    constructor(participants) {
        this.raceInterval = null;
        this.participants = participants;
        this.isRacing = false;
    }
    startRace() {
        if (this.isRacing) {
            console.log("The race is already in progress!");
            return;
        }
        this.isRacing = true;
        console.log("The race has started!");
        this.raceInterval = setInterval(() => {
            this.updatePositions();
        }, 1000);
    }
    stopRace() {
        if (!this.isRacing) {
            console.log("The race is not currently in progress!");
            return;
        }
        clearInterval(this.raceInterval);
        this.isRacing = false;
        console.log("The race has ended!");
    }
    updatePositions() {
        const randomIndex = Math.floor(Math.random() * this.participants.length);
        const participant = this.participants[randomIndex];
        console.log(`${participant} has moved forward!`);
    }
}
exports.default = DuckRace;
