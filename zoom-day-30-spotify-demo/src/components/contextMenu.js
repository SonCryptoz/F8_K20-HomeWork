let activeMenu = null;
let cleanupFns = [];

// Mũi tên submenu
const ARROW_ICON = `<svg viewBox="0 0 16 16" style="width:12px;height:12px"><path fill="currentColor" d="M4.97 2.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06-1.06L9.44 8 4.97 3.53a.75.75 0 0 1 0-1.06z"/></svg>`;

/**
 * Đóng context menu đang mở (nếu có)
 */
export function closeContextMenu() {
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
    cleanupFns.forEach((fn) => fn());
    cleanupFns = [];
}

function createMenuPanel(items, rootMenu) {
    const panel = document.createElement('div');
    panel.style.cssText = `
        min-width: 200px;
        background: #282828;
        color: #eaeaea;
        border-radius: 4px;
        padding: 4px;
        box-shadow: 0 16px 24px rgba(0,0,0,.3), 0 6px 8px rgba(0,0,0,.2);
        font-size: 14px;
        user-select: none;
        max-height: 70vh;
        overflow-y: auto;
    `;

    items.forEach((item) => {
        // --- Divider ---
        if (item.divider) {
            const div = document.createElement('div');
            div.style.cssText = 'height:1px; background:#3e3e3e; margin:4px 0;';
            panel.appendChild(div);
            return;
        }

        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        // --- Menu Item Row ---
        const row = document.createElement('div');
        row.setAttribute('data-is-row', 'true'); // Dấu hiệu nhận biết các row
        row.style.cssText = `
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border-radius: 2px;
            cursor: pointer;
            position: relative;
        `;

        // Nội dung bên trong (icon + label + arrow)
        const innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; min-width:0; pointer-events:none;">
                ${item.icon ? `<span style="width:16px; height:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#b3b3b3;">${item.icon}</span>` : ''}
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.label}</span>
            </div>
            ${hasChildren ? `<span style="color:#b3b3b3; display:flex; align-items:center; pointer-events:none;">${ARROW_ICON}</span>` : ''}
        `;
        row.innerHTML = innerHTML;

        // --- Hover ---
        row.addEventListener('mouseenter', () => {
            // Hủy timer ẩn submenu (nếu có)
            if (panel.closeTimer) {
                clearTimeout(panel.closeTimer);
                panel.closeTimer = null;
            }

            // Xóa highlight của tất cả các row khác trong cùng panel
            Array.from(panel.children).forEach(child => {
                if (child.hasAttribute('data-is-row')) {
                    child.style.background = 'transparent';
                }
            });

            // Highlight row hiện tại
            row.style.background = '#3e3e3e';

            if (hasChildren) {
                showChildMenu(row, item.children, panel, rootMenu || panel);
            } else {
                hideChildMenu(panel);
            }
        });

        row.addEventListener('mouseleave', () => {
            if (hasChildren) {
                // Delay 300ms trước khi đóng submenu & bỏ highlight
                // Để user kịp rê chuột chéo sang submenu
                panel.closeTimer = setTimeout(() => {
                    row.style.background = 'transparent';
                    hideChildMenu(panel);
                }, 300);
            } else {
                row.style.background = 'transparent';
            }
        });

        // --- Click ---
        if (!hasChildren && typeof item.action === 'function') {
            row.addEventListener('click', () => {
                item.action();
                closeContextMenu();
            });
        }

        panel.appendChild(row);
    });

    return panel;
}

/**
 * Hiển thị submenu con bên cạnh item cha
 */
function showChildMenu(parentRow, childItems, parentPanel, rootMenu) {
    hideChildMenu(parentPanel);

    const childPanel = createMenuPanel(childItems, rootMenu);
    childPanel.setAttribute('data-submenu', 'true');
    childPanel.style.position = 'fixed';
    childPanel.style.zIndex = '100001';

    parentPanel.appendChild(childPanel);

    // Tính toán vị trí: mặc định mở sang phải
    const parentRect = parentRow.getBoundingClientRect();
    childPanel.style.left = `${parentRect.right}px`;
    childPanel.style.top = `${parentRect.top}px`;

    // Điều chỉnh nếu tràn phải -> mở sang trái
    const childRect = childPanel.getBoundingClientRect();
    if (childRect.right > window.innerWidth) {
        childPanel.style.left = `${parentRect.left - childRect.width}px`;
    }
    // Điều chỉnh nếu tràn dưới -> đẩy lên
    if (childRect.bottom > window.innerHeight) {
        childPanel.style.top = `${window.innerHeight - childRect.height - 8}px`;
    }

    // Giữ submenu không bị đóng khi di chuột vào
    childPanel.addEventListener('mouseenter', () => {
        if (parentPanel.closeTimer) {
            clearTimeout(parentPanel.closeTimer);
            parentPanel.closeTimer = null;
        }
        parentRow.style.background = '#3e3e3e';
    });
    
    // Khi rời khỏi submenu, cũng delay 300ms rồi đóng
    childPanel.addEventListener('mouseleave', () => {
        parentPanel.closeTimer = setTimeout(() => {
            parentRow.style.background = 'transparent';
            hideChildMenu(parentPanel);
        }, 300);
    });
}

/**
 * Ẩn submenu con hiện tại
 */
function hideChildMenu(parentPanel) {
    const existing = parentPanel.querySelector('[data-submenu]');
    if (existing) existing.remove();
}

export function openContextMenu({ x, y, items }) {
    closeContextMenu();

    const menu = createMenuPanel(items, null);
    menu.style.position = 'fixed';
    menu.style.zIndex = '99999';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    document.body.appendChild(menu);
    activeMenu = menu;

    // Điều chỉnh vị trí nếu bị tràn
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = `${window.innerHeight - rect.height - 8}px`;
    }

    // Đóng menu khi click ra ngoài hoặc nhấn Esc
    const onClickOutside = (e) => {
        if (activeMenu && !activeMenu.contains(e.target)) {
            closeContextMenu();
        }
    };
    const onEsc = (e) => {
        if (e.key === 'Escape') closeContextMenu();
    };

    setTimeout(() => {
        document.addEventListener('click', onClickOutside, true);
        document.addEventListener('keydown', onEsc);
    }, 0);

    cleanupFns.push(() => document.removeEventListener('click', onClickOutside, true));
    cleanupFns.push(() => document.removeEventListener('keydown', onEsc));
}
