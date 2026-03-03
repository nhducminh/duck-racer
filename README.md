# 🏎️ Cuộc đua kì thú - NPK Phú Mỹ Edition

## 🌟 Tổng quan
Ứng dụng **Cuộc đua kì thú** (trước đây là Đua vịt) & **Vòng quay may mắn** tương tác, được thiết kế chuyên nghiệp cho các sự kiện trao giải. Hỗ trợ hàng trăm thí sinh, tích hợp hệ thống quản lý kết quả tự động, nhật ký loại bỏ thông minh và giao diện hiện đại theo phong cách NPK Phú Mỹ.

---

## ✨ Tính năng nổi bật

### 🏁 Cuộc đua kì thú (Race Mode)
- **Tự động hóa hoàn toàn:** Hệ thống tự động ghi nhận người thắng và loại họ khỏi các lượt sau ngay khi cuộc đua kết thúc.
- **Upload CSV:** Tự động import danh sách thí sinh từ file CSV tùy chỉnh.
- **Điều khiển tốc độ (Real-time Speed):** Hỗ trợ thay đổi tốc độ ngay trong cuộc đua (0.5x, 1x, 2x) để tăng kịch tính.
- **Phạm vi Top:** Tùy chỉnh dừng đua khi có đủ từ 1 đến 50 người về đích.
- **Visual kịch tính:** Hiển thị tên người dẫn đầu trực tiếp trên đường đua với đồ họa mượt mà.

### 🎡 Vòng quay may mắn (Lucky Wheel)
- **Vòng quay thông minh:** Nan quay tự động co giãn theo số lượng thí sinh, đảm bảo hiển thị đẹp mắt cho bất kỳ quy mô nào.
- **Xử lý vắng mặt:** Chức năng "Không có mặt" giúp gạch tên người vắng mặt khỏi toàn bộ chương trình mà không ghi nhận trúng giải.
- **Độ chính xác tuyệt đối:** Kim quay dừng chính xác ở nan của người trúng giải với hiệu ứng hạ cánh mượt mà.

### 🚫 Nhật ký loại bỏ & Khôi phục (Exclusion System)
- **Ghi chép chi tiết:** Tự động lưu lại lý do loại bỏ (Trúng giải lượt X, Vắng mặt tại Vòng quay) kèm thời gian chính xác.
- **Khôi phục linh hoạt:** Cho phép "Restore" thí sinh bị loại nhầm quay trở lại cuộc thi chỉ với 1 click.
- **Đồng bộ hóa (Persistence):** Danh sách người bị loại được dùng chung giữa Đua vịt và Vòng quay qua bộ nhớ trình duyệt (`localStorage`).

### 🏆 Quản lý tập trung
- **Khóa chế độ (Mode Lock):** Ngăn chặn việc sử dụng lẫn lộn giữa Đua vịt và Vòng quay cho đến khi hoàn thành lượt.
- **Hợp nhất kết quả:** Tất cả người thắng được trình bày tập trung tại Trang chủ với các biểu tượng phân biệt (🏎️/🎰).

---

## 🚀 Hướng dẫn khởi động (Docker & PowerShell)

Ứng dụng hiện được tối ưu để vận hành qua Docker tại cổng **3333**.

### 1. Khởi động chuyên nghiệp
Trong thư mục dự án, nhấp chuột phải vào file `.ps1` và chọn **"Run with PowerShell"**:
- `.\run-bg.ps1`: Khởi động ứng dụng bằng Docker Compose (mapping port 3333).
- `.\view-logs.ps1`: Theo dõi nhật ký hoạt động thời gian thực.
- `.\stop-bg.ps1`: Dừng và gỡ bỏ toàn bộ container đang chạy.

### 2. Truy cập
Mở trình duyệt và truy cập: `http://localhost:3333`

---

## 🎯 Quy trình vận hành sự kiện

### Bước 1: Chuẩn bị thí sinh
- Sử dụng danh sách 200 người có sẵn hoặc tải lên file `.csv`.
- Sau khi tải, nhấn **"Reset toàn bộ chương trình"** để đảm bảo danh sách thí sinh sạch sẽ nhất.

### Bước 2: Thi đấu
- **Đua vịt:** Chọn số người về đích (Top) và nhấn Bắt đầu. Hệ thống sẽ tự động gạch tên những người trúng giải sau khi cuộc đua hoàn tất.
- **Vòng quay:** Nhấn Vòng quay để chọn 1 đối tượng may mắn. Nếu họ có mặt, nhấn **Xác nhận**. Nếu vắng mặt, nhấn **Không có mặt** để loại họ vĩnh viễn khỏi danh sách quay tiếp theo.

### Bước 3: Xem Nhật ký & Copy kết quả
- Kiểm tra danh sách người thắng giải tại Trang chủ.
- Xem lại **"Nhật ký loại bỏ & Khôi phục"** ở bên dưới nếu có tranh khiếu nại hoặc cần khôi phục thí sinh.
- Sử dụng nút **"📋 Copy danh sách trúng"** để gửi kết quả nhanh qua Zalo/Email.

---

## 🗂️ Cấu trúc dự án
```
duck-race-app/
├── 📁 public/         # Frontend (HTML, CSS, JS)
│   ├── index.html    # Trang quản lý & Nhật ký khôi phục
│   ├── race.html     # Trang Cuộc đua kì thú
│   ├── wheel.html    # Trang Vòng quay may mắn
│   ├── app.js        # Điều phối chính & Quản lý Nhật ký
│   └── wheel.js      # Logic vẽ vòng quay toán học chính xác
├── docker-compose.yml # Cấu hình Docker (Port 3333)
├── Dockerfile         # Docker Image build
├── run-bg.ps1        # Script khởi chạy Docker ngầm
├── stop-bg.ps1       # Script dừng hệ thống
└── README.md         # Tài liệu này
```

---

## 📝 Định dạng File CSV
Định dạng đơn giản, cột đầu tiên là Tên (có thể có header "Tên" hoặc không):
```csv
Nguyễn Văn A
Trần Thị B
Lê Minh C
...
```

---

## 📄 Bản quyền
Sản phẩm được tối ưu cho sự kiện **NPK Phú Mỹ**.
Giấy phép: MIT.