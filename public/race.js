// Race Page Logic
class DuckRace {
    constructor() {
        this.participants = [];
        this.raceInterval = null;
        this.isRacing = false;
        this.finishers = [];
        this.duckPositions = [];
        this.raceSpeed = 1.0;
        this.trackWidth = 0;
        this.trackHeight = 0;
        this.topCount = 5;
        this.round = 1;
        this.multipleRounds = false;

        // DOM elements
        this.raceTrack = document.getElementById('raceTrack');
        this.resultsDiv = document.getElementById('results');
        this.backButton = document.getElementById('backButton');
        this.resultsModal = document.getElementById('resultsModal');
        this.modalContent = document.getElementById('modalContent');
        this.closeModal = document.querySelector('.close');

        this.init();
    }

    init() {
        this.loadParticipants();
        this.setupEventListeners();
        this.createRaceTrack();

        window.addEventListener('resize', () => this.updateTrackDimensions());
    }

    setupEventListeners() {
        this.backButton.addEventListener('click', () => this.goBack());
        this.closeModal.addEventListener('click', () => this.resultsModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === this.resultsModal) this.resultsModal.style.display = 'none';
        });

        // Speed Controls
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.raceSpeed = parseFloat(btn.dataset.speed);
                speedButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    loadParticipants() {
        const storedRaceData = localStorage.getItem('duckRaceData');
        if (storedRaceData) {
            try {
                const raceData = JSON.parse(storedRaceData);
                this.participants = raceData.participants;
                this.topCount = raceData.topCount || 5;
                this.round = raceData.round || 1;
                this.multipleRounds = raceData.multipleRounds || false;
            } catch (e) {
                console.error('Error parsing race data');
            }
        }

        if (!this.participants.length) {
            alert('Không có danh sách thí sinh!');
            this.goBack();
        }
    }

    createRaceTrack() {
        const roundInfo = this.multipleRounds ? ` - Lượt ${this.round}` : '';
        const raceInfo = `(Dừng khi có ${this.topCount} về đích)`;

        this.raceTrack.innerHTML = `
            <div class="single-lane">
                <div class="lane-header">
                    🦆 Đường đua duy nhất - ${this.participants.length} thí sinh - Top ${this.topCount}${roundInfo} 🦆
                    <div class="race-info">${raceInfo}</div>
                    <button id="startRaceButton" class="start-race-btn">Bắt đầu cuộc đua</button>
                </div>
                <div class="race-track-area" id="trackArea">
                    <div class="race-progress" id="raceProgress">Chờ bắt đầu...</div>
                    <div class="finish-line">🏁</div>
                </div>
                <div class="participants-grid" id="participantsGrid"></div>
            </div>
        `;

        this.trackArea = document.getElementById('trackArea');
        this.participantsGrid = document.getElementById('participantsGrid');
        this.startButton = document.getElementById('startRaceButton');
        this.raceProgress = document.getElementById('raceProgress');

        this.startButton.addEventListener('click', () => this.startRace());

        this.updateTrackDimensions();
        this.createParticipantCards();
        this.createDucks();
    }

    updateTrackDimensions() {
        const trackRect = this.trackArea?.getBoundingClientRect();
        if (trackRect) {
            this.trackWidth = trackRect.width - 80;
            this.trackHeight = trackRect.height - 40;
        }
    }

    createParticipantCards() {
        this.participantsGrid.innerHTML = '';
        this.participants.forEach((participant, index) => {
            const card = document.createElement('div');
            card.className = 'participant-card';
            card.id = `card-${index}`;
            card.innerHTML = `
                <div class="participant-name">${participant}</div>
                <div class="participant-position" id="position-${index}">Chờ đua...</div>
            `;
            this.participantsGrid.appendChild(card);
        });
    }

    createDucks() {
        const minDistance = 120;
        const usedPositions = [];
        const duckEmojis = ['🦆', '🦢', '🐥', '🐤'];
        const colors = ['#FF6B6B33', '#4ECDC433', '#45B7D133', '#FFA07A33', '#98D8C833', '#F7DC6F33', '#BB8FCE33'];

        this.participants.forEach((participant, index) => {
            const duck = document.createElement('div');
            duck.className = 'duck';
            duck.id = `duck-${index}`;

            const emoji = duckEmojis[Math.floor(Math.random() * duckEmojis.length)];
            duck.innerHTML = emoji;
            duck.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            let randomY, attempts = 0;
            do {
                randomY = Math.random() * (this.trackHeight - 150) + 75;
                attempts++;
            } while (attempts < 200 && usedPositions.some(pos => Math.abs(pos - randomY) < minDistance));

            if (attempts >= 200) randomY = (index * 60) % (this.trackHeight - 150) + 75;
            usedPositions.push(randomY);

            duck.style.left = '20px';
            duck.style.top = `${randomY}px`;

            const nameLabel = document.createElement('div');
            nameLabel.className = 'duck-name';
            nameLabel.id = `name-${index}`;
            nameLabel.textContent = participant;
            nameLabel.style.left = '20px';
            nameLabel.style.top = `${randomY - 25}px`;
            nameLabel.style.display = 'none';

            this.trackArea.appendChild(duck);
            this.trackArea.appendChild(nameLabel);

            this.duckPositions[index] = {
                x: 20,
                y: randomY,
                participant: participant,
                finished: false,
                baseSpeed: Math.random() * 2 + 2,
                currentSpeed: 2,
                speedTimer: 0
            };
        });
    }

    startRace() {
        if (this.isRacing) return;
        this.isRacing = true;
        this.startButton.disabled = true;
        this.startButton.textContent = 'Đang đua...';
        this.finishers = [];
        this.resultsDiv.style.display = 'none';

        // Reset positions
        this.participants.forEach((p, i) => {
            this.duckPositions[i].x = 20;
            this.duckPositions[i].finished = false;
            const duck = document.getElementById(`duck-${i}`);
            duck.style.left = '20px';
            document.getElementById(`position-${i}`).textContent = 'Đua...';
        });

        this.raceInterval = setInterval(() => this.updateRace(), 50);
    }

    updateRace() {
        let alive = false;
        this.participants.forEach((p, i) => {
            const data = this.duckPositions[i];
            if (data.finished) return;
            alive = true;

            data.speedTimer++;
            if (data.speedTimer > 20) {
                data.speedTimer = 0;
                data.currentSpeed = data.baseSpeed * (Math.random() * 1.5 + 0.5);
            }

            const move = data.currentSpeed * this.raceSpeed;
            data.x += move;
            data.y += (Math.random() - 0.5) * 2 * this.raceSpeed;
            data.y = Math.max(50, Math.min(this.trackHeight - 50, data.y));

            const duck = document.getElementById(`duck-${i}`);
            const name = document.getElementById(`name-${i}`);
            duck.style.left = `${data.x}px`;
            duck.style.top = `${data.y}px`;
            name.style.left = `${data.x}px`;
            name.style.top = `${data.y - 25}px`;

            // Logic showing names for leaders
            const leaders = this.participants.map((_, idx) => ({ idx, x: this.duckPositions[idx].x }))
                .sort((a, b) => b.x - a.x).slice(0, 5).map(l => l.idx);
            name.style.display = leaders.includes(i) ? 'block' : 'none';

            if (data.x >= this.trackWidth - 10) {
                data.finished = true;
                this.finishers.push({ name: p, round: this.round });
                document.getElementById(`position-${i}`).textContent = `Top ${this.finishers.length}`;
                document.getElementById(`card-${i}`).classList.add('finished');
                this.addCelebration(duck);

                if (this.finishers.length >= this.topCount) {
                    this.endRace();
                }
            }
        });

        this.updateProgress();
        if (!alive) this.endRace();
    }

    updateProgress() {
        const remaining = this.topCount - this.finishers.length;
        this.raceProgress.textContent = remaining > 0 ?
            `🔥 Còn ${remaining} chú vịt nữa về đích (${this.finishers.length}/${this.topCount})` :
            `✅ Đã đủ Top ${this.topCount}!`;
    }

    addCelebration(duck) {
        duck.classList.add('celebrate');
        this.createConfetti();
    }

    createConfetti() {
        for (let i = 0; i < 10; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.innerHTML = ['🎉', '✨', '⭐', '🎈'][Math.floor(Math.random() * 4)];
            c.style.left = Math.random() * 100 + 'vw';
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 3000);
        }
    }

    endRace() {
        clearInterval(this.raceInterval);
        this.isRacing = false;
        this.startButton.disabled = false;
        this.startButton.textContent = 'Đua lượt mới';

        if (this.multipleRounds) {
            const results = {
                winners: this.finishers.slice(0, this.topCount).map(f => f.name),
                topCount: this.topCount,
                round: this.round
            };
            localStorage.setItem('raceResults', JSON.stringify(results));
        }

        this.showResults();
    }

    showResults() {
        this.resultsDiv.style.display = 'block';
        let html = `<h3>🏆 Top ${this.topCount} Kết thúc 🏆</h3><ol>`;
        this.finishers.slice(0, this.topCount).forEach((f, i) => {
            html += `<li><span class="position">${i + 1}</span> <span class="name">${f.name}</span></li>`;
        });
        html += '</ol>';
        this.resultsDiv.innerHTML = html;

        this.resultsModal.style.display = 'block';
        this.modalContent.innerHTML = `<h2>Kết quả Top ${this.topCount}</h2>` + html;
    }

    goBack() {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => new DuckRace());