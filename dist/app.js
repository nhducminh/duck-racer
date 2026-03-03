"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Get base path from environment variable or default to empty
const BASE_PATH = process.env.BASE_PATH || '';
// Serve static files from the public directory
app.use(BASE_PATH, express_1.default.static(path_1.default.join(__dirname, '../public')));
// Serve the index.html file
app.get(BASE_PATH + '/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Serve the race.html file (with and without .html extension)
app.get(BASE_PATH + '/race.html', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/race.html'));
});
app.get(BASE_PATH + '/race', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/race.html'));
});
// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Base path: ${BASE_PATH || '(root)'}`);
    console.log(`Network access: http://192.168.10.157:${PORT}${BASE_PATH}`);
});
