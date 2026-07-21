// TODO: Hàm 1: formatBirthday(dateString)
// * Đề bài: Dữ liệu ngày sinh từ hệ thống thường ở dạng "YYYY-MM-DD" (ví dụ "1995-03-25").
// * Hãy chuyển nó về định dạng quen thuộc của người Việt: "DD/MM/YYYY".

// * Đầu vào: một chuỗi ngày dạng ISO, ví dụ "1995-03-25"
// * Đầu ra: một chuỗi dạng "DD/MM/YYYY"

const formatBirthday = (dateString) => {
    try {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Invalid Date";
        }

        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "Invalid Date";
    }
};

console.log(formatBirthday("1995-03-25")); // "25/03/1995"
console.log(formatBirthday("2000-12-01")); // "01/12/2000"
console.log(formatBirthday("2012-08-23")); // "23/08/2012"
console.log(formatBirthday("2027-02-11")); // "11/02/2027"
console.log(formatBirthday(1234456723554)); // "12/02/2009"
console.log(formatBirthday(NaN)); // "Invalid Date"
console.log(formatBirthday("Hello")); // "Invalid Date"
console.log(formatBirthday({})); // "Invalid Date"
console.log(formatBirthday(13n)); // "Invalid Date"
console.log(formatBirthday(function () {})); // "Invalid Date"
console.log(formatBirthday(null)); // "01/01/1970"
console.log(formatBirthday(0)); // "01/01/1970"
console.log(formatBirthday(-1982374)); // "01/01/1970"
console.log(formatBirthday(12324.2345)); // "01/01/1970"
console.log(formatBirthday(undefined)); // "Invalid Date"
console.log(formatBirthday()); // "Invalid Date"
console.log(formatBirthday("1900-01-01")); // "01/01/1900"

// TODO: Hàm 2: getAge(birthDateString, currentDateString)
// * Đề bài: Tính tuổi chính xác của một người, dựa vào ngày sinh và ngày hiện tại.
// * Lưu ý: nếu người đó chưa tới sinh nhật trong năm nay thì tuổi phải trừ đi 1 (không được tính đơn giản bằng cách lấy năm hiện tại trừ năm sinh).

// * Đầu vào:
// * birthDateString — ngày sinh, dạng "YYYY-MM-DD"
// * currentDateString — ngày hiện tại, dạng "YYYY-MM-DD"

const getAge = (birthDateString, currentDateString) => {
    try {
        const birth = new Date(birthDateString);
        const current = new Date(currentDateString);

        if (Number.isNaN(birth.getTime()) || Number.isNaN(current.getTime())) {
            return "Invalid Date";
        }

        let diff = current.getFullYear() - birth.getFullYear();
        if (
            current.getMonth() < birth.getMonth() ||
            (current.getDate() < birth.getDate() &&
                current.getMonth() === birth.getMonth())
        ) {
            diff--;
        }
        return diff > 0 ? diff : "Invalid current birth";
    } catch {
        return "Invalid Date";
    }
};

console.log(getAge("1995-03-25", "2026-07-19")); // 31  (đã qua sinh nhật tháng 3)
console.log(getAge("2000-12-01", "2026-07-19")); // 25  (chưa tới sinh nhật tháng 12, nên chưa tính là 26)
console.log(getAge("1995-08-01", "2026-07-19")); // 30  (còn vài ngày nữa mới tới sinh nhật)
console.log(getAge("1995-08-01", 123)); // "Invalid current birth"
console.log(getAge("1970-01-01", "2026-07-19")); // 56  (Đã qua ngày sinh nhật)
console.log(getAge("1970-01-01", null)); // "Invalid current birth"
console.log(getAge("1970-01-01", undefined)); // "Invalid Date"
console.log(getAge("1940-02-01", "1969-01-01")); // 28 (Chưa qua sinh nhật)

// TODO: Hàm 3: getDayOfWeekName(dateString)
// * Đề bài: Cho một ngày bất kỳ, hãy cho biết ngày đó là thứ mấy trong tuần (dùng tiếng Việt).

// * Đầu vào: chuỗi ngày dạng "YYYY-MM-DD"
// * Đầu ra: chuỗi tên thứ trong tuần

const getDayOfWeekName = (dateString) => {
    const weekDays = [
        "Chủ nhật",
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
    ];
    try {
        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "Invalid Date";
        }

        return weekDays[date.getDay()];
    } catch {
        return "Invalid Date";
    }
};

console.log(getDayOfWeekName("2026-07-19")); // "Chủ nhật"
console.log(getDayOfWeekName("2000-01-01")); // "Thứ bảy"
console.log(getDayOfWeekName("1995-03-25")); // "Thứ bảy"
console.log(getDayOfWeekName("2000-12-01")); // "Thứ sáu"
console.log(getDayOfWeekName("2012-08-23")); // "Thứ năm"
console.log(getDayOfWeekName("2027-02-11")); // "Thứ năm"
console.log(getDayOfWeekName(1234456723554)); // "Thứ năm"
console.log(getDayOfWeekName(NaN)); // "Invalid Date"
console.log(getDayOfWeekName("Hello")); // "Invalid Date"
console.log(getDayOfWeekName({})); // "Invalid Date"
console.log(getDayOfWeekName(13n)); // "Invalid Date"
console.log(getDayOfWeekName(function () {})); // "Invalid Date"
console.log(getDayOfWeekName(null)); // "Thứ năm"
console.log(getDayOfWeekName(0)); // "Thứ năm"
console.log(getDayOfWeekName(-1982374)); // "Thứ năm"
console.log(getDayOfWeekName(12324.2345)); // "Thứ năm"
console.log(getDayOfWeekName(undefined)); // "Invalid Date"
console.log(getDayOfWeekName()); // "Invalid Date"
console.log(getDayOfWeekName("1900-01-01")); // ""Thứ hai"