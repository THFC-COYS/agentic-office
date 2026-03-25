// ============================================================
// ui.js — UI layer: agent list, chat, modals, EDIT AGENT
// ============================================================

'use strict';

const UI = (() => {
  let activeAgent = null;
  let isSending   = false;
  let els         = {};

  // Status display config matching game.js HB states
  // State colors + labels for report bars
  const STATE_META = {
    working:     { label: 'Working',      color: '#58a6ff', icon: '🎯' },
    normal:      { label: 'Active',       color: '#3fb950', icon: '🟢' },
    socializing: { label: 'Socializing',  color: '#f0c040', icon: '💬' },
    coffee:      { label: 'Coffee Break', color: '#c4913a', icon: '☕' },
    distracted:  { label: 'Distracted',   color: '#ff9944', icon: '📱' },
    tired:       { label: 'Tired',        color: '#9b72ff', icon: '😴' },
    stressed:    { label: 'Stressed',     color: '#f78166', icon: '😤' },
    celebrating: { label: 'Celebrating',  color: '#FFD700', icon: '🎉' },
    unwell:      { label: 'Unwell',       color: '#88cc44', icon: '🤒' },
    pto:         { label: 'OOO / PTO',    color: '#4ecdc4', icon: '🏖️' },
    arriving:    { label: 'Arriving',     color: '#aaa',    icon: '👋' }
  };

  const STATUS_DISPLAY = {
    normal:      { label: 'Active',       color: '#3fb950', icon: '🟢' },
    working:     { label: 'Deep Focus',   color: '#58a6ff', icon: '🎯' },
    socializing: { label: 'In Chat',      color: '#f0c040', icon: '💬' },
    distracted:  { label: 'Distracted',   color: '#ff9944', icon: '📱' },
    unwell:      { label: 'Not Well',     color: '#88cc44', icon: '🤒' },
    pto:         { label: 'OOO / PTO',    color: '#4ecdc4', icon: '🏖️' },
    coffee:      { label: 'Coffee Break', color: '#c4913a', icon: '☕' },
    celebrating: { label: 'Celebrating',  color: '#FFD700', icon: '🎉' },
    stressed:    { label: 'Stressed',     color: '#f78166', icon: '😤' },
    tired:       { label: 'Tired',        color: '#9b72ff', icon: '😴' },
    arriving:    { label: 'Arriving',     color: '#3fb950', icon: '👋' }
  };

  function init() {
    els = {
      panelList:        q('#panel-list'),
      panelChat:        q('#panel-chat'),
      agentList:        q('#agent-list'),
      agentCount:       q('#agent-count'),
      chatMessages:     q('#chat-messages'),
      chatInput:        q('#chat-input'),
      chatSendBtn:      q('#chat-send-btn'),
      chatBackBtn:      q('#chat-back-btn'),
      chatAgentEmoji:   q('#chat-agent-emoji'),
      chatAgentName:    q('#chat-agent-name'),
      chatAgentCompany: q('#chat-agent-company'),
      chatApiBadge:     q('#chat-api-badge'),
      addAgentBtn:      q('#add-agent-btn'),
      addAgentBtn2:     q('#add-agent-btn-2'),
      settingsBtn:      q('#settings-btn'),
      tooltip:          q('#agent-tooltip'),
      apiStatusDot:     q('#api-status-indicator'),
      agentFormProvider: q('#agent-form-provider'),
      agentFormModel:    q('#agent-form-model'),
      settingsAnthropicKey: q('#settings-anthropic-key'),
      settingsOpenaiKey:    q('#settings-openai-key'),
      settingsSpeed:        q('#settings-speed'),
      settingsSpeedLabel:   q('#settings-speed-label'),
      saveSettingsBtn:      q('#save-settings-btn'),
      saveAgentBtn:         q('#save-agent-btn'),
      emojiInput:           q('#agent-form-emoji'),
      emojiGrid:            q('.emoji-grid')
    };

    // Populate role dropdown from ROLE_PRESETS
    populateRoleDropdown();
    bindEvents();
    populateSettingsKeys();
    updateApiStatusDot();
    updateEnvBadge();

    // Show landing screen on very first visit (no saved env = fresh start)
    const hasVisited = localStorage.getItem('ao_has_visited');
    if (!hasVisited) {
      setTimeout(() => openModal('modal-landing'), 400);
    }
  }

  function q(sel) { return document.querySelector(sel); }

  // ── Role Dropdown ─────────────────────────────────────────────
  function populateRoleDropdown() {
    const roleInput = q('#agent-form-role');
    if (!roleInput || !ROLE_PRESETS) return;

    // Create datalist for suggestions
    const dl = document.createElement('datalist');
    dl.id = 'role-presets-list';
    ROLE_PRESETS.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      dl.appendChild(opt);
    });
    document.body.appendChild(dl);
    roleInput.setAttribute('list', 'role-presets-list');
    roleInput.setAttribute('autocomplete', 'off');
  }

  // ── Event Bindings ────────────────────────────────────────────
  function bindEvents() {
    els.addAgentBtn.addEventListener('click',  () => openModal('modal-add-agent'));
    els.addAgentBtn2.addEventListener('click', () => openModal('modal-add-agent'));
    els.settingsBtn.addEventListener('click',  () => openModal('modal-settings'));

    const reportBtn = q('#report-btn');
    if (reportBtn) reportBtn.addEventListener('click', openReport);

    const reportResetBtn = q('#report-reset-btn');
    if (reportResetBtn) reportResetBtn.addEventListener('click', () => {
      Game.resetReport();
      openReport();
    });

    const reportCsvBtn = q('#report-csv-btn');
    if (reportCsvBtn) reportCsvBtn.addEventListener('click', () => downloadReportCSV());

    // Environment switcher
    const envBtn = q('#env-btn');
    if (envBtn) envBtn.addEventListener('click', () => {
      renderLandingCards(false); // render env switcher (not first-time)
      openModal('modal-landing');
    });

    // Share / Screenshot button
    const shareBtn = q('#share-btn');
    if (shareBtn) shareBtn.addEventListener('click', onShareScreenshot);

    // Task modal
    const saveTaskBtn = q('#save-task-btn');
    if (saveTaskBtn) saveTaskBtn.addEventListener('click', onSaveTask);

    const clearTaskBtn = q('#clear-task-btn');
    if (clearTaskBtn) clearTaskBtn.addEventListener('click', onClearTask);

    // Task quick-pick chips
    document.querySelectorAll('.task-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const titleEl    = q('#task-title');
        const priorityEl = q('#task-priority');
        if (titleEl)    titleEl.value    = chip.dataset.title;
        if (priorityEl) priorityEl.value = chip.dataset.priority || 'normal';
      });
    });

    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.modal
          || e.currentTarget.closest('.modal-overlay')?.id;
        if (id) closeModal(id);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });

    els.saveAgentBtn.addEventListener('click', onSaveAgent);
    els.agentFormProvider.addEventListener('change', onProviderChange);
    els.saveSettingsBtn.addEventListener('click', onSaveSettings);

    els.settingsSpeed.addEventListener('input', e => {
      els.settingsSpeedLabel.textContent = `${parseFloat(e.target.value).toFixed(1)}×`;
    });

    els.chatBackBtn.addEventListener('click', closeChat);
    els.chatSendBtn.addEventListener('click', onChatSend);
    els.chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onChatSend(); }
    });

    // Edit modal save
    const saveEditBtn = q('#save-edit-btn');
    if (saveEditBtn) saveEditBtn.addEventListener('click', onSaveEdit);

    // Emoji picker
    els.emojiInput.addEventListener('click', () => els.emojiGrid.classList.toggle('open'));
    els.emojiGrid.querySelectorAll('span').forEach(span => {
      span.addEventListener('click', () => {
        els.emojiInput.value = span.textContent;
        els.emojiGrid.classList.remove('open');
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.emoji-picker-wrap')) els.emojiGrid.classList.remove('open');
    });
  }

  // ── Environment Badge ─────────────────────────────────────────
  function updateEnvBadge() {
    const envBadge = q('#env-badge-label');
    if (!envBadge) return;
    const env = getCurrentEnvDef ? getCurrentEnvDef() : null;
    if (env) envBadge.textContent = `${env.emoji} ${env.name}`;
  }

  // ── Landing Screen / Env Picker ───────────────────────────────
  function renderLandingCards(isFirstVisit) {
    const container = q('#landing-env-cards');
    if (!container) return;
    const currentEnv = CURRENT_ENV_KEY || 'university';
    container.innerHTML = '';

    Object.values(ENVIRONMENT_DEFS).forEach(env => {
      const card = document.createElement('div');
      card.className = 'env-card' + (env.key === currentEnv ? ' active' : '');
      card.style.setProperty('--env-color', env.color);
      card.innerHTML = `
        <div class="env-card-emoji">${env.emoji}</div>
        <div class="env-card-name">${env.name}</div>
        <div class="env-card-tagline">${env.tagline}</div>
        <div class="env-card-desc">${env.desc}</div>
        ${env.key === currentEnv ? '<div class="env-card-active-badge">✓ Active</div>' : ''}
      `;
      card.addEventListener('click', () => {
        localStorage.setItem('ao_has_visited', '1');
        closeModal('modal-landing');
        if (env.key !== currentEnv) {
          Game.switchEnvironment(env.key);
          renderAgentList(Game.getAgents());
          updateEnvBadge();
          showToast(`${env.emoji} Switched to ${env.name}!`, env.color);
        }
      });
      container.appendChild(card);
    });

    const heading = q('#landing-heading');
    if (heading) {
      heading.textContent = isFirstVisit
        ? 'Choose your environment'
        : 'Switch Environment';
    }
    const subheading = q('#landing-subheading');
    if (subheading) {
      subheading.textContent = isFirstVisit
        ? 'Pick where your AI agents will work today. Office of Greg is always included.'
        : 'Select a new environment. Your custom agents stay. Office of Greg always remains.';
    }
  }

  // When landing modal opens, render cards
  const origOpenModal = null;
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'modal-landing') {
      const isFirst = !localStorage.getItem('ao_has_visited');
      renderLandingCards(isFirst);
    }
    el.classList.remove('hidden');
  }

  // ── Share Screenshot ──────────────────────────────────────────
  function onShareScreenshot() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    try {
      canvas.toBlob(blob => {
        if (!blob) { showToast('Screenshot failed 😢', '#f78166'); return; }
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `agentic-office-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📸 Screenshot saved!', '#3fb950');
      });
    } catch(e) {
      showToast('Screenshot not available', '#f78166');
    }
  }

  // ── Toast Notification ────────────────────────────────────────
  function showToast(text, color = '#58a6ff') {
    let toast = q('#ao-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ao-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.borderColor = color;
    toast.style.color = color;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  // ── Agent List ────────────────────────────────────────────────
  function renderAgentList(agents) {
    els.agentCount.textContent = agents.length;
    els.agentList.innerHTML    = '';

    const byDept = { executive: [], finance: [], sales: [], greg: [] };
    agents.forEach(ag => {
      const bucket = byDept[ag.department] ? ag.department : 'finance';
      byDept[bucket].push(ag);
    });

    ['executive', 'sales', 'finance', 'greg'].forEach(dept => {
      const group = byDept[dept];
      if (!group.length) return;

      const room = ROOMS[dept];

      const header = document.createElement('div');
      header.style.cssText = `
        font-size:10px;font-weight:700;text-transform:uppercase;
        letter-spacing:.8px;color:${room.accentColor};
        padding:8px 12px 4px;margin-top:4px;
      `;
      header.textContent = room.name;
      els.agentList.appendChild(header);

      group.forEach(ag => {
        const hs     = ag.humanState || 'normal';
        const status = STATUS_DISPLAY[hs] || STATUS_DISPLAY.normal;
        const isPTO  = ag.onPTO || hs === 'pto';

        const card = document.createElement('div');
        card.className = 'agent-card' + (ag === activeAgent ? ' selected' : '');
        card.dataset.id = ag.id;
        card.style.opacity = isPTO ? '0.5' : '1';

        const TASK_PRIORITY_COLOR = { urgent: '#FF3B30', high: '#FF9F0A', normal: '#30D158', low: '#636366' };
        const taskHtml = ag.currentTask ? `
          <div class="agent-task-badge" style="border-color:${TASK_PRIORITY_COLOR[ag.currentTask.priority]||'#30D158'}22;background:${TASK_PRIORITY_COLOR[ag.currentTask.priority]||'#30D158'}11;color:${TASK_PRIORITY_COLOR[ag.currentTask.priority]||'#30D158'}">
            📋 ${ag.currentTask.title}
          </div>
        ` : '';
        card.innerHTML = `
          <div class="agent-card-emoji" style="background:${ag.color}22;border:1px solid ${ag.color}44;${isPTO ? 'filter:grayscale(1)' : ''}">
            ${ag.emoji}
          </div>
          <div class="agent-card-info">
            <div class="agent-card-name">${ag.name}</div>
            <div style="font-size:11px;color:${room.accentColor}">${ag.company}</div>
            <div style="font-size:10px;color:${status.color};margin-top:1px">${status.icon} ${status.label}</div>
            ${taskHtml}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <button class="edit-btn" data-id="${ag.id}" title="Rename / Edit" style="
              background:none;border:1px solid #30363d;color:#8b949e;
              border-radius:5px;padding:2px 7px;font-size:11px;cursor:pointer;
            ">✏️</button>
            <button class="task-btn" data-id="${ag.id}" title="Assign Task" style="
              background:none;border:1px solid #30363d;color:${ag.currentTask ? '#FF9F0A' : '#8b949e'};
              border-radius:5px;padding:2px 7px;font-size:11px;cursor:pointer;
            ">${ag.currentTask ? '📋' : '＋'}</button>
          </div>
        `;

        card.addEventListener('click', e => {
          if (e.target.closest('.edit-btn')) return;
          if (e.target.closest('.task-btn')) return;
          if (!isPTO) openChat(ag);
        });

        card.querySelector('.edit-btn').addEventListener('click', e => {
          e.stopPropagation();
          openEditModal(ag);
        });

        card.querySelector('.task-btn').addEventListener('click', e => {
          e.stopPropagation();
          openTaskModal(ag);
        });

        els.agentList.appendChild(card);
      });
    });
  }

  // ── Edit Agent Modal ──────────────────────────────────────────
  function openEditModal(agent) {
    // Populate edit form
    const setVal = (id, val) => { const el = q(id); if (el) el.value = val || ''; };
    setVal('#edit-agent-name',     agent.name);
    setVal('#edit-agent-company',  agent.company);
    setVal('#edit-agent-role',     agent.role);
    setVal('#edit-agent-emoji',    agent.emoji);
    setVal('#edit-agent-desc',     agent.description);
    setVal('#edit-agent-provider', agent.apiConfig?.provider || 'claude');
    setVal('#edit-agent-model',    agent.apiConfig?.model    || '');
    setVal('#edit-agent-apikey',   agent.apiConfig?.apiKey   || '');
    setVal('#edit-agent-system',   agent.apiConfig?.systemPrompt || '');
    setVal('#edit-agent-dept',     agent.department);

    // Populate edit role datalist
    const editRole = q('#edit-agent-role');
    if (editRole && ROLE_PRESETS) {
      let dl = q('#edit-role-presets-list');
      if (!dl) {
        dl = document.createElement('datalist');
        dl.id = 'edit-role-presets-list';
        ROLE_PRESETS.forEach(r => {
          const opt = document.createElement('option');
          opt.value = r;
          dl.appendChild(opt);
        });
        document.body.appendChild(dl);
      }
      editRole.setAttribute('list', 'edit-role-presets-list');
    }

    const saveBtn = q('#save-edit-btn');
    if (saveBtn) saveBtn.dataset.agentId = agent.id;

    openModal('modal-edit-agent');
  }

  function onSaveEdit() {
    const id = q('#save-edit-btn')?.dataset.agentId;
    if (!id) return;

    const getVal = sel => { const el = q(sel); return el ? el.value.trim() : ''; };
    const updated = Game.updateAgent(id, {
      name:        getVal('#edit-agent-name')    || 'Agent',
      company:     getVal('#edit-agent-company') || '',
      role:        getVal('#edit-agent-role')    || '',
      emoji:       getVal('#edit-agent-emoji')   || '🤖',
      department:  getVal('#edit-agent-dept'),
      description: getVal('#edit-agent-desc'),
      apiConfig: {
        provider:     getVal('#edit-agent-provider') || 'claude',
        model:        getVal('#edit-agent-model')    || 'claude-sonnet-4-6',
        apiKey:       getVal('#edit-agent-apikey'),
        systemPrompt: getVal('#edit-agent-system')
      }
    });

    closeModal('modal-edit-agent');
    renderAgentList(Game.getAgents());

    // Update chat header if this agent is open
    if (activeAgent?.id === id && updated) {
      els.chatAgentEmoji.textContent   = updated.emoji;
      els.chatAgentName.textContent    = updated.name;
      els.chatAgentCompany.textContent = `${updated.company} · ${updated.role}`;
    }
  }

  // ── Task Modal ────────────────────────────────────────────────
  let _taskAgentId = null;

  function openTaskModal(agent) {
    _taskAgentId = agent.id;
    const task = agent.currentTask;
    const setVal = (id, val) => { const el = q(id); if (el) el.value = val || ''; };
    setVal('#task-title',    task?.title || '');
    setVal('#task-desc',     task?.description || '');
    setVal('#task-priority', task?.priority || 'normal');
    setVal('#task-agent-name', agent.name);

    const agLabel = q('#task-modal-agent');
    if (agLabel) agLabel.textContent = `${agent.emoji} ${agent.name}`;

    const clearBtn = q('#clear-task-btn');
    if (clearBtn) clearBtn.style.display = task ? 'inline-flex' : 'none';

    openModal('modal-assign-task');
  }

  function onSaveTask() {
    if (!_taskAgentId) return;
    const title    = q('#task-title')?.value.trim();
    const desc     = q('#task-desc')?.value.trim();
    const priority = q('#task-priority')?.value || 'normal';
    if (!title) { highlight(q('#task-title')); return; }

    Game.assignTask(_taskAgentId, { title, description: desc, priority });
    closeModal('modal-assign-task');
    renderAgentList(Game.getAgents());
    showToast(`📋 Task assigned!`, '#30D158');
  }

  function onClearTask() {
    if (!_taskAgentId) return;
    Game.clearTask(_taskAgentId);
    closeModal('modal-assign-task');
    renderAgentList(Game.getAgents());
    showToast('Task cleared', '#636366');
  }

  // ── Chat Panel ────────────────────────────────────────────────
  function openChat(agent) {
    activeAgent = agent;
    els.chatAgentEmoji.textContent   = agent.emoji;
    els.chatAgentName.textContent    = agent.name;
    els.chatAgentCompany.textContent = `${agent.company} · ${agent.role}`;

    const ok = AgentAPI.isConfigured(agent);
    els.chatApiBadge.textContent = ok
      ? (agent.apiConfig?.provider || 'claude').toUpperCase()
      : 'NO API KEY';
    els.chatApiBadge.className = `api-badge ${ok ? 'configured' : 'unconfigured'}`;

    // Show assign-task button in chat header
    let chatTaskBtn = q('#chat-assign-task-btn');
    if (!chatTaskBtn) {
      chatTaskBtn = document.createElement('button');
      chatTaskBtn.id = 'chat-assign-task-btn';
      chatTaskBtn.className = 'btn btn-ghost btn-sm';
      chatTaskBtn.title = 'Assign Task';
      q('#panel-chat .panel-header')?.appendChild(chatTaskBtn);
    }
    chatTaskBtn.textContent = agent.currentTask ? `📋 ${agent.currentTask.title}` : '＋ Task';
    chatTaskBtn.onclick = () => openTaskModal(agent);

    els.chatMessages.innerHTML = '';
    if (!agent.chatHistory?.length) {
      addSystemMessage(`Chat with ${agent.name} — ${agent.role}`);
      if (agent.description) addSystemMessage(agent.description);
      if (agent.currentTask) {
        addSystemMessage(`📋 Current task: ${agent.currentTask.title}${agent.currentTask.description ? ' — ' + agent.currentTask.description : ''}`);
      }
      if (!ok) addSystemMessage('⚠ No API key — add one in Settings ⚙ or edit this agent.');
    } else {
      agent.chatHistory.forEach(m => addMessage(m.role, m.content, false));
    }

    els.panelList.classList.remove('active');
    els.panelChat.classList.add('active');
    els.chatInput.focus();

    document.querySelectorAll('.agent-card').forEach(c =>
      c.classList.toggle('selected', c.dataset.id === agent.id));
  }

  function closeChat() {
    activeAgent = null;
    els.panelChat.classList.remove('active');
    els.panelList.classList.add('active');
    document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('selected'));
    Game.deselectAll();
  }

  // ── Messages ──────────────────────────────────────────────────
  function addMessage(role, content, save = true) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML  = escapeHtml(content).replace(/\n/g, '<br>');
    els.chatMessages.appendChild(div);
    scrollBottom();
    if (save && activeAgent && role !== 'system') {
      activeAgent.chatHistory = activeAgent.chatHistory || [];
      activeAgent.chatHistory.push({ role, content });
    }
    return div;
  }

  function addSystemMessage(text) {
    if (!text) return;
    const div = document.createElement('div');
    div.className  = 'msg system';
    div.textContent = text;
    els.chatMessages.appendChild(div);
    scrollBottom();
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    els.chatMessages.appendChild(div);
    scrollBottom();
    return div;
  }

  function scrollBottom() {
    requestAnimationFrame(() => { els.chatMessages.scrollTop = els.chatMessages.scrollHeight; });
  }

  // ── Send Chat ─────────────────────────────────────────────────
  async function onChatSend() {
    if (isSending || !activeAgent) return;
    const text = els.chatInput.value.trim();
    if (!text) return;

    els.chatInput.value = '';
    isSending = true;
    els.chatSendBtn.disabled = true;
    els.chatInput.disabled   = true;

    addMessage('user', text);
    activeAgent.state        = 'thinking';
    activeAgent.speechBubble = { text: '🤔 Thinking...', age: 0, maxAge: 99 };

    const typingEl = addTypingIndicator();
    try {
      // Inject current task into the user message context if agent has one
      let contextualText = text;
      if (activeAgent.currentTask) {
        const t = activeAgent.currentTask;
        contextualText = `[Context: I am currently assigned the task "${t.title}"${t.description ? ': ' + t.description : ''}. Priority: ${t.priority}.]\n\n${text}`;
      }
      const reply = await AgentAPI.callAgent(activeAgent, contextualText);
      typingEl.remove();
      addMessage('agent', reply);
      const snip = reply.slice(0, 40) + (reply.length > 40 ? '…' : '');
      activeAgent.speechBubble = { text: snip, age: 0, maxAge: 4 };
      // Chance of celebrating after a successful response
      if (Math.random() < 0.15 && activeAgent.humanState !== 'pto') {
        activeAgent.humanState = 'celebrating';
        activeAgent.humanStateTimer = 0;
      }
    } catch (err) {
      typingEl.remove();
      const errDiv = document.createElement('div');
      errDiv.className  = 'msg error';
      errDiv.textContent = `❌ ${err.message}`;
      els.chatMessages.appendChild(errDiv);
      scrollBottom();
      activeAgent.speechBubble = null;
    } finally {
      activeAgent.state        = 'idle';
      isSending                = false;
      els.chatSendBtn.disabled = false;
      els.chatInput.disabled   = false;
      els.chatInput.focus();
    }
  }

  // ── Tooltip ───────────────────────────────────────────────────
  function showTooltip(agent, clientX, clientY) {
    if (!agent) { els.tooltip.classList.add('hidden'); return; }
    els.tooltip.classList.remove('hidden');
    const hs     = agent.humanState || 'normal';
    const status = STATUS_DISPLAY[hs] || STATUS_DISPLAY.normal;
    els.tooltip.querySelector('.tt-emoji').textContent   = agent.emoji;
    els.tooltip.querySelector('.tt-name').textContent    = agent.name;
    els.tooltip.querySelector('.tt-company').textContent = agent.company;
    els.tooltip.querySelector('.tt-role').textContent    = `${agent.role} · ${status.icon} ${status.label}`;
    els.tooltip.style.left = `${clientX}px`;
    els.tooltip.style.top  = `${clientY}px`;
  }

  // ── Add Agent ─────────────────────────────────────────────────
  function onProviderChange() {
    const p = els.agentFormProvider.value;
    q('#custom-endpoint-row').classList.toggle('hidden', p !== 'custom');
    q('#api-model-row').classList.toggle('hidden', p === 'custom');
    els.agentFormModel.placeholder = p === 'openai' ? 'gpt-4o-mini' : 'claude-sonnet-4-6';
  }

  function onSaveAgent() {
    const name = q('#agent-form-name')?.value.trim();
    if (!name) { highlight(q('#agent-form-name')); return; }
    const provider = els.agentFormProvider.value;
    const ag = Game.addAgent({
      name,
      company:     q('#agent-form-company')?.value.trim()  || 'University',
      role:        q('#agent-form-role')?.value.trim()     || 'AI Agent',
      emoji:       els.emojiInput.value                    || '🤖',
      color:       randomColor(),
      department:  q('#agent-form-dept')?.value,
      description: q('#agent-form-desc')?.value.trim(),
      apiConfig: {
        provider,
        model:        q('#agent-form-model')?.value.trim()    || defaultModel(provider),
        apiKey:       q('#agent-form-apikey')?.value.trim(),
        endpoint:     q('#agent-form-endpoint')?.value.trim(),
        systemPrompt: q('#agent-form-system')?.value.trim()
      },
      speed: 55
    });
    closeModal('modal-add-agent');
    clearAddForm();
    renderAgentList(Game.getAgents());
    openChat(ag);
    Game.selectAgent(ag);
  }

  function clearAddForm() {
    ['#agent-form-name','#agent-form-company','#agent-form-role','#agent-form-desc',
     '#agent-form-apikey','#agent-form-endpoint','#agent-form-system'].forEach(s => {
      const el = q(s); if (el) el.value = '';
    });
    els.emojiInput.value             = '🤖';
    els.agentFormProvider.value      = 'claude';
    els.agentFormModel.value         = '';
    els.agentFormModel.placeholder   = 'claude-sonnet-4-6';
    q('#custom-endpoint-row').classList.add('hidden');
    q('#api-model-row').classList.remove('hidden');
  }

  // ── Settings ──────────────────────────────────────────────────
  function populateSettingsKeys() {
    const keys = AgentAPI.loadGlobalKeys();
    if (keys.anthropic) els.settingsAnthropicKey.value = keys.anthropic;
    if (keys.openai)    els.settingsOpenaiKey.value    = keys.openai;
  }

  function onSaveSettings() {
    AgentAPI.saveGlobalKeys(
      els.settingsAnthropicKey.value.trim(),
      els.settingsOpenaiKey.value.trim()
    );
    Game.setSpeed(parseFloat(els.settingsSpeed.value));
    updateApiStatusDot();
    closeModal('modal-settings');
  }

  function updateApiStatusDot() {
    const keys  = AgentAPI.loadGlobalKeys();
    const hasKey = !!(keys.anthropic || keys.openai);
    els.apiStatusDot.className = `status-dot ${hasKey ? 'configured' : 'unconfigured'}`;
    els.apiStatusDot.title     = hasKey ? 'API key configured' : 'No API key — open Settings';
  }

  // ── Modal Helpers ─────────────────────────────────────────────
  function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }

  // ── Utilities ─────────────────────────────────────────────────
  function highlight(el) {
    if (!el) return;
    el.focus();
    el.style.borderColor = '#f78166';
    setTimeout(() => { el.style.borderColor = ''; }, 2000);
  }

  function defaultModel(p) { return p === 'openai' ? 'gpt-4o-mini' : 'claude-sonnet-4-6'; }

  function randomColor() {
    const c = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#EC4899','#84CC16'];
    return c[Math.floor(Math.random() * c.length)];
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Report ────────────────────────────────────────────────────
  let _lastReport = null;

  function openReport() {
    _lastReport = Game.getReport();
    const body  = q('#report-body');
    if (!body) return;
    body.innerHTML = renderReportHTML(_lastReport);
    openModal('modal-report');
  }

  function fmtSec(s) {
    s = Math.round(s);
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m ${s%60}s`;
    return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
  }

  function fmtWall(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m`;
    return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
  }

  function renderReportHTML(report) {
    // Group agents by department
    const depts = ['greg','executive','sales','finance'];
    const byDept = {};
    depts.forEach(d => { byDept[d] = []; });
    report.agents.forEach(ag => {
      const d = byDept[ag.department] ? ag.department : 'finance';
      byDept[d].push(ag);
    });

    // Find top performers across all agents
    const allAgents = report.agents;
    let topFocus = allAgents[0], topSocial = allAgents[0];
    allAgents.forEach(ag => {
      const workPct  = (ag.states.working  || 0) / ag.totalGameSec;
      const topWPct  = (topFocus.states.working  || 0) / topFocus.totalGameSec;
      const socPct   = (ag.states.socializing || 0) / ag.totalGameSec;
      const topSPct  = (topSocial.states.socializing || 0) / topSocial.totalGameSec;
      if (workPct > topWPct) topFocus  = ag;
      if (socPct  > topSPct) topSocial = ag;
    });

    const focusPct = Math.round(((topFocus.states.working || 0) / topFocus.totalGameSec) * 100);
    const socPct   = Math.round(((topSocial.states.socializing || 0) / topSocial.totalGameSec) * 100);

    let html = `
      <div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
        <div class="report-stat-card">🕐 Session time<br><b>${fmtWall(report.wallMs)}</b></div>
        <div class="report-stat-card">🤖 Agents<br><b>${allAgents.length}</b></div>
        <div class="report-stat-card">🎯 Most focused<br><b>${topFocus.emoji} ${topFocus.name}</b><small>${focusPct}% working</small></div>
        <div class="report-stat-card">💬 Most social<br><b>${topSocial.emoji} ${topSocial.name}</b><small>${socPct}% socializing</small></div>
      </div>
      <div style="font-size:10px;color:#555;margin-bottom:14px;">Generated ${report.generatedAt} &nbsp;·&nbsp; Game time shown as bars; wall clock shown in parens</div>
    `;

    // Legend row
    html += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">`;
    Object.entries(STATE_META).forEach(([k, m]) => {
      html += `<span style="font-size:10px;background:${m.color}22;border:1px solid ${m.color}55;color:${m.color};padding:2px 7px;border-radius:10px;">${m.icon} ${m.label}</span>`;
    });
    html += `</div>`;

    // Per-dept sections
    depts.forEach(dept => {
      const group = byDept[dept];
      if (!group.length) return;
      const room = ROOMS[dept];
      html += `<div style="font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${room?.accentColor || '#aaa'};margin:16px 0 8px;">${room?.name || dept}</div>`;

      group.forEach(ag => {
        const total = ag.totalGameSec || 1;
        // Build bar segments in priority order
        const stateOrder = ['working','normal','socializing','coffee','distracted','tired','stressed','celebrating','unwell','pto','arriving'];
        let bars = '';
        let legendParts = [];
        stateOrder.forEach(s => {
          const sec = ag.states[s] || 0;
          if (sec < 0.5) return;
          const pct = Math.max(0.5, (sec / total) * 100);
          const m   = STATE_META[s];
          bars += `<div title="${m.label}: ${fmtSec(sec)} (${Math.round(pct)}%)" style="width:${pct}%;background:${m.color};min-width:3px;"></div>`;
          if (pct > 2) legendParts.push(`<span style="color:${m.color}">${m.icon} ${Math.round(pct)}%</span>`);
        });

        html += `
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #1a1f26;">
            <div style="width:180px;flex-shrink:0;display:flex;align-items:center;gap:7px;">
              <span style="font-size:18px">${ag.emoji}</span>
              <div>
                <div style="font-size:12px;font-weight:600;color:#e6edf3">${ag.name}</div>
                <div style="font-size:10px;color:#768390">${ag.company}</div>
              </div>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;height:14px;border-radius:4px;overflow:hidden;background:#0d1117;gap:1px;">${bars}</div>
              <div style="font-size:10px;margin-top:4px;display:flex;flex-wrap:wrap;gap:6px;">${legendParts.join('')}</div>
            </div>
            <div style="width:54px;flex-shrink:0;text-align:right;font-size:10px;color:#555">${fmtSec(total)}</div>
          </div>`;
      });
    });

    return html;
  }

  function downloadReportCSV() {
    const report = _lastReport || Game.getReport();
    const stateOrder = ['working','normal','socializing','coffee','distracted','tired','stressed','celebrating','unwell','pto','arriving'];
    const header = ['Name','Company','Role','Department','Total Game Sec', ...stateOrder.map(s => `${STATE_META[s].label} (sec)`), ...stateOrder.map(s => `${STATE_META[s].label} (%)`)];
    const rows = report.agents.map(ag => {
      const total = ag.totalGameSec || 1;
      const secs  = stateOrder.map(s => (ag.states[s] || 0).toFixed(1));
      const pcts  = stateOrder.map(s => (((ag.states[s] || 0) / total) * 100).toFixed(1));
      return [ag.name, ag.company, ag.role, ag.department, total.toFixed(1), ...secs, ...pcts];
    });
    const csv  = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `agentic-office-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { init, renderAgentList, openChat, closeChat, showTooltip };
})();
