# Spotify Web Player Clone (F8 - Fullstack Practice)

> Dự án thực hành mô phỏng giao diện và các chức năng cốt lõi của Spotify Web Player, tập trung vào việc xây dựng ứng dụng Single Page Application (SPA) hoàn toàn bằng Vanilla JavaScript.

- **Live Demo:** [https://your-project-name.vercel.app](https://your-project-name.vercel.app)

---

## 1. Mục tiêu dự án (Objectives)

- Áp dụng kiến thức JavaScript nâng cao: ES6+ Modules, DOM Manipulation, Event Handling, Async/Await.
- Tự xây dựng cơ chế Client-side Routing (SPA) và quản lý trạng thái (State Management) từ đầu mà không phụ thuộc thư viện bên ngoài.
- Rèn luyện kỹ năng tổ chức cấu trúc mã nguồn theo hướng module hóa và thiết kế giao diện với Tailwind CSS v4.

---

## 2. Công nghệ sử dụng (Tech Stack)

- **Ngôn ngữ & Nền tảng:** HTML5, CSS3, Vanilla JavaScript (ES6+ Modules).
- **Công cụ dựng & phát triển (Build Tool):** Vite.
- **Framework CSS:** Tailwind CSS v4.
- **Triển khai (Deployment):** Vercel.

---

## 3. Tính năng chính (Features)

- **Trình phát nhạc (Audio Player Manager):** 
  - Phát / Dừng bài hát.
  - Tua bài hát theo thanh tiến trình (Seek bar).
  - Tăng / Giảm và bật / tắt âm lượng.
  - Chuyển tiếp / Quay lại bài hát trước đó.
- **Client-side Routing (SPA):** 
  - Điều hướng mượt mà giữa các trang (Home, Track, Artist, Album, Playlist, My Playlist, Collection) mà không cần tải lại toàn bộ trang.
- **Xác thực và phân quyền (Authentication):** 
  - Lưu và quản lý trạng thái người dùng (Session/Local storage).
  - Cá nhân hóa giao diện và danh sách yêu thích theo từng tài khoản.
- **Trải nghiệm người dùng (UX/UI):**
  - Skeleton Loading hiển thị tạm thời trong khi tải nội dung từng trang.
  - Hệ thống thông báo nhanh (Toast Notification).
  - Tooltip hiển thị chú thích khi tương tác.
- **Giao diện tương thích (Responsive Design):** 
  - Tối ưu hiển thị trên cả máy tính (Desktop) và thiết bị di động (hỗ trợ Bottom Navigation).

---

## 4. Những gì đã học và đúc kết được (Key Learnings)

1. **Kiến trúc SPA với Vanilla JS:** Hiểu về cơ chế hoạt động của History API (`popstate`, `pushState`), cách đăng ký route và render linh hoạt các view/layout vào DOM.
2. **Quản lý State & Audio DOM:** Tự thiết kế và cài đặt `PlayerManager` theo mô hình Singleton/Global Instance để duy trì và đồng bộ trạng thái phát nhạc xuyên suốt khi chuyển trang.
3. **Tổ chức cấu trúc thư mục chuẩn (Clean Architecture):** Tách biệt rõ ràng các tầng trách nhiệm giữa `components`, `layouts`, `pages`, `services` và `utils`, giúp mã nguồn dễ bảo trì và mở rộng.
4. **Xử lý Bất đồng bộ & Tối ưu hiệu năng:** Ứng dụng `async/await` và Dynamic Import (`import()`) để nạp module khi cần thiết, giảm thời gian tải ban đầu.
5. **Tailwind CSS v4:** Làm quen và áp dụng cú pháp, cấu hình của phiên bản Tailwind CSS mới nhất.

---

## 5. Cấu trúc thư mục (Folder Structure)

```text
src/
├── assets/          # Hình ảnh, tài nguyên tĩnh
├── components/      # UI components dùng chung (Loader, Popup, Toaster, Tooltip,...)
├── layouts/         # Layout khung chính (Header, Sidebar, BottomNav, Player, Skeletons)
├── pages/           # Logic và giao diện từng trang (Home, Track, Artist, Album,...)
├── services/        # Logic kết nối API và xử lý dữ liệu (Auth, Track data)
├── utils/           # Tiện ích bổ trợ (Router, Helpers)
├── styles.css       # File cấu hình CSS chính
└── main.js          # File khởi chạy ứng dụng (Entry Point)
```

---

## 6. Hướng dẫn cài đặt & Chạy dự án (Getting Started)

### Yêu cầu môi trường:
- Node.js (phiên bản 18 trở lên)
- Trình quản lý gói: npm, yarn hoặc pnpm

### Các bước cài đặt:

1. **Clone repository về máy:**
   ```bash
   git clone <link-repo-cua-ban>
   cd zoom-day-30-spotify-demo
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Chạy server phát triển (Development):**
   ```bash
   npm run dev
   ```

4. **Build mã nguồn cho môi trường Production:**
   ```bash
   npm run build
   ```
