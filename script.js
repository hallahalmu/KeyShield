// ── Particles ──────────────────────────────────────────
const pContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.cssText = `
    left: ${Math.random() * 100}%;
    animation-duration: ${6 + Math.random() * 12}s;
    animation-delay: ${Math.random() * 10}s;
    --dx: ${(Math.random() - 0.5) * 200}px;
    width: ${Math.random() > 0.7 ? '3px' : '2px'};
    height: ${Math.random() > 0.7 ? '3px' : '2px'};
    background: ${Math.random() > 0.5 ? '#00a8ff' : '#00fff7'};
  `;
  pContainer.appendChild(p);
}

// ── Common passwords list ───────────────────────────────
const commonPasswords = [
  'password','123456','12345678','qwerty','abc123','monkey','1234567',
  'letmein','trustno1','dragon','baseball','iloveyou','master','sunshine',
  'ashley','bailey','passw0rd','shadow','123123','654321','superman','qazwsx',
  'michael','football','password1','password123','admin','welcome','login',
  'hello','qwerty123','111111','000000','1q2w3e4r','pass','pass123',
  'محمد','احمد','12345','مرحبا','كلمة','سعودي','admin123'
];

// ── Entropy calculation ─────────────────────────────────
function calcEntropy(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  if (pool === 0) return 0;
  return Math.round(pw.length * Math.log2(pool));
}

// ── Crack time estimator ────────────────────────────────
function crackTime(bits) {
  const guessesPerSec = 1e10;
  const seconds = Math.pow(2, bits) / guessesPerSec;
  if (seconds < 1) return 'أقل من ثانية ⚠️';
  if (seconds < 60) return `${Math.round(seconds)} ثانية`;
  if (seconds < 3600) return `${Math.round(seconds/60)} دقيقة`;
  if (seconds < 86400) return `${Math.round(seconds/3600)} ساعة`;
  if (seconds < 2592000) return `${Math.round(seconds/86400)} يوم`;
  if (seconds < 31536000) return `${Math.round(seconds/2592000)} شهر`;
  if (seconds < 3153600000) return `${Math.round(seconds/31536000)} سنة`;
  if (seconds < 3.15e14) return `${Math.round(seconds/3.15e9)} ألف سنة`;
  return 'ملايين السنين 🛡️';
}

// ── Main analysis function ──────────────────────────────
function analyze(pw) {
  const len = pw.length;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSym = /[^a-zA-Z0-9\u0600-\u06FF]/.test(pw);
  const hasArabic = /[\u0600-\u06FF]/.test(pw);
  const isCommon = commonPasswords.includes(pw.toLowerCase());
  const isRepeat = /(.)\1{3,}/.test(pw);
  const isSequential = /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|qwe|wer|ert|rty)/i.test(pw);
  const hasMixedCase = hasUpper && hasLower;

  const tips = [];
  let score = 0;

  if (len === 0) return null;

  if (len >= 8) score++;
  if (len >= 12) score++;
  if (len >= 16) score++;
  if (hasNum) score++;
  if (hasSym) score++;
  if (hasMixedCase) score++;
  if (!isCommon) score += 0.5;
  if (!isRepeat) score += 0.5;
  if (!isSequential) score += 0.5;

  if (len < 8) tips.push({ type: 'warn', icon: '⚠️', text: 'كلمة المرور قصيرة جداً — يفضل 12 حرف على الأقل' });
  else if (len < 12) tips.push({ type: 'warn', icon: '📏', text: 'الطول متوسط — زيادة الأحرف تقوي الحماية بشكل كبير' });
  else tips.push({ type: 'ok', icon: '✅', text: `الطول جيد (${len} حرف)` });

  if (!hasSym) tips.push({ type: 'warn', icon: '⚡', text: 'لا توجد رموز خاصة — أضف (@, #, !, $, %) لزيادة التعقيد' });
  else tips.push({ type: 'ok', icon: '⚡', text: 'تحتوي على رموز خاصة — ممتاز!' });

  if (!hasNum) tips.push({ type: 'warn', icon: '🔢', text: 'لا توجد أرقام — أضف أرقام لتقوية كلمة المرور' });
  else tips.push({ type: 'ok', icon: '🔢', text: 'تحتوي على أرقام' });

  if (!hasMixedCase && !hasArabic) tips.push({ type: 'warn', icon: '🔠', text: 'استخدم حروفاً كبيرة وصغيرة معاً (A-Z + a-z)' });
  else if (hasMixedCase) tips.push({ type: 'ok', icon: '🔠', text: 'أحرف كبيرة وصغيرة — جيد!' });

  if (isCommon) tips.push({ type: 'warn', icon: '🚨', text: 'كلمة المرور شائعة جداً — من أول ما يجربه الهكرز!' });
  if (isRepeat) tips.push({ type: 'warn', icon: '🔁', text: 'تكرار نفس الحرف — يسهّل التخمين' });
  if (isSequential) tips.push({ type: 'warn', icon: '🎯', text: 'تسلسل متوقع (123, abc) — يجعلها أسهل للكسر' });

  const entropy = calcEntropy(pw);
  const crack = crackTime(entropy);
  const maxScore = 7;
  const pct = Math.min(100, Math.round((score / maxScore) * 100));

  let level, color;
  if (pct < 20) { level = 'CRITICAL'; color = '#ff2244'; }
  else if (pct < 40) { level = 'WEAK'; color = '#ff5500'; }
  else if (pct < 60) { level = 'FAIR'; color = '#ff8800'; }
  else if (pct < 80) { level = 'STRONG'; color = '#00cc66'; }
  else { level = 'FORTRESS'; color = '#00fff7'; }

  return { score, pct, level, color, tips, entropy, crack, len, hasNum, hasSym, hasMixedCase };
}

