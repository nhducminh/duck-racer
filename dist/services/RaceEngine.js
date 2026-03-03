"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RaceEngine {
    constructor(participants, raceDuration) {
        this.participants = participants;
        this.raceDuration = raceDuration;
        this.intervalId = null;
    }
    startRace(callback) {
        const startTime = Date.now();
        const endTime = startTime + this.raceDuration;
        this.intervalId = setInterval(() => {
            if (Date.now() >= endTime) {
                clearInterval(this.intervalId);
                const winner = this.selectRandomParticipant();
                callback(winner);
            }
        }, 100);
    }
    stopRace() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    selectRandomParticipant() {
        const randomIndex = Math.floor(Math.random() * this.participants.length);
        return this.participants[randomIndex];
    }
}
exports.default = RaceEngine;
