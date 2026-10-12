document.addEventListener('DOMContentLoaded', () => {
    // 简单的按钮点击事件处理
    const buttons = document.querySelectorAll('.icon-btn, .main-btn, .huge-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.target.textContent.trim();
            if (btnName) {
                showToast(`你点击了 [${btnName}] 功能，该功能尚未开放！`);
            }
        });
    });

    // 聊天框点击
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
        chatBox.addEventListener('click', () => {
            showToast('聊天系统暂未开放');
        });
    }

    // 玩家头像点击
    const playerAvatar = document.querySelector('.player-left'); // Wait, the class is .top-left
    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            showToast('玩家个人信息详情');
        });
    }

    // 提示框逻辑
    function showToast(message) {
        // 如果已经有toast，先移除
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        // 设置样式
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

    // 注入简单的淡入淡出动画
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -40%); }
            15% { opacity: 1; transform: translate(-50%, -50%); }
            85% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -60%); }
        }
    `;
    document.head.appendChild(style);
});