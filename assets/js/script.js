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

  // Dynamic Typing (AI-like Personalization)
  const typingText = document.getElementById('typing-text');
  if (typingText) {
    const phrases = ['AI Solutions', 'Interactive Apps', 'Custom Tools'];
    let index = 0, char = 0, isDeleting = false;
    function type() {
      typingText.textContent = phrases[index].substring(0, char);
      if (!isDeleting && char++ === phrases[index].length) {
        isDeleting = true;
        setTimeout(type, 1200);
        return;
      } else if (isDeleting && char-- === 0) {
        isDeleting = false;
        index = (index + 1) % phrases.length;
      }
      setTimeout(type, isDeleting ? 50 : 150);
    }
    type();
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

  // Initialize Chart.js for Data Visualization if available
  if (typeof Chart !== 'undefined') {
    const ctx = document.getElementById('myChart');
    if (ctx) {
      const myChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54,162,235,1)',
              'rgba(255,206,86,1)',
              'rgba(75,192,192,1)',
              'rgba(153,102,255,1)',
              'rgba(255,159,64,1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  // Initialize Clipboard.js for Copy to Clipboard Functionality if available
  if (typeof ClipboardJS !== 'undefined') {
    const clipboard = new ClipboardJS('.copy-btn');
    clipboard.on('success', e => {
      alert('Copied to clipboard: ' + e.text);
      e.clearSelection();
    });
    clipboard.on('error', e => {
      alert('Failed to copy text. Please try manually.');
    });
  }

  // Initialize Prism.js for Code Highlighting if available
  if (typeof Prism !== 'undefined') {
    document.querySelectorAll('pre code').forEach(block => {
      Prism.highlightElement(block);
        const codeText = block.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(codeText)
            .then(() => {
              alert('Code copied to clipboard!');
            })
            .catch(err => {
              alert('Failed to copy code: ' + err);
            });
        } else {
          // Fallback for older browsers
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(block);
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          alert('Code copied to clipboard!');
        }
        alert('Code copied to clipboard!');
      });
    });
  }

  // Initialize Isotope for Portfolio Layout if available
  if (typeof Isotope !== 'undefined') {
    const iso = new Isotope('.portfolio-grid', {
      itemSelector: '.grid-item',
      layoutMode: 'fitRows'
    });
    // Filter items on button click
    document.querySelectorAll('.portfolio-filter button').forEach(button => {
      button.addEventListener('click', () => {
        const filterValue = button.getAttribute('data-filter');
        iso.arrange({ filter: filterValue });
        const activeBtn = document.querySelector('.portfolio-filter .active');
        if (activeBtn) activeBtn.classList.remove('active');
        button.classList.add('active');
      });
    });
  }

  // Initialize Magnific Popup for Image Gallery if available
  if (typeof $ !== 'undefined' && typeof $.fn.magnificPopup !== 'undefined') {
    $('.image-gallery').magnificPopup({
      delegate: 'a',
      type: 'image',
      gallery: { enabled: true },
      zoom: { enabled: true, duration: 300 }
    });
  }

  // Initialize Select2 for Dropdowns if available
  if (typeof $ !== 'undefined' && typeof $.fn.select2 !== 'undefined') {
    $('.select2').select2({ placeholder: 'Select an option', allowClear: true });
  }

  // Initialize Datepicker for Forms if available
  if (typeof $ !== 'undefined' && typeof $.fn.datepicker !== 'undefined') {
    $('.datepicker').datepicker({ format: 'mm/dd/yyyy', autoclose: true });
  }

  // Initialize Timepicker for Forms if available
  if (typeof $ !== 'undefined' && typeof $.fn.timepicker !== 'undefined') {
    $('.timepicker').timepicker({
      timeFormat: 'h:mm p',
      interval: 30,
      minTime: '0',
      maxTime: '11:59pm',
      dynamic: false,
      dropdown: true,
      scrollbar: true
    });
  }

  // Initialize Tags Input for Forms if available
  if (typeof $ !== 'undefined' && typeof $.fn.tagsInput !== 'undefined') {
    $('.tags-input').tagsInput({
      width: '100%',
      height: '36px',
      defaultText: 'Add a tag',
      removeWithBackspace: true,
      placeholderColor: '#999',
      onAddTag: tag => console.log('Tag added:', tag),
      onRemoveTag: tag => console.log('Tag removed:', tag)
    });
  }

  // Initialize Dropzone.js for File Upload if available
  if (typeof Dropzone !== 'undefined') {
    Dropzone.options.fileUpload = {
      url: '/upload',
      maxFilesize: 2,
      acceptedFiles: 'image/*',
      addRemoveLinks: true,
      dictDefaultMessage: 'Drop files here or click to upload',
      init: function() {
        this.on('success', file => console.log('File uploaded successfully:', file));
        this.on('error', (file, errorMessage) => console.error('File upload error:', errorMessage));
      }
    };
  }

  // Initialize NProgress for Progress Bar if available
  if (typeof NProgress !== 'undefined') {
    NProgress.configure({ showSpinner: false });
    window.addEventListener('load', () => NProgress.done());
    document.addEventListener('ajaxStart', () => NProgress.start());
    document.addEventListener('ajaxStop', () => NProgress.done());
  }

  // Initialize Toastr for Notifications if available
  if (typeof toastr !== 'undefined') {
    toastr.options = {
      closeButton: true,
      debug: false,
      progressBar: true,
      positionClass: 'toast-top-right',
      showDuration: '300',
      hideDuration: '1000',
      timeOut: '5000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut'
    };
    function showNotification(message, type = 'info') {
      toastr[type](message);
    }
    // Example usage
    const notifyBtn = document.getElementById('notify-btn');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', () => showNotification('This is a notification!', 'success'));
    }
  }

  // Initialize SweetAlert2 for Alerts if available
  if (typeof Swal !== 'undefined') {
    function showAlert(title, text, icon = 'info') {
      Swal.fire({ title, text, icon, confirmButtonText: 'OK' });
    }
    const alertBtn = document.getElementById('alert-btn');
    if (alertBtn) {
      alertBtn.addEventListener('click', () => showAlert('Alert Title', 'This is an alert message!', 'warning'));
    }
  }
});
// Add this to the end of script.js, inside the DOMContentLoaded listener

// Register Service Worker for PWA features
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
/*
End of script.js
This script file contains various functionalities for the portfolio website, including theme toggling, dynamic typing, portfolio filtering, form submission handling, smooth scrolling, and integration with various libraries for enhanced user experience. Make sure to replace placeholders like 'YOUR_API_KEY' with actual values where necessary, and ensure that the required libraries are included in your HTML file.
*/
