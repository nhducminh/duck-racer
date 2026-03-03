// ===== Vòng Quay May Mắn - Lucky Wheel Logic =====
class LuckyWheel {
    constructor() {
        // Brand Colors
        this.COLORS = {
            red: '#E64B19',
            blue: '#1A97A4',
            green: '#508A3B',
            yellow: '#FFC107',
            neutral: '#F4F4F4',
        };

        // Segment palette (derived from brand)
        this.SEGMENT_COLORS = [
            '#E64B19', '#1A97A4', '#508A3B', '#FFC107',
            '#FF8A65', '#4DB6AC', '#81C784', '#FFD54F',
            '#EF5350', '#26A69A', '#66BB6A', '#FFCA28',
            '#D84315', '#00897B', '#43A047', '#FFB300',
        ];

        this.participants = [];
        this.allParticipants = [];
        this.winners = [];
        this.excluded = []; // Danh sách những người bị loại hoàn toàn (ko có mặt hoặc bị xoá)
        this.isSpinning = false;
        this.currentAngle = 0;
        this.pendingWinner = null;

        // Canvas
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 10;

        // DOM
        this.spinBtn = document.getElementById('spinBtn');
        this.winnersList = document.getElementById('winnersList');
        this.winnersCount = document.getElementById('winnersCount');
        this.participantsCount = document.getElementById('participantsCount');
        this.remainingCount = document.getElementById('remainingCount');
        this.remainingList = document.getElementById('remainingList');
        this.winnersActions = document.getElementById('winnersActions');
        this.clearWinnersBtn = document.getElementById('clearWinnersBtn');
        this.backBtn = document.getElementById('backBtn');
        this.winnerModal = document.getElementById('winnerModal');
        this.winnerDisplayName = document.getElementById('winnerDisplayName');
        this.acceptWinnerBtn = document.getElementById('acceptWinnerBtn');
        this.rejectWinnerBtn = document.getElementById('rejectWinnerBtn');
        this.wheelPointer = document.getElementById('wheelPointer');

        this.init();
    }

    init() {
        this.loadParticipants();
        this.loadWinners();
        this.loadExcluded(); // Tải danh sách bị loại
        this.filterParticipants();
        this.drawWheel();
        this.updateUI();

        this.spinBtn.addEventListener('click', () => this.spin());
        this.clearWinnersBtn.addEventListener('click', () => this.clearAllWinners());
        this.backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
        this.acceptWinnerBtn.addEventListener('click', () => this.confirmWinner());
        this.rejectWinnerBtn.addEventListener('click', () => this.rejectCurrentWinner());

        // Responsive canvas
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const wrapper = document.querySelector('.wheel-wrapper');
        if (!wrapper) return;

        const size = Math.min(wrapper.clientWidth, wrapper.clientHeight);
        const canvasSize = Math.max(280, size - 20);
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        this.centerX = canvasSize / 2;
        this.centerY = canvasSize / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 10;
        this.drawWheel();
    }

    loadParticipants() {
        // Ưu tiên lấy từ duckRaceData (cùng nguồn với cuộc đua)
        const raceDataStored = localStorage.getItem('duckRaceData');
        if (raceDataStored) {
            try {
                const raceData = JSON.parse(raceDataStored);
                this.allParticipants = raceData.participants;
            } catch (e) {
                console.error('Error parsing duckRaceData');
            }
        } else {
            // Fallback sang key cũ nếu không có raceData
            const stored = localStorage.getItem('duckRaceParticipants');
            if (stored) {
                try {
                    this.allParticipants = JSON.parse(stored);
                } catch (e) {
                    console.error('Error parsing participants');
                }
            }
        }

        if (this.allParticipants.length === 0) {
            this.allParticipants = this.getDefaultParticipants();
        }
    }

    loadWinners() {
        const stored = localStorage.getItem('luckyWheelWinners');
        if (stored) {
            try {
                this.winners = JSON.parse(stored);
            } catch (e) {
                this.winners = [];
            }
        }
    }

    loadExcluded() {
        const stored = localStorage.getItem('duckRaceExcluded');
        if (stored) {
            try {
                this.excluded = JSON.parse(stored);
            } catch (e) {
                this.excluded = [];
            }
        }
    }

    saveWinners() {
        localStorage.setItem('luckyWheelWinners', JSON.stringify(this.winners));
    }

    saveExcluded() {
        localStorage.setItem('duckRaceExcluded', JSON.stringify(this.excluded));
    }

    filterParticipants() {
        const winnerNames = new Set(this.winners.map(w => w.name));
        const excludedNames = new Set(this.excluded);
        this.participants = this.allParticipants.filter(p => !winnerNames.has(p) && !excludedNames.has(p));
    }

    // ===== DRAWING =====

