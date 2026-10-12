document.addEventListener('DOMContentLoaded', () => {
    
    // 初始化角色名称
    const initCharName = localStorage.getItem('char_name') || '张三';
    const playerNameEl = document.querySelector('.player-name');
    if (playerNameEl) {
        playerNameEl.textContent = `平民_${initCharName}`;
    }

    // 1. 收纳按钮展开/收起逻辑
    const toggleMenuBtn = document.getElementById('toggle-menu-btn');
    const rightMenu = document.querySelector('.right-menu');

    if (toggleMenuBtn && rightMenu) {
        toggleMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            rightMenu.classList.toggle('show');
            toggleMenuBtn.textContent = rightMenu.classList.contains('show') ? '收起' : '展开';
        });
    }

    document.addEventListener('click', (e) => {
        if (rightMenu && rightMenu.classList.contains('show')) {
            if (!rightMenu.contains(e.target) && e.target !== toggleMenuBtn) {
                rightMenu.classList.remove('show');
                toggleMenuBtn.textContent = '展开';
            }
        }
    });

    // 2. 弹窗系统核心逻辑
    const modalOverlay = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContentBody = document.getElementById('modal-content-body');
    const modalClose = document.getElementById('modal-close');

    // 增加 onOpenCallback 支持弹窗后执行 JS (如绑定事件、读取本地存储)
    function openModal(title, htmlContent, onOpenCallback) {
        modalTitle.textContent = title;
        modalContentBody.innerHTML = htmlContent;
        modalOverlay.classList.add('active');
        
        if (rightMenu && rightMenu.classList.contains('show')) {
            rightMenu.classList.remove('show');
            toggleMenuBtn.textContent = '展开';
        }

        if (typeof onOpenCallback === 'function') {
            // 确保 DOM 渲染完毕后再执行
            setTimeout(onOpenCallback, 0);
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // 3. 各个按钮的弹窗内容配置
    const modalConfigs = {
        '背包': {
            title: '【 我的行囊 】',
            html: `
                <div class="grid-layout">
                    ${Array(16).fill('<div class="grid-cell">空</div>').join('')}
                </div>
                <div style="margin-top:15px;text-align:center;font-size:12px;color:#8b7456;">容量: 0/16</div>
            `
        },
        '信件': {
            title: '【 飞鸽传书 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <span style="font-weight:bold;">娘亲的家书</span>
                        <span style="color:#c25b4e;font-size:12px;">未读</span>
                    </div>
                </div>
            `
        },
        '人际': {
            title: '【 人脉交游 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>私塾先生</span><span>好感: 10</span></div>
                    <div class="list-item"><span>神秘乞丐</span><span style="color:#c25b4e;">好感: -50</span></div>
                </div>
            `
        },
        '地图': {
            title: '【 城镇地图 】',
            html: `
                <div class="grid-layout">
                    <div class="grid-cell" style="background:#eaddc7;color:#5c4a3d;">自家</div>
                    <div class="grid-cell">市集</div>
                    <div class="grid-cell">私塾</div>
                    <div class="grid-cell">破庙</div>
                </div>
            `
        },
        '我': { 
            title: '【 造物设定 (Prompt) 】',
            html: `
                <div style="margin-bottom:15px;font-size:13px;color:#8b7456;text-align:center;">在此写下你的身世与夙愿，天道(AI)将据此推演你的命运。</div>
                <div class="form-group">
                    <label>角色姓名</label>
                    <input type="text" id="char-name-input" class="modal-input" placeholder="例如：张三">
                </div>
                <div class="form-group">
                    <label>背景与性格设定</label>
                    <textarea id="char-prompt-input" class="modal-textarea" placeholder="例如：我是一个出生在贫苦农家的孩子，性格坚韧，渴望通过读书改变命运..."></textarea>
                </div>
                <button class="action-btn" id="save-char-btn" style="width:100%; padding:10px; margin-top:10px;">铭记于天道 (保存设定)</button>
            `,
            onOpen: () => {
                const nameInput = document.getElementById('char-name-input');
                const promptInput = document.getElementById('char-prompt-input');
                
                // 读取本地存储
                nameInput.value = localStorage.getItem('char_name') || '张三';
                promptInput.value = localStorage.getItem('char_prompt') || '我是一个出生在贫苦农家的孩子，渴望通过读书改变命运。';

                // 保存设定
                document.getElementById('save-char-btn').addEventListener('click', () => {
                    const newName = nameInput.value.trim() || '无名氏';
                    const newPrompt = promptInput.value.trim();
                    localStorage.setItem('char_name', newName);
                    localStorage.setItem('char_prompt', newPrompt);
                    
                    // 更新主界面的名字
                    const pNameEl = document.querySelector('.player-name');
                    if(pNameEl) pNameEl.textContent = `平民_${newName}`;
                    
                    showToast('角色设定已保存！');
                    closeModal();
                });
            }
        },
        '任务': {
            title: '【 当前目标 】',
            html: `
                <div class="list-layout">
                    <div class="list-item" style="border-left: 3px solid #c25b4e;">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">[主线] 逆天改命</span>
                            <span style="font-size:12px;color:#666;margin-top:4px;">前往私塾偷听讲学 (0/1)</span>
                        </div>
                    </div>
                </div>
            `
        },
        '设置': {
            title: '【 系统与大模型设置 】',
            html: `
                <div class="list-layout">
                    <div class="form-group" style="margin-top:5px;">
                        <label>API 地址 (Base URL)</label>
                        <input type="text" id="api-url" class="modal-input" placeholder="例如: https://api.openai.com/v1">
                    </div>
                    <div class="form-group">
                        <label>API 密钥 (API Key)</label>
                        <input type="password" id="api-key" class="modal-input" placeholder="sk-...">
                    </div>
                    <div class="form-group" style="display:flex; flex-direction:row; justify-content:space-between; align-items:center;">
                        <label>大语言模型</label>
                        <button class="action-btn" id="fetch-models-btn" style="padding:4px 10px;">获取模型</button>
                    </div>
                    <div class="form-group">
                        <select id="model-select" class="modal-select">
                            <option value="">手动输入或点击获取</option>
                        </select>
                        <input type="text" id="manual-model" class="modal-input" placeholder="或在此手动输入模型名称" style="margin-top:8px;">
                    </div>
                    <button class="action-btn" id="save-ai-settings" style="width:100%; padding:10px; margin-top:5px; background:#c25b4e;">保存设置</button>
                </div>
            `,
            onOpen: () => {
                const urlInput = document.getElementById('api-url');
                const keyInput = document.getElementById('api-key');
                const modelSelect = document.getElementById('model-select');
                const manualModelInput = document.getElementById('manual-model');
                
                // 加载已保存设置
                urlInput.value = localStorage.getItem('ai_api_url') || '';
                keyInput.value = localStorage.getItem('ai_api_key') || '';
                const savedModel = localStorage.getItem('ai_model') || '';
                if (savedModel) {
                    manualModelInput.value = savedModel;
                    modelSelect.innerHTML = \`<option value="\${savedModel}">\${savedModel}</option>\`;
                }

                // 获取模型列表模拟/真实调用
                document.getElementById('fetch-models-btn').addEventListener('click', async () => {
                    const url = urlInput.value.trim();
                    const key = keyInput.value.trim();
                    if (!url || !key) return showToast('请先填写API地址和密钥');
                    
                    showToast('正在尝试获取模型列表...');
                    try {
                        const endpoint = url.endsWith('/') ? url + 'models' : url + '/models';
                        const response = await fetch(endpoint, {
                            headers: { 'Authorization': 'Bearer ' + key }
                        });
                        const data = await response.json();
                        
                        if (data && data.data && Array.isArray(data.data)) {
                            modelSelect.innerHTML = '';
                            data.data.forEach(m => {
                                const opt = document.createElement('option');
                                opt.value = m.id;
                                opt.textContent = m.id;
                                modelSelect.appendChild(opt);
                            });
                            showToast('获取模型成功！');
                            
                            // 联动选择框与手动输入框
                            manualModelInput.value = modelSelect.value;
                            modelSelect.addEventListener('change', () => {
                                manualModelInput.value = modelSelect.value;
                            });
                        } else {
                            showToast('未获取到模型列表，请检查API格式');
                        }
                    } catch (e) {
                        console.error(e);
                        showToast('网络错误或跨域(CORS)拦截，请手动输入模型名称');
                    }
                });

                // 保存
                document.getElementById('save-ai-settings').addEventListener('click', () => {
                    localStorage.setItem('ai_api_url', urlInput.value.trim());
                    localStorage.setItem('ai_api_key', keyInput.value.trim());
                    // 优先取手动输入框的值，它与下拉框联动
                    localStorage.setItem('ai_model', manualModelInput.value.trim());
                    showToast('AI设置已保存！');
                    closeModal();
                });
            }
        },
        '微调': { title: '【 造物主微调 】', html: '<div class="text-center">造物主权限不足</div>' },
        '存档': { title: '【 记录人生 】', html: '<div class="text-center">尚未连通时空长河(待开发)</div>' },
        '读档': { title: '【 回溯时光 】', html: '<div class="text-center">尚未连通时空长河(待开发)</div>' },
        '重生': { title: '【 轮回转世 】', html: '<div class="text-center">轮回盘正在修复中...</div>' },
        '日志': { title: '【 过往风霜 】', html: '<div class="text-center">过往如烟，暂无记录。</div>' },
        '下一年': {
            title: '【 岁末结算 】',
            html: `
                <div class="text-center">
                    <p style="font-size:18px;font-weight:bold;margin-bottom:10px;">景泰三年</p>
                    <p style="margin-bottom:15px;color:#8b7456;">时光流逝，是否将命运交由天道推演？</p>
                    <button class="action-btn" id="next-year-btn" style="width:100%;padding:10px;background:#c25b4e;">推演下一年 (召唤AI)</button>
                </div>
            `,
            onOpen: () => {
                document.getElementById('next-year-btn').addEventListener('click', () => {
                    // 读取玩家的设定并模拟发送给大模型
                    const charName = localStorage.getItem('char_name') || '张三';
                    const charPrompt = localStorage.getItem('char_prompt') || '无设定';
                    const aiUrl = localStorage.getItem('ai_api_url');
                    const aiKey = localStorage.getItem('ai_api_key');
                    const aiModel = localStorage.getItem('ai_model');

                    if (!aiUrl || !aiKey || !aiModel) {
                        showToast('天道未降临！请先前往【设置】配置AI大模型参数。');
                        closeModal();
                        return;
                    }

                    // 模拟发送过程
                    showToast(`正在将 [${charName}] 的命运设定发往天道推演...`);
                    console.log('--- 发送给AI的 Prompt ---');
                    console.log(`角色名: ${charName}`);
                    console.log(`背景设定: ${charPrompt}`);
                    console.log(`请求地址: ${aiUrl}, 模型: ${aiModel}`);
                    console.log('---------------------------');
                    
                    closeModal();
                });
            }
        }
    };

    // 4. 绑定所有按钮的点击事件
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const config = modalConfigs[btnName];
            if (config) {
                openModal(config.title, config.html, config.onOpen);
            } else {
                openModal('【 提示 】', `<div class="text-center">功能 [${btnName}] 正在开发中...</div>`);
            }
        });
    });

    // 左上角头像点击 -> 触发"我"的设定弹窗
    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            const config = modalConfigs['我'];
            openModal(config.title, config.html, config.onOpen);
        });
    }

    // 5. 提示框(Toast)逻辑
    function showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

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
            fontSize: '15px',
            zIndex: '9999',
            pointerEvents: 'none',
            letterSpacing: '1px',
            animation: 'fadeInOut 2.5s ease-in-out forwards'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) toast.remove();
        }, 2500);
    }

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