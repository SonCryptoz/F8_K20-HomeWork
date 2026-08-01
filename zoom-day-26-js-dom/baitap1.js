const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const todoItems = [];
let currentFilter = "all";

const todoForm = $(".todo-form");
const todoInput = todoForm.querySelector("input");
const todoList = $(".todo-list");

const requiredText = $(".required");
const todoFilterBtns = $$(".filter-btn");

const completedTodos = $(".completed-todos");
const deleteCompletedAll = $(".clear-completed-btn");

const render = (filter = currentFilter) => {
    const html = todoItems
        .map((todoItem, index) => {
            if (todoItem.deleted) return ""; // lọc todo đã xóa mềm
            if (todoItem.done && filter === "active") return ""; // chưa hoàn thành (lọc bỏ các todo đã done)
            if (!todoItem.done && filter === "completed") return ""; // hoàn thành (lọc các todo chưa hoàn thành)
            return `<div class="todo-wrapper">
                        <li data-index="${index}" class="todo-item ${todoItem.done ? "done" : ""}  ${todoItem.isNew ? "new" : ""}">
                            <span>${todoItem.title}</span>
                            <button>Xóa</button>
                        </li>
                        <p class="required">Vui lòng nhập nội dung cần sửa!</p>
                    </div>
                    `;
        })
        .join("");

    todoList.innerHTML = html || "<p>Không có công việc nào!</p>";

    const total = todoItems.filter((todoItem) => !todoItem.deleted).length;
    const completed = todoItems.filter(
        (todoItem) => !todoItem.deleted && todoItem.done,
    ).length;

    completedTodos.innerHTML = `<span>${completed}</span> / <span>${total}</span> mục đã hoàn thành`;
    deleteCompletedAll.classList.toggle("hidden", completed === 0);
};

render(currentFilter);

// TODO: Chức năng thêm todo:

// Một ô input và button "Thêm" ở đầu danh sách.

// Nhấn Enter trong ô input hoặc click button để thêm todo mới vào cuối danh sách.

// Nếu ô input trống hoặc chỉ chứa khoảng trắng, hiển thị thông báo lỗi ngay bên dưới ô input (Ví dụ: "Vui lòng nhập nội dung todo!").

// Sau khi thêm thành công, tự động xoá nội dung trong ô input và focus lại vào ô input để người dùng nhập tiếp.

const addTodo = () => {
    const value = todoInput.value.trim();
    if (value === "") {
        todoInput.style = "border-color: red";
        requiredText.classList.add("active");

        setTimeout(() => {
            todoInput.style = "";
            requiredText.classList.remove("active");
        }, 1500);

        return;
    }
    todoItems.push({
        title: value,
        done: false,
        deleted: false,
    });
    todoInput.value = "";
    todoInput.focus();
    render(currentFilter);

    const wrapper = todoList.lastElementChild;
    const newTodo = wrapper.querySelector(".todo-item");

    newTodo.classList.add("new"); // Khi add todo vào list thêm class new tạm thời ẩn không hiện

    requestAnimationFrame(() => { // chạy đến đây sẽ request xóa class new đồng thời animate hiện dần
        newTodo.classList.remove("new");
    });
};

todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo();
});

// TODO: Hiển thị và thao tác danh sách:

// Mỗi todo hiển thị dưới dạng một dòng riêng biệt, gồm: nội dung todo, button Xoá.

// Sử dụng Event Delegation: gán một listener duy nhất lên container danh sách, lắng nghe sự kiện "change".

// Dùng event.target để phân biệt hành động: todo toggle trạng thái completed, button Xoá xoá todo tương ứng.

// To-do trạng thái completed: nội dung todo được gạch ngang (text-decoration: line-through), màu sắc mờ đi để phân biệt trạng thái hoàn thành.

// To-do trạng thái uncompleted: khôi phục trạng thái ban đầu.

// Button Xoá: xoá todo đó khỏi danh sách cần có confirm trước khi xóa thật, nên sử dụng kỹ thuật Soft Delete.

let timer = null;

