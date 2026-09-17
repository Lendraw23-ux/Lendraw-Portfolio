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