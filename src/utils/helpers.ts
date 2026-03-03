export function formatOutput(duckName: string, position: number): string {
    return `${duckName} is at position ${position}`;
}

export function generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}