class DuckRace {
    private participants: string[];
    private raceInterval: NodeJS.Timeout | null = null;
    private isRacing: boolean;

    constructor(participants: string[]) {
        this.participants = participants;
        this.isRacing = false;
    }

    startRace(): void {
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

    stopRace(): void {
        if (!this.isRacing) {
            console.log("The race is not currently in progress!");
            return;
        }

        clearInterval(this.raceInterval!);
        this.isRacing = false;
        console.log("The race has ended!");
    }

    private updatePositions(): void {
        const randomIndex = Math.floor(Math.random() * this.participants.length);
        const participant = this.participants[randomIndex];
        console.log(`${participant} has moved forward!`);
    }
}

export default DuckRace;