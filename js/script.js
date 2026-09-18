// =========================================================
// LENDRAW. — Art Portfolio
// script.js
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Mobile menu (hamburger) ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the menu when a link is clicked (mobile view only)
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Gallery filter (index.html) ---------- */
  var filterRow = document.getElementById("filterRow");
  var workGrid = document.getElementById("workGrid");
  var galleryItems = workGrid ? Array.prototype.slice.call(workGrid.querySelectorAll(".work-item[data-cat]")) : [];

  // Add a small zoom hint icon to every gallery item
  galleryItems.forEach(function (item) {
    var hint = document.createElement("span");
    hint.className = "zoom-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = "\u2922";
    item.appendChild(hint);
  });

  if (filterRow && workGrid) {
    var buttons = filterRow.querySelectorAll("button");

    filterRow.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;

      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");

      galleryItems.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-cat") === filter;
        item.style.display = match ? "" : "none";
      });
    });
  }

  /* ---------- Lightbox / slider for the gallery ---------- */
  var lightbox = document.getElementById("lightbox");

  if (lightbox && galleryItems.length) {
    var lightboxImg = document.getElementById("lightboxImg");
    var lightboxCat = document.getElementById("lightboxCat");
    var lightboxTitle = document.getElementById("lightboxTitle");
    var lightboxCount = document.getElementById("lightboxCount");
    var closeBtn = document.getElementById("lightboxClose");
    var prevBtn = document.getElementById("lightboxPrev");
    var nextBtn = document.getElementById("lightboxNext");
    var lastFocused = null;
    var currentIndex = 0;

    // Build a lookup of visible-order artwork data for slider navigation
    function getArtworks() {
      return galleryItems.map(function (item) {
        var img = item.querySelector("img");
        return {
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt") || "",
          cat: item.querySelector(".work-cap .cat") ? item.querySelector(".work-cap .cat").textContent : "",
          title: item.querySelector(".work-cap .title") ? item.querySelector(".work-cap .title").textContent : ""
        };
      });
    }

    function renderSlide(index) {
      var artworks = getArtworks();
      if (!artworks.length) return;
      currentIndex = (index + artworks.length) % artworks.length;
      var art = artworks[currentIndex];
      lightboxImg.src = art.src;
      lightboxImg.alt = art.alt;
      lightboxCat.textContent = art.cat;
      lightboxTitle.textContent = art.title;
      lightboxCount.textContent = (currentIndex + 1) + " / " + artworks.length;
    }

    function openLightbox(index) {
      lastFocused = document.activeElement;
      renderSlide(index);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-active");
      if (closeBtn) closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-active");
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function showNext() { renderSlide(currentIndex + 1); }
    function showPrev() { renderSlide(currentIndex - 1); }

    function onKeydown(e) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    }

    galleryItems.forEach(function (item, idx) {
      item.addEventListener("click", function () {
        openLightbox(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (nextBtn) nextBtn.addEventListener("click", showNext);
    if (prevBtn) prevBtn.addEventListener("click", showPrev);

    // Click on the dark backdrop (outside the stage) closes the viewer
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Basic swipe support for touch devices
    var touchStartX = null;
    lightbox.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        if (delta < 0) showNext(); else showPrev();
      }
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------- Contact form validation & real submit (Web3Forms) ---------- */
  var contactForm = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      var valid = true;

      [name, email, message].forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = "#d64545";
          valid = false;
        } else {
          field.style.borderColor = "";
        }
      });

      if (!valid) return;

      var submitBtn = contactForm.querySelector("button[type=submit]");
      var originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.75";
      }

      var formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "";
          }

          if (data.success) {
            formSuccess.classList.add("show");
            contactForm.reset();
            formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            alert("Gagal mengirim pesan. Coba lagi ya.");
            console.error("Web3Forms error:", data);
          }
        })
        .catch(function (error) {
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "";
          }
          alert("Terjadi kesalahan jaringan. Coba lagi ya.");
          console.error("Fetch error:", error);
        });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  window.addEventListener("scroll", function () {
    var current = window.pageYOffset;
    if (header) {
      header.style.boxShadow = current > 10 ? "0 6px 18px rgba(0,0,0,0.25)" : "none";
    }
  });

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById("scrollProgress");
  if (progressBar) {
    window.addEventListener("scroll", function () {
      var scrollTop = window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    });
  }

  /* ---------- Animated stat counters ---------- */
  var statNumbers = document.querySelectorAll(".stat b[data-count]");
  if (statNumbers.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statNumbers.forEach(function (el) { statObserver.observe(el); });
    } else {
      statNumbers.forEach(function (el) { animateCount(el); });
    }
  }

  /* ---------- Skill bar animation (about.html) ---------- */
  var skillBars = document.querySelectorAll(".skill-bar");
  if (skillBars.length && "IntersectionObserver" in window) {
    var skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    skillBars.forEach(function (el) { skillObserver.observe(el); });
  } else {
    skillBars.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Soft cursor-following highlight in the hero ---------- */
  var heroIntro = document.querySelector(".hero-intro");
  if (heroIntro && window.matchMedia("(pointer: fine)").matches) {
    heroIntro.addEventListener("mousemove", function (e) {
      var rect = heroIntro.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      heroIntro.style.setProperty("--mx", x + "%");
      heroIntro.style.setProperty("--my", y + "%");
    });
  }

});