// ── UI update function ──────────────────────────────────
function update() {
  const pw = document.getElementById('pwInput').value;
  const result = analyze(pw);

  const badge = document.getElementById('strengthBadge');
  const bar = document.getElementById('barFill');
  const entropyVal = document.getElementById('entropyVal');
  const crackVal = document.getElementById('crackVal');
  const tipsList = document.getElementById('tipsList');
  const tipsSection = document.getElementById('tipsSection');

  if (!result) {
    badge.textContent = '— —';
    badge.style.color = '#333';
    badge.style.borderColor = '#333';
    bar.style.width = '0%';
    bar.style.background = '#333';
    entropyVal.textContent = '——';
    crackVal.textContent = '——';
    tipsSection.style.display = 'none';
    for (let i = 0; i < 5; i++) {
      document.getElementById(`seg${i}`).style.background = 'var(--dim)';
      document.getElementById(`seg${i}`).style.boxShadow = 'none';
    }
    ['len','sym','num','mix'].forEach(s => {
      document.getElementById(`stat-${s}`).className = 'stat-box';
    });
    return;
  }

  badge.textContent = result.level;
  badge.style.color = result.color;
  badge.style.borderColor = result.color;
  badge.style.textShadow = `0 0 10px ${result.color}`;

  bar.style.width = result.pct + '%';
  bar.style.background = `linear-gradient(90deg, ${result.color}99, ${result.color})`;
  bar.style.boxShadow = `0 0 15px ${result.color}66`;

  const segCount = Math.round(result.pct / 20);
  for (let i = 0; i < 5; i++) {
    const seg = document.getElementById(`seg${i}`);
    if (i < segCount) {
      seg.style.background = result.color;
      seg.style.boxShadow = `0 0 8px ${result.color}`;
    } else {
      seg.style.background = 'var(--dim)';
      seg.style.boxShadow = 'none';
    }
  }

  const statLen = document.getElementById('stat-len');
  statLen.className = 'stat-box ' + (result.len >= 12 ? 'active' : 'inactive');
  statLen.querySelector('.stat-icon').textContent = result.len >= 12 ? '📏' : '📐';

  document.getElementById('stat-sym').className = 'stat-box ' + (result.hasSym ? 'active' : 'inactive');
  document.getElementById('stat-num').className = 'stat-box ' + (result.hasNum ? 'active' : 'inactive');
  document.getElementById('stat-mix').className = 'stat-box ' + (result.hasMixedCase ? 'active' : 'inactive');

  entropyVal.textContent = result.entropy + ' bits';
  crackVal.textContent = result.crack;

  tipsSection.style.display = 'block';
  tipsList.innerHTML = result.tips.map(t =>
    `<div class="tip ${t.type}">
      <span class="tip-icon">${t.icon}</span>
      <span>${t.text}</span>
    </div>`
  ).join('');
}

// ── Event listeners ─────────────────────────────────────
document.getElementById('pwInput').addEventListener('input', update);

document.getElementById('toggleBtn').addEventListener('click', () => {
  const inp = document.getElementById('pwInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});