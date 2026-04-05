here/**
 * CryptoDesk — script.js
 * ======================
 * Vanilla JavaScript. No frameworks or dependencies.
 * GitHub Pages compatible — runs entirely in the browser.
 *
 * Sections:
 *   1. Floating support button — IntersectionObserver hides it when
 *      the #contact-support section is visible in the viewport.
 *   2. FAQ accordion
 *   3. Contact form — client-side validation & submit UX
 *   4. Mobile navigation
 *   5. Scroll-aware nav background
 *   6. Wallet card entrance animation (IntersectionObserver)
 */

'use strict';

/* ================================================================
   1. FLOATING SUPPORT BUTTON
   ================================================================

   BEHAVIOR:
   - The button is fixed to the bottom-right of the viewport.
   - When the user scrolls close to — or into — the #contact-support
     section, the button hides (opacity → 0, pointer-events off).
   - When the user scrolls back up and the section leaves the
     viewport, the button reappears.

   IMPLEMENTATION:
   - Uses IntersectionObserver watching #contact-support.
   - threshold: 0.08 means the button hides as soon as 8% of the
     contact section enters the viewport — giving a natural feel
     before the user actually reaches the form.
   - rootMargin: "0px 0px -20px 0px" adds a tiny extra buffer at
     the bottom so the button disappears just before the section
     becomes fully visible.
   ================================================================ */

(function initFloatingButton() {
  const floatingBtn = document.getElementById('floating-support-btn');
  const contactSection = document.getElementById('contact-support');

  if (!floatingBtn || !contactSection) return;

  // ---- Click: smooth-scroll to contact section ----
  floatingBtn.addEventListener('click', function () {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- IntersectionObserver: hide/show based on contact section visibility ----
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Contact section entered the viewport → hide the floating button
          floatingBtn.classList.add('hidden');
        } else {
          // Contact section left the viewport → show the floating button
          floatingBtn.classList.remove('hidden');
        }
      });
    },
    {
      // threshold: 0 = trigger as soon as ANY pixel of the section is visible.
      // We use a small value so the button starts hiding slightly before
      // the section fully enters the screen — feels more natural.
      threshold: 0.05,

      // rootMargin: A negative bottom margin means "pretend the viewport
      // is 60px shorter at the bottom." This causes the observer to fire
      // earlier — hiding the button before the contact section is fully
      // in view, preventing overlap.
      rootMargin: '0px 0px -60px 0px',
    }
  );

  observer.observe(contactSection);

  // ---- Fallback: Also hide on page-load if contact section is already visible ----
  // This handles the edge case where the page is loaded with the URL hash #contact-support
  function checkInitialVisibility() {
    const rect = contactSection.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < windowHeight && rect.bottom > 0) {
      floatingBtn.classList.add('hidden');
    }
  }
  checkInitialVisibility();

})();


/* ================================================================
   2. FAQ ACCORDION
   ================================================================
   Clicking a question toggles its answer panel open/closed.
   Only one FAQ item is open at a time (accordion pattern).
   ================================================================ */

