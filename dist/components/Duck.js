"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Duck {
    constructor(name) {
        this.name = name;
        this.position = 0;
    }
    move() {
        this.position += Math.random() * 10; // Move the duck a random distance
    }
}
exports.default = Duck;
