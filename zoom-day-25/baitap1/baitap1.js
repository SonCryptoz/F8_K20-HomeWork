const todoInput = document.querySelector("#todo-input");
const btnAdd = document.querySelector("#add-btn");
const todoList = document.querySelector("#todo-list");
const todoCount = document.querySelector("#todo-count");

const tasks = [];

// Khi bấm nút "Thêm" (hoặc nhấn Enter trong ô input):
// Nếu ô input đang trống hoặc chỉ toàn khoảng trắng thì không thêm gì cả.
// Nếu có nội dung, tạo một thẻ <li> mới chứa nội dung đó, thêm vào cuối
// danh sách, rồi xóa trắng ô input để gõ tiếp cho tiện.

// ? Mỗi <li> phải có kèm theo:

// Một nút "Xóa" để xóa riêng việc đó khỏi danh sách.

// EscapeHTML (xử lý chống XSS)
const escapeHTML = (html) => {
    const div = document.createElement("div");

    div.textContent = html;

    return div.innerHTML;
};

const render = () => {
    const html = tasks
        .map((task, index) => {
            return `<li data-index="${index}"><span>${escapeHTML(task.taskName)}</span><button>Xóa</button></li>`;
        })
        .join("");

    todoList.innerHTML = html;

    // Khi click vào phần chữ của <li> (không phải nút xóa) thì việc đó được
    // đánh dấu là "đã xong" — gạch ngang chữ lại, đổi màu mờ đi. Click lần nữa
    // thì bỏ đánh dấu, coi như "chưa xong".
    const liElements = document.querySelectorAll("li");

    liElements.forEach((element) => {
        element.style = "cursor: pointer;";
        const span = element.querySelector("span");
        const button = element.querySelector("button");
        span.addEventListener("click", () => {
            tasks[+element.dataset.index].done =
                !tasks[+element.dataset.index].done;
            render();
        });
        span.classList.toggle("done-task", tasks[+element.dataset.index].done);
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            tasks.splice(+element.dataset.index, 1);
            render();
        });
    });

    todoCount.textContent = `Còn ${tasks.filter((task) => !task.done).length} việc chưa xong`;
};

render();

const handleAdd = () => {
    const value = todoInput.value.trim();
    const isDuplicate = tasks.some((task) => task.taskName === value);
    if (value === "" || isDuplicate) {
        todoInput.style = "border-color: red";

        setTimeout(() => {
            todoInput.style = `border-color: #6c63ff; box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.12);`;
        }, 1000);
        return;
    }
    tasks.push({
        taskName: value,
        done: false,
    });
    render();
    todoInput.value = "";
    todoInput.focus();
};

const handleEnter = (e) => {
    if (e.code === "Enter") {
        handleAdd();
    }
};

btnAdd.addEventListener("click", handleAdd);

todoInput.addEventListener("keydown", handleEnter);

// Gõ "Học JavaScript" rồi bấm Thêm → danh sách xuất hiện đúng 1 dòng, ô
// input trở về rỗng, dòng đếm hiển thị "Còn 1 việc chưa xong".
// TODO: => OK

// Để trống ô input rồi bấm Thêm → không có gì được thêm vào danh sách.
// TODO: => OK

// Gõ " " (chỉ có khoảng trắng) rồi bấm Thêm → không có gì được thêm.
// TODO: => OK

// Thêm 3 việc khác nhau, sau đó click vào chữ của việc thứ 2 → việc đó bị
// gạch ngang, dòng đếm giảm xuống còn "Còn 2 việc chưa xong".
// TODO: => OK

// Click lại vào việc thứ 2 lần nữa → hết gạch ngang, dòng đếm quay lại
// "Còn 3 việc chưa xong".
// TODO: => OK

// Bấm nút "Xóa" ở một việc bất kỳ → việc đó biến mất khỏi danh sách và số
// đếm cập nhật lại cho đúng.
// TODO: => OK

// Thêm việc "Đi chợ", sau đó gõ lại đúng "Đi chợ" và bấm Thêm lần nữa →
// danh sách không có 2 dòng "Đi chợ" giống nhau, có dấu hiệu báo trùng.
// TODO: => OK

// Nhấn phím Enter khi con trỏ đang ở trong ô input (thay vì bấm nút) →
// việc vẫn được thêm vào bình thường như khi bấm nút Thêm.
// TODO: => OK