(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all items first (accordion — only one open at a time)
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        const otherBtn = other.querySelector('.faq-q');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // If this one was not open, open it
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();


/* ================================================================
   3. CONTACT FORM — CLIENT-SIDE VALIDATION & UX
   ================================================================
   Pure frontend form. No backend. Demonstrates validation UX.
   To connect a real backend: replace the submit handler's
   "simulation" block with a fetch() POST to your endpoint.
   ================================================================ */

(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput    = document.getElementById('cf-name');
  const emailInput   = document.getElementById('cf-email');
  const messageInput = document.getElementById('cf-message');
  const submitBtn    = document.getElementById('submit-btn');
  const successBox   = document.getElementById('form-success');

  const errName    = document.getElementById('err-name');
  const errEmail   = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');

  // ---- Validation helpers ----
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }
  function clearError(input, errEl) {
    input.classList.remove('error');
    if (errEl) errEl.textContent = '';
  }
  function showError(input, errEl, message) {
    input.classList.add('error');
    if (errEl) errEl.textContent = message;
  }

  // Clear errors on input
  [nameInput, emailInput, messageInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      input.classList.remove('error');
    });
  });

  // ---- Form submit ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let hasError = false;

    // Validate name
    if (!nameInput || nameInput.value.trim().length < 2) {
      showError(nameInput, errName, 'Please enter your full name (at least 2 characters).');
      hasError = true;
    } else {
      clearError(nameInput, errName);
    }

    // Validate email
    if (!emailInput || !isValidEmail(emailInput.value)) {
      showError(emailInput, errEmail, 'Please enter a valid email address.');
      hasError = true;
    } else {
      clearError(emailInput, errEmail);
    }

    // Validate message
    if (!messageInput || messageInput.value.trim().length < 20) {
      showError(messageInput, errMessage, 'Please describe your issue in at least 20 characters.');
      hasError = true;
    } else {
      clearError(messageInput, errMessage);
    }

    if (hasError) return;

    // ---- Simulate submit (replace with real fetch() call) ----
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:spin 0.8s linear infinite">
        <path d="M9 2a7 7 0 0 1 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      Sending…`;

    // Inject the spin keyframe once
    if (!document.getElementById('spin-style')) {
      const style = document.createElement('style');
      style.id = 'spin-style';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    // Simulate network delay (remove this block and use fetch() for real backend)
    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M15.5 3L1.5 8.5L6.5 10.5M15.5 3L10.5 16.5L6.5 10.5M15.5 3L6.5 10.5"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Send Message`;

      // Show success message
      if (successBox) {
        successBox.style.display = 'flex';
        setTimeout(function () { successBox.style.display = 'none'; }, 6000);
      }
    }, 1800);

    /*
    ---- REAL BACKEND: Replace the setTimeout above with this ----

    const formData = {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      platform: document.getElementById('cf-platform').value,
      issue:    document.getElementById('cf-issue').value,
      message:  messageInput.value.trim(),
    };

    fetch('https://your-backend.com/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(data => {
        // show success
      })
      .catch(err => {
        // show error
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
    */
  });

})();


/* ================================================================
   4. MOBILE NAVIGATION
   ================================================================ */

(function initMobileNav() {
  const hamburger   = document.getElementById('nav-hamburger');
  const mobileMenu  = document.getElementById('nav-mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    mobileMenu.style.display = 'flex';
    hamburger.setAttribute('aria-expanded', 'true');
    // Animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (spans[0]) spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    if (spans[1]) spans[1].style.opacity = '0';
    if (spans[2]) spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function closeMenu() {
    isOpen = false;
    mobileMenu.style.display = 'none';
    hamburger.setAttribute('aria-expanded', 'false');
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(function (s) {
      s.style.transform = '';
      s.style.opacity = '';
    });
  }

  hamburger.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  // Close menu when a link is clicked
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on resize back to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 720) closeMenu();
  });

})();


/* ================================================================
   5. SCROLL-AWARE NAV BACKGROUND
   ================================================================
   Adds a stronger shadow to the nav when the user scrolls down,
   making it easier to distinguish from the content below.
   ================================================================ */

(function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        if (window.scrollY > 48) {
          nav.style.boxShadow = '0 4px 32px rgba(0,0,0,0.5)';
          nav.style.background = 'rgba(12, 13, 16, 0.95)';
        } else {
          nav.style.boxShadow = '';
          nav.style.background = '';
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

})();


/* ================================================================
   6. WALLET CARDS — SCROLL-TRIGGERED ENTRANCE
   ================================================================
   Cards fade + slide up when they enter the viewport.
   Uses IntersectionObserver for performance (no scroll listener).
   ================================================================ */

(function initWalletCardAnimations() {
  const cards = document.querySelectorAll('.wallet-card');
  if (!cards.length) return;

  // Set initial state via inline style
  cards.forEach(function (card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.55s ' + (i * 0.07) + 's ease, transform 0.55s ' + (i * 0.07) + 's cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach(function (card) { observer.observe(card); });

})();


/* ================================================================
   7. FEATURE CARDS — SCROLL-TRIGGERED ENTRANCE
   ================================================================ */

(function initFeatureCardAnimations() {
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;

  cards.forEach(function (card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ' + (i * 0.08) + 's ease, transform 0.5s ' + (i * 0.08) + 's cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  cards.forEach(function (card) { observer.observe(card); });

})();


/* ================================================================
   8. SMOOTH ANCHOR LINKS (override default jump-to)
   ================================================================ */

(function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      // Offset by nav height
      const navHeight = document.getElementById('nav')?.offsetHeight || 62;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
