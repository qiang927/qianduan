document.addEventListener('DOMContentLoaded', () => {
    
    // 全局 AI 配置数据持久化
    const gameData = {
        apiUrl: localStorage.getItem('ai_apiUrl') || '',
        apiKey: localStorage.getItem('ai_apiKey') || '',
        selectedModel: localStorage.getItem('ai_selectedModel') || '',
        userPrompt: localStorage.getItem('ai_userPrompt') || '我是一个出生在偏远山村的平凡少年，父母务农，家境贫寒。但我性格坚韧，渴望通过读书考取功名，或是寻仙访道，走出大山改变命运。'
    };

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

    function openModal(title, htmlContent) {
        modalTitle.textContent = title;
        modalContentBody.innerHTML = htmlContent;
        modalOverlay.classList.add('active');
        if (rightMenu && rightMenu.classList.contains('show')) {
            rightMenu.classList.remove('show');
            toggleMenuBtn.textContent = '展开';
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
                        <span style="font-weight:bold;">村长的口信</span>
                        <span style="color:#c25b4e;font-size:12px;">未读</span>
                    </div>
                </div>
            `
        },
        '人际': {
            title: '【 人脉交游 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>老爹</span><span>血亲</span></div>
                    <div class="list-item"><span>老娘</span><span>血亲</span></div>
                </div>
            `
        },
        '地图': {
            title: '【 城镇地图 】',
            html: `
                <div class="grid-layout">
                    <div class="grid-cell" style="background:#eaddc7;color:#5c4a3d;">茅草屋</div>
                    <div class="grid-cell">村口</div>
                    <div class="grid-cell">后山</div>
                </div>
            `
        },
        // ========== 核心修改点：我 (User 命格设定) ==========
        '我': { 
            title: '【 命格刻印 】',
            getHtml: () => `
                <div class="text-center" style="text-align:left;">
                    <p style="color:#c25b4e; font-size:12px; margin-bottom:10px; font-weight:bold;">
                        * 此设定将作为 Prompt 的核心，决定 AI 推演你一生走向的基调。
                    </p>
                    <div class="input-group">
                        <label>初始命格 / 角色背景与执念</label>
                        <textarea id="ai-user-prompt" class="form-textarea" rows="8" placeholder="请描绘你的出身、性格与目标...">${gameData.userPrompt}</textarea>
                    </div>
                    <div style="text-align:right; font-size:12px; color:#8b7456;" id="save-status">字数: ${gameData.userPrompt.length}</div>
                </div>
            `
        },
        '任务': {
            title: '【 当前目标 】',
            html: `
                <div class="list-layout">
                    <div class="list-item" style="border-left: 3px solid #c25b4e;">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">[主线] 活下去</span>
                            <span style="font-size:12px;color:#666;margin-top:4px;">平安度过今年。</span>
                        </div>
                    </div>
                </div>
            `
        },
        // ========== 核心修改点：设置 (API 参数配置) ==========
        '设置': {
            title: '【 天道枢纽 (AI设置) 】',
            getHtml: () => `
                <div class="list-layout">
                    <div class="input-group">
                        <label>API 地址 (Base URL)</label>
                        <input type="text" id="ai-api-url" class="form-input" placeholder="例如: https://api.openai.com/v1" value="${gameData.apiUrl}">
                    </div>
                    <div class="input-group">
                        <label>API 密钥 (API Key)</label>
                        <input type="password" id="ai-api-key" class="form-input" placeholder="sk-..." value="${gameData.apiKey}">
                    </div>
                    <div class="input-group" style="display:flex; flex-direction:row; gap:10px; align-items:flex-end;">
                        <div style="flex:1;">
                            <label>模型选择 (Model)</label>
                            <select id="ai-model-select" class="form-select">
                                ${gameData.selectedModel ? `<option value="${gameData.selectedModel}">${gameData.selectedModel}</option>` : `<option value="">请先获取模型</option>`}
                            </select>
                        </div>
                        <button class="action-btn" id="ai-fetch-models" style="height:35px; white-space:nowrap;">获取模型</button>
                    </div>
                    
                    <div style="border-top:1px dashed #d3c1a8; margin:10px 0;"></div>
                    
                    <div class="list-item">
                        <span>游戏音效</span>
                        <button class="action-btn">开启</button>
                    </div>
                </div>
            `
        },
        '微调': {
            title: '【 造物主微调 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>健康上限</span><button class="action-btn">+10</button></div>
                    <div class="list-item"><span>盘缠金钱</span><button class="action-btn">+100</button></div>
                </div>
            `
        },
        '存档': {
            title: '【 记录人生 】',
            html: `<div class="text-center">暂未实装云端存档</div>`
        },
        '读档': {
            title: '【 回溯时光 】',
            html: `<div class="text-center">暂未实装</div>`
        },
        '重生': {
            title: '【 轮回转世 】',
            html: `
                <div class="text-center">
                    <p style="color:#c25b4e;margin:10px 0;">是否要放弃当前的人生，重新投胎？</p>
                    <button class="action-btn" style="background:#c25b4e;margin-top:10px;padding:8px 20px;">确认转世</button>
                </div>
            `
        },
        '日志': {
            title: '【 过往风霜 】',
            html: `
                <div class="list-layout">
                    <div style="font-size:13px;line-height:1.6;color:#4a3c31;">
                        <p>[系统] 命运的齿轮开始转动。</p>
                    </div>
                </div>
            `
        },
        // ========== 核心修改点：下一年 (发送给 AI) ==========
        '下一年': {
            title: '【 岁末推演 】',
            getHtml: () => `
                <div class="text-center">
                    <p style="font-size:18px;font-weight:bold;margin-bottom:10px;">景泰三年</p>
                    <p style="margin-bottom:15px;color:#8b7456;font-size:13px;line-height:1.5;text-align:justify;">
                        你的命格与行事轨迹，即将上呈天道（AI模型）。天道将推演出你下一年的祸福吉凶。
                    </p>
                    
                    <div class="input-group" style="margin-bottom:15px;">
                        <label>【 今岁行事侧重 (可选) 】</label>
                        <input type="text" id="ai-yearly-action" class="form-input" placeholder="例如：今年我打算离开村子，去城里找活干。">
                    </div>
                    
                    <div style="background:rgba(0,0,0,0.03); border:1px dashed #c25b4e; padding:10px; border-radius:4px; margin-bottom:15px; text-align:left; font-size:12px; color:#5c4a3d;">
                        <div style="font-weight:bold; margin-bottom:5px;">[天道连接状态]</div>
                        API 配置: ${gameData.apiUrl && gameData.apiKey ? '<span style="color:#2d7d46;">已就绪</span>' : '<span style="color:#c25b4e;">未配置 (请前往[设置])</span>'}<br>
                        选用模型: ${gameData.selectedModel ? `<span style="color:#2d7d46;">${gameData.selectedModel}</span>` : '<span style="color:#c25b4e;">未选择</span>'}<br>
                        命格字数: ${gameData.userPrompt.length} 字
                    </div>

                    <button class="action-btn" id="start-ai-btn" style="width:100%;padding:10px;background:#c25b4e;font-size:15px;letter-spacing:2px;">呈递天道开始推演</button>
                </div>
            `
        }
    };

    // 4. 绑定所有按钮的打开弹窗事件
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const config = modalConfigs[btnName];
            if (config) {
                const htmlContent = typeof config.getHtml === 'function' ? config.getHtml() : config.html;
                openModal(config.title, htmlContent);
            } else {
                openModal('【 提示 】', `<div class="text-center">功能 [${btnName}] 正在开发中...</div>`);
            }
        });
    });

    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            const config = modalConfigs['我'];
            const htmlContent = typeof config.getHtml === 'function' ? config.getHtml() : config.html;
            openModal(config.title, htmlContent);
        });
    }

    // =====================================================================
    // 5. 动态表单交互与事件委托 (AI 核心逻辑模拟与保存)
    // =====================================================================
    
    // 输入保存逻辑
    document.addEventListener('input', (e) => {
        if (e.target.id === 'ai-api-url') {
            gameData.apiUrl = e.target.value.trim();
            localStorage.setItem('ai_apiUrl', gameData.apiUrl);
        }
        if (e.target.id === 'ai-api-key') {
            gameData.apiKey = e.target.value.trim();
            localStorage.setItem('ai_apiKey', gameData.apiKey);
        }
        if (e.target.id === 'ai-user-prompt') {
            gameData.userPrompt = e.target.value;
            localStorage.setItem('ai_userPrompt', gameData.userPrompt);
            const status = document.getElementById('save-status');
            if (status) {
                status.textContent = `字数: ${gameData.userPrompt.length} (已自动铭记)`;
            }
        }
    });

    // 下拉框改变保存逻辑
    document.addEventListener('change', (e) => {
        if (e.target.id === 'ai-model-select') {
            gameData.selectedModel = e.target.value;
            localStorage.setItem('ai_selectedModel', gameData.selectedModel);
        }
    });

    // 按钮点击响应逻辑 (获取模型、发送AI)
    document.addEventListener('click', (e) => {
        // [获取模型] 按钮
        if (e.target.id === 'ai-fetch-models') {
            if (!gameData.apiUrl || !gameData.apiKey) {
                showToast('请先输入完整的 API 地址与密钥！');
                return;
            }
            showToast('正在沟通天道(请求接口)，请稍候...');
            const btn = e.target;
            btn.textContent = '获取中...';
            btn.disabled = true;

            // 这里模拟一个网络请求过程
            setTimeout(() => {
                const select = document.getElementById('ai-model-select');
                if(select) {
                    // 模拟返回的模型列表
                    select.innerHTML = `
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="claude-3-haiku">claude-3-haiku</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    `;
                    gameData.selectedModel = select.value;
                    localStorage.setItem('ai_selectedModel', gameData.selectedModel);
                    showToast('天道模型列表已更新！');
                }
                btn.textContent = '获取模型';
                btn.disabled = false;
            }, 1000);
        }
        
        // [呈递天道开始推演] 按钮
        if (e.target.id === 'start-ai-btn') {
            if (!gameData.apiUrl || !gameData.apiKey || !gameData.selectedModel) {
                showToast('无法连接天道！请先在【设置】中配置完整的接口与模型。');
                return;
            }
            if (!gameData.userPrompt) {
                showToast('命格为空！请先在左上角【头像】处撰写命格。');
                return;
            }
            
            const actionInput = document.getElementById('ai-yearly-action');
            const actionText = actionInput ? actionInput.value : '';

            showToast('正在发送命格与行事至 AI 模型推演...');
            
            const btn = e.target;
            btn.textContent = '推演中，命运织线交错...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none'; // 防连点
            
            // 模拟发送给 AI 并等待返回的过程
            console.log('--- 发送给 AI 的数据 ---');
            console.log('API:', gameData.apiUrl, 'Model:', gameData.selectedModel);
            console.log('System Prompt (命格):', gameData.userPrompt);
            console.log('User Input (本年行事):', actionText);
            console.log('------------------------');

            setTimeout(() => {
                closeModal();
                showToast('天道推演完成！(目前为模拟，后续接入真实请求)');
            }, 2500);
        }
    });

    // 6. 提示框(Toast)逻辑
    function showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '9999',
            pointerEvents: 'none',
            letterSpacing: '1px',
            animation: 'fadeInOut 2.5s ease-in-out forwards',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.remove();
            }
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