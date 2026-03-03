// Cuộc đua kì thú - Frontend Logic with SQLite Backend
class DuckRaceUI {
    constructor() {
        this.participants = [
            'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
            'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hạnh', 'Dương Văn Inh', 'Lý Thị Kim',
            'Mai Văn Long', 'Chu Thị Mai', 'Võ Văn Nam', 'Tô Thị Oanh', 'Hồ Văn Phúc',
            'Ngô Thị Quỳnh', 'Đinh Văn Rùa', 'Trương Thị Sương', 'Lương Văn Tài', 'Phan Thị Uyên',
            'Đỗ Văn Việt', 'Bùi Thị Xuân', 'Lê Văn Yên', 'Nguyễn Thị Zoe', 'Trần Văn Bảo',
            'Phạm Thị Cẩm', 'Hoàng Văn Đức', 'Vũ Thị Enya', 'Đặng Văn Phi', 'Dương Thị Giang',
            'Lý Văn Hưng', 'Mai Thị Inh', 'Chu Văn Kiên', 'Võ Thị Linh', 'Tô Văn Minh',
            'Hồ Thị Nhi', 'Ngô Văn Ổn', 'Đinh Thị Phượng', 'Trương Văn Quân', 'Lương Thị Rừng',
            'Phan Văn Sơn', 'Đỗ Thị Tâm', 'Bùi Văn Uyên', 'Lê Thị Vân', 'Nguyễn Văn Xuân',
            'Trần Thị Yến', 'Phạm Văn Zung', 'Hoàng Thị Ánh', 'Vũ Văn Bình', 'Đặng Thị Châu'
        ];
        this.defaultParticipants = [...this.participants];

        // Load saved participants from localStorage if available
        const savedParticipants = localStorage.getItem('allParticipants');
        if (savedParticipants) {
            this.allParticipants = JSON.parse(savedParticipants);
            this.participants = [...this.allParticipants];
        } else {
            this.allParticipants = [...this.participants];
        }

        this.winners = [];
        this.excluded = [];
        this.currentRound = 0;
        this.lockMode = null;
        this.currentSessionId = null;

        this.basePath = this.getBasePath();

        // DOM elements
        this.startButton = document.getElementById('startRace');
        this.wheelButton = document.getElementById('openWheel');
        this.csvFileInput = document.getElementById('csvFile');
        this.loadDefaultButton = document.getElementById('loadDefault');
        this.topCountSelect = document.getElementById('topCount');
        this.multipleRoundsCheckbox = document.getElementById('multipleRounds');
        this.winnersSection = document.querySelector('.winners-section');
        this.winnersList = document.getElementById('winnersList');
        this.copyWinnersButton = document.getElementById('copyWinners');
        this.exportWinnersButton = document.getElementById('exportWinners');
        this.removeWinnersButton = document.getElementById('removeWinners');
        this.resetWinnersButton = document.getElementById('resetWinners');
        this.participantsList = document.getElementById('participantsList');

        this.currentSessionNameSpan = document.getElementById('currentSessionName');
        this.sessionSubtitle = document.getElementById('sessionSubtitle');
        this.newSessionBtn = document.getElementById('newSessionBtn');
        this.excludedSection = document.querySelector('.excluded-section');
        this.excludedList = document.getElementById('excludedList');

        this.init();
        window.duckRaceUI = this;
    }

    getBasePath() {
        const path = window.location.pathname;
        const lastSlashIndex = path.lastIndexOf('/');
        if (lastSlashIndex <= 0) return '';
        return path.substring(0, lastSlashIndex);
    }

    async init() {
        await this.loadSessions();

        this.startButton.addEventListener('click', () => this.startRace());
        this.csvFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.loadDefaultButton.addEventListener('click', () => this.loadDefaultParticipants());
        this.copyWinnersButton.addEventListener('click', () => this.copyWinners());
        this.exportWinnersButton.addEventListener('click', () => this.exportWinners());
        this.removeWinnersButton.addEventListener('click', () => this.removeWinners());
        this.resetWinnersButton.addEventListener('click', () => this.resetWinners());
        this.newSessionBtn.addEventListener('click', () => this.createNewSession());

        if (this.wheelButton) this.wheelButton.addEventListener('click', () => this.openWheel());
        this.topCountSelect.addEventListener('input', () => this.validateTopCount());

        this.listenForRaceResults();
    }