    drawWheel() {
        const ctx = this.ctx;
        const total = this.participants.length;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (total === 0) {
            this.drawEmptyWheel();
            return;
        }

        // Use total count for both drawing and logic to ensure accuracy
        const displayCount = total;
        const segAngle = (2 * Math.PI) / displayCount;

        for (let i = 0; i < displayCount; i++) {
            const startAngle = this.currentAngle + i * segAngle;
            const endAngle = startAngle + segAngle;

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = this.SEGMENT_COLORS[i % this.SEGMENT_COLORS.length];
            ctx.fill();

            // Segment border (hide for very high counts to avoid noise)
            if (displayCount < 100) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.stroke();
            }

            // Text - Only draw if segments are wide enough
            if (displayCount <= 60) {
                ctx.save();
                ctx.translate(this.centerX, this.centerY);
                ctx.rotate(startAngle + segAngle / 2);

                ctx.fillStyle = '#FFFFFF';
                const fontSize = Math.max(8, Math.min(13, 300 / displayCount));
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';

                const name = this.participants[i];
                const maxWidth = this.radius - 30;
                const displayName = this.truncateText(ctx, name, maxWidth);
                ctx.fillText(displayName, this.radius - 18, 0);

                ctx.restore();
            }
        }

        // Always draw names for the segment currently under the pointer if count is high
        // (Optional enhancement, could be added later for better UX)

        // Center circle
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.COLORS.blue;
        ctx.stroke();

