document.addEventListener('DOMContentLoaded', () => {
    
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

    // 点击空白处收起收纳菜单
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

    // 5. 特殊弹窗内的按钮事件绑定逻辑
    function bindModalEvents(title) {
        if (title === '【 系统设置 】') {
            const btnFetch = document.getElementById('btn-fetch-models');
            const btnSave = document.getElementById('btn-save-api');
            const inputUrl = document.getElementById('api-url');
            const inputKey = document.getElementById('api-key');
            const selectModel = document.getElementById('api-model');

            if (btnFetch) {
                btnFetch.addEventListener('click', async () => {
                    const url = inputUrl.value.trim();
                    const key = inputKey.value.trim();
                    if (!url || !key) {
                        showToast('请先填写API地址和密钥');
                        return;
                    }
                    try {
                        btnFetch.textContent = '获取中...';
                        const models = await AIEngine.fetchModels(url, key);
                        selectModel.innerHTML = '';
                        models.forEach(m => {
                            const option = document.createElement('option');
                            option.value = m;
                            option.textContent = m;
                            selectModel.appendChild(option);
                        });
                        showToast('模型列表获取成功');
                    } catch (e) {
                        showToast(e.message);
                    } finally {
                        btnFetch.textContent = '获取';
                    }
                });
            }

            if (btnSave) {
                btnSave.addEventListener('click', () => {
                    const url = inputUrl.value.trim();
                    const key = inputKey.value.trim();
                    const model = selectModel.value;
                    if (!url || !key || !model) {
                        showToast('请完整填写地址、密钥并选择模型');
                        return;
                    }
                    AIEngine.saveConfig(url, key, model);
                    showToast('天道节点配置已保存');
                });
            }
        }
    }

    function openModal(title, htmlContent) {
        modalTitle.textContent = title;
        modalContentBody.innerHTML = htmlContent;
        modalOverlay.classList.add('active');
        
        if (rightMenu && rightMenu.classList.contains('show')) {
            rightMenu.classList.remove('show');
            toggleMenuBtn.textContent = '展开';
        }

        // 每次打开弹窗后，绑定内部可能存在的事件
        bindModalEvents(title);
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    // 点击关闭按钮关闭弹窗
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    // 点击遮罩层也能关闭弹窗
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // 3. 各个按钮的弹窗内容配置 (不同布局结构)
    const modalConfigs = {
        '背包': {
            title: '【 我的行囊 】',
            html: `
                <div class="grid-layout">
                    <!-- 模拟16个背包格子 -->
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
                    <div class="list-item">
                        <span>王二狗的借条</span>
                        <span style="color:#999;font-size:12px;">已读</span>
                    </div>
                </div>
            `
        },
        '人际': {
            title: '【 人脉交游 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>老村长</span><span>好感: 30</span></div>
                    <div class="list-item"><span>私塾先生</span><span>好感: 10</span></div>
                    <div class="list-item"><span>神秘乞丐</span><span style="color:#c25b4e;">好感: -50 (交恶)</span></div>
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
                    <div class="grid-cell">医馆</div>
                    <div class="grid-cell">破庙</div>
                    <div class="grid-cell">后山</div>
                </div>
            `
        },
        '我': { // 或点击左上角头像
            title: '【 个人志 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>姓名</span><span>平民_张三</span></div>
                    <div class="list-item"><span>骨龄</span><span>18 岁</span></div>
                    <div class="list-item"><span>体质</span><span>虚弱</span></div>
                    <div class="list-item"><span>学识</span><span>初识笔墨</span></div>
                    <div class="list-item"><span>名望</span><span>籍籍无名</span></div>
                </div>
            `
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
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">[传闻] 后山的异响</span>
                            <span style="font-size:12px;color:#666;margin-top:4px;">听说夜里会有野兽出没。</span>
                        </div>
                    </div>
                </div>
            `
        },
        '设置': {
            title: '【 系统设置 】',
            html: `
                <div class="list-layout">
                    <!-- AI 后端配置区 -->
                    <div style="text-align:center; color:#c25b4e; font-weight:bold; font-size:14px; margin-bottom:5px;">AI 引擎天道节点配置</div>
                    
                    <div class="list-item" style="flex-direction:column; align-items:flex-start;">
                        <span style="font-size:12px; font-weight:bold; color:#8b7456;">API 地址 (Base URL)</span>
                        <input type="text" id="api-url" class="setting-input" placeholder="例如: https://api.openai.com/v1" value="\${AIEngine.config.url}">
                    </div>
                    
                    <div class="list-item" style="flex-direction:column; align-items:flex-start;">
                        <span style="font-size:12px; font-weight:bold; color:#8b7456;">API 密钥 (API Key)</span>
                        <input type="password" id="api-key" class="setting-input" placeholder="sk-..." value="\${AIEngine.config.key}">
                    </div>
                    
                    <div class="list-item" style="justify-content:space-between; align-items:center;">
                        <select id="api-model" class="model-select">
                            \${AIEngine.config.model ? \`<option value="\${AIEngine.config.model}">\${AIEngine.config.model}</option>\` : '<option value="">请先获取模型</option>'}
                        </select>
                        <button id="btn-fetch-models" class="action-btn" style="background:#8b7456;">获取</button>
                    </div>

                    <button id="btn-save-api" class="action-btn" style="width:100%; margin-top:5px; background:#c25b4e; padding:8px;">保存天道配置</button>

                    <div style="border-top:1px dashed #d3c1a8; margin: 15px 0 5px 0;"></div>

                    <div class="list-item">
                        <span>背景音乐</span>
                        <button class="action-btn">开启</button>
                    </div>
                </div>
            `
        },
        '微调': {
            title: '【 造物主微调 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <span>健康上限</span>
                        <button class="action-btn">+10</button>
                    </div>
                    <div class="list-item">
                        <span>盘缠金钱</span>
                        <button class="action-btn">+1000</button>
                    </div>
                </div>
                <div style="margin-top:10px;text-align:center;font-size:12px;color:#c25b4e;">过度微调可能影响天道平衡</div>
            `
        },
        '存档': {
            title: '【 记录人生 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                            <span style="font-size:12px;color:#666;">景泰三年 春 / 张三</span>
                        </div>
                        <button class="action-btn">覆盖</button>
                    </div>
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 贰</span>
                            <span style="font-size:12px;color:#999;">暂无记录</span>
                        </div>
                        <button class="action-btn">记录</button>
                    </div>
                </div>
            `
        },
        '读档': {
            title: '【 回溯时光 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                            <span style="font-size:12px;color:#666;">景泰三年 春 / 张三</span>
                        </div>
                        <button class="action-btn">读取</button>
                    </div>
                </div>
            `
        },
        '重生': {
            title: '【 轮回转世 】',
            html: `
                <div class="text-center">
                    <p>天道无常，生死轮回。</p>
                    <p style="color:#c25b4e;margin:10px 0;">是否要放弃当前的人生，<br>重新投胎？</p>
                    <button class="action-btn" style="background:#c25b4e;margin-top:10px;padding:8px 20px;">确认转世</button>
                </div>
            `
        },
        '日志': {
            title: '【 过往风霜 】',
            html: `
                <div class="list-layout">
                    <div style="font-size:13px;line-height:1.6;color:#4a3c31;">
                        <p>[系统] 游戏初始化完成。</p>
                        <p>[系统] 你出生在一个贫寒的农家。</p>
                        <p>[系统] 景泰二年 春：你大病初愈。</p>
                        <p>[系统] 景泰二年 夏：邻里逢旱，随父母逃荒。</p>
                    </div>
                </div>
            `
        },
        '下一年': {
            title: '【 岁末结算 】',
            html: `
                <div class="text-center">
                    <p style="font-size:18px;font-weight:bold;margin-bottom:10px;">景泰三年</p>
                    <p style="margin-bottom:15px;color:#8b7456;">时光流逝，万象更新...</p>
                    <div class="list-layout" style="text-align:left;">
                        <div class="list-item"><span>健康流失</span><span style="color:#c25b4e;">-5</span></div>
                        <div class="list-item"><span>生活开销</span><span style="color:#c25b4e;">-200 钱</span></div>
                        <div class="list-item"><span>心境变化</span><span style="color:#2d7d46;">+10</span></div>
                    </div>
                    <button class="action-btn" style="margin-top:15px;width:100%;padding:10px;">进入下一年</button>
                </div>
            `
        }
    };

    // 4. 绑定所有按钮的点击事件
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn, .grid-cell, .list-item');
    allButtons.forEach(btn => {
        // 如果是弹窗内部的元素(在动态绑定前已经存在的)，或者是特定的格子，我们在这里拦截
        if (btn.classList.contains('grid-cell') || btn.classList.contains('list-item')) {
            return; 
        }

        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const config = modalConfigs[btnName];
            if (config) {
                openModal(config.title, config.html);
            } else {
                openModal('【 提示 】', `<div class="text-center">功能 [${btnName}] 正在开发中...</div>`);
            }
        });
    });

    // 绑定主界面上可能触发AI交互的元素 (例如地图和人际的交互测试)
    // 监听全局点击事件，捕获动态生成的弹窗内的交互行为
    document.addEventListener('click', async (e) => {
        // 匹配地图点击
        if (e.target.classList.contains('grid-cell') && e.target.textContent !== '空') {
            const place = e.target.textContent.trim();
            await handleAIInteraction(`前往 [${place}]`);
        }
        
        // 匹配人际点击 (由于结构嵌套，需要向上找 list-item)
        const listItem = e.target.closest('.list-item');
        if (listItem && modalTitle.textContent === '【 人脉交游 】') {
            const personName = listItem.querySelector('span:first-child').textContent;
            await handleAIInteraction(`与 [${personName}] 交流`);
        }
    });

    // 封装 AI 交互处理
    async function handleAIInteraction(actionText) {
        if (!AIEngine.config.url || !AIEngine.config.key || !AIEngine.config.model) {
            showToast('请先在【设置】中配置并保存天道节点(API)');
            return;
        }

        // 先关闭当前弹窗
        closeModal();
        showToast(`正在推演: ${actionText}...`);

        try {
            // 调用隐藏在底层的 AI 引擎
            const result = await AIEngine.generate(actionText);
            
            // 将结果展示在主界面的右侧“今岁推演”面板中
            const rightPanelContent = document.querySelector('.right-panel .panel-content');
            if (rightPanelContent) {
                // 移除之前“诸事尚未落定”的提示词
                const fadeText = rightPanelContent.querySelector('.fade-text');
                if (fadeText) fadeText.remove();

                const newEvent = document.createElement('p');
                newEvent.innerHTML = `<strong style="color:#c25b4e;">[交互] ${actionText}</strong><br>${result}`;
                
                // 将新事件追加到面板
                rightPanelContent.appendChild(newEvent);

                // 重新加上提示词
                const newFade = document.createElement('p');
                newFade.className = 'fade-text';
                newFade.textContent = '岁月流转，前方迷雾重重，诸事尚未落定...';
                rightPanelContent.appendChild(newFade);

                // 滚动到底部
                const panel = document.querySelector('.right-panel');
                panel.scrollTop = panel.scrollHeight;
            }
        } catch (err) {
            showToast(err.message);
        }
    }

    // 左上角头像点击 -> 触发"我"的弹窗
    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            const config = modalConfigs['我'];
            openModal(config.title, config.html);
        });
    }

});