const $ = document.querySelector.bind(document);

const form = $("#register-form");

const username = $("#username");
const email = $("#email");
const password = $("#password");
const confirmPassword = $("#confirm-password");

const usernameErr = $("#username-error");
const emailErr = $("#email-error");
const passwordErr = $("#password-error");
const confirmPasswordErr = $("#confirm-password-error");

const successMessage = $("#success-msg");

const submitBtn = $("#submit-btn");

// TODO: Tên đăng nhập
// Phải có ít nhất 4 ký tự.

// Chỉ được chứa:

// Chữ cái (a-z, A-Z)

// Chữ số (0-9)

// Dấu gạch dưới (_)

// Không được chứa:

// Khoảng trắng

// Ký tự đặc biệt khác

// Nếu không hợp lệ thì hiển thị lỗi trong #username-error.

// Nếu hợp lệ thì xóa thông báo lỗi.
const verifyUsername = (value) => {
    return value.length >= 4 && /^[a-zA-Z0-9_]+$/.test(value);
};

// TODO: Email
// Phải đúng định dạng email cơ bản:

// Có tên

// Có ký tự @

// Có tên miền

// Hiển thị hoặc xóa lỗi trong #email-error tương tự như trên.

const verifyEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// TODO: Mật khẩu
// Phải có ít nhất 8 ký tự.

// Phải chứa ít nhất 1 chữ số.

// Nếu không đạt yêu cầu thì hiển thị lỗi trong #password-error.
const verifyPassword = (value) => {
    return value.trim().length >= 8 && /[0-9]/.test(value);
};

// TODO: Nhập lại mật khẩu
// Phải khớp hoàn toàn với ô Mật khẩu.

// Ngoài việc kiểm tra khi người dùng gõ vào ô này, cần kiểm tra lại mỗi khi người dùng thay đổi ô Mật khẩu,
// vì họ có thể sửa mật khẩu sau khi đã nhập xác nhận.
const verifyConfirmPassword = (value) => {
    return value === password.value;
};

// TODO: Thời điểm kiểm tra
// Việc kiểm tra phải chạy ngay khi người dùng đang gõ (input event).

// Tuy nhiên:

// Không hiển thị lỗi khi trang vừa tải.

// Chỉ hiển thị lỗi sau khi người dùng đã tương tác với ô đó ít nhất một lần.
username.addEventListener("input", (e) => {
    if (verifyUsername(e.target.value)) {
        usernameErr.textContent = "";
    } else {
        if (e.target.value.trim() === "") {
            usernameErr.textContent = "Vui lòng điền tên đăng nhập!";
        } else {
            usernameErr.textContent = "Tên đăng nhập không hợp lệ!";
        }
    }
});

email.addEventListener("input", (e) => {
    if (verifyEmail(e.target.value)) {
        emailErr.textContent = "";
    } else {
        if (e.target.value.trim() === "") {
            emailErr.textContent = "Vui lòng điền email!";
        } else {
            emailErr.textContent = "Email không hợp lệ!";
        }
    }
});

password.addEventListener("input", (e) => {
    if (verifyPassword(e.target.value)) {
        passwordErr.textContent = "";
    } else {
        if (e.target.value.trim() === "") {
            passwordErr.textContent = "Vui lòng điền mật khẩu!";
        } else {
            passwordErr.textContent =
                "Mật khẩu phải chứa ít nhất 8 ký tự và chứa ít nhất 1 số!";
        }
    }

    // Kiểm tra lại confirm password
    if (verifyConfirmPassword(confirmPassword.value)) {
        confirmPasswordErr.textContent = "";
    } else {
        confirmPasswordErr.textContent =
            "Mật khẩu xác nhận không trùng với mật khẩu!";
    }
});

confirmPassword.addEventListener("input", (e) => {
    if (verifyConfirmPassword(e.target.value)) {
        confirmPasswordErr.textContent = "";
    } else {
        if (e.target.value.trim() === "") {
            confirmPasswordErr.textContent = "Vui lòng xác nhận mật khẩu!";
        } else {
            confirmPasswordErr.textContent =
                "Mật khẩu xác nhận không trùng với mật khẩu!";
        }
    }
});

// TODO: Nút Đăng ký
// Mặc định bị khóa (disabled).

// Chỉ được mở khi cả 4 ô đều hợp lệ.

// Nếu bất kỳ ô nào trở nên không hợp lệ thì nút phải bị khóa lại ngay.
form.addEventListener("input", (e) => {
    if (
        verifyUsername(username.value) &&
        verifyEmail(email.value) &&
        verifyPassword(password.value) &&
        verifyConfirmPassword(confirmPassword.value)
    ) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    successMessage.classList.remove("hidden");
    setTimeout(() => {
        successMessage.classList.add("hidden");
    }, 500);
});

// TODO: 1 Mới load trang. => OK

// Chưa nhập gì.

// Không có ô nào hiển thị lỗi.

// Nút Đăng ký đang bị khóa.

// TODO: 2. Nhập vào ô Tên đăng nhập => OK
// ab
// → Hiển thị lỗi vì chưa đủ 4 ký tự.

// TODO: 3. Tiếp tục nhập thành => OK
// abcd
// → Lỗi biến mất.

// TODO: 5. Nhập => OK
// abc def
// → Hiển thị lỗi vì có khoảng trắng (ký tự không hợp lệ).

// TODO: 6. Nhập Email => OK
// abc
// → Hiển thị lỗi định dạng email.

// Sửa thành
// abc@gmail.com
// → Lỗi biến mất.

// TODO: 7. Nhập Mật khẩu => OK
// abcdefgh
// → Vẫn báo lỗi vì chưa có chữ số.

// TODO: 8. Sửa thành => OK
// abcdefg1
// → Lỗi biến mất.

// TODO: 9. Nhập lại mật khẩu => OK
// abcdefg2
// → Hiển thị lỗi vì không khớp.

// TODO: 10. Quay lại ô Mật khẩu => OK

// Sửa thành:

// abcdefg2
// → Lỗi ở ô Nhập lại mật khẩu tự động biến mất mà không cần nhập lại.

// TODO: 11. Điền đúng cả 4 ô. => OK
// → Nút Đăng ký được mở khóa.

// TODO: 12. Sau khi nút đã mở. => OK

// Quay lại sửa Email thành không hợp lệ.

// → Nút Đăng ký lập tức bị khóa lại.

// TODO: 13. Điền đúng toàn bộ form => OK

// Bấm Đăng ký.

// Kết quả:

// Trang không reload.

// Hiển thị thông báo:

// Đăng ký thành công!