    // SESSION LOGIC
    async loadSessions() {
        try {
            const res = await fetch('/api/sessions');
            const sessions = await res.json();

            const lastId = localStorage.getItem('currentSessionId');
            let sessionToLoad = null;

            // Chỉ tải session cũ nếu tồn tại trong localStorage của trình duyệt này
            if (lastId && sessions.find(s => s.id == lastId)) {
                sessionToLoad = sessions.find(s => s.id == lastId);
                this.currentSessionId = parseInt(lastId);
            }

            if (sessionToLoad) {
                this.sessionName = sessionToLoad.name;
                const sessionText = `${sessionToLoad.name} (${new Date(sessionToLoad.created_at).toLocaleDateString('vi-VN')})`;
                if (this.currentSessionNameSpan) this.currentSessionNameSpan.textContent = sessionText;
                if (this.sessionSubtitle) this.sessionSubtitle.textContent = `Chương trình: ${sessionToLoad.name}`;

                // Kích hoạt các nút bấm
                this.startButton.disabled = false;
                if (this.wheelButton) this.wheelButton.disabled = false;

                await this.refreshSessionData();
            } else {
                // Trình duyệt mới chưa có session
                if (this.currentSessionNameSpan) {
                    this.currentSessionNameSpan.textContent = 'CHƯA CÓ - Vui lòng nhấn tạo mới để bắt đầu';
                    this.currentSessionNameSpan.style.color = '#dc3545';
                }
                if (this.sessionSubtitle) this.sessionSubtitle.textContent = 'Vui lòng bắt đầu Lượt mới cho ngày hôm nay';

                // Khóa các nút bấm cho đến khi tạo session
                this.startButton.disabled = true;
                this.startButton.style.opacity = '0.5';
                if (this.wheelButton) {
                    this.wheelButton.disabled = true;
                    this.wheelButton.style.opacity = '0.5';
                }

                this.displayParticipants();
            }
        } catch (err) {
            console.error('Failed to load sessions:', err);
            if (this.currentSessionNameSpan) this.currentSessionNameSpan.textContent = 'Lỗi kết nối Server';
        }
    }

