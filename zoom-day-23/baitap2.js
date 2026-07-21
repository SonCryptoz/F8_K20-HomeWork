// TODO: Hàm 1: addDays(dateString, days)
// * Đề bài: Cho một ngày, hãy cộng thêm (hoặc trừ đi, nếu days âm) số ngày cho trước, trả về ngày mới.

// * Đầu vào:

// * dateString — ngày ban đầu, dạng "YYYY-MM-DD"
// * days — số ngày muốn cộng thêm (có thể âm để lùi lại)

// *Đầu ra: chuỗi ngày mới, dạng "YYYY-MM-DD"

const addDays = (dateString, days) => {
    if (
        typeof dateString === "bigint" ||
        typeof days === "bigint" ||
        !Number.isInteger(days)
    )
        return "Invalid days";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Invalid Date";
    }

    date.setDate(date.getDate() + days);

    return date.toISOString().split("T")[0];
};

console.log(addDays("2026-07-19", 10)); // "2026-07-29"
console.log(addDays("2026-07-25", 10)); // "2026-08-04"
console.log(addDays("2026-01-01", -5)); // "2025-12-27"
console.log(addDays("1995-08-01", 123)); // "1995-12-02"
console.log(addDays("1995-08-01", 123n)); // "Invalid days"
console.log(addDays(123, 123)); // "1970-05-04"
console.log(addDays("1970-01-01", "2026-07-19 hello")); // Invalid days
console.log(addDays("1970-01-01", null)); // Invalid days
console.log(addDays("1970-01-01", undefined)); // Invalid days
console.log(addDays("1940-02-01", {})); // Invalid days
console.log(addDays("Hello", 123)); // "Invalid Date"
console.log(addDays({}, 123)); // "Invalid Date"
console.log(addDays(null, 123)); // "1970-05-04"

// TODO: Hàm 2: getDaysBetween(date1String, date2String)
// * Đề bài: Tính số ngày giữa hai mốc thời gian.

// * Đầu vào: hai chuỗi ngày, dạng "YYYY-MM-DD"

// * Đầu ra: số ngày chênh lệch (số nguyên)

const getDaysBetween = (date1String, date2String) => {
    if (typeof date1String === "bigint" || typeof date2String === "bigint")
        return "Invalid Date";

    const date1 = new Date(date1String);
    const date2 = new Date(date2String);

    if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
        return "Invalid Date";
    }

    return Math.abs(Math.floor((date2 - date1) / (1000 * 60 * 60 * 24)));
};

console.log(getDaysBetween("2026-07-19", "2026-08-01")); // 13
console.log(getDaysBetween("2026-01-01", "2026-12-31")); // 364
console.log(getDaysBetween("2026-01-01", "heleo")); // Invalid Date

console.log(getDaysBetween("2030-01-01", "2026-12-31")); // 1097

console.log(getDaysBetween("2019-01-01", null)); // 17897
console.log(getDaysBetween("2019-01-01", undefined)); // Invalid Date
console.log(getDaysBetween("2019-01-01", {})); // Invalid Date
console.log(getDaysBetween("2019-01-01", NaN)); // Invalid Date
console.log(getDaysBetween("2019-01-01", 123n)); // Invalid Date
console.log(getDaysBetween(null, "2026-01-01")); // 20454
console.log(getDaysBetween(undefined, "2026-01-01")); // Invalid Date
console.log(getDaysBetween(NaN, "2026-01-01")); // Invalid Date
console.log(getDaysBetween(222n, "2026-01-01")); // Invalid Date

// TODO: Hàm 3: isExpired(expiryDateString, currentDateString)
// * Đề bài: Kiểm tra xem một thứ gì đó (ví dụ voucher, tài khoản dùng thử) đã hết hạn chưa, dựa vào ngày hết hạn và ngày hiện tại.

// * Đầu vào:
// * expiryDateString — ngày hết hạn
// * currentDateString — ngày hiện tại

// * Đầu ra: true nếu đã hết hạn, false nếu chưa

const isExpired = (expiryDateString, currentDateString) => {
    if (
        typeof expiryDateString === "bigint" ||
        typeof currentDateString === "bigint"
    )
        return "Invalid Date";

    const expiry = new Date(expiryDateString);
    const current = new Date(currentDateString);

    if (Number.isNaN(expiry.getTime()) || Number.isNaN(current.getTime())) {
        return "Invalid Date";
    }

    return current >= expiry;
};

console.log(isExpired("2026-07-01", "2026-07-19")); // true  (đã qua ngày hết hạn)
console.log(isExpired("2026-07-01", "2026-07-01")); // true  (đã đến ngày hết hạn)
console.log(isExpired("2026-12-31", "2026-07-19")); // false (chưa tới hạn)
console.log(isExpired("2019-01-01", null)); // false (chưa tới hạn)
console.log(isExpired("2019-01-01", undefined)); // Invalid Date
console.log(isExpired("2019-01-01", {})); // Invalid Date
console.log(isExpired("2019-01-01", NaN)); // Invalid Date
console.log(isExpired("2019-01-01", 123n)); // Invalid Date
console.log(isExpired(null, "2026-01-01")); // true (đã qua ngày hết hạn)
console.log(isExpired(undefined, "2026-01-01")); // Invalid Date
console.log(isExpired(NaN, "2026-01-01")); // Invalid Date
console.log(isExpired(222n, "2026-01-01")); // Invalid Date

// TODO: Hàm 4: getCountdown(targetDateString, currentDateString)
// * Đề bài: Xây một bộ đếm ngược hiển thị còn bao nhiêu ngày và giờ nữa đến một sự kiện. Nếu sự kiện đã qua rồi thì báo là "Đã qua hạn".

// * Đầu vào:
// * targetDateString — thời điểm sự kiện diễn ra, dạng có giờ "YYYY-MM-DDTHH:MM:SS"
// * currentDateString — thời điểm hiện tại, cùng định dạng

// * Đầu ra: chuỗi mô tả thời gian còn lại

const getCountdown = (targetDateString, currentDateString) => {
    if (
        typeof targetDateString === "bigint" ||
        typeof currentDateString === "bigint"
    )
        return "Invalid Date";

    const target = new Date(targetDateString);
    const current = new Date(currentDateString);

    if (Number.isNaN(target.getTime()) || Number.isNaN(current.getTime())) {
        return "Invalid Date";
    }

    const diff = target - current,
        hours = 1000 * 60 * 60,
        days = hours * 24;

    return diff < 0
        ? "Đã qua hạn"
        : `Còn ${Math.floor(diff / days)} ngày ${Math.floor((diff % days) / hours)} giờ`;
};

console.log(getCountdown("2026-08-01T00:00:00", "2026-07-19T12:00:00"));
// "Còn 12 ngày 12 giờ"

console.log(getCountdown("2026-07-01T00:00:00", "2026-07-19T12:00:00"));
// "Đã qua hạn"

console.log(getCountdown("2019-01-01", null)); // Còn 17897 ngày 0 giờ
console.log(getCountdown("2019-01-01", undefined)); // Invalid Date
console.log(getCountdown("2019-01-01", {})); // Invalid Date
console.log(getCountdown("2019-01-01", NaN)); // Invalid Date
console.log(getCountdown("2019-01-01", 123n)); // Invalid Date
console.log(getCountdown(null, "2026-01-01")); // Đã qua hạn
console.log(getCountdown(undefined, "2026-01-01")); // Invalid Date
console.log(getCountdown(NaN, "2026-01-01")); // Invalid Date
console.log(getCountdown(222n, "2026-01-01")); // Invalid Date