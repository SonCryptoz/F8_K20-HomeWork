// Lỗi sai kiểu dữ liệu
class InvalidTypeError extends Error {
    constructor(message, value) {
        super(message);
        this.name = this.constructor.name;
        this.value = value; // Thông tin phụ để debug
    }
}

// Lỗi giá trị vượt phạm vi
class OutOfRangeError extends Error {
    constructor(message, value) {
        super(message);
        this.name = this.constructor.name;
        this.value = value;
    }
}

// Lỗi Email không hợp lệ
class InvalidEmailError extends Error {
    constructor(message, value) {
        super(message);
        this.name = this.constructor.name;
        this.value = value;
    }
}

// Lỗi mật khẩu quá yếu
class WeakPasswordError extends Error {
    constructor(message, value) {
        super(message);
        this.name = this.constructor.name;
        this.value = value;
    }
}

// Hàm kiểm tra dữ liệu
const registerUser = (object) => {
    // 1. Không truyền đối số khi gọi hàm hoặc sai kiểu dữ liệu.
    if (
        !object ||
        typeof object !== "object" ||
        object === null ||
        Array.isArray(object)
    ) {
        throw new InvalidTypeError(
            "Sai kiểu dữ liệu hoặc không có dữ liệu đầu vào",
            object,
        );
    }

    // 2. Sai cấu trúc dữ liệu
    const keys = Object.keys(object);
    if (
        !keys.includes("username") ||
        !keys.includes("age") ||
        !keys.includes("email") ||
        !keys.includes("password")
    ) {
        throw new InvalidTypeError("Sai cấu trúc dữ liệu", object);
    }

    const { username, age, email, password } = object;

    // 3. Sai kiểu dữ liệu từng trường
    if (
        typeof username !== "string" ||
        !Number.isInteger(age) ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        throw new InvalidTypeError(
            "Sai kiểu dữ liệu thuộc tính, hãy kiểm tra lại",
            object,
        );
    }

    // 4. age là số nhưng nằm ngoài khoảng hợp lệ:
    if (age < 13 || age > 120) {
        throw new OutOfRangeError("Phạm vi tuổi không hợp lệ", age);
    }

    // 5. email không chứa ký tự @.
    if (!email.includes("@")) {
        throw new InvalidEmailError("Email không hợp lệ", email);
    }

    // 6. password có độ dài nhỏ hơn 8 ký tự.
    if (password.length < 8) {
        throw new WeakPasswordError(
            "Mật khẩu cần có độ dài lớn hơn 7 ký tự",
            password,
        );
    }

    return {
        success: true,
        message: "Đăng ký thành công",
    };
};

// Case 1
try {
    const res = registerUser();
    console.log(res);
} catch (error) {
    error instanceof InvalidTypeError
        ? console.log(`${error.message}:`, error.value)
        : console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

try {
    const res = registerUser({});
    console.log(res);
} catch (error) {
    error instanceof InvalidTypeError
        ? console.log(`${error.message}:`, error.value)
        : console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

// Bắt được lỗi sai kiểu dữ liệu.
// Quá trình xử lý đăng ký đã kết thúc.
// Bắt được lỗi sai cấu trúc dữ liệu.
// Quá trình xử lý đăng ký đã kết thúc.

// Case 2
try {
    const res = registerUser({
        username: 123,
        age: 20,
        email: "a@b.com",
        password: "12345678",
    });
    console.log(res);
} catch (error) {
    error instanceof InvalidTypeError
        ? console.log(`${error.message}:`, error.value)
        : console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

// Bắt được lỗi sai kiểu dữ liệu vì username không phải chuỗi.
// Quá trình xử lý đăng ký đã kết thúc.

// Case 3
try {
    const res = registerUser({
        username: "an",
        age: 8,
        email: "a@b.com",
        password: "12345678",
    });
    console.log(res);
} catch (error) {
    error instanceof OutOfRangeError
        ? console.log(`${error.message}:`, error.value)
        : console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

// Bắt được lỗi vượt phạm vi vì tuổi nhỏ hơn 13.
// Quá trình xử lý đăng ký đã kết thúc.

// Case 4
try {
    const res = registerUser({
        username: "an",
        age: 20,
        email: "abgmail.com",
        password: "12345678",
    });
    console.log(res);
} catch (error) {
    error instanceof InvalidEmailError
        ? console.log(`${error.message}:`, error.value)
        : console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

// Bắt được lỗi email không hợp lệ (InvalidEmailError).
// Quá trình xử lý đăng ký đã kết thúc.

// * Case 5
try {
    const res = registerUser({
        username: "an",
        age: 20,
        email: "a@b.com",
        password: "123",
    });
    console.log(res);
} catch (error) {
    error instanceof WeakPasswordError
        ? console.log(`${error.message}:`, error.value)
        : console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

// Bắt được lỗi mật khẩu quá ngắn (WeakPasswordError).
// Quá trình xử lý đăng ký đã kết thúc.

// * Case 6
try {
    const res = registerUser({
        username: "an",
        age: 20,
        email: "a@b.com",
        password: "12345678",
    });
    console.log(res);
} catch (error) {
    console.log("Lỗi không xác định:", error.message);
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}

// {
//     success: true,
//     message: "Đăng ký thành công"
// }
// Quá trình xử lý đăng ký đã kết thúc.

// * Test tổng hợp
try {
    const res = registerUser({
        username: "an",
        age: 20,
        email: "abgmail.com", // Sai email
        password: "12345678",
    });
    console.log(res);
} catch (error) {
    if (error instanceof InvalidTypeError) {
        console.log(`${error.message}:`, error.value);
    } else if (error instanceof OutOfRangeError) {
        console.log(`${error.message}:`, error.value);
    } else if (error instanceof InvalidEmailError) {
        console.log(`${error.message}:`, error.value);
    } else if (error instanceof WeakPasswordError) {
        console.log(`${error.message}:`, error.value);
    } else {
        console.log("Lỗi không xác định:", error.message);
    }
} finally {
    console.log("Quá trình xử lý đăng ký đã kết thúc.");
}