const handleTodo = (e) => {
    const button = e.target.closest(".todo-item button");
    const li = e.target.closest(".todo-item");

    if (button) {
        if (confirm("Bạn có muốn xóa việc này không?")) {
            li.classList.add("remove");

            li.addEventListener("transitionend", () => { // li được add thêm remove, khi animate xong sẽ thực hiện logic này
                todoItems[li.dataset.index].deleted = true;
                render(currentFilter);
            });
        }
    } else if (li) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            todoItems[li.dataset.index].done =
                !todoItems[li.dataset.index].done;
            render(currentFilter);
        }, 300);
    }
};

todoList.addEventListener("click", handleTodo);

// TODO: Chỉnh sửa todo:

// Double-click vào nội dung todo: nội dung chuyển thành ô input để người dùng sửa.

// Nhấn Enter hoặc blur khỏi ô input: lưu nội dung mới.

// Nhấn Escape: huỷ chỉnh sửa, khôi phục nội dung cũ.

// Nếu nội dung mới trống hoặc chỉ chứa khoảng trắng, hiển thị thông báo lỗi ngay bên dưới ô input (Ví dụ: "Vui lòng nhập nội dung todo!").

const noBubbling = (e) => e.stopPropagation();

todoList.addEventListener("dblclick", (e) => {
    clearTimeout(timer);
    const li = e.target.closest(".todo-item");
    if (!li) return;

    const span = li.querySelector("span");
    const p = todoList.querySelector(".todo-wrapper").querySelector("p");
    const value = span.textContent;

    span.outerHTML = `<input type="text" class="change-todo" placeholder="Sửa việc" value="${value}" />`;

    const input = li.querySelector("input");
    input.focus();
    input.addEventListener("click", noBubbling);
    input.addEventListener("dblclick", noBubbling);

    const handleChange = () => {
        const newValue = input.value.trim();
        if (!newValue) {
            input.style = "border-color: red";
            p.classList.add("active");
            todoList.removeEventListener("click", handleTodo);
            input.focus();

            setTimeout(() => {
                input.style = "";
                p.classList.remove("active");
            }, 1500);
            return;
        }
        todoItems[li.dataset.index].title = newValue;
        todoList.addEventListener("click", handleTodo);
        render(currentFilter);
    };

    input.addEventListener("keydown", (e) => {
        if (e.code === "Escape") {
            render(currentFilter);
        } else if (e.code === "Enter") {
            handleChange();
        }
    });
    input.addEventListener("blur", (e) => {
        handleChange();
    });
});

// TODO: Lọc todo:

// Ba nút lọc "Tất cả", "Chưa hoàn thành", "Hoàn thành" nằm phía trên danh sách.

// Nút đang active được highlight màu khác biệt.

// Click vào nút nào, danh sách chỉ hiển thị các todo tương ứng.

// Khi không có todo nào ở chế độ lọc hiện tại, hiển thị thông báo "Không có todo nào" thay vì để danh sách trống.

todoFilterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const activedBtn = document.querySelector(".filter-btn.active");
        if (activedBtn) {
            activedBtn.classList.remove("active");
        }
        e.target.classList.add("active");

        currentFilter = e.target.dataset.filter;

        render(currentFilter);
    });
});

// TODO: UI / UX:

// Hiển thị số lượng todo đã hoàn thành / tổng số todo ở cuối danh sách (vd: "3/5 mục đã hoàn thành").

// Button "Xoá tất cả" chỉ hiển thị khi có ít nhất 1 todo đã hoàn thành, click để xoá toàn bộ todo đã hoàn thành.

// Hiệu ứng hover trên mỗi dòng todo (đổi màu nền nhẹ).

// Transition mượt khi thêm/xoá todo.
deleteCompletedAll.addEventListener("click", () => {
    if (confirm("Bạn có muốn xóa hết tất cả công việc đã hoàn thành không?")) {
        todoItems.forEach((todoItem) => {
            if (todoItem.done) {
                todoItem.deleted = true;
            }
        });
        render(currentFilter);

        // const wrapper = todoList.lastElementChild;
        // const todoItem = wrapper.querySelector(".todo-item");
    }
});
