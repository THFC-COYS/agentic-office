// ============================================================
// renderer.js — Canvas drawing engine with human behavior visuals
// ============================================================

'use strict';

const Renderer = (() => {
  let canvas, ctx;
  const TILE = 32;

  // Status badge config per behavior state
  const HB_BADGE = {
    working:     { icon: '🎯', color: '#58a6ff' },
    socializing: { icon: '💬', color: '#f0c040' },
    distracted:  { icon: '📱', color: '#ff9944' },
    unwell:      { icon: '🤒', color: '#88cc44' },
    pto:         { icon: '🏖️', color: '#4ecdc4' },
    coffee:      { icon: '☕', color: '#c4913a' },
    celebrating: { icon: '🎉', color: '#FFD700' },
    stressed:    { icon: '😤', color: '#f78166' },
    tired:       { icon: '😴', color: '#9b72ff' },
    arriving:    { icon: '👋', color: '#3fb950' }
  };

  // Body tint overlays per state (r,g,b,a)
  const HB_TINT = {
    unwell:      [100, 200, 80, 0.28],
    stressed:    [255, 80,  40, 0.22],
    tired:       [80,  80, 140, 0.25],
    pto:         [100,160,220, 0.35],
    celebrating: [255,220,  0, 0.18]
  };

  // ── Init ─────────────────────────────────────────────────────
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    const wrap   = canvas.parentElement;
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
  }

  function getScale() {
    return Math.min(canvas.width / CW, canvas.height / CH);
  }

  function getOffset() {
    const s = getScale();
    return { x: (canvas.width - CW * s) / 2, y: (canvas.height - CH * s) / 2 };
  }

  function canvasToGame(cx, cy) {
    const s = getScale(), off = getOffset();
    return { x: (cx - off.x) / s, y: (cy - off.y) / s };
  }

  // ── Main Render ───────────────────────────────────────────────
  function render(agents, selectedAgent, gameTime, socialPairs) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = getScale(), off = getOffset();
    ctx.save();
    ctx.translate(off.x, off.y);
    ctx.scale(s, s);

    drawFloors();
    drawCorridor();
    drawWalls();
    drawFurniture(gameTime);
    drawRoomLabels();

    // Draw social connection lines BEFORE agents
    if (socialPairs) drawSocialLinks(agents, socialPairs);

    // Painter's sort by Y
    const sorted = [...agents].filter(ag => !ag.onPTO).sort((a, b) => a.y - b.y);
    sorted.forEach(ag => drawAgentShadow(ag));
    sorted.forEach(ag => drawParticles(ag));
    sorted.forEach(ag => drawAgent(ag, ag === selectedAgent, gameTime));
    sorted.forEach(ag => { if (ag.speechBubble) drawSpeechBubble(ag); });

    // Draw PTO "empty desk" indicators
    agents.filter(ag => ag.onPTO).forEach(ag => drawPTOPlaceholder(ag, gameTime));

    ctx.restore();
  }

  // ── Floors ────────────────────────────────────────────────────
  function drawFloors() {
    Object.values(ROOMS).forEach(room => {
      for (let tx = room.x; tx < room.x + room.w; tx += TILE) {
        for (let ty = room.y; ty < room.y + room.h; ty += TILE) {
          const odd = ((tx / TILE) + (ty / TILE)) % 2 === 0;
          ctx.fillStyle = odd ? room.floorA : room.floorB;
          ctx.fillRect(tx, ty, TILE + 1, TILE + 1);
        }
      }
      // Vignette
      const g = ctx.createLinearGradient(room.x, room.y, room.x, room.y + room.h);
      g.addColorStop(0,   'rgba(0,0,0,0.22)');
      g.addColorStop(0.1, 'rgba(0,0,0,0)');
      g.addColorStop(0.9, 'rgba(0,0,0,0)');
      g.addColorStop(1,   'rgba(0,0,0,0.22)');
      ctx.fillStyle = g;
      ctx.fillRect(room.x, room.y, room.w, room.h);
    });
  }

  function drawCorridor() {
    const c = CORRIDOR;
    for (let tx = c.x; tx < c.x + c.w; tx += TILE) {
      for (let ty = c.y; ty < c.y + c.h; ty += TILE) {
        ctx.fillStyle = '#232830';
        ctx.fillRect(tx, ty, TILE + 1, TILE + 1);
      }
    }
    const lx = c.x + c.w / 2;
    const lg = ctx.createRadialGradient(lx, c.y + c.h / 2, 0, lx, c.y + c.h / 2, c.h * 0.6);
    lg.addColorStop(0, 'rgba(200,230,255,0.06)');
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(c.x, c.y, c.w, c.h);

    // ── VIP corridor (Academic Commons → Office of Greg) ──
    const vc = VIP_CORRIDOR;
    for (let tx = vc.x; tx < vc.x + vc.w; tx += TILE) {
      for (let ty = vc.y; ty < vc.y + vc.h; ty += TILE) {
        ctx.fillStyle = '#0E0E18';
        ctx.fillRect(tx, ty, TILE + 1, TILE + 1);
      }
    }
    // Gold runner carpet strip
    ctx.fillStyle = 'rgba(212,175,55,0.10)';
    ctx.fillRect(vc.x + 6, vc.y + 6, vc.w - 12, vc.h - 12);
    // Gold border lines
    ctx.save();
    ctx.strokeStyle = 'rgba(212,175,55,0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vc.x + 3, vc.y + 3, vc.w - 6, vc.h - 6);
    // Center arrow label
    ctx.font = '7px Arial';
    ctx.fillStyle = 'rgba(212,175,55,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText('▼  OFFICE OF GREG  ▼', vc.x + vc.w / 2, vc.y + vc.h / 2 + 2.5);
    ctx.restore();
  }

  // ── Walls ─────────────────────────────────────────────────────
  function drawWalls() {
    ctx.lineWidth   = 6;
    ctx.strokeStyle = '#111418';
    ctx.strokeRect(1, 1, CW - 2, CH - 2);

    ctx.beginPath();
    ctx.moveTo(0, ROOMS.executive.h);
    ctx.lineTo(CW, ROOMS.executive.h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CORRIDOR.x, ROOMS.executive.h);
    ctx.lineTo(CORRIDOR.x, CH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CORRIDOR.x + CORRIDOR.w, ROOMS.executive.h);
    ctx.lineTo(CORRIDOR.x + CORRIDOR.w, CH);
    ctx.stroke();

    // Accent baseboards
    Object.values(ROOMS).forEach(room => {
      ctx.strokeStyle  = room.accentColor;
      ctx.lineWidth    = 2;
      ctx.globalAlpha  = 0.2;
      ctx.strokeRect(room.x + 3, room.y + 3, room.w - 6, room.h - 6);
      ctx.globalAlpha  = 1;
    });

    Object.values(ROOMS).forEach(room => {
      ctx.fillStyle = room.wallColor;
      ctx.fillRect(room.x, room.y, room.w, 8);
    });
  }

  // ── Furniture ─────────────────────────────────────────────────
  function drawFurniture(gameTime) {
    FURNITURE.forEach(item => {
      switch (item.type) {
        case 'table_exec':   drawExecTable(item);          break;
        case 'chair':        drawChair(item, false);       break;
        case 'chair_bottom': drawChair(item, true);        break;
        case 'credenza':     drawCredenza(item);           break;
        case 'plant':        drawPlant(item, gameTime);    break;
        case 'cubicle':      drawCubicle(item, gameTime);  break;
        case 'desk_open':    drawOpenDesk(item, gameTime); break;
        case 'whiteboard':   drawWhiteboard(item);         break;
        case 'couch':        drawCouch(item);              break;
        case 'server_rack':  drawServerRack(item,gameTime);break;
        case 'bookshelf':    drawBookshelf(item);              break;
        case 'podium':       drawPodium(item, gameTime);       break;
        case 'table_oval':   drawOvalTable(item);              break;
        case 'chair_vip':    drawVIPChair(item, false);        break;
        case 'chair_vip_b':  drawVIPChair(item, true);         break;
        case 'display_wall': drawDisplayWall(item, gameTime);  break;
      }
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawExecTable({ x, y, w, h }) {
    roundRect(x, y, w, h, 10);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#4A3580');
    g.addColorStop(1, '#2A1D50');
    ctx.fillStyle = g;
    ctx.fill();
    // Grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let gx = x + 20; gx < x + w - 10; gx += 22) {
      ctx.beginPath();
      ctx.moveTo(gx, y + 5);
      ctx.lineTo(gx, y + h - 5);
      ctx.stroke();
    }
    // Sheen
    roundRect(x + 6, y + 5, w - 12, h * 0.35, 7);
    ctx.fillStyle = 'rgba(200,180,255,0.06)';
    ctx.fill();
    // Edge trim
    roundRect(x, y, w, h, 10);
    ctx.strokeStyle = '#9B72FF';
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Name plates
    for (let i = 0; i < 6; i++) {
      const px = x + 30 + i * ((w - 60) / 5);
      roundRect(px - 18, y + h + 10, 36, 10, 3);
      ctx.fillStyle = '#6B4FA0';
      ctx.fill();
    }
  }

  function drawChair({ x, y, w, h }, bottom) {
    roundRect(x, y, w, h, 4);
    ctx.fillStyle = bottom ? '#2A2A3A' : '#1E1E2E';
    ctx.fill();
    ctx.strokeStyle = '#4A4A6A'; ctx.lineWidth = 1; ctx.stroke();
  }

  function drawCredenza({ x, y, w, h }) {
    roundRect(x, y, w, h, 5);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#3A2860'); g.addColorStop(1, '#1E1438');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + w / 2, y + 4); ctx.lineTo(x + w / 2, y + h - 4); ctx.stroke();
    [0.3, 0.7].forEach(t => {
      ctx.beginPath(); ctx.arc(x + w * t, y + h / 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#9B72FF'; ctx.fill();
    });
  }

  function drawPlant({ x, y, r }, gameTime) {
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.8, r * 0.55, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5C3010'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.5, r * 0.45, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2A1000'; ctx.fill();
    const sway = Math.sin(gameTime * 0.8) * 1.5;
    [[0,-r,1],[-r*0.7,-r*0.5,0.85],[r*0.7,-r*0.5,0.85]].forEach(([lx,ly,sz]) => {
      ctx.beginPath(); ctx.ellipse(x+lx+sway, y+ly, r*sz*0.5, r*sz*0.7, lx/r*0.3, 0, Math.PI*2);
      const lg = ctx.createRadialGradient(x+lx,y+ly,0,x+lx,y+ly,r*0.7);
      lg.addColorStop(0,'#4CAF50'); lg.addColorStop(1,'#1B5E20');
      ctx.fillStyle = lg; ctx.fill();
    });
  }

  function drawCubicle({ x, y, w, h }, gameTime) {
    roundRect(x, y, w, h, 4);
    ctx.fillStyle = '#2A3040'; ctx.fill();
    ctx.strokeStyle = '#3A4A5A'; ctx.lineWidth = 1; ctx.stroke();
    // Monitor
    const mx = x + w / 2 - 18, my = y - 28;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + w/2 - 4, y - 6, 8, 8); ctx.fillRect(x + w/2 - 10, y - 1, 20, 4);
    roundRect(mx, my, 36, 26, 3); ctx.fillStyle = '#111'; ctx.fill();
    roundRect(mx+2, my+2, 32, 22, 2);
    const sg = ctx.createLinearGradient(mx, my, mx, my+24);
    sg.addColorStop(0,'rgba(20,40,120,0.9)'); sg.addColorStop(1,'rgba(10,20,70,0.9)');
    ctx.fillStyle = sg; ctx.fill();
    ctx.fillStyle = 'rgba(100,200,255,0.6)';
    for (let i = 0; i < 4; i++) ctx.fillRect(mx+4, my+5+i*5, 8+(x+y+i*7)%18, 1.5);
    roundRect(x+15, y+h-12, 40, 8, 2); ctx.fillStyle = '#1a1a1a'; ctx.fill();
  }

  function drawOpenDesk({ x, y, w, h }, gameTime) {
    roundRect(x, y, w, h, 5);
    const g = ctx.createLinearGradient(x, y, x, y+h);
    g.addColorStop(0,'#2A3A4A'); g.addColorStop(1,'#1A2530');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#3A5060'; ctx.lineWidth = 1; ctx.stroke();
    // Monitor
    const mx = x + w*0.3, my = y-25;
    roundRect(mx, my, 38, 27, 3); ctx.fillStyle = '#111'; ctx.fill();
    roundRect(mx+2, my+2, 34, 23, 2);
    const sg = ctx.createLinearGradient(mx, my, mx+38, my+27);
    sg.addColorStop(0,'rgba(30,80,200,0.85)'); sg.addColorStop(1,'rgba(80,30,160,0.85)');
    ctx.fillStyle = sg; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    [0,4,8,12,16,20].forEach((bx,i) => {
      const bh = 4+((x+i*4)%9); ctx.fillRect(mx+6+bx, my+24-bh, 3, bh);
    });
    // Notepad
    roundRect(x+w*0.65, y+5, 28, 35, 2); ctx.fillStyle = '#FFFDE7'; ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.12)';
    for(let i=0;i<5;i++) ctx.fillRect(x+w*0.65+4, y+11+i*5, 20, 1);
  }

  function drawWhiteboard({ x, y, w, h }) {
    roundRect(x-4, y-4, w+8, h+8, 3); ctx.fillStyle = '#555'; ctx.fill();
    roundRect(x, y, w, h, 2); ctx.fillStyle = '#F0F0F8'; ctx.fill();
    ctx.strokeStyle = '#3A6ECC'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x+4,y+h-20); ctx.lineTo(x+10,y+h-40);
    ctx.lineTo(x+16,y+h-30); ctx.lineTo(x+22,y+h-55); ctx.stroke();
    ctx.fillStyle='rgba(60,100,255,0.12)'; ctx.fillRect(x+2,y+10,w-4,8);
    ctx.fillStyle='#1040A0'; ctx.font='5px Arial'; ctx.textAlign='left';
    ctx.fillText('CURRICULUM',x+4,y+17);
    roundRect(x-2, y+h, w+4, 6, 2); ctx.fillStyle='#888'; ctx.fill();
  }

  function drawCouch({ x, y, w, h }) {
    roundRect(x, y, w, h*0.4, 5); ctx.fillStyle='#2A4060'; ctx.fill();
    [[x,h*0.35],[x+w/2+2,h*0.35]].forEach(([cx]) => {
      roundRect(cx, y+h*0.35, w/2-2, h*0.65, 4);
      ctx.fillStyle='#3A5878'; ctx.fill();
      ctx.strokeStyle='#4A7090'; ctx.lineWidth=1; ctx.stroke();
    });
    [x,x+w-8].forEach(ax => {
      roundRect(ax, y, 8, h, 4); ctx.fillStyle='#1A2E40'; ctx.fill();
    });
  }

  function drawServerRack({ x, y, w, h }, gameTime) {
    roundRect(x, y, w, h, 3); ctx.fillStyle='#0D1520'; ctx.fill();
    ctx.strokeStyle='#4ECDC4'; ctx.lineWidth=1; ctx.stroke();
    for (let uy = y+5; uy < y+h-5; uy+=12) {
      roundRect(x+2, uy, w-4, 9, 2); ctx.fillStyle='#151F30'; ctx.fill();
      ctx.beginPath(); ctx.arc(x+5, uy+4.5, 2, 0, Math.PI*2);
      ctx.fillStyle = Math.sin(gameTime*2+uy)>0.3 ? '#4ECDC4' : '#0A2020';
      ctx.fill();
    }
  }

  function drawBookshelf({ x, y, w, h }) {
    roundRect(x, y, w, h, 3);
    ctx.fillStyle = '#1A1A2A'; ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
    // Books (colorful spines)
    const bookColors = ['#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00ACC1','#F4511E'];
    let bx = x + 2;
    while (bx < x + w - 4) {
      const bw = 6 + Math.floor((bx * 3) % 8);
      const bh = h * 0.6 + Math.floor((bx * 7) % (h * 0.3));
      ctx.fillStyle = bookColors[Math.floor(bx * 13) % bookColors.length];
      ctx.fillRect(bx, y + h - bh - 2, bw, bh);
      bx += bw + 1;
    }
  }

  function drawPodium({ x, y, w, h }, gameTime) {
    // Lectern / podium for presentations
    roundRect(x, y, w, h, 4);
    const g = ctx.createLinearGradient(x, y, x, y+h);
    g.addColorStop(0,'#3A2860'); g.addColorStop(1,'#1E1438');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#9B72FF'; ctx.lineWidth = 1.5; ctx.stroke();
    // Screen/laptop glow on top
    roundRect(x+5, y+3, w-10, 12, 2);
    const sg = ctx.createLinearGradient(x+5, y+3, x+5, y+15);
    sg.addColorStop(0,'rgba(80,60,200,0.9)'); sg.addColorStop(1,'rgba(40,30,120,0.9)');
    ctx.fillStyle = sg; ctx.fill();
    // Pulsing ready light
    const pulse = 0.5 + Math.sin(gameTime * 2) * 0.5;
    ctx.beginPath(); ctx.arc(x+w-8, y+h-8, 3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(100,200,255,${pulse})`;
    ctx.fill();
  }

  // ── Office of Greg — VIP Furniture ───────────────────────────

  function drawOvalTable({ x, y, w, h }) {
    const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
    // Drop shadow
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy + 8, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000'; ctx.fill();
    ctx.restore();
    // Surface gradient
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.35, 0, cx, cy, rx);
    g.addColorStop(0,   '#302030');
    g.addColorStop(0.5, '#1C1428');
    g.addColorStop(1,   '#0E0B14');
    ctx.fillStyle = g; ctx.fill();
    // Wood grain (clipped to ellipse)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let gx = x; gx < x + w; gx += 16) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + 8, y + h); ctx.stroke();
    }
    ctx.restore();
    // Gold trim ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.72; ctx.stroke(); ctx.globalAlpha = 1;
    // Inner sheen
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.18, cy - ry * 0.2, rx * 0.52, ry * 0.38, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();
    // Name plates (6 around rim)
    const seats = [
      [-0.48, -0.95],[ 0, -1.06],[0.48, -0.95],
      [-0.48,  0.95],[ 0,  1.06],[0.48,  0.95]
    ];
    seats.forEach(([px, py]) => {
      const npx = cx + px * rx * 0.82;
      const npy = cy + py * ry * 0.78;
      ctx.save();
      roundRect(npx - 15, npy - 4, 30, 8, 2);
      ctx.fillStyle = '#D4AF37'; ctx.globalAlpha = 0.28; ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    });
  }

  function drawVIPChair({ x, y, w, h }, bottom) {
    const brH = Math.round(h * 0.45);
    const seatH = h - brH - 2;
    const brY  = bottom ? y + seatH + 2 : y;
    const seatY = bottom ? y : y + brH + 2;
    // Backrest
    roundRect(x, brY, w, brH, 4);
    const g1 = ctx.createLinearGradient(x, brY, x + w, brY);
    g1.addColorStop(0, '#221508'); g1.addColorStop(0.5, '#3A2518'); g1.addColorStop(1, '#221508');
    ctx.fillStyle = g1; ctx.fill();
    ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55; ctx.stroke(); ctx.globalAlpha = 1;
    // Seat cushion
    roundRect(x + 1, seatY, w - 2, seatH, 3);
    const g2 = ctx.createLinearGradient(x, seatY, x, seatY + seatH);
    g2.addColorStop(0, '#4A3520'); g2.addColorStop(1, '#281808');
    ctx.fillStyle = g2; ctx.fill();
    // Tuft button
    ctx.beginPath();
    ctx.arc(x + w / 2, seatY + seatH / 2, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#D4AF37'; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
  }

  function drawDisplayWall({ x, y, w, h }, gameTime) {
    // Mounting frame
    roundRect(x - 4, y - 4, w + 8, h + 8, 3);
    ctx.fillStyle = '#111'; ctx.fill();
    // Screen background
    roundRect(x, y, w, h, 2);
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, '#0A0A22'); bg.addColorStop(0.5, '#06060E'); bg.addColorStop(1, '#0A0A22');
    ctx.fillStyle = bg; ctx.fill();
    // Clipped content
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    // Animated bar chart columns
    const cols = 4;
    for (let i = 0; i < cols; i++) {
      const bx = x + 2 + i * Math.floor((w - 4) / cols);
      const bw = Math.floor((w - 4) / cols) - 1;
      const bh = 16 + Math.round((Math.sin(gameTime * 1.4 + i * 0.9) * 0.5 + 0.5) * (h - 36));
      const by = y + h - 8 - bh;
      const bg2 = ctx.createLinearGradient(0, by, 0, by + bh);
      bg2.addColorStop(0, '#D4AF37'); bg2.addColorStop(0.5, 'rgba(212,175,55,0.35)'); bg2.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = bg2;
      ctx.fillRect(bx, by, bw, bh);
    }
    // Scrolling ticker text
    const tickers = ['NVDA','MSFT','GOOGL','AAPL','TSLA','META','AMZN','BRK'];
    const scroll  = (gameTime * 10) % (tickers.length * 13);
    ctx.fillStyle = 'rgba(212,175,55,0.75)';
    ctx.font = '4px monospace'; ctx.textAlign = 'left';
    tickers.forEach((t, i) => {
      const ly = ((y + 8 + i * 13 - scroll + h) % h) + y;
      if (ly > y + 2 && ly < y + h - 2) ctx.fillText(t, x + 2, ly);
    });
    ctx.restore();
    // Edge glow
    ctx.save();
    ctx.globalAlpha = 0.07;
    const glow = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w * 1.2);
    glow.addColorStop(0, '#D4AF37'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 14, y - 10, w + 28, h + 20);
    ctx.restore();
    // Status LED
    const pulse = 0.38 + Math.sin(gameTime * 1.8) * 0.28;
    ctx.beginPath(); ctx.arc(x + w - 3, y + h + 5, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,175,55,${pulse})`; ctx.fill();
  }

  // ── Room Labels ───────────────────────────────────────────────
  function drawRoomLabels() {
    Object.values(ROOMS).forEach(room => {
      ctx.save();
      ctx.font        = 'bold 11px "Segoe UI", Arial';
      ctx.fillStyle   = room.labelColor;
      ctx.textAlign   = 'left';
      ctx.globalAlpha = 0.8;
      ctx.fillText(room.name.toUpperCase(), room.x + 12, room.y + 20);
      ctx.globalAlpha = 1;
      ctx.restore();
    });
    ctx.save();
    ctx.font      = '9px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('ACADEMIC COMMONS', CORRIDOR.x + CORRIDOR.w / 2, CH - 15);
    ctx.restore();
  }

  // ── Social Link Lines ─────────────────────────────────────────
  function drawSocialLinks(agents, socialPairs) {
    const drawn = new Set();
    socialPairs.forEach((partnerId, agentId) => {
      const key = [agentId, partnerId].sort().join('|');
      if (drawn.has(key)) return;
      drawn.add(key);
      const a = agents.find(ag => ag.id === agentId);
      const b = agents.find(ag => ag.id === partnerId);
      if (!a || !b || a.onPTO || b.onPTO) return;
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(240,192,64,0.35)';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + (a.bobOffset || 0));
      ctx.lineTo(b.x, b.y + (b.bobOffset || 0));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });
  }

  // ── Celebration Particles ─────────────────────────────────────
  function drawParticles(agent) {
    if (!agent.particles?.length) return;
    agent.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });
  }

  // ── PTO Placeholder ───────────────────────────────────────────
  function drawPTOPlaceholder(agent, gameTime) {
    // Ghost silhouette at last known position
    const x = agent.targetX || CW / 2;
    const y = agent.targetY || CH / 2;

    ctx.save();
    ctx.globalAlpha = 0.18 + Math.sin(gameTime * 1.2) * 0.06;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#4ecdc4';
    ctx.fill();
    ctx.font         = '12px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha  = 0.4;
    ctx.fillText('🏖️', x, y);
    ctx.globalAlpha  = 1;
    ctx.restore();
  }

  // ── Agent Shadow ──────────────────────────────────────────────
  function drawAgentShadow(agent) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.ellipse(agent.x, agent.y + 18, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  }

  // ── Agent Drawing ─────────────────────────────────────────────
  function drawAgent(agent, isSelected, gameTime) {
    const { x, color, emoji, name, company, state, walkCycle, humanState } = agent;
    const bobOffset = agent.bobOffset || 0;
    const y = agent.y + bobOffset;

    // Walk squash/stretch
    let scaleX = 1, scaleY = 1;
    if (state === 'walking') {
      const b = Math.sin((walkCycle || 0) * Math.PI * 2);
      scaleY = 1 - b * 0.06;
      scaleX = 1 + b * 0.04;
    }
    // Celebrating: extra bounce scale
    if (humanState === 'celebrating') {
      const cb = Math.abs(Math.sin(gameTime * 6 + (agent.bobPhase || 0)));
      scaleX = 1 + cb * 0.12;
      scaleY = 1 - cb * 0.08;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);

    // Selection ring
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = '#58a6ff';
      ctx.shadowBlur  = 18;
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Body gradient
    const bodyGrad = ctx.createRadialGradient(-6, -6, 0, 0, 0, 20);
    const base     = color || '#555';
    bodyGrad.addColorStop(0,   lighten(base, 0.4));
    bodyGrad.addColorStop(0.6, base);
    bodyGrad.addColorStop(1,   darken(base, 0.4));
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Behavior tint overlay
    const tint = HB_TINT[humanState];
    if (tint) {
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${tint[3]})`;
      ctx.fill();
    }

    // Highlight
    ctx.beginPath();
    ctx.arc(-5, -5, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.11)';
    ctx.fill();

    // Emoji face
    ctx.font         = '14px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);

    // Stressed shake
    if (humanState === 'stressed') {
      ctx.translate(Math.sin(gameTime * 18) * 1.5, 0);
    }

    ctx.restore();

    // Name tag (unscaled)
    drawNameTag(agent, x, y);

    // Status badge
    drawStatusBadge(agent, x, y, gameTime);

    // Thinking dots
    if (state === 'thinking') {
      for (let i = 0; i < 3; i++) {
        const dotY = y - 38 + Math.sin(gameTime * 4 + i * 1.0) * 4;
        ctx.beginPath();
        ctx.arc(x - 7 + i * 7, dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();
      }
    }
  }

  function drawNameTag(agent, x, y) {
    ctx.save();
    ctx.font         = 'bold 9px "Segoe UI", Arial';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    const nameW = ctx.measureText(agent.name).width + 10;
    const tagX  = x - nameW / 2;
    const tagY  = y + 20;
    roundRect(tagX, tagY, nameW, 13, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fill();
    ctx.fillStyle = '#eee'; ctx.fillText(agent.name, x, tagY + 2);
    ctx.font = '8px Arial'; ctx.fillStyle = 'rgba(150,200,255,0.8)';
    ctx.fillText(agent.company, x, tagY + 14);
    ctx.restore();
  }

  function drawStatusBadge(agent, x, y, gameTime) {
    const hs = agent.humanState;
    if (!hs || hs === 'normal' || hs === 'arriving') return;
    const badge = HB_BADGE[hs];
    if (!badge) return;

    const bx = x + 12;
    const by = y - 32 + Math.sin(gameTime * 2) * 2;

    ctx.save();
    // Badge background circle
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fillStyle = badge.color + '33';
    ctx.fill();
    ctx.strokeStyle = badge.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Icon
    ctx.font = '10px serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge.icon, bx, by);
    ctx.restore();
  }

  // ── Speech Bubble ─────────────────────────────────────────────
  function drawSpeechBubble(agent) {
    const { x, y, speechBubble } = agent;
    if (!speechBubble?.text) return;

    ctx.save();
    ctx.font = '9px "Segoe UI", Arial';
    const tw  = Math.min(ctx.measureText(speechBubble.text).width, 140);
    const bw  = tw + 14;
    const bh  = 18;
    const bx  = x - bw / 2;
    const by  = y + (agent.bobOffset || 0) - 60;

    const age = speechBubble.age || 0;
    const max = speechBubble.maxAge || 3;
    let alpha = 1;
    if (age < 0.25)      alpha = age / 0.25;
    else if (age > max - 0.4) alpha = (max - age) / 0.4;
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    roundRect(bx, by, bw, bh, 7);
    ctx.fillStyle   = 'rgba(255,255,255,0.93)'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 5, by + bh); ctx.lineTo(x, by + bh + 7); ctx.lineTo(x + 5, by + bh);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.fill();

    ctx.fillStyle    = '#111';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(speechBubble.text, x, by + bh / 2, tw);
    ctx.restore();
  }

  // ── Hit Test ──────────────────────────────────────────────────
  function getAgentAtCanvasPos(cx, cy, agents) {
    const gp = canvasToGame(cx, cy);
    for (let i = agents.length - 1; i >= 0; i--) {
      const ag = agents[i];
      if (ag.onPTO) continue;
      const dx = gp.x - ag.x, dy = gp.y - ag.y;
      if (Math.sqrt(dx*dx + dy*dy) < 22) return ag;
    }
    return null;
  }

  function getGamePos(cx, cy) { return canvasToGame(cx, cy); }

  // ── Color Helpers ─────────────────────────────────────────────
  function lighten(hex, amt) {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.min(255,r+amt*255|0)},${Math.min(255,g+amt*255|0)},${Math.min(255,b+amt*255|0)})`;
  }
  function darken(hex, amt) {
    const [r,g,b] = hexToRgb(hex);
    return `rgb(${Math.max(0,r-amt*255|0)},${Math.max(0,g-amt*255|0)},${Math.max(0,b-amt*255|0)})`;
  }
  function hexToRgb(hex) {
    const h = hex.replace('#','');
    if (h.length===3) return [parseInt(h[0]+h[0],16),parseInt(h[1]+h[1],16),parseInt(h[2]+h[2],16)];
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
  }

  return { init, render, resize, getAgentAtCanvasPos, getGamePos };
})();
