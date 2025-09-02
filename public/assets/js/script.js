// Wait for DOM to load before running scripts
window.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const toggleThemeBtn = document.getElementById('toggle-theme');
  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
  }

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }

  // Improved Dynamic Typing Effect with Blinking Cursor
  class TypeWriter {
    constructor(element, phrases, options = {}) {
      this.element = element;
      this.phrases = phrases;
      this.txt = '';
      this.phraseIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.typingSpeed = options.typingSpeed || 120;
      this.deletingSpeed = options.deletingSpeed || 60;
      this.pauseAfterTyping = options.pauseAfterTyping || 1500;
      this.pauseAfterDeleting = options.pauseAfterDeleting || 500;
      this.cursorChar = options.cursorChar || '|';
      this.cursorBlinkSpeed = options.cursorBlinkSpeed || 500;
      this.cursorVisible = true;
      this.init();
    }

    init() {
      this.element.innerHTML = '';
      this.type();
      this.blinkCursor();
    }

    type() {
      const currentPhrase = this.phrases[this.phraseIndex];
      if (this.isDeleting) {
        this.charIndex--;
        this.txt = currentPhrase.substring(0, this.charIndex);
      } else {
        this.charIndex++;
        this.txt = currentPhrase.substring(0, this.charIndex);
      }

      this.element.innerHTML = `<span class="typed-text">${this.txt}</span><span class="cursor">${this.cursorVisible ? this.cursorChar : ' '}</span>`;

      let timeout = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

      if (!this.isDeleting && this.charIndex === currentPhrase.length) {
        timeout = this.pauseAfterTyping;
        this.isDeleting = true;
      } else if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        timeout = this.pauseAfterDeleting;
      }

      setTimeout(() => this.type(), timeout);
    }

    blinkCursor() {
      setInterval(() => {
        this.cursorVisible = !this.cursorVisible;
        const cursorSpan = this.element.querySelector('.cursor');
        if (cursorSpan) {
          cursorSpan.style.visibility = this.cursorVisible ? 'visible' : 'hidden';
        }
      }, this.cursorBlinkSpeed);
    }
  }

  const typingText = document.getElementById('typing-text');
  if (typingText) {
    const phrases = ['AI Solutions', 'Interactive Apps', 'Custom Tools'];
    new TypeWriter(typingText, phrases, {
      typingSpeed: 100,
      deletingSpeed: 50,
      pauseAfterTyping: 1800,
      pauseAfterDeleting: 700,
      cursorChar: '|',
      cursorBlinkSpeed: 600
    });
  }

  // Portfolio Filters
  const filterButtons = document.querySelectorAll('.filter');
  const portfolioCards = document.querySelectorAll('.card');
  if (filterButtons.length && portfolioCards.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const activeBtn = document.querySelector('.filter.active');
        if (activeBtn) activeBtn.classList.remove('active');
        button.classList.add('active');
        const filter = button.dataset.filter;
        portfolioCards.forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
        });
      });
    });
  }

  // Form Submission (Placeholder - Replace with real backend)
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('Message sent! (Placeholder)');
      form.reset();
    });
  }

  // Smooth Scroll for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Back to Top Button
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Responsive Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.querySelector('nav ul');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Close Navigation on Link Click
  const navLinks = document.querySelectorAll('nav ul li a');
  if (navLinks.length && navMenu) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      });
    });
  }

  // Initialize AOS (Animate On Scroll) if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }

  // Initialize Swiper for Testimonials if available
  if (typeof Swiper !== 'undefined') {
    const swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 20,
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 }
      }
    });
  }

  // Initialize GLightbox for Portfolio Images if available
  if (typeof GLightbox !== 'undefined') {
    const lightbox = GLightbox({
      selector: '.glightbox',
      loop: true,
      zoomable: true,
      draggable: true,
      touchNavigation: true,
      openEffect: 'zoom',
      closeEffect: 'fade'
    });
  }

  // Initialize CountUp.js for Statistics if available
  if (typeof CountUp !== 'undefined') {
    document.querySelectorAll('.count-up').forEach(el => {
      const countUp = new CountUp(el, parseInt(el.dataset.count, 10), {
        duration: 2,
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.'
      });
      if (!countUp.error) countUp.start();
      else console.error(countUp.error);
    });
  }

  // Initialize particlesJS for Background Effects if available
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: {
          type: 'circle',
          stroke: { width: 0, color: '#000000' },
          polygon: { nb_sides: 5 }
        },
        opacity: { value: 0.5, random: false, anim: { enable: false } },
        size: { value: 3, random: true, anim: { enable: false } },
        line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 6, direction: 'none', random: false, straight: false }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 400, line_linked: { opacity: 1 } },
          bubble: { distance: 400, size: 40, duration: 2, opacity: 8 },
          repulse: { distance: 200 }
        }
      },
      retina_detect: true
    });
  }

  // Initialize WOW.js for Animations if available
  if (typeof WOW !== 'undefined') {
    new WOW().init();
  }

  // Initialize Google Maps (Placeholder - Replace with real API key)
  function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    const map = new google.maps.Map(mapElement, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8
    });
    new google.maps.Marker({
      position: { lat: -34.397, lng: 150.644 },
      map: map,
      title: 'Your Location'
    });
  }

  if (document.getElementById('map')) {
    const script = document.createElement('script');
    // TODO: Replace 'YOUR_API_KEY' with your actual Google Maps API key before deploying to production.
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
  }

  // Register Service Worker for PWA features
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
});