    async createNewSession() {
        const name = prompt('Nhập tên chương trình mới cho trình duyệt này (ví dụ: Sự kiện Ngày 02/03):');
        if (name === null || name.trim() === '') return;

        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            });
            const data = await res.json();
            localStorage.setItem('currentSessionId', data.id);
            location.reload();
        } catch (err) {
            alert('Lỗi tạo session: ' + err.message);
        }
    }

    async refreshSessionData() {
        if (!this.currentSessionId) return;

        try {
            const res = await fetch('/api/admin/history');
            const allHistory = await res.json();

            const currentWinners = allHistory.filter(h => h.session_id === this.currentSessionId);

            const rounds = {};
            currentWinners.forEach(w => {
                const key = `${w.round}-${w.type}-${w.date}`;
                if (!rounds[key]) {
                    rounds[key] = { round: w.round, type: w.type, date: w.date, winners: [] };
                }
                rounds[key].winners.push(w.name);
            });

            this.winners = Object.values(rounds);
            if (this.winners.length > 0) {
                this.winnersSection.style.display = 'block';
                this.displayWinners();

                const firstType = this.winners[0].type;
                this.lockMode = (firstType === 'wheel') ? 'wheel' : 'race';
                this.enforceModeLock();

                const raceRounds = this.winners.filter(r => r.type === 'race').map(r => parseInt(r.round) || 0);
                this.currentRound = raceRounds.length > 0 ? Math.max(...raceRounds) : 0;
            }

            this.loadExcluded();
            this.filterExcluded();
            this.displayParticipants();
            this.displayExcluded();
            this.updateStartButtonText();
        } catch (err) {
            console.error('Refresh data error:', err);
        }
    }

    loadExcluded() {
        if (!this.currentSessionId) return;
        const stored = localStorage.getItem(`excluded_${this.currentSessionId}`);
        this.excluded = stored ? JSON.parse(stored) : [];
    }

    saveExcluded() {
        if (!this.currentSessionId) return;
        localStorage.setItem(`excluded_${this.currentSessionId}`, JSON.stringify(this.excluded));
        fetch('/api/excluded', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: this.currentSessionId, items: this.excluded })
        }).catch(e => console.warn('SQL Sync Excluded failed', e));
    }

    filterExcluded() {
        const excludedNames = new Set(this.excluded.map(e => e.name));
        this.participants = this.allParticipants.filter(p => !excludedNames.has(p));
    }

    addToExclusions(names, reason) {
        if (!Array.isArray(names)) names = [names];
        const now = new Date().toLocaleString('vi-VN');
        names.forEach(name => {
            if (!this.excluded.find(e => e.name === name)) {
                this.excluded.push({ name, reason, time: now });
            }
        });
        this.saveExcluded();
        this.filterExcluded();
        this.displayExcluded();
        this.displayParticipants();
        this.updateStartButtonText();
    }

    displayExcluded() {
        if (!this.excluded || this.excluded.length === 0) {
            this.excludedSection.style.display = 'none';
            return;
        }
        this.excludedSection.style.display = 'block';
        let html = '<div class="excluded-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; margin-top: 10px;">';
        this.excluded.forEach(item => {
            html += `
                <div class="excluded-item" style="background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="ex-name" style="color: #333; font-weight: 600;">${item.name}</span>
                        <button class="restore-btn" onclick="duckRaceUI.restoreParticipant('${item.name.replace(/'/g, "\\'")}')" style="font-size: 11px; padding: 2px 8px; background: #e3f2fd; color: #1976d2; border: none; border-radius: 4px; cursor: pointer;">Khôi phục</button>
                    </div>
                    <div style="font-size: 12px; color: #666; display: flex; justify-content: space-between;">
                        <span class="ex-reason" style="background: #f5f5f5; padding: 1px 6px; border-radius: 4px;">${item.reason}</span>
                        <span class="ex-time" style="color: #999;">${item.time}</span>
                    </div>
                </div>`;
        });
        this.excludedList.innerHTML = html + '</div>';
    }

    restoreParticipant(name) {
        this.excluded = this.excluded.filter(e => e.name !== name);
        this.saveExcluded();
        this.filterExcluded();
        this.displayExcluded();
        this.displayParticipants();
        this.updateStartButtonText();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            this.parseData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    }

    parseData(dataRows) {
        if (dataRows.length === 0) return alert('Tệp trống!');
        const headers = dataRows[0].map(h => (h || '').toString().toLowerCase().trim());

        let nameIdx = -1;
        let phoneIdx = -1;

        // Ưu tiên tìm chính xác theo yêu cầu người dùng
        headers.forEach((h, idx) => {
            if (h === 'tên khách hàng') nameIdx = idx;
            if (h === 'số điện thoại khách hàng' || h === 'số điện thoại') phoneIdx = idx;
        });

        // Nếu không tìm thấy chính xác, dùng logic cũ để gợi ý
        if (nameIdx === -1) {
            headers.forEach((h, idx) => {
                if (h.includes('tên') || h.includes('khách hàng') || h.includes('name')) { if (nameIdx === -1) nameIdx = idx; }
            });
        }
        if (phoneIdx === -1) {
            headers.forEach((h, idx) => {
                if (h.includes('số') || h.includes('điện thoại') || h.includes('phone') || h.includes('sđt')) { if (phoneIdx === -1) phoneIdx = idx; }
            });
        }

        if (nameIdx === -1) nameIdx = 0;

        const parsedParticipants = [];
        for (let i = 1; i < dataRows.length; i++) {
            const row = dataRows[i];
            let nameVal = (row[nameIdx] || '').toString().trim();
            let phoneVal = phoneIdx !== -1 ? (row[phoneIdx] || '').toString().trim() : '';

            if (nameVal) {
                let fullName = nameVal;
                if (phoneVal) fullName += ` - ${phoneVal}`;
                parsedParticipants.push(fullName);
            }
        }

        if (parsedParticipants.length > 0) {
            this.allParticipants = parsedParticipants;
            localStorage.setItem('allParticipants', JSON.stringify(parsedParticipants));
            this.participants = [...parsedParticipants];
            this.filterExcluded();
            this.displayParticipants();
            alert(`Đã tải ${parsedParticipants.length} thí sinh!`);
        } else {
            alert('Không tìm thấy dữ liệu thí sinh hợp lệ (Cần cột: Tên khách hàng, Số điện thoại khách hàng).');
        }
    }

    loadDefaultParticipants() {
        this.allParticipants = [...this.defaultParticipants];
        localStorage.removeItem('allParticipants');
        this.participants = [...this.allParticipants];
        this.filterExcluded();
        this.displayParticipants();
        alert('Đã tải danh sách mặc định!');
    }

    displayParticipants() {
        this.participantsList.innerHTML = '<h3>Danh sách thí sinh:</h3>';
        const participantsDiv = document.createElement('div');
        participantsDiv.className = 'participants-display';
        const countDiv = document.createElement('div');
        countDiv.className = 'participant-count';
        countDiv.innerHTML = `<strong>Tổng số: ${this.participants.length} người</strong>`;
        const list = document.createElement('ul');
        list.className = 'participants-list';
        this.participants.forEach((participant, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${participant}`;
            li.style.color = this.getRandomColor();
            list.appendChild(li);
        });
        participantsDiv.append(countDiv, list);
        this.participantsList.appendChild(participantsDiv);
    }

    startRace() {
        if (!this.currentSessionId) return alert('Vui lòng tạo Chương trình mới trước khi bắt đầu!');
        if (this.participants.length === 0) return alert('Không còn thí sinh!');
        this.currentRound++;
        let topCount = parseInt(this.topCountSelect.value);
        if (!this.lockMode) { this.lockMode = 'race'; this.enforceModeLock(); }
        const shuffled = [...this.participants].sort(() => Math.random() - 0.5);
        localStorage.setItem('duckRaceData', JSON.stringify({
            participants: shuffled, topCount, round: this.currentRound, multipleRounds: this.multipleRoundsCheckbox.checked
        }));
        window.open(`${this.basePath}/race.html`, '_blank', 'width=1400,height=900');
    }

    openWheel() {
        if (!this.currentSessionId) return alert('Vui lòng tạo Chương trình mới trước khi bắt đầu!');
        if (this.participants.length === 0) return alert('Không còn thí sinh!');
        localStorage.setItem('duckRaceData', JSON.stringify({ participants: this.participants, round: 'Wheel', isWheel: true }));
        window.open(`${this.basePath}/wheel.html`, '_blank', 'width=1400,height=900');
        if (!this.lockMode) { this.lockMode = 'wheel'; this.enforceModeLock(); }
    }

    listenForRaceResults() {
        const checkResults = () => {
            const res = localStorage.getItem('raceResults');
            if (res) {
                this.processRaceResults(JSON.parse(res));
                localStorage.removeItem('raceResults');
            }
            setTimeout(checkResults, 1000);
        };
        checkResults();
    }

    async processRaceResults(results) {
        if (!this.currentSessionId) return;
        const isWheel = results.type === 'wheel';
        if (!this.lockMode) { this.lockMode = isWheel ? 'wheel' : 'race'; this.enforceModeLock(); }
        const winnersPayload = results.winners.map(name => ({
            name, round: isWheel ? 'Vòng quay' : this.currentRound, type: results.type || 'race', date: new Date().toLocaleString('vi-VN')
        }));
        const reason = isWheel ? 'Trúng giải Vòng quay' : `Trúng giải Đua vịt (Lượt ${this.currentRound})`;
        this.addToExclusions(results.winners, reason);
        try {
            await fetch('/api/winners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: this.currentSessionId, items: winnersPayload })
            });
            await this.refreshSessionData();
        } catch (e) { console.error('SQL Save Winner failed', e); }
        alert(isWheel ? `Vòng quay hoàn tất! ${results.winners[0]} trúng giải.` : `Lượt ${this.currentRound} hoàn tất! Top ${results.topCount} trúng giải.`);
    }

    enforceModeLock() {
        const wheelBtn = document.getElementById('openWheel');
        const raceBtn = document.getElementById('startRace');
        if (!wheelBtn || !raceBtn) return;
        if (this.lockMode === 'race') { wheelBtn.disabled = true; wheelBtn.style.opacity = '0.3'; wheelBtn.style.pointerEvents = 'none'; }
        else if (this.lockMode === 'wheel') { raceBtn.disabled = true; raceBtn.style.opacity = '0.3'; raceBtn.style.pointerEvents = 'none'; }
    }

    updateStartButtonText() {
        if (this.multipleRoundsCheckbox.checked && this.winners.length > 0) {
            this.startButton.textContent = `Bắt đầu lượt ${this.currentRound + 1} (${this.participants.length} thí sinh)`;
        } else { this.startButton.textContent = 'Bắt đầu cuộc đua'; }
    }

    displayWinners() {
        this.winnersList.innerHTML = this.winners.map(round => `
            <div class="winner-round ${round.type}">
                <h4>${round.type === 'wheel' ? '🎰' : '🏆'} ${round.type === 'wheel' ? 'Vòng quay' : `Lượt ${round.round}`} (${round.date})</h4>
                <ul class="winner-list">${round.winners.map((w, i) => `<li>${i + 1}. ${w}</li>`).join('')}</ul>
            </div>
        `).join('') || '<p>Chưa có người trúng thưởng</p>';
    }

    copyWinners() {
        let text = '🏆 DANH SÁCH TRÚNG THƯỞNG 🏆\n\n';
        this.winners.forEach(r => { text += `${r.type === 'wheel' ? 'Vòng quay' : `Lượt ${r.round}`} (${r.date}):\n${r.winners.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\n`; });
        navigator.clipboard.writeText(text).then(() => alert('Đã copy danh sách!'));
    }

    exportWinners() {
        if (!this.winners || this.winners.length === 0) return alert('Chưa có người trúng thưởng để xuất!');

        const exportData = [];
        this.winners.forEach(r => {
            const typeLabel = r.type === 'wheel' ? 'Vòng quay' : 'Đua vịt';
            const roundLabel = r.type === 'wheel' ? 'May mắn' : `Lượt ${r.round}`;

            r.winners.forEach(w => {
                exportData.push({
                    'Chương trình': this.sessionName || 'Không tên',
                    'Họ và Tên': w,
                    'Lượt': roundLabel,
                    'Loại hình': typeLabel,
                    'Thời gian': r.date
                });
            });
        });

        // Tạo worksheet từ JSON
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Tạo workbook mới
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách trúng thưởng");

        // Xuất file XLSX
        const fileName = `Danh_sach_trung_thuong_${this.sessionName ? this.sessionName.replace(/\s+/g, '_') : 'Race'}_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    async resetWinners() {
        if (!confirm('Reset toàn bộ chương trình này?')) return;
        localStorage.removeItem(`excluded_${this.currentSessionId}`);
        location.reload();
    }

    validateTopCount() {
        const topCount = parseInt(this.topCountSelect.value);
        const maxParticipants = this.participants.length;
        let message = '';
        let isValid = true;
        if (isNaN(topCount) || topCount < 1) { message = 'Phải là số nguyên dương từ 1 trở lên'; isValid = false; }
        else if (topCount > maxParticipants && maxParticipants > 0) { message = `Chỉ có ${maxParticipants} thí sinh`; isValid = false; }
        else if (topCount > 50) { message = 'Tối đa 50'; isValid = false; }
        else { message = `✓ Hợp lệ`; }
        let messageEl = document.getElementById('topCountMessage');
        if (!messageEl) { messageEl = document.createElement('small'); messageEl.id = 'topCountMessage'; messageEl.style.display = 'block'; this.topCountSelect.parentNode.appendChild(messageEl); }
        messageEl.textContent = message;
        messageEl.style.color = isValid ? '#28a745' : '#dc3545';
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => { new DuckRaceUI(); });