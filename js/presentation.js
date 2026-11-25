/**
 * ECG Guardian · Interactive Web Presentation Engine
 * Powered by Anime.js choreography + Three.js reactive telemetry stage
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentIndex = 0;
  let wheelLocked = false;

  const progressFill = document.getElementById('topProgressFill');
  const headerSectionLabel = document.getElementById('headerSectionLabel');
  const counterCurrent = document.getElementById('counterCurrent');
  const counterTotal = document.getElementById('counterTotal');

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnStartDeck = document.getElementById('btnStartDeck');
  const btnOverview = document.getElementById('btnOverview');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnExportPdf = document.getElementById('btnExportPdf');

  const slideRail = document.getElementById('slideRail');
  const overviewOverlay = document.getElementById('overviewOverlay');
  const closeOverview = document.getElementById('closeOverview');
  const overviewGrid = document.getElementById('overviewGrid');

  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');

  if (counterTotal) counterTotal.textContent = String(totalSlides).padStart(2, '0');

  // Build Right Slide Rail & Overview Grid
  slides.forEach((slide, index) => {
    const titleEl = slide.querySelector('.slide-h2') || slide.querySelector('.hero-title');
    const catEl = slide.dataset.category || 'Overview';
    const cleanTitle = titleEl ? titleEl.innerText.replace(/\s+/g, ' ').trim() : `Slide ${index + 1}`;

    if (slideRail) {
      const dot = document.createElement('button');
      dot.className = `rail-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('data-title', `${String(index + 1).padStart(2, '0')} · ${cleanTitle}`);
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      slideRail.appendChild(dot);
    }

    if (overviewGrid) {
      const item = document.createElement('div');
      item.className = `overview-item ${index === 0 ? 'active' : ''}`;
      item.innerHTML = `
        <div class="ov-num">${String(index + 1).padStart(2, '0')} · ${catEl.toUpperCase()}</div>
        <div class="ov-title">${cleanTitle}</div>
      `;
      item.addEventListener('click', () => {
        goToSlide(index);
        toggleOverview(false);
      });
      overviewGrid.appendChild(item);
    }
  });

  // Continuous SVG ECG Pulse Drawing Animation on Slide 1
  const ecgLine = document.getElementById('heroEcgLine');
  if (ecgLine && typeof anime !== 'undefined') {
    const pathLen = ecgLine.getTotalLength();
    ecgLine.style.strokeDasharray = `${pathLen * 0.45} ${pathLen * 0.55}`;
    anime({
      targets: ecgLine,
      strokeDashoffset: [pathLen, 0],
      easing: 'linear',
      duration: 2400,
      loop: true
    });
  }

  // Animate Slide Elements with Anime.js
  function animateSlideIn(slideEl, direction = 1) {
    const targets = slideEl.querySelectorAll('.anim-item');
    if (!targets.length || typeof anime === 'undefined') return;

    anime.remove(targets);
    anime({
      targets,
      translateY: [direction >= 0 ? 22 : -22, 0],
      opacity: [0, 1],
      scale: [0.985, 1],
      duration: 680,
      delay: anime.stagger(65, { start: 40 }),
      easing: 'easeOutExpo'
    });

    // Numeric roll-up for elements with data-count
    const counters = slideEl.querySelectorAll('[data-count]');
    counters.forEach((el) => {
      const endVal = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      anime.remove(obj);
      anime({
        targets: obj,
        val: endVal,
        duration: 1100,
        delay: 180,
        easing: 'easeOutQuart',
        update() {
          el.textContent = obj.val.toFixed(decimals) + suffix;
        }
      });
    });
  }

  function goToSlide(newIndex) {
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= totalSlides) newIndex = totalSlides - 1;
    const direction = newIndex >= currentIndex ? 1 : -1;

    slides.forEach((s, i) => {
      s.classList.toggle('active', i === newIndex);
    });

    currentIndex = newIndex;

    // Update UI indicators
    if (counterCurrent) counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
    if (progressFill) progressFill.style.width = `${((currentIndex + 1) / totalSlides) * 100}%`;
    if (headerSectionLabel) {
      headerSectionLabel.textContent = (slides[currentIndex].dataset.category || 'Overview').toUpperCase();
    }

    if (slideRail) {
      Array.from(slideRail.children).forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }
    if (overviewGrid) {
      Array.from(overviewGrid.children).forEach((item, i) => item.classList.toggle('active', i === currentIndex));
    }

    if (btnPrev) btnPrev.disabled = currentIndex === 0;
    if (btnNext) btnNext.disabled = currentIndex === totalSlides - 1;

    // Notify Three.js 3D Camera
    if (window.ThreeTelemetryStage) {
      window.ThreeTelemetryStage.setSlideTarget(currentIndex);
    }

    // Run Anime.js choreography
    animateSlideIn(slides[currentIndex], direction);

    // Sync hash
    history.replaceState(null, '', `#slide-${currentIndex + 1}`);
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }

  function toggleOverview(forceState) {
    if (!overviewOverlay) return;
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !overviewOverlay.classList.contains('open');
    overviewOverlay.classList.toggle('open', shouldOpen);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  // Lightbox Zoom on Screenshots
  document.querySelectorAll('.zoomable-img').forEach((container) => {
    container.addEventListener('click', () => {
      const img = container.querySelector('img');
      if (img && lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxModal.classList.add('open');
      }
    });
  });

  if (lightboxModal) {
    lightboxModal.addEventListener('click', () => lightboxModal.classList.remove('open'));
  }

  // Button Events
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnStartDeck) btnStartDeck.addEventListener('click', () => goToSlide(1));
  if (btnOverview) btnOverview.addEventListener('click', () => toggleOverview());
  if (closeOverview) closeOverview.addEventListener('click', () => toggleOverview(false));
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
  if (btnExportPdf) btnExportPdf.addEventListener('click', () => window.print());

  // Debounced Mouse Wheel / Trackpad Navigation
  window.addEventListener('wheel', (e) => {
    if (overviewOverlay?.classList.contains('open') || lightboxModal?.classList.contains('open')) return;
    if (wheelLocked || Math.abs(e.deltaY) < 28) return;
    wheelLocked = true;
    if (e.deltaY > 0) nextSlide();
    else prevSlide();
    setTimeout(() => { wheelLocked = false; }, 520);
  }, { passive: true });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (lightboxModal?.classList.contains('open')) {
      if (e.key === 'Escape') lightboxModal.classList.remove('open');
      return;
    }
    if (overviewOverlay?.classList.contains('open')) {
      if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        toggleOverview(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'o':
      case 'O':
      case 'g':
      case 'G':
      case 'Tab':
        e.preventDefault();
        toggleOverview();
        break;
      case 'p':
      case 'P':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          window.print();
        }
        break;
    }
  });

  // Touch Swipe Navigation
  let touchStartX = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 55) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // Initial Slide Load from URL Hash
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  const startIdx = match ? Math.min(Math.max(parseInt(match[1], 10) - 1, 0), totalSlides - 1) : 0;
  goToSlide(startIdx);
});
