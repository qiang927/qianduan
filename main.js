// 全局游戏与AI配置数据
window.GameData = {
    api: {
        url: 'https://api.openai.com/v1',
        key: '',
        model: '',
        availableModels: []
    },
    user: {
        prompt: '你出生在一个贫寒的农家，虽身体虚弱，但你渴望通过努力改变命运。请推演我下一年的遭遇。'
    },
    world: {
        preset: {
            system: '你是一个古代人生模拟器的文字引擎。你需要根据用户的背景设定，以第二人称（你）的视角，输出他新的一年中发生的重要遭遇。',
            postHistory: '文本要求：古风修辞，字数适中（不要超过200字），并且分段叙述。不要带有格式化Markdown符号。'
        },
        worldbook: [
            { keys: '大旱,饥荒', content: '当今天下大旱，庄稼绝收，饿殍遍野，难民纷纷涌向京城。', alwaysOn: false }
        ]
    }
};

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

    function openModal(title, htmlContentFn, afterRenderFn) {
        modalTitle.textContent = title;
        modalContentBody.innerHTML = typeof htmlContentFn === 'function' ? htmlContentFn() : htmlContentFn;
        modalOverlay.classList.add('active');
        
        if (rightMenu && rightMenu.classList.contains('show')) {
            rightMenu.classList.remove('show');
            toggleMenuBtn.textContent = '展开';
        }

        if (typeof afterRenderFn === 'function') {
            afterRenderFn();
        }
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
        '设置': {
            title: '【 系统设置 】',
            html: () => `
                <div class="accordion-container">
                    
                    <!-- 游戏基础设置 -->
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>🎵 基础设置</span>
                            <span class="accordion-icon">▼</span>
                        </div>
                        <div class="accordion-body">
                            <div class="list-layout">
                                <div class="list-item">
                                    <span>背景音乐</span>
                                    <button class="action-btn">开启</button>
                                </div>
                                <div class="list-item">
                                    <span>音效</span>
                                    <button class="action-btn">开启</button>
                                </div>
                                <div class="list-item">
                                    <span>文字速度</span>
                                    <span style="color:#8b7456;">适中</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI API 设置 -->
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>⚙️ AI 核心接口配置</span>
                            <span class="accordion-icon">▼</span>
                        </div>
                        <div class="accordion-body">
                            <div class="form-group">
                                <label>API 地址 (Base URL)</label>
                                <input type="text" id="setting-api-url" class="classical-input" value="${window.GameData.api.url}" placeholder="例如: https://api.openai.com/v1">
                            </div>
                            <div class="form-group">
                                <label>API 密钥 (API Key)</label>
                                <input type="password" id="setting-api-key" class="classical-input" value="${window.GameData.api.key}" placeholder="输入密钥 sk-...">
                            </div>
                            <div class="form-group" style="flex-direction: row; justify-content: space-between; align-items: center;">
                                <label style="margin-bottom:0;">AI 模型</label>
                                <button class="action-btn" id="btn-fetch-models">请求获取模型</button>
                            </div>
                            <div class="form-group">
                                <select id="setting-api-model" class="classical-select">
                                    ${window.GameData.api.model ? `<option value="${window.GameData.api.model}">${window.GameData.api.model}</option>` : '<option value="">(请先获取模型)</option>'}
                                    ${window.GameData.api.availableModels.map(m => m !== window.GameData.api.model ? `<option value="${m}">${m}</option>` : '').join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <button class="action-btn" id="btn-save-settings" style="width:100%; margin-top:15px; padding:10px;">💾 封存所有设置</button>
            `,
            afterRender: () => {
                // 手风琴折叠逻辑
                const headers = document.querySelectorAll('.accordion-header');
                headers.forEach(header => {
                    header.addEventListener('click', () => {
                        const item = header.parentElement;
                        item.classList.toggle('open');
                    });
                });

                // 真实的 Fetch 获取模型逻辑
                document.getElementById('btn-fetch-models').onclick = async () => {
                    const tempUrl = document.getElementById('setting-api-url').value.trim();
                    const tempKey = document.getElementById('setting-api-key').value.trim();
                    
                    if (!tempUrl || !tempKey) {
                        showToast('请先输入完整的 API 地址与密钥！');
                        return;
                    }

                    showToast('正在链接天地法则(获取模型)...');
                    try {
                        const res = await fetch(`${tempUrl}/models`, {
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${tempKey}` }
                        });
                        
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }

                        const data = await res.json();
                        if (data && data.data && Array.isArray(data.data)) {
                            // 提取模型 ID 列表
                            window.GameData.api.availableModels = data.data.map(m => m.id);
                            if(!window.GameData.api.model || !window.GameData.api.availableModels.includes(window.GameData.api.model)) {
                                window.GameData.api.model = window.GameData.api.availableModels[0]; // 默认选中第一个
                            }
                            
                            // 更新下拉框
                            const select = document.getElementById('setting-api-model');
                            select.innerHTML = window.GameData.api.availableModels.map(m => 
                                `<option value="${m}" ${m === window.GameData.api.model ? 'selected' : ''}>${m}</option>`
                            ).join('');
                            
                            showToast('获取模型成功，天道已就绪！');
                        } else {
                            showToast('获取模型失败: 返回数据格式不正确');
                            console.error('Data format error:', data);
                        }
                    } catch (error) {
                        showToast('网络请求失败，请检查 URL 或跨域配置');
                        console.error('Fetch Models Error:', error);
                    }
                };

                // 保存设置
                document.getElementById('btn-save-settings').onclick = () => {
                    window.GameData.api.url = document.getElementById('setting-api-url').value.trim();
                    window.GameData.api.key = document.getElementById('setting-api-key').value.trim();
                    window.GameData.api.model = document.getElementById('setting-api-model').value.trim();
                    showToast('设置已保存，天道流转已重置。');
                    closeModal();
                };
            }
        },
        '头像': { 
            title: '【 个人志 / Prompt设定 】',
            html: () => `
                <div class="list-layout">
                    <div class="form-group">
                        <label>角色背景与推演祈愿 (User Prompt)</label>
                        <textarea id="user-prompt" class="classical-textarea" rows="8" placeholder="在此书写你的人生起点或当前愿望...">${window.GameData.user.prompt}</textarea>
                    </div>
                    <button class="action-btn" id="btn-save-user" style="width:100%; padding:10px;">✍️ 确认命格</button>
                </div>
            `,
            afterRender: () => {
                document.getElementById('btn-save-user').onclick = () => {
                    window.GameData.user.prompt = document.getElementById('user-prompt').value;
                    showToast('命格已定，天机已录。');
                    closeModal();
                };
            }
        },
        '我': {
            title: '【 个人属性 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item"><span>姓名</span><span>平民_张三</span></div>
                    <div class="list-item"><span>骨龄</span><span>18 岁</span></div>
                    <div class="list-item"><span>体质</span><span>虚弱</span></div>
                    <div class="list-item"><span>学识</span><span>初识笔墨</span></div>
                    <div class="list-item"><span>名望</span><span>籍籍无名</span></div>
                </div>
            `
        },
        '微调': {
            title: '【 世界书与预设 (Lore & Presets) 】',
            html: () => {
                const p = window.GameData.world.preset;
                const wb = window.GameData.world.worldbook;

                let wbHtml = wb.map((entry) => `
                    <div class="wb-entry">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <input type="text" class="classical-input wb-keys" value="${entry.keys}" placeholder="触发词 (用逗号分隔)" style="flex:1; margin-right:10px;">
                            <button class="action-btn wb-del" style="background:#c25b4e; padding:4px 8px;">删</button>
                        </div>
                        <textarea class="classical-textarea wb-content" rows="3" placeholder="世界观、传闻或设定内容...">${entry.content}</textarea>
                        <label style="font-size:12px; display:flex; align-items:center; gap:5px; margin-top:5px;">
                            <input type="checkbox" class="wb-always" ${entry.alwaysOn ? 'checked' : ''}> 始终激活 (Constant/Always On)
                        </label>
                    </div>
                `).join('');

                return `
                    <div class="tabs-container" style="display:flex; flex-direction:column;">
                        
                        <!-- 预设页面 (Presets) -->
                        <div id="view-preset" class="tab-content active" style="max-height:50vh; overflow-y:auto; padding-right:5px;">
                            <div class="form-group">
                                <label>System Prompt (核心扮演预设)</label>
                                <textarea id="preset-system" class="classical-textarea" rows="6" placeholder="定义AI的行为与基础规则...">${p.system}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Post-History Instructions (后缀/防越狱指令)</label>
                                <textarea id="preset-post" class="classical-textarea" rows="4" placeholder="放在Prompt最后，用于强化格式或限制...">${p.postHistory}</textarea>
                            </div>
                            <button class="action-btn" id="btn-save-preset" style="width:100%; padding:10px; margin-top:10px;">💾 封存预设设定</button>
                        </div>

                        <!-- 世界书页面 (Worldbook) -->
                        <div id="view-worldbook" class="tab-content" style="display:none; max-height:50vh; overflow-y:auto; padding-right:5px;">
                            <div id="wb-list">${wbHtml}</div>
                            <button class="action-btn" id="btn-add-wb" style="width:100%; margin-top:10px;">+ 新增世界书条目</button>
                            <button class="action-btn" id="btn-save-wb" style="width:100%; margin-top:10px; background:#c25b4e;">💾 封存世界书内容</button>
                        </div>

                        <!-- 底部并列的切换按钮 -->
                        <div class="modal-tabs-nav">
                            <button class="tab-btn active" data-target="view-preset">预设配置</button>
                            <button class="tab-btn" data-target="view-worldbook">世界书 (Lore)</button>
                        </div>

                    </div>
                `;
            },
            afterRender: () => {
                // 1. 切换页签逻辑
                const tabBtns = document.querySelectorAll('.tab-btn');
                const tabContents = document.querySelectorAll('.tab-content');

                tabBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        // 移除所有激活状态
                        tabBtns.forEach(b => b.classList.remove('active'));
                        tabContents.forEach(c => c.style.display = 'none');
                        // 激活当前
                        btn.classList.add('active');
                        document.getElementById(btn.dataset.target).style.display = 'block';
                    });
                });

                // 2. 预设封存逻辑
                document.getElementById('btn-save-preset').onclick = () => {
                    window.GameData.world.preset.system = document.getElementById('preset-system').value;
                    window.GameData.world.preset.postHistory = document.getElementById('preset-post').value;
                    showToast('核心预设已封存。');
                };

                // 3. 世界书新增/删除/封存逻辑
                const wbList = document.getElementById('wb-list');
                
                document.getElementById('btn-add-wb').onclick = () => {
                    const div = document.createElement('div');
                    div.className = 'wb-entry';
                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <input type="text" class="classical-input wb-keys" value="" placeholder="触发词 (用逗号分隔)" style="flex:1; margin-right:10px;">
                            <button class="action-btn wb-del" style="background:#c25b4e; padding:4px 8px;">删</button>
                        </div>
                        <textarea class="classical-textarea wb-content" rows="3" placeholder="世界观、传闻或设定内容..."></textarea>
                        <label style="font-size:12px; display:flex; align-items:center; gap:5px; margin-top:5px;">
                            <input type="checkbox" class="wb-always"> 始终激活 (Constant/Always On)
                        </label>
                    `;
                    wbList.appendChild(div);
                };

                wbList.addEventListener('click', (e) => {
                    if (e.target.classList.contains('wb-del')) {
                        e.target.closest('.wb-entry').remove();
                    }
                });

                document.getElementById('btn-save-wb').onclick = () => {
                    const entries = [];
                    wbList.querySelectorAll('.wb-entry').forEach(el => {
                        entries.push({
                            keys: el.querySelector('.wb-keys').value.trim(),
                            content: el.querySelector('.wb-content').value.trim(),
                            alwaysOn: el.querySelector('.wb-always').checked
                        });
                    });
                    window.GameData.world.worldbook = entries;
                    showToast('世界书条目已封存。');
                };
            }
        },
        '下一年': {
            title: '【 岁末交替 】',
            html: () => `
                <div class="text-center">
                    <p style="font-size:18px;font-weight:bold;margin-bottom:10px;">准备推演下一年</p>
                    <p style="margin-bottom:15px;color:#8b7456;font-size:13px;">将根据你当前设定的命格与状态交由 AI 进行推演...</p>
                    <div class="list-layout" style="text-align:left; font-size:12px; background:rgba(0,0,0,0.02); padding:10px; border-radius:4px; border:1px dashed #d3c1a8;">
                        <div><strong>模型:</strong> ${window.GameData.api.model || '未配置'}</div>
                        <div><strong>激活的世界书条目:</strong> 动态匹配</div>
                        <div style="margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><strong>推演祈愿:</strong> ${window.GameData.user.prompt}</div>
                    </div>
                    <button class="action-btn" id="btn-trigger-ai" style="margin-top:20px; width:100%; padding:12px; background:#c25b4e; font-size:15px;">🔮 拨动命运之轮</button>
                </div>
            `,
            afterRender: () => {
                document.getElementById('btn-trigger-ai').onclick = async () => {
                    if (!window.GameData.api.key || !window.GameData.api.url || !window.GameData.api.model) {
                        showToast('天道残缺！请先在【设置】中配置完整的 API 信息与模型。');
                        return;
                    }
                    
                    showToast('命运之轮转动... 正在进行推演');
                    closeModal();

                    // 在右侧面板加入 Loading 效果
                    const rightPanelContent = document.querySelector('.right-panel .panel-content');
                    if (rightPanelContent) {
                        rightPanelContent.innerHTML = `<p class="fade-text" style="text-align:center; margin-top:20px;">AI 正在拨动命盘，推演未来，请稍候...</p>`;
                    }

                    // 组合 SillyTavern 风格的 Prompt
                    let activeLore = [];
                    const textToScan = window.GameData.user.prompt; // 实际游玩中应包含最近的对话历史
                    
                    // 扫描世界书条目
                    window.GameData.world.worldbook.forEach(entry => {
                        if (entry.alwaysOn) {
                            activeLore.push(entry.content);
                        } else if (entry.keys) {
                            const keywords = entry.keys.split(',').map(k => k.trim()).filter(k => k);
                            const triggered = keywords.some(k => textToScan.includes(k));
                            if (triggered) {
                                activeLore.push(entry.content);
                            }
                        }
                    });

                    // 组合发送给 AI 的 System Prompt (按照: 角色设定 + 预设 + 世界书 的顺序)
                    let finalSystemContent = `【角色设定】\n${window.GameData.user.prompt}`;
                    
                    if (window.GameData.world.preset.system) {
                        finalSystemContent += `\n\n【核心预设】\n${window.GameData.world.preset.system}`;
                    }

                    if (activeLore.length > 0) {
                        finalSystemContent += `\n\n【世界背景/传闻 (Worldbook)】\n${activeLore.join('\n')}`;
                    }
                    
                    if (window.GameData.world.preset.postHistory) {
                        finalSystemContent += `\n\n【系统附加指令】\n${window.GameData.world.preset.postHistory}`;
                    }

                    // 真实的 Chat Completion 请求
                    try {
                        const response = await fetch(`${window.GameData.api.url}/chat/completions`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${window.GameData.api.key}`
                            },
                            body: JSON.stringify({
                                model: window.GameData.api.model,
                                messages: [
                                    {
                                        role: "system",
                                        content: finalSystemContent
                                    },
                                    {
                                        role: "user",
                                        content: "请推演我下一年的遭遇。"
                                    }
                                ]
                            })
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();
                        
                        if (data.choices && data.choices[0]) {
                            showToast('推演完成！');
                            let aiText = data.choices[0].message.content;
                            // 将换行符转为段落标签以适配 HTML 展示
                            const formattedHtml = aiText.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
                            
                            if (rightPanelContent) {
                                rightPanelContent.innerHTML = formattedHtml + `<p class="fade-text" style="margin-top:15px;">岁月流转，前方迷雾重重，诸事尚未落定...</p>`;
                            }
                        } else {
                            showToast('AI 推演异常: ' + (data.error?.message || '未知数据结构'));
                            if (rightPanelContent) rightPanelContent.innerHTML = `<p style="color:#c25b4e;">推演受阻，天道反噬...</p>`;
                        }
                    } catch (error) {
                        showToast('网络请求失败，请检查 API 配置或网络');
                        console.error('AI Request Error:', error);
                        if (rightPanelContent) rightPanelContent.innerHTML = `<p style="color:#c25b4e;">网络中断，推演终止。</p>`;
                    }
                };
            }
        },
        '背包': {
            title: '【 我的行囊 】',
            html: () => `
                <div class="grid-layout">
                    ${Array(16).fill('<div class="grid-cell">空</div>').join('')}
                </div>
                <div style="margin-top:15px;text-align:center;font-size:12px;color:#8b7456;">容量: 0/16</div>
            `
        },
        '信件': {
            title: '【 飞鸽传书 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item"><span style="font-weight:bold;">娘亲的家书</span><span style="color:#c25b4e;font-size:12px;">未读</span></div>
                    <div class="list-item"><span>王二狗的借条</span><span style="color:#999;font-size:12px;">已读</span></div>
                </div>
            `
        },
        '人际': {
            title: '【 人脉交游 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item"><span>老村长</span><span>好感: 30</span></div>
                    <div class="list-item"><span>私塾先生</span><span>好感: 10</span></div>
                    <div class="list-item"><span>神秘乞丐</span><span style="color:#c25b4e;">好感: -50 (交恶)</span></div>
                </div>
            `
        },
        '地图': {
            title: '【 城镇地图 】',
            html: () => `
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
        '任务': {
            title: '【 当前目标 】',
            html: () => `
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
        '存档': {
            title: '【 记录人生 】',
            html: () => `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                            <span style="font-size:12px;color:#666;">景泰三年 春 / 张三</span>
                        </div>
                        <button class="action-btn">覆盖</button>
                    </div>
                </div>
            `
        },
        '读档': {
            title: '【 回溯时光 】',
            html: () => `
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
            html: () => `
                <div class="text-center">
                    <p>天道无常，生死轮回。</p>
                    <p style="color:#c25b4e;margin:10px 0;">是否要放弃当前的人生，重新投胎？</p>
                    <button class="action-btn" style="background:#c25b4e;margin-top:10px;padding:8px 20px;">确认转世</button>
                </div>
            `
        },
        '日志': {
            title: '【 过往风霜 】',
            html: () => `
                <div class="list-layout">
                    <div style="font-size:13px;line-height:1.6;color:#4a3c31;">
                        <p>[系统] 游戏初始化完成。</p>
                        <p>[系统] 景泰二年 夏：邻里逢旱，随父母逃荒。</p>
                    </div>
                </div>
            `
        }
    };

    // 4. 绑定所有按钮的点击事件
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const config = modalConfigs[btnName];
            if (config) {
                openModal(config.title, config.html, config.afterRender);
            } else {
                openModal('【 提示 】', `<div class="text-center">功能 [${btnName}] 尚未配置。</div>`);
            }
        });
    });

    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            const config = modalConfigs['头像'];
            openModal(config.title, config.html, config.afterRender);
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
            top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '15px',
            zIndex: '9999',
            pointerEvents: 'none',
            letterSpacing: '1px',
            animation: 'fadeInOut 2s ease-in-out forwards'
        });

        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) toast.remove();
        }, 2000);
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