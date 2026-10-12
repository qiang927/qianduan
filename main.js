document.addEventListener('DOMContentLoaded', () => {

    // --- 全局状态存储，用于保存用户设定和API配置 ---
    const appData = {
        apiUrl: localStorage.getItem('apiUrl') || '',
        apiKey: localStorage.getItem('apiKey') || '',
        selectedModel: localStorage.getItem('selectedModel') || '',
        userSetting: localStorage.getItem('userSetting') || '我是一个普通的平民，生于乱世，渴望通过读书改变命运。我性格坚韧，遇事冷静。'
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
            // 防止点击弹窗内部也关闭
            if (e.target === modalOverlay) closeModal();
        });
    }

    // 3. 各个按钮的弹窗内容配置 (使用函数动态生成，以便读取 appData 最新数据)
    const modalConfigs = {
        '背包': () => ({
            title: '【 我的行囊 】',
            html: `
                <div class="grid-layout">
                    ${Array(16).fill('<div class="grid-cell">空</div>').join('')}
                </div>
                <div style="margin-top:15px;text-align:center;font-size:12px;color:#8b7456;">容量: 0/16</div>
            `
        }),
        '信件': () => ({
            title: '【 飞鸽传书 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <span style="font-weight:bold;">娘亲的家书</span>
                        <span style="color:#c25b4e;font-size:12px;">未读</span>
                    </div>
                </div>
            `
        }),
        '人际': () => ({
            title: '【 人脉交游 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>私塾先生</span><span>好感: 10</span></div>
                    <div class="list-item"><span>神秘乞丐</span><span style="color:#c25b4e;">好感: -50 (交恶)</span></div>
                </div>
            `
        }),
        '地图': () => ({
            title: '【 城镇地图 】',
            html: `
                <div class="grid-layout">
                    <div class="grid-cell" style="background:#eaddc7;color:#5c4a3d;">自家</div>
                    <div class="grid-cell">市集</div>
                    <div class="grid-cell">私塾</div>
                    <div class="grid-cell">破庙</div>
                </div>
            `
        }),
        '我': () => ({ // 点击“我”或左上角头像：改为 User 设定面板
            title: '【 我的身世 (AI 设定) 】',
            html: `
                <div class="list-layout">
                    <p style="font-size:13px;color:#8b7456;margin-bottom:5px;">请写下你的身世、性格与愿景。<br>这些设定将在推演时作为 Prompt 发送给 AI。</p>
                    <textarea id="user-setting-input" class="custom-textarea" placeholder="例如：我是一个落魄书生...">${appData.userSetting}</textarea>
                    <button id="save-setting-btn" class="action-btn" style="width:100%; margin-top:5px; padding:10px;">保存命格设定</button>
                </div>
            `
        }),
        '任务': () => ({
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
        }),
        '设置': () => ({ // 新增 API 配置表单
            title: '【 系统与 AI 配置 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <span>环境音效</span>
                        <button class="action-btn">开启</button>
                    </div>
                    
                    <div class="api-group">
                        <span style="font-weight:bold; color:#5c4a3d;">AI 驱动核心配置</span>
                        <input type="text" id="api-url-input" class="custom-input" placeholder="API 地址 (如 https://api.openai.com/v1)" value="${appData.apiUrl}">
                        <input type="password" id="api-key-input" class="custom-input" placeholder="API 密钥 (sk-...)" value="${appData.apiKey}">
                        
                        <div style="display:flex; gap:10px;">
                            <button id="fetch-models-btn" class="action-btn" style="flex:1;">获取模型</button>
                            <select id="model-select" class="custom-select" style="flex:2;">
                                <option value="${appData.selectedModel}">${appData.selectedModel ? appData.selectedModel : '请先点击获取模型'}</option>
                            </select>
                        </div>
                        
                        <button id="save-api-btn" class="action-btn" style="width:100%; background:#c25b4e; margin-top:5px; padding:10px;">保存 AI 配置</button>
                    </div>
                </div>
            `
        }),
        '微调': () => ({
            title: '【 造物主微调 】',
            html: `
                <div class="list-layout">
                    <div class="list-item"><span>健康上限</span><button class="action-btn">+10</button></div>
                    <div class="list-item"><span>盘缠金钱</span><button class="action-btn">+1000</button></div>
                </div>
                <div style="margin-top:10px;text-align:center;font-size:12px;color:#c25b4e;">过度微调可能影响天道平衡</div>
            `
        }),
        '存档': () => ({
            title: '【 记录人生 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                            <span style="font-size:12px;color:#666;">景泰三年 春</span>
                        </div>
                        <button class="action-btn">覆盖</button>
                    </div>
                </div>
            `
        }),
        '读档': () => ({
            title: '【 回溯时光 】',
            html: `
                <div class="list-layout">
                    <div class="list-item">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:bold;">位面 壹</span>
                            <span style="font-size:12px;color:#666;">景泰三年 春</span>
                        </div>
                        <button class="action-btn">读取</button>
                    </div>
                </div>
            `
        }),
        '重生': () => ({
            title: '【 轮回转世 】',
            html: `
                <div class="text-center">
                    <p>天道无常，生死轮回。</p>
                    <p style="color:#c25b4e;margin:10px 0;">是否要放弃当前的人生，<br>重新投胎？</p>
                    <button class="action-btn" style="background:#c25b4e;margin-top:10px;padding:8px 20px;">确认转世</button>
                </div>
            `
        }),
        '日志': () => ({
            title: '【 过往风霜 】',
            html: `
                <div class="list-layout">
                    <div style="font-size:13px;line-height:1.6;color:#4a3c31;">
                        <p>[系统] 游戏初始化完成。</p>
                        <p>[系统] 你出生在一个贫寒的农家。</p>
                        <p>[系统] 景泰二年 春：你大病初愈。</p>
                    </div>
                </div>
            `
        }),
        '下一年': () => ({
            title: '【 开启推演 】',
            html: `
                <div class="text-center">
                    <p style="font-size:18px;font-weight:bold;margin-bottom:10px;">景泰三年</p>
                    <div style="background:rgba(0,0,0,0.03); border:1px solid #d3c1a8; padding:10px; border-radius:4px; text-align:left; margin-bottom:15px;">
                        <span style="color:#8b7456; font-size:12px; font-weight:bold;">[ 即将发送给 AI 的设定 ]</span><br>
                        <span style="font-size:13px; color:#4a3c31;">${appData.userSetting.length > 30 ? appData.userSetting.substring(0,30) + '...' : appData.userSetting}</span>
                    </div>
                    <p style="font-size:12px; color:#c25b4e; margin-bottom:10px;">将根据你的设定与当期境遇，由 AI 生成未来的走向。</p>
                    <button id="start-ai-simulation-btn" class="action-btn" style="width:100%; padding:12px; font-size:16px;">开始 AI 推演</button>
                </div>
            `
        })
    };

    // 4. 绑定所有触发弹窗的按钮
    const allButtons = document.querySelectorAll('.icon-btn, .main-btn, .long-btn');
    allButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnName = e.currentTarget.textContent.trim();
            const configCreator = modalConfigs[btnName];
            if (configCreator) {
                const config = configCreator();
                openModal(config.title, config.html);
            }
        });
    });

    // 左上角头像点击 -> 触发"我"的设定弹窗
    const topLeft = document.querySelector('.top-left');
    if (topLeft) {
        topLeft.addEventListener('click', () => {
            const config = modalConfigs['我']();
            openModal(config.title, config.html);
        });
    }

    // 5. 使用事件代理处理弹窗内部的各种按钮点击操作
    modalContentBody.addEventListener('click', (e) => {
        // 保存用户设定
        if (e.target.id === 'save-setting-btn') {
            const val = document.getElementById('user-setting-input').value.trim();
            if (!val) return showToast('设定不可为空！');
            appData.userSetting = val;
            localStorage.setItem('userSetting', val);
            showToast('命格设定已保存！将在下一年推演时生效。');
            setTimeout(closeModal, 800);
        }
        
        // 模拟获取模型列表
        if (e.target.id === 'fetch-models-btn') {
            const url = document.getElementById('api-url-input').value.trim();
            const key = document.getElementById('api-key-input').value.trim();
            if (!url || !key) {
                return showToast('请先填写完整的 API 地址与密钥！');
            }
            
            showToast('正在尝试连接获取模型...');
            const select = document.getElementById('model-select');
            // 模拟异步获取数据
            setTimeout(() => {
                select.innerHTML = `
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="claude-3-opus">claude-3-opus</option>
                    <option value="qwen-max">qwen-max</option>
                `;
                appData.selectedModel = 'gpt-4o'; // 默认选中第一个
                showToast('已成功拉取可用模型！');
            }, 800);
        }

        // 保存 API 配置
        if (e.target.id === 'save-api-btn') {
            appData.apiUrl = document.getElementById('api-url-input').value.trim();
            appData.apiKey = document.getElementById('api-key-input').value.trim();
            const select = document.getElementById('model-select');
            appData.selectedModel = select.value;

            localStorage.setItem('apiUrl', appData.apiUrl);
            localStorage.setItem('apiKey', appData.apiKey);
            localStorage.setItem('selectedModel', appData.selectedModel);
            
            showToast('核心 AI 配置已成功保存！');
            setTimeout(closeModal, 800);
        }

        // 开始AI推演 (下一年)
        if (e.target.id === 'start-ai-simulation-btn') {
            if (!appData.apiUrl || !appData.apiKey) {
                showToast('请先前往【设置】中配置 AI 驱动核心！');
                return;
            }
            closeModal();
            showToast(`正在请求 ${appData.selectedModel} 进行推演，请稍候...`);
            // 此处未来可以替换为真正的 fetch() API 调用逻辑
        }
    });

    // 6. 通用提示框(Toast)逻辑
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: '9999',
            pointerEvents: 'none',
            letterSpacing: '1px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            animation: 'fadeInOut 2.5s ease-in-out forwards'
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