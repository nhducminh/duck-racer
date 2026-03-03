// Tạo danh sách 200 tên
const generateParticipants = () => {
    const lastNames = [
        'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Dương', 'Lý',
        'Mai', 'Chu', 'Võ', 'Tô', 'Hồ', 'Ngô', 'Đinh', 'Trương', 'Lương', 'Phan',
        'Đỗ', 'Cao', 'Đào', 'Lâm', 'Huỳnh', 'Đào', 'Vương', 'Từ', 'Duyên', 'Quách'
    ];
    
    const maleFirstNames = [
        'Văn An', 'Văn Bình', 'Văn Cường', 'Văn Đức', 'Văn Em', 'Văn Phúc', 'Văn Giang', 
        'Văn Hưng', 'Văn Inh', 'Văn Kiên', 'Văn Long', 'Văn Minh', 'Văn Nam', 'Văn Ổn',
        'Văn Quân', 'Văn Rùa', 'Văn Sơn', 'Văn Tài', 'Văn Uyên', 'Văn Việt', 'Văn Xuân',
        'Văn Yên', 'Văn Zung', 'Hữu Bảo', 'Hữu Đạt', 'Hữu Hiếu', 'Hữu Khang', 'Hữu Lộc',
        'Hữu Phát', 'Hữu Thành', 'Đình Bình', 'Đình Cường', 'Đình Khoa', 'Đình Lâm',
        'Đình Phúc', 'Quang Anh', 'Quang Bình', 'Quang Dũng', 'Quang Huy', 'Quang Khải',
        'Minh Anh', 'Minh Đức', 'Minh Hiếu', 'Minh Khang', 'Minh Long', 'Tuấn Anh',
        'Tuấn Kiệt', 'Tuấn Minh', 'Anh Tuấn', 'Anh Dũng', 'Anh Khoa', 'Anh Minh'
    ];
    
    const femaleFirstNames = [
        'Thị Ánh', 'Thị Bình', 'Thị Cẩm', 'Thị Dung', 'Thị Enya', 'Thị Phương', 'Thị Giang',
        'Thị Hạnh', 'Thị Inh', 'Thị Kim', 'Thị Linh', 'Thị Mai', 'Thị Nhi', 'Thị Oanh',
        'Thị Phượng', 'Thị Quỳnh', 'Thị Rừng', 'Thị Sương', 'Thị Tâm', 'Thị Uyên',
        'Thị Vân', 'Thị Xuân', 'Thị Yến', 'Thị Zoe', 'Thanh Ánh', 'Thanh Bình', 'Thanh Giang',
        'Thanh Hiền', 'Thanh Hoa', 'Thanh Lan', 'Thanh Mai', 'Thanh Nga', 'Thanh Phương',
        'Thanh Thảo', 'Thanh Tuyền', 'Thu Ánh', 'Thu Giang', 'Thu Hà', 'Thu Hiền', 'Thu Hương',
        'Thu Lan', 'Thu Mai', 'Thu Nga', 'Thu Phương', 'Thu Thảo', 'Minh Anh', 'Minh Châu',
        'Minh Hằng', 'Minh Huyền', 'Minh Ngọc', 'Minh Phương', 'Minh Thảo', 'Minh Trang'
    ];
    
    const participants = [];
    
    for (let i = 0; i < 200; i++) {
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const isFemale = Math.random() > 0.5;
        const firstName = isFemale 
            ? femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)]
            : maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)];
        
        participants.push(`${lastName} ${firstName}`);
    }
    
    return participants;
};

// Export để sử dụng
const participants200 = generateParticipants();
console.log('Generated 200 participants:', participants200);