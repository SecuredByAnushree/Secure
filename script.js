(function () {
  const startLessonBtn = document.getElementById('startLessonBtn');
  const quizArea = document.getElementById('quizArea');
  const progressBar = document.getElementById('progressBar');
  const statusText = document.getElementById('statusText');
  const sideProgress = document.getElementById('sideProgress');
  const quizScore = document.getElementById('quizScore');
  const finishBtn = document.getElementById('finishBtn');
  const restartBtn = document.getElementById('restartBtn');
  const reportBtn = document.getElementById('reportBtn');
  const certArea = document.getElementById('certArea');

  const STORAGE_KEY = 'securestart:v1';

  // Initial state
  let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!state.modules) state.modules = { m1: { completed: false, score: 0 } };
  updateUI();

  startLessonBtn.addEventListener('click', () => {
    // Show a micro-lesson as an alert-like modal (kept simple)
    const lesson = `Phishing micro-lesson (2 min):
1) Urgency + requests for money or credentials = red flag.
2) Check sender's email; hover to preview links.
3) When in doubt, report using 'Report Phish'.\n\n(Click OK to open quiz.)`;
    alert(lesson);
    quizArea.hidden = false;
    statusText.textContent = 'In progress — take the quiz';
    // Scroll quiz into view
    document.getElementById('q1').scrollIntoView({ behavior: 'smooth' });
  });

  // Attach click handlers to options
  document.querySelectorAll('.opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentQ = btn.closest('.q');
      if (parentQ.dataset.answered === 'true') return; // Single attempt
      const correct = btn.dataset.correct === 'true';
      parentQ.dataset.answered = 'true';
      if (correct) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
        // Reveal correct option
        const opts = parentQ.querySelectorAll('.opt');
        opts.forEach(o => { if (o.dataset.correct === 'true') o.classList.add('correct'); });
      }
      // Update score
      updateScore();
    });
  });

  function updateScore() {
    const qs = document.querySelectorAll('.q');
    let score = 0;
    qs.forEach(q => {
      const answered = q.dataset.answered === 'true';
      if (answered) {
        const correctOpt = q.querySelector('.opt.correct');
        if (correctOpt) score++;
      }
    });
    quizScore.textContent = `Score: ${score}/3`;
    state.modules.m1.score = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  finishBtn.addEventListener('click', () => {
    // Require that all questions are attempted; if not, warn
    const unanswered = [...document.querySelectorAll('.q')].some(q => q.dataset.answered !== 'true');
    if (unanswered) {
      if (!confirm('Some questions are unanswered. Submit anyway?')) return;
    }
    // Mark module complete if score >= 2
    if (state.modules.m1.score >= 2) {
      state.modules.m1.completed = true;
      alert('Well done — module complete! Certificate issued.');
      certArea.textContent = 'Certificate: Module 1 — Recognizing Phishing (demo)';
    } else {
      alert('You scored below threshold. Recommend re-reading the lesson.');
    }
    // Update progress visuals
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateUI();
  });

  restartBtn.addEventListener('click', () => {
    if (!confirm('Reset progress for demo?')) return;
    state = { modules: { m1: { completed: false, score: 0 } } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Reset UI
    document.querySelectorAll('.q').forEach(q => {
      q.dataset.answered = 'false';
      q.querySelectorAll('.opt').forEach(o => o.className = 'opt');
    });
    quizScore.textContent = 'Score: 0/3';
    certArea.textContent = 'Complete module to earn certificate';
    updateUI();
  });

  reportBtn.addEventListener('click', () => {
    // Simulate reporting phish: store event and show thanks
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY + '_events') || '[]');
    events.push({ type: 'report_phish', ts: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY + '_events', JSON.stringify(events));
    alert('Thanks — the email has been reported. Good security behavior!');
    // Small visual reward
    reportBtn.textContent = 'Reported ✓';
    setTimeout(() => reportBtn.textContent = 'Report Phish', 1800);
  });

  function updateUI() {
    const completed = state.modules.m1.completed;
    const score = state.modules.m1.score || 0;
    progressBar.style.width = completed ? '100%' : (score / 3 * 100) + '%';
    statusText.textContent = completed ? 'Completed' : (score > 0 ? `In progress — score ${score}/3` : 'Not started');
    sideProgress.textContent = (completed ? '1 of 1 modules' : '0 of 1 modules');
  }

})();
