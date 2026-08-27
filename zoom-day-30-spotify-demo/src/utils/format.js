// * Chuyển giây -> mm:ss
export function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// * Format tổng thời lượng (ví dụ: 503s -> "8 min 23 sec" hoặc "13 min 18 sec")
export const formatTotalDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "0 min";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
        return `${hrs} hr ${mins} min`;
    }
    if (mins > 0 && secs > 0) {
        return `${mins} min ${secs} sec`;
    }
    if (mins > 0) {
        return `${mins} min`;
    }
    return `${secs} sec`;
};

// * Format lượt nghe kiểu Spotify: 45,686,897 hoặc 45.6M
export function formatPlayCount(count) {
    if (!count && count !== 0) return "0";
    return count.toLocaleString("en-US");
}

// * Lấy năm
export function getYear(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).getFullYear();
}

// * Kích cỡ chữ dựa vào độ dài chữ
export function getTrackNameFontSize(title) {
    if (!title) return 72;

    const len = title.length;

    if (len <= 10) return 96;
    if (len <= 20) return 64;
    if (len <= 30) return 48;
    if (len <= 40) return 40;
    if (len <= 50) return 32;
    return 24;
}

// * Format thời gian trôi qua
export const formatDateAdded = (addedAt) => {
    if (!addedAt) return "";

    const date = new Date(addedAt);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const diffMs = now - date;

    // Chống trường hợp server/client clock bị lệch
    if (diffMs < 0) {
        return "Just now";
    }

    const MINUTE = 60 * 1000;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;

    // < 1 minute
    if (diffMs < MINUTE) {
        return "Just now";
    }

    // < 1 hour
    if (diffMs < HOUR) {
        const minutes = Math.floor(diffMs / MINUTE);

        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    // < 24 hours
    if (diffMs < DAY) {
        const hours = Math.floor(diffMs / HOUR);

        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfDate = new Date(date);
    startOfDate.setHours(0, 0, 0, 0);

    const calendarDiffDays = Math.floor((startOfToday - startOfDate) / DAY);

    // Ngày hôm qua
    if (calendarDiffDays === 1) {
        return "Yesterday";
    }

    // Trong vòng 1 tuần
    if (calendarDiffDays < 7) {
        return `${calendarDiffDays} days ago`;
    }

    // Trong vòng 1 tháng
    if (calendarDiffDays < 30) {
        const weeks = Math.floor(calendarDiffDays / 7);

        return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    }

    // Cũ hơn 30 ngày
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};