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

    async init() {
        this.currentSessionId = localStorage.getItem('currentSessionId');
        this.loadParticipants();
        await this.refreshDataFromServer();

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

    async refreshDataFromServer() {
        if (!this.currentSessionId) return;
        try {
            const res = await fetch('/api/admin/history');
            const allHistory = await res.json();

            // Lọc người thắng của session hiện tại
            const currentWinners = allHistory.filter(h => h.session_id == this.currentSessionId);
            this.winners = currentWinners.map(w => ({
                name: w.name,
                time: w.date,
                type: w.type
            }));

            // Tải danh sách bị loại từ localStorage để đồng bộ (vì app.js cũng dùng localStorage làm cache)
            const storedEx = localStorage.getItem(`excluded_${this.currentSessionId}`);
            this.excluded = storedEx ? JSON.parse(storedEx) : [];

            this.filterParticipants();
        } catch (err) {
            console.error('Failed to sync with server:', err);
        }
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

    async loadParticipants() {
        if (!this.currentSessionId) return;
        try {
            const res = await fetch(`/api/participants/${this.currentSessionId}`);
            if (res.ok) {
                this.allParticipants = await res.json();
                this.filterParticipants();
                this.drawWheel();
                this.updateUI();
            }
        } catch (err) {
            console.error('Failed to load participants for wheel:', err);
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
        const sessionId = localStorage.getItem('currentSessionId');
        if (!sessionId) return;

        const stored = localStorage.getItem(`excluded_${sessionId}`);
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
        if (!this.currentSessionId) return;
        localStorage.setItem(`excluded_${this.currentSessionId}`, JSON.stringify(this.excluded));

        // Gửi lên server để lưu vào SQLite
        fetch('/api/excluded', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: this.currentSessionId, items: this.excluded })
        }).catch(e => console.warn('SQL Sync Excluded failed', e));
    }

    filterParticipants() {
        const winnerNames = new Set(this.winners.map(w => w.name));
        const excludedNames = new Set(this.excluded.map(e => typeof e === 'string' ? e : e.name));
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

    async confirmWinner() {
        if (!this.pendingWinner || !this.currentSessionId) return;

        const now = new Date().toLocaleString('vi-VN');
        const winnerObj = {
            name: this.pendingWinner,
            round: 'Vòng quay',
            type: 'wheel',
            date: now
        };

        // 1. Lưu vào CSDL ngay lập tức
        try {
            await fetch('/api/winners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: this.currentSessionId, items: [winnerObj] })
            });

            // 2. Thêm vào danh sách loại bỏ
            if (!this.excluded.find(e => (typeof e === 'string' ? e : e.name) === this.pendingWinner)) {
                this.excluded.push({
                    name: this.pendingWinner,
                    reason: 'Trúng giải Vòng quay',
                    time: now
                });
                this.saveExcluded();
            }

            // 3. Cập nhật UI
            await this.refreshDataFromServer();
            this.updateUI();
            this.drawWheel();

        } catch (err) {
            console.error('Failed to save winner to server:', err);
            alert('Lỗi lưu kết quả vào CSDL!');
        }

        this.pendingWinner = null;
        this.winnerModal.classList.remove('show');
    }

    async rejectCurrentWinner() {
        if (!this.pendingWinner || !this.currentSessionId) return;

        // Thêm vào danh sách bị loại với lý do vắng mặt
        const now = new Date().toLocaleString('vi-VN');
        const excludedItem = {
            name: this.pendingWinner,
            reason: 'Vắng mặt (Vòng quay)',
            time: now
        };

        if (!this.excluded.find(e => (typeof e === 'string' ? e : e.name) === this.pendingWinner)) {
            this.excluded.push(excludedItem);

            // Lưu vào LocalStorage và Server ngay lập tức
            localStorage.setItem(`excluded_${this.currentSessionId}`, JSON.stringify(this.excluded));

            try {
                await fetch('/api/excluded', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: this.currentSessionId, items: [excludedItem] })
                });
            } catch (err) {
                console.error('Failed to sync exclusion to server:', err);
            }
        }

        // Vẫn gửi kết quả về trang chủ nếu trang chủ đang mở
        localStorage.setItem('raceResults', JSON.stringify({
            type: 'wheel_reject',
            name: this.pendingWinner,
            reason: 'Vắng mặt (Vòng quay)',
            timestamp: Date.now()
        }));

        await this.refreshDataFromServer();
        this.updateUI();
        this.drawWheel();

        this.pendingWinner = null;
        this.winnerModal.classList.remove('show');
    }

    // ===== WINNERS MANAGEMENT =====

    async removeWinner(index) {
        const winner = this.winners[index];
        if (!winner) return;

        try {
            // Cần tìm ID của winner trong DB hoặc dùng API xoá theo tên + session
            // Để đơn giản, ta sẽ gọi refresh lại từ server sau khi bấm xoá một người có ID cụ thể
            // Ở đây vì this.winners trong wheel.js được map từ history (có session_id), ta cần ID thực của dòng đó.
            // Giải pháp tạm thời: Xoá dựa trên session_id và name (hoặc thêm ID vào fetch winners)

            // Xoá cục bộ trước
            this.winners.splice(index, 1);

            // Thực tế: Lệnh này nên gọi DELETE /api/winners/:id. 
            // Ta sẽ giả định refresh lại để đồng bộ.
            await this.refreshDataFromServer();
            this.updateUI();
        } catch (err) {
            console.error('Failed to remove winner:', err);
        }
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
