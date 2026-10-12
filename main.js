document.addEventListener('DOMContentLoaded', () => {
    
    // --- SillyTavern 风格 AI 预设数据 ---
    const ST_SYSTEM_PRESET = "你是一个文字沙盒游戏的服务端。你必须以简短的、带有古风韵味的文字描述游戏事件的发生。玩家不能直接与你对话，只能通过系统发送的动作指令与世界交互。输出控制在50-100字左右，强调结果和氛围。";
    const ST_WORLDBOOK = "世界背景：大明景泰三年，天下初定，但民间仍有妖患与饥荒。当前地点：南方偏僻小镇，四周环山。";
    const ST_USER_PERSONA = "姓名：张三。身份：平民。年龄：18岁。体质：虚弱。名望：籍籍无名。金钱：5000文。";

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

    function openModal(title, htmlContent, onOpenCallback = null) {
        modalTitle.textContent = title;
        modalContentBody.innerHTML = htmlContent;
        modalOverlay.classList.add('active');
        if (rightMenu && rightMenu.classList.contains('show')) {
            rightMenu.classList.remove('show');
            toggleMenuBtn.textContent = '展开';
        }
        if (onOpenCallback) onOpenCallback();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
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
            // 给可交互NPC添加 ai-interact-npc class 和 data 属性
            html: `
                <div class="list-layout">
                    <div class="list-item interactive-item ai-interact-npc" data-npc="老村长">
                        <span>老村长</span><span style="color:#8b7456;">好感: 30 (拜访)</span>
                    </div>
                    <div class="list-item interactive-item ai-interact-npc" data-npc="私塾先生">
                        <span>私塾先生</span><span style="color:#8b7456;">好感: 10 (拜访)</span>
                    </div>
                    <div class="list-item interactive-item ai-interact-npc" data-npc="神秘乞丐">
                        <span>神秘乞丐</span><span style="color:#c25b4e;">好感: -50 (施舍)</span>
                    </div>
                    <div style="margin-top:10px;text-align:center;font-size:12px;color:#8b7456;">*点击人物进行互动推演*</div>
                </div>
            `
        },
        '地图': {
            title: '【 城镇地图 】',
            // 给可交互地点添加 ai-interact-loc class 和 data 属性
            html: `
                <div class="grid-layout">
                    <div class="grid-cell interactive-cell ai-interact-loc" data-loc="自家">自家</div>
                    <div class="grid-cell interactive-cell ai-interact-loc" data-loc="市集">市集</div>
                    <div class="grid-cell interactive-cell ai-interact-loc" data-loc="私塾">私塾</div>
                    <div class="grid-cell interactive-cell ai-interact-loc" data-loc="医馆">医馆</div>
                    <div class="grid-cell interactive-cell ai-interact-loc" data-loc="破庙">破庙</div>
                    <div class="grid-cell interactive-cell ai-interact-loc" data-loc="后山">后山</div>
                </div>
                <div style="margin-top:15px;text-align:center;font-size:12px;color:#8b7456;">*点击地点进行探索推演*</div>
            `
        },
        '我': { 
            title: '【 个人志 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>姓名</span><span>平民_张三</span></div>
                    <div class="list-item"><span>骨龄</span><span>18 岁</span></div>
                    <div class="list-item"><span>体质</span><span>虚弱</span></div>
                </div>
            `
        },
        '设置': {
            title: '【 系统设置 & API 】',
            html: `
                <div class="list-layout">
                    <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:8px;">
                        <span style="font-weight:bold;font-size:13px;">接口地址 (兼容OpenAI)</span>
                        <input type="text" id="setting-api-url" class="form-input" placeholder="例如: https://api.openai.com/v1">
                    </div>
                    <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:8px;">
                        <span style="font-weight:bold;font-size:13px;">密钥 (API Key)</span>
                        <input type="password" id="setting-api-key" class="form-input" placeholder="输入 API 密钥">
                    </div>
                    <div class="list-item" style="justify-content:space-between; border:none; background:transparent; padding:0;">
                        <span style="font-weight:bold;font-size:13px;">选择模型</span>
                        <button class="action-btn" id="btn-fetch-models">获取模型</button>
                    </div>
                    <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:8px;">
                        <select id="setting-api-model" class="form-select">
                            <option value="">请先获取模型</option>
                        </select>
                    </div>
                    <button class="action-btn" id="btn-save-settings" style="margin-top:5px; padding:10px; width:100%; font-size:14px; background:#c25b4e;">保存设置</button>
                </div>
            `,
            onOpen: () => {
                // 打开设置弹窗时，读取缓存
                document.getElementById('setting-api-url').value = localStorage.getItem('ai_url') || '';
                document.getElementById('setting-api-key').value = localStorage.getItem('ai_key') || '';
                const savedModel = localStorage.getItem('ai_model');
                if (savedModel) {
                    document.getElementById('setting-api-model').innerHTML = `<option value="${savedModel}">${savedModel}</option>`;
                }
            }
        },
        '任务': { title: '【 当前目标 】', html: '<div class="text-center">暂无任务</div>' },
        '微调': { title: '【 造物主微调 】', html: '<div class="text-center">修改天道规则暂未开放</div>' },
        '存档': { title: '【 记录人生 】', html: '<div class="text-center">暂无存档位</div>' },
        '读档': { title: '【 回溯时光 】', html: '<div class="text-center">暂无存档可读</div>' },
        '重生': { title: '【 轮回转世 】', html: '<div class="text-center">时机未到，无法转世。</div>' },
        '日志': { title: '【 过往风霜 】', html: '<div class="text-center">往事随风...</div>' },
        '下一年': { title: '【 岁末结算 】', html: '<div class="text-center">岁月流逝...</div>' }
    };

    // 4. 绑定侧边栏/底部按钮的打开弹窗事件
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const config = modalConfigs[btnName];
            if (config) {
                openModal(config.title, config.html, config.onOpen);
            }
        });
    });

    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => openModal(modalConfigs['我'].title, modalConfigs['我'].html));
    }

    // 5. 弹窗内部的事件委托 (处理API设置保存、获取模型，以及点击地点/人物触发AI)
    modalContentBody.addEventListener('click', async (e) => {
        
        // ---- API 设置逻辑 ----
        if (e.target.id === 'btn-save-settings') {
            const url = document.getElementById('setting-api-url').value.trim();
            const key = document.getElementById('setting-api-key').value.trim();
            const model = document.getElementById('setting-api-model').value;
            localStorage.setItem('ai_url', url);
            localStorage.setItem('ai_key', key);
            localStorage.setItem('ai_model', model);
            showToast('设置已保存');
            closeModal();
        }

        if (e.target.id === 'btn-fetch-models') {
            const url = document.getElementById('setting-api-url').value.trim();
            const key = document.getElementById('setting-api-key').value.trim();
            if (!url || !key) return showToast('请填写地址和密钥');
            
            showToast('正在拉取模型...');
            try {
                // OpenAI 标准模型获取接口
                const res = await fetch(`${url}/models`, {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error.message || '获取失败');
                
                const select = document.getElementById('setting-api-model');
                select.innerHTML = '';
                if (data.data && Array.isArray(data.data)) {
                    data.data.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m.id;
                        opt.textContent = m.id;
                        select.appendChild(opt);
                    });
                    showToast('模型拉取成功！');
                } else {
                    throw new Error('未获取到模型列表');
                }
            } catch(err) {
                showToast(`获取失败: ${err.message}`);
            }
        }

        // ---- AI 交互动作触发逻辑 ----
        const locTarget = e.target.closest('.ai-interact-loc');
        if (locTarget) {
            const locName = locTarget.dataset.loc;
            closeModal();
            triggerAIAction(`玩家前往了地点：[${locName}]，试图探索或触发事件。`);
        }

        const npcTarget = e.target.closest('.ai-interact-npc');
        if (npcTarget) {
            const npcName = npcTarget.dataset.npc;
            closeModal();
            triggerAIAction(`玩家靠近了人物：[${npcName}]，试图与其交流或互动。`);
        }
    });

    // 6. 核心：组装 SillyTavern 格式的 Prompt 并请求 AI
    async function triggerAIAction(actionText) {
        const url = localStorage.getItem('ai_url');
        const key = localStorage.getItem('ai_key');
        const model = localStorage.getItem('ai_model');

        if (!url || !key || !model) {
            showToast('天道未明，请先在【设置】中配置并保存 API。');
            return;
        }

        showToast('天道推演中...');
        
        // 构造类似 SillyTavern 的 System Prompt
        const systemMessage = `${ST_SYSTEM_PRESET}\n\n【世界设定】\n${ST_WORLDBOOK}\n\n【玩家设定】\n${ST_USER_PERSONA}`;
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: `【动作指令】\n${actionText}` }
        ];

        try {
            const res = await fetch(`${url}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: 150, // 控制输出不要太长
                    temperature: 0.7
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            
            const aiReply = data.choices[0].message.content;
            
            // 将结果渲染到右侧推演面板中
            appendLogToCurrentYear(actionText, aiReply);

        } catch (err) {
            showToast(`推演失败: ${err.message}`);
        }
    }

    // 将 AI 返回的结果写入右侧背景面板
    function appendLogToCurrentYear(action, reply) {
        const container = document.getElementById('current-year-content');
        if (!container) return;

        // 移除等待提示文字
        const fadeText = document.getElementById('waiting-action-text');
        if (fadeText) fadeText.remove();

        const p = document.createElement('p');
        // 提炼动作文本给用户看
        let cleanAction = action.replace(/玩家前往了地点：\[(.*?)\]，.*/, '前往 $1');
        cleanAction = cleanAction.replace(/玩家靠近了人物：\[(.*?)\]，.*/, '拜访 $1');

        p.innerHTML = `<span style="color:#c25b4e;font-weight:bold;">[${cleanAction}]</span> ${reply}`;
        
        // 加一点简单的渐显动画
        p.style.opacity = 0;
        p.style.transform = 'translateY(10px)';
        p.style.transition = 'all 0.5s ease';
        container.appendChild(p);
        
        // 触发重绘以运行动画
        requestAnimationFrame(() => {
            p.style.opacity = 1;
            p.style.transform = 'translateY(0)';
        });

        // 自动滚动到底部
        const panel = container.closest('.history-panel');
        if (panel) {
            setTimeout(() => { panel.scrollTop = panel.scrollHeight; }, 100);
        }
    }

    // 7. 通用 Toast 提示框
    function showToast(message) {
        let existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'absolute', top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white',
            padding: '12px 24px', borderRadius: '8px',
            fontSize: '16px', zIndex: '9999', pointerEvents: 'none',
            letterSpacing: '1px', animation: 'fadeInOut 2s ease-in-out forwards'
        });

        document.body.appendChild(toast);
        setTimeout(() => { if (document.body.contains(toast)) toast.remove(); }, 2000);
    }
});