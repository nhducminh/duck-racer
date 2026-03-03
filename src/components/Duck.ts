class Duck {
    name: string;
    position: number;

    constructor(name: string) {
        this.name = name;
        this.position = 0;
    }

    move() {
        this.position += Math.random() * 10; // Move the duck a random distance
    }
}

export default Duck;