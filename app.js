// ============================================================
// PITCH CLUTCH '26 — MOBILE NAVIGATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  // Mobile menu toggle
  if (toggle && links) {

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      links.classList.toggle("open");

      toggle.setAttribute(
        "aria-expanded",
        links.classList.contains("open") ? "true" : "false"
      );
    });

    // Make every navigation link clickable on mobile
    const navLinks = links.querySelectorAll("a");

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {

        // Allow the browser to follow the link normally
        event.stopPropagation();

        // Close the mobile menu
        links.classList.remove("open");

        toggle.setAttribute("aria-expanded", "false");
      });

      // Better touch support
      link.addEventListener("touchend", (event) => {
        event.stopPropagation();
      }, { passive: true });
    });
  }


  // ============================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ============================================================

  document.addEventListener("click", (event) => {

    if (!toggle || !links) return;

    const clickedInsideNav =
      event.target.closest(".nav");

    if (!clickedInsideNav) {
      links.classList.remove("open");

      toggle.setAttribute("aria-expanded", "false");
    }
  });


  // ============================================================
  // HIGHLIGHT CURRENT PAGE
  // ============================================================

  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach((link) => {

    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.classList.add("active");
    }

  });

});