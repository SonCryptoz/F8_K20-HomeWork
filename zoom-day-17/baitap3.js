const players = [
    {
        id: 1,
        name: "DragonSlayer",
        scores: [120, 85, 200, 95],
        level: 8,
        badge: "gold",
    },
    { id: 2, name: "NightWolf", scores: [60, 75, 50], level: 5, badge: null },
    {
        id: 3,
        name: "StarQueen",
        scores: [300, 250, 180, 90, 120],
        level: 12,
        badge: "diamond",
    },
    { id: 4, name: "IronFist", scores: [40, 30], level: 2, badge: null },
    {
        id: 5,
        name: "ShadowBlade",
        scores: [150, 200, 175],
        level: 9,
        badge: "silver",
    },
];

// * Hàm 1: getTotalScore(player)
// Tính tổng điểm của một người chơi (cộng tất cả phần tử trong scores).

const getTotalScore = (player) => {
    return typeof player !== "object" ||
        player === null ||
        Array.isArray(player) ||
        !Array.isArray(player.scores)
        ? "Invalid Input"
        : player.scores.reduce((count, score) => count + score, 0);
};

console.log(getTotalScore(players[0])); // 500
console.log(getTotalScore(players[1])); // 185
console.log(getTotalScore(players[2])); // 940

// * Hàm 2: getRanking(players)
// Trả về mảng người chơi sắp xếp theo tổng điểm giảm dần, mỗi phần tử là object gồm:

// rank — thứ hạng (1, 2, 3...)

// name — tên người chơi

// totalScore — tổng điểm

// badge — badge nếu có, nếu null thì là "none"

const getRanking = (players) => {
    return players
        .slice(0) // tránh thay đổi mảng gốc
        .sort((a, b) => getTotalScore(b) - getTotalScore(a))
        .map((player, index) => {
            return {
                rank: index + 1,
                name: player.name,
                totalScore: getTotalScore(player),
                badge: player.badge ?? "none",
            };
        });
};

console.log(getRanking(players));
// [
//   { rank: 1, name: "StarQueen",   totalScore: 940, badge: "diamond" },
//   { rank: 2, name: "ShadowBlade", totalScore: 525, badge: "silver"  },
//   { rank: 3, name: "DragonSlayer",totalScore: 500, badge: "gold"    },
//   { rank: 4, name: "NightWolf",   totalScore: 185, badge: "none"    },
//   { rank: 5, name: "IronFist",    totalScore: 100, badge: "none"    },
// ]

// * Hàm 3: getTopPlayers(players, n)
// Trả về mảng tên của n người chơi có tổng điểm cao nhất.

const getTopPlayers = (players, n) => {
    return getRanking(players)
        .slice(0, n)
        .map((player) => player.name);
};

console.log(getTopPlayers(players, 3));
// ["StarQueen", "ShadowBlade", "DragonSlayer"]

console.log(getTopPlayers(players, 1));
// ["StarQueen"]

// * Hàm 4: formatPlayerCard(player)
// Tạo chuỗi hiển thị thông tin người chơi dùng template literal:

// badge = "diamond" → 💎 DIAMOND

// badge = "gold" → 🏅 GOLD

// badge = "silver" → 🥈 SILVER

// badge = null → không hiển thị phần badge

const formatPlayerCard = (player) => {
    let badgeText = "";

    if (player.badge === "diamond") {
        badgeText = " | 💎 DIAMOND";
    } else if (player.badge === "gold") {
        badgeText = " | 🏅 GOLD";
    } else if (player.badge === "silver") {
        badgeText = " | 🥈 SILVER";
    }

    return `${player.name} | Lv.${player.level} | ${getTotalScore(player)} điểm${badgeText}`;
};

console.log(formatPlayerCard(players[0]));
// "DragonSlayer | Lv.8 | 500 điểm | 🏅 GOLD"

console.log(formatPlayerCard(players[1]));
// "NightWolf | Lv.5 | 185 điểm"

console.log(formatPlayerCard(players[2]));
// "StarQueen | Lv.12 | 940 điểm | 💎 DIAMOND"
