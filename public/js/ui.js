// ============================================================
// ui.js — UI layer: agent list, chat, modals, EDIT AGENT
// ============================================================

'use strict';

const UI = (() => {
  let activeAgent = null;
  let isSending   = false;
  let els         = {};

  // Status display config matching game.js HB states
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

  // ── Agent List ────────────────────────────────────────────────
  function renderAgentList(agents) {
    els.agentCount.textContent = agents.length;
    els.agentList.innerHTML    = '';

    const byDept = { executive: [], finance: [], sales: [] };
    agents.forEach(ag => (byDept[ag.department] || byDept.finance).push(ag));

    ['executive', 'sales', 'finance'].forEach(dept => {
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

        card.innerHTML = `
          <div class="agent-card-emoji" style="background:${ag.color}22;border:1px solid ${ag.color}44;${isPTO ? 'filter:grayscale(1)' : ''}">
            ${ag.emoji}
          </div>
          <div class="agent-card-info">
            <div class="agent-card-name">${ag.name}</div>
            <div style="font-size:11px;color:${room.accentColor}">${ag.company}</div>
            <div style="font-size:10px;color:${status.color};margin-top:1px">${status.icon} ${status.label}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <button class="edit-btn" data-id="${ag.id}" title="Rename / Edit" style="
              background:none;border:1px solid #30363d;color:#8b949e;
              border-radius:5px;padding:2px 7px;font-size:11px;cursor:pointer;
            ">✏️</button>
          </div>
        `;

        card.addEventListener('click', e => {
          if (e.target.closest('.edit-btn')) return;
          if (!isPTO) openChat(ag);
        });

        card.querySelector('.edit-btn').addEventListener('click', e => {
          e.stopPropagation();
          openEditModal(ag);
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

    els.chatMessages.innerHTML = '';
    if (!agent.chatHistory?.length) {
      addSystemMessage(`Chat with ${agent.name} — ${agent.role}`);
      if (agent.description) addSystemMessage(agent.description);
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
      const reply = await AgentAPI.callAgent(activeAgent, text);
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
  function openModal(id)  { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); }
  function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.add('hidden');    }

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

  return { init, renderAgentList, openChat, closeChat, showTooltip };
})();
