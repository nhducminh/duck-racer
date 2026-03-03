class RaceEngine {
    private participants: string[];
    private raceDuration: number;
    private intervalId: NodeJS.Timeout | null;

    constructor(participants: string[], raceDuration: number) {
        this.participants = participants;
        this.raceDuration = raceDuration;
        this.intervalId = null;
    }

    public startRace(callback: (winner: string) => void): void {
        const startTime = Date.now();
        const endTime = startTime + this.raceDuration;

        this.intervalId = setInterval(() => {
            if (Date.now() >= endTime) {
                clearInterval(this.intervalId!);
                const winner = this.selectRandomParticipant();
                callback(winner);
            }
        }, 100);
    }

    public stopRace(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private selectRandomParticipant(): string {
        const randomIndex = Math.floor(Math.random() * this.participants.length);
        return this.participants[randomIndex];
    }
}

export default RaceEngine;