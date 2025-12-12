document.addEventListener('DOMContentLoaded', () => {
  const controls = document.querySelectorAll('.skills-controls [data-view]');
  const progressView = document.querySelector('.skills-progress');
  const cloudView = document.querySelector('.skills-cloud');
  const progressBars = document.querySelectorAll('.skills-progress .progress');

  // Initialize: set progress widths to 0, then animate in
  function resetAndAnimateProgress() {
    // reset
    progressBars.forEach(bar => {
      bar.classList.remove('animate');
      bar.style.width = '0%';
    });
    // allow reflow then animate
    requestAnimationFrame(() => {
      progressBars.forEach(bar => {
        const percent = bar.closest('.skill-item')?.dataset?.percent || bar.dataset?.percent || 0;
        bar.classList.add('animate');
        bar.style.width = percent + '%';
      });
    });
  }

  // Toggle views
  controls.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = btn.dataset.view;
      controls.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (view === 'progress') {
        progressView.setAttribute('aria-hidden', 'false');
        cloudView.setAttribute('aria-hidden', 'true');
        progressView.style.display = '';
        cloudView.style.display = 'none';
        resetAndAnimateProgress();
      } else {
        progressView.setAttribute('aria-hidden', 'true');
        cloudView.setAttribute('aria-hidden', 'false');
        progressView.style.display = 'none';
        cloudView.style.display = '';
      }
    });
  });

  // Improve cloud tag interaction: prevent fading and add selected state
  const cloudTags = document.querySelectorAll('.skills-cloud .skill');
  cloudTags.forEach(tag => {
    tag.setAttribute('role', 'button');
    tag.setAttribute('tabindex', '0');
    tag.addEventListener('click', () => {
      const selected = tag.classList.toggle('selected');
      tag.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    tag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const selected = tag.classList.toggle('selected');
        tag.setAttribute('aria-pressed', selected ? 'true' : 'false');
      }
    });
  });

  // initial state
  resetAndAnimateProgress();
  // show progress view by default
  if (cloudView) cloudView.style.display = 'none';
});
