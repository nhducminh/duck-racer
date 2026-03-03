# 🏎️ Cuộc đua kì thú - NPK Phú Mỹ Edition

## 🌟 Tổng quan
Ứng dụng **Cuộc đua kì thú** & **Vòng quay may mắn** tương tác, được thiết kế chuyên nghiệp cho các sự kiện trao giải. Hỗ trợ hàng trăm thí sinh, tích hợp hệ thống quản lý kết quả tự động, nhật ký loại bỏ thông minh và giao diện hiện đại theo phong cách NPK Phú Mỹ.

---

## ✨ Tính năng nổi bật

### 🏁 Cuộc đua kì thú (Race Mode)
- **Tự động hóa hoàn toàn:** Hệ thống tự động ghi nhận người thắng và loại họ khỏi các lượt sau ngay khi cuộc đua kết thúc.
- **Nạp dữ liệu linh hoạt:** Hỗ trợ nhập danh sách thí sinh từ file **Excel (.xlsx, .xls)** hoặc **CSV**. Tự động nhận diện cột "Tên khách hàng" và "Số điện thoại khách hàng".
- **Ghi nhớ danh sách (Persistence):** Danh sách thí sinh sau khi nạp sẽ được lưu trữ trong bộ nhớ trình duyệt, không bị mất khi tải lại trang hoặc tạo lượt mới.
- **Top Winner:** Tùy chỉnh dừng đua khi có đủ từ 1 đến 50 người về đích.
- **Visual kịch tính:** Hiển thị tên người dẫn đầu trực tiếp trên đường đua với đồ họa mượt mà.

### 🎡 Vòng quay may mắn (Lucky Wheel)
- **Vòng quay thông minh:** Nan quay tự động co giãn theo số lượng thí sinh, đảm bảo hiển thị đẹp mắt cho bất kỳ quy mô nào.
- **Xử lý vắng mặt:** Chức năng "Không có mặt" giúp gạch tên người vắng mặt khỏi toàn bộ chương trình mà không ghi nhận trúng giải.
- **Độ chính xác tuyệt đối:** Kim quay dừng chính xác ở nan của người trúng giải với hiệu ứng hạ cánh mượt mà.

### 🚫 Nhật ký loại bỏ & Khôi phục (Exclusion System)
- **Ghi chép chi tiết:** Tự động lưu lại lý do loại bỏ (Trúng giải lượt X, Vắng mặt tại Vòng quay) kèm thời gian chính xác.
- **Khôi phục linh hoạt:** Cho phép "Restore" thí sinh bị loại nhầm quay trở lại cuộc thi chỉ với 1 click.
- **Đồng bộ hóa:** Danh sách người bị loại được đồng bộ giữa Đua vịt và Vòng quay.

### 🏆 Quản lý & Xuất dữ liệu
- **Xuất Excel chuyên nghiệp:** Hỗ trợ xuất danh sách trúng thưởng ra file **Excel (.xlsx)** kèm theo tên chương trình, lượt thắng và thời gian chi tiết.
- **Quản lý theo Lượt (Session):** Mỗi lần nhấn "Bắt đầu lượt mới" sẽ tạo một phiên làm việc riêng biệt, giúp kết quả trúng thưởng không bị chồng lấn.

---

## 🚀 Hướng dẫn vận hành bằng Docker

Ứng dụng vận hành qua Docker tại cổng **3333**.

### 1. Khởi động ứng dụng
Mở Terminal/Command Prompt trong thư mục dự án và chạy lệnh:
```bash
docker-compose up -d --build
```

### 2. Truy cập
Mở trình duyệt và truy cập: `http://localhost:3333`

### 3. Dừng ứng dụng
Chạy lệnh sau để dừng hệ thống:
```bash
docker-compose down
```

---

## 🎯 Quy trình vận hành sự kiện

### Bước 1: Chuẩn bị thí sinh
- Sử dụng danh sách mặc định hoặc nạp file **Excel/CSV** của bạn qua nút "Tải lên danh sách".
- Hệ thống sẽ tự động ghi nhớ danh sách này cho các lần truy cập sau.

### Bước 2: Thi đấu
- **Đua vịt:** Chọn số người về đích (Top) và nhấn Bắt đầu. Hệ thống sẽ tự động gạch tên những người trúng giải sau khi cuộc đua hoàn tất.
- **Vòng quay:** Nhấn Vòng quay để chọn 1 đối tượng may mắn. Nếu họ có mặt, nhấn **Xác nhận**. Nếu vắng mặt, nhấn **Không có mặt** để loại họ vĩnh viễn khỏi danh sách.

### Bước 3: Xuất kết quả
- Kiểm tra danh sách người thắng giải tại Trang chủ.
- Nhấn nút **"Xuất danh sách trúng thưởng"** để tải file Excel về máy phục vụ báo cáo.

---

## 🗂️ Cấu trúc dự án
```
duck-race-app/
├── 📁 public/         # Frontend (HTML, CSS, JS)
│   ├── index.html    # Trang quản lý & Thiết lập
│   ├── race.html     # Trang Cuộc đua kì thú
│   ├── wheel.html    # Trang Vòng quay may mắn
│   ├── app.js        # Logic xử lý dữ liệu & Persistence
│   └── wheel.js      # Logic vẽ vòng quay
├── 📁 src/            # Backend (Node.js & SQLite)
├── docker-compose.yml # Cấu hình Docker
├── Dockerfile         # Bản dựng môi trường
└── README.md         # Tài liệu này
```

---

## 📄 Bản quyền
Sản phẩm được tối ưu cho sự kiện **NPK Phú Mỹ**.
Giấy phép: MIT.