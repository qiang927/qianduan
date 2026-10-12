document.addEventListener('DOMContentLoaded', () => {
    // 1. 收纳按钮展开/收起逻辑
    const toggleMenuBtn = document.getElementById('toggle-menu-btn');
    const rightMenu = document.querySelector('.right-menu');

    if (toggleMenuBtn && rightMenu) {
        toggleMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡
            rightMenu.classList.toggle('show');
            
            // 切换文字内容
            if (rightMenu.classList.contains('show')) {
                toggleMenuBtn.textContent = '收起';
            } else {
                toggleMenuBtn.textContent = '展开';
            }
        });
    }

    // 点击页面其他区域自动收起
    document.addEventListener('click', (e) => {
        if (rightMenu && rightMenu.classList.contains('show')) {
            if (!rightMenu.contains(e.target) && e.target !== toggleMenuBtn) {
                rightMenu.classList.remove('show');
                toggleMenuBtn.textContent = '展开';
            }
        }
    });

    // 2. 下一年长条按钮点击事件
    const longBtn = document.querySelector('.long-btn');
    if (longBtn) {
        longBtn.addEventListener('click', () => {
            showToast('时光飞逝，新的一年开始了...');
        });
    }

    // 3. 通用按钮点击
    const buttons = document.querySelectorAll('.icon-btn, .main-btn, .action-box');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 如果是行程格子
            if (btn.classList.contains('action-box')) {
                showToast(`你点击了行程：尚未实装安排功能`);
                return;
            }
            // 普通按钮
            const btnName = e.target.textContent.trim();
            if (btnName) {
                showToast(`[${btnName}] 功能尚未开放！`);
            }
        });
    });

    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            showToast('玩家个人信息详情');
        });
    }

    // 4. 提示框(Toast)逻辑
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
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            zIndex: '9999',
            pointerEvents: 'none',
            letterSpacing: '1px',
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