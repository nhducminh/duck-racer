"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = exports.formatOutput = void 0;
function formatOutput(duckName, position) {
    return `${duckName} is at position ${position}`;
}
exports.formatOutput = formatOutput;
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.generateRandomNumber = generateRandomNumber;
