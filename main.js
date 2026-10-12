document.addEventListener('DOMContentLoaded', () => {
    // 1. 主线任务按钮与右侧菜单收纳逻辑
    const hugeBtn = document.querySelector('.huge-btn');
    const rightMenu = document.querySelector('.right-menu');

    if (hugeBtn && rightMenu) {
        hugeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡到 document 触发全局关闭
            // 切换右侧菜单的显示/隐藏状态
            rightMenu.classList.toggle('show');
        });
    }

    // 点击页面其他区域自动收起右侧菜单
    document.addEventListener('click', (e) => {
        if (rightMenu && rightMenu.classList.contains('show')) {
            // 如果点击的不是菜单内部，也不是主线按钮本身，则收起菜单
            if (!rightMenu.contains(e.target) && e.target !== hugeBtn) {
                rightMenu.classList.remove('show');
            }
        }
    });

    // 2. 简单的按钮点击事件处理（排除主线按钮，因为它现在是菜单开关）
    const buttons = document.querySelectorAll('.icon-btn, .main-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.target.textContent.trim();
            if (btnName) {
                showToast(`你点击了 [${btnName}] 功能，该功能尚未开放！`);
            }
        });
    });

    // 3. 聊天框与头像点击
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
        chatBox.addEventListener('click', () => {
            showToast('聊天系统暂未开放');
        });
    }

    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            showToast('玩家个人信息详情');
        });
    }

    // 4. 通用提示框(Toast)逻辑
    function showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '16px',
            zIndex: '9999',
            pointerEvents: 'none',
            animation: 'fadeInOut 2s ease-in-out forwards'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
        }, 2000);
    }

    // 注入淡入淡出动画样式
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.innerHTML = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -40%); }
                15% { opacity: 1; transform: translate(-50%, -50%); }
                85% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(style);
    }
});