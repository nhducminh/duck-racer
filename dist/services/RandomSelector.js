"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRandom = void 0;
function selectRandom(items) {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
}
exports.selectRandom = selectRandom;