        // Center text
        ctx.fillStyle = this.COLORS.blue;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total.toString(), this.centerX, this.centerY - 5);

        ctx.fillStyle = '#666';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('vị trí', this.centerX, this.centerY + 10);

        // Outer ring
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        ctx.lineWidth = 6;
        ctx.strokeStyle = this.COLORS.yellow;
        ctx.stroke();
    }

    drawEmptyWheel() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#E8E8E8';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#DDD';
        ctx.stroke();

        ctx.fillStyle = '#BBB';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Hết người tham gia!', this.centerX, this.centerY);
    }

    truncateText(ctx, text, maxWidth) {
        let width = ctx.measureText(text).width;
        if (width <= maxWidth) return text;

        let truncated = text;
        while (width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
            width = ctx.measureText(truncated + '…').width;
        }
        return truncated + '…';
    }

    // ===== SPINNING =====

    spin() {
        if (this.isSpinning || this.participants.length === 0) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.textContent = '🎰 Đang quay...';
        this.canvas.classList.add('spinning');
        this.wheelPointer.classList.add('spinning');

        // Pick a random winner from the TOTAL list
        const winnerIndex = Math.floor(Math.random() * this.participants.length);

        // Accurate segment calculation for ANY total count
        const totalCount = this.participants.length;
        const segAngle = (2 * Math.PI) / totalCount;

        // Pointer is at top (−π/2). Segment i is drawn from startAngle = currentAngle + i*segAngle
        // We want the winnerIndex segment to land at -PI/2
        // targetAngle = -PI/2 - (winnerIndex * segAngle + halfSegAngle)
        const targetSegCenter = winnerIndex * segAngle + segAngle / 2;
        const pointerAngleAtTop = -Math.PI / 2;

        let targetAngle = pointerAngleAtTop - targetSegCenter;

        // Number of rotations (ensure it spins forward significantly)
        const minRotation = 8 * 2 * Math.PI; // 8 full spins
        const startAngle = this.currentAngle;

        // Normalize rotation to always spin in one direction
        targetAngle = startAngle + (targetAngle - startAngle) % (2 * Math.PI) - minRotation;

        const totalRotation = targetAngle - startAngle;
        const duration = 6000 + Math.random() * 1500; // 6-7.5 seconds
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 4);

            this.currentAngle = startAngle + totalRotation * eased;
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentAngle = targetAngle;
                this.drawWheel();
                this.onSpinComplete(this.participants[winnerIndex]);
            }
        };

        requestAnimationFrame(animate);
    }

    onSpinComplete(winnerName) {
        this.isSpinning = false;
        this.canvas.classList.remove('spinning');
        this.wheelPointer.classList.remove('spinning');
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = '🎰 Quay ngay!';

        // Store pending winner
        this.pendingWinner = winnerName;

        // Show modal
        this.winnerDisplayName.textContent = winnerName;
        this.winnerModal.classList.add('show');

        // Confetti
        this.launchConfetti();
    }

    confirmWinner() {
        if (!this.pendingWinner) return;

        // Gửi kết quả về trang chủ
        const results = {
            type: 'wheel',
            winners: [this.pendingWinner],
            timestamp: Date.now()
        };
        localStorage.setItem('raceResults', JSON.stringify(results));

        this.winners.push({
            name: this.pendingWinner,
            time: new Date().toLocaleTimeString('vi-VN'),
        });

        // Tự động đưa vào danh sách bị loại vĩnh viễn với lý do cụ thể
        const now = new Date().toLocaleString('vi-VN');
        if (!this.excluded.find(e => e.name === this.pendingWinner)) {
            this.excluded.push({
                name: this.pendingWinner,
                reason: 'Trúng giải Vòng quay',
                time: now
            });
            this.saveExcluded();
        }

        this.saveWinners();
        this.filterParticipants();
        this.drawWheel();
        this.updateUI();

        this.pendingWinner = null;
        this.winnerModal.classList.remove('show');
    }

    rejectCurrentWinner() {
        if (!this.pendingWinner) return;

        // Thêm vào danh sách bị loại với lý do vắng mặt
        const now = new Date().toLocaleString('vi-VN');
        if (!this.excluded.find(e => e.name === this.pendingWinner)) {
            this.excluded.push({
                name: this.pendingWinner,
                reason: 'Vắng mặt (Vòng quay)',
                time: now
            });
            this.saveExcluded();
        }

        this.filterParticipants();
        this.drawWheel();
        this.updateUI();

        this.pendingWinner = null;
        this.winnerModal.classList.remove('show');
    }

    // ===== WINNERS MANAGEMENT =====

    removeWinner(index) {
        const removed = this.winners.splice(index, 1);
        if (removed.length > 0) {
            // Khi xoá khỏi danh sách trúng giải, đưa vào danh sách excluded 
            // để họ không quay trở lại vòng quay
            this.excluded.push(removed[0].name);
            this.saveExcluded();
        }
        this.saveWinners();
        this.filterParticipants();
        this.drawWheel();
        this.updateUI();
    }

    clearAllWinners() {
        if (!confirm('Bạn chắc chắn muốn xoá toàn bộ danh sách trúng giải và đặt lại toàn bộ danh sách quay?')) return;
        this.winners = [];
        this.excluded = []; // Xoá luôn cả danh sách bị loại khi reset tất cả
        this.saveWinners();
        this.saveExcluded();
        this.filterParticipants();
        this.drawWheel();
        this.updateUI();
    }

    // ===== UI UPDATES =====

    updateUI() {
        this.updateWinnersList();
        this.updateRemainingList();
        this.updateCounts();
    }

    updateWinnersList() {
        if (this.winners.length === 0) {
            this.winnersList.innerHTML = '<li class="empty-state">Chưa có người trúng giải</li>';
            this.winnersActions.style.display = 'none';
            return;
        }

        this.winnersActions.style.display = 'flex';
        this.winnersList.innerHTML = '';

        this.winners.forEach((winner, index) => {
            const li = document.createElement('li');
            li.className = 'winner-item';
            li.innerHTML = `
                <div class="winner-info">
                    <span class="winner-rank">${index + 1}</span>
                    <span class="winner-name" title="${winner.name}">${winner.name}</span>
                </div>
                <button class="remove-winner-btn" data-index="${index}" title="Loại khỏi danh sách trúng giải">Loại</button>
            `;
            this.winnersList.appendChild(li);
        });

        // Bind remove buttons
        this.winnersList.querySelectorAll('.remove-winner-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (confirm(`Loại "${this.winners[idx].name}" khỏi danh sách trúng giải?\nLưu ý: Người này sẽ bị loại hoàn toàn khỏi vòng quay lượt tiếp theo.`)) {
                    this.removeWinner(idx);
                }
            });
        });
    }

    updateRemainingList() {
        this.remainingList.innerHTML = '';
        this.participants.forEach((name, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${name}`;
            li.title = name;
            this.remainingList.appendChild(li);
        });
    }

    updateCounts() {
        this.winnersCount.textContent = this.winners.length;
        this.participantsCount.textContent = this.participants.length;
        this.remainingCount.textContent = this.participants.length;

        // Disable spin if no participants
        if (this.participants.length === 0) {
            this.spinBtn.disabled = true;
            this.spinBtn.textContent = '🎰 Hết người!';
        }
    }

    // ===== EFFECTS =====

    launchConfetti() {
        const colors = [this.COLORS.red, this.COLORS.blue, this.COLORS.green, this.COLORS.yellow, '#FF8A65', '#4DB6AC'];
        const shapes = ['■', '●', '▲', '★', '◆'];

        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = Math.random() * 100 + '%';
                piece.style.color = colors[Math.floor(Math.random() * colors.length)];
                piece.style.fontSize = (8 + Math.random() * 14) + 'px';
                piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                piece.style.animationDuration = (2 + Math.random() * 2) + 's';
                document.body.appendChild(piece);

                setTimeout(() => {
                    if (piece.parentNode) piece.parentNode.removeChild(piece);
                }, 4000);
            }, i * 40);
        }
    }

    // ===== DEFAULT PARTICIPANTS =====

    getDefaultParticipants() {
        return [
            'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
            'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hạnh', 'Dương Văn Inh', 'Lý Thị Kim',
            'Mai Văn Long', 'Chu Thị Mai', 'Võ Văn Nam', 'Tô Thị Oanh', 'Hồ Văn Phúc',
            'Ngô Thị Quỳnh', 'Đinh Văn Rùa', 'Trương Thị Sương', 'Lương Văn Tài', 'Phan Thị Uyên',
            'Đỗ Văn Việt', 'Bùi Thị Xuân', 'Lê Văn Yên', 'Nguyễn Thị Zoe', 'Trần Văn Bảo',
            'Phạm Thị Cẩm', 'Hoàng Văn Đức', 'Vũ Thị Enya', 'Đặng Văn Phi', 'Dương Thị Giang',
        ];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LuckyWheel();
});
