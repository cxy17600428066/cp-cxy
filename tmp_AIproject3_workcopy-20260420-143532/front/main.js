/*
   Zhuoxi Group Portal - Interaction Engine
*/

document.addEventListener("DOMContentLoaded", () => {
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, revealOptions);

  document.querySelectorAll(".reveal, .reveal-item").forEach(el => revealObserver.observe(el));

  const mainNav = document.getElementById("main-nav");
  const backToTop = document.getElementById("back-to-top");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      if (mainNav) mainNav.classList.add("shrink");
      if (backToTop) backToTop.classList.add("visible");
    } else {
      if (mainNav) mainNav.classList.remove("shrink");
      if (backToTop) backToTop.classList.remove("visible");
    }
  });

  const timelineContainer = document.querySelector(".timeline-horizontal-container");
  if (timelineContainer) {
    timelineContainer.addEventListener(
      "wheel",
      e => {
        if (window.innerWidth > 1024 && e.deltaY !== 0) {
          e.preventDefault();
          timelineContainer.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const cards = document.querySelectorAll(".product-card, .news-card, .culture-card, .btn");
  cards.forEach(card => {
    card.addEventListener("mousedown", () => {
      card.style.transform = "scale(0.96)";
    });
    card.addEventListener("mouseup", () => {
      card.style.transform = "";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".nav-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (mainNav) mainNav.classList.toggle("is-minimized");
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navHeight = (mainNav ? mainNav.offsetHeight : 0) + 40;
      const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    });
  });

  const heroCarousel = document.querySelector(".hero-carousel");
  if (heroCarousel) {
    const images = heroCarousel.querySelectorAll(".carousel-img");
    const dots = heroCarousel.querySelectorAll(".dot");
    const prevBtn = heroCarousel.querySelector(".prev");
    const nextBtn = heroCarousel.querySelector(".next");
    let currentIndex = 0;
    let autoPlayTimer = null;

    const updateCarousel = (index, direction = "next") => {
      images.forEach(img => {
        img.classList.remove("active");
        img.style.transform = direction === "next" ? "translateX(-20px)" : "translateX(20px)";
      });
      dots.forEach(dot => dot.classList.remove("active"));
      currentIndex = index;
      if (images[currentIndex]) images[currentIndex].classList.add("active");
      if (dots[currentIndex]) dots[currentIndex].classList.add("active");
    };

    const nextSlide = () => updateCarousel((currentIndex + 1) % images.length, "next");
    const prevSlide = () => updateCarousel((currentIndex - 1 + images.length) % images.length, "prev");

    const startTimer = () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(nextSlide, 5000);
    };

    nextBtn &&
      nextBtn.addEventListener("click", () => {
        nextSlide();
        startTimer();
      });
    prevBtn &&
      prevBtn.addEventListener("click", () => {
        prevSlide();
        startTimer();
      });
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        const direction = index > currentIndex ? "next" : "prev";
        updateCarousel(index, direction);
        startTimer();
      });
    });

    updateCarousel(0);
    startTimer();
    heroCarousel.addEventListener("mouseenter", () => autoPlayTimer && clearInterval(autoPlayTimer));
    heroCarousel.addEventListener("mouseleave", startTimer);
  }

  window.showToast = message => {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.innerHTML = `<span>✓</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => {
        toast.remove();
        if (container && container.childNodes.length === 0) container.remove();
      }, 300);
    }, 2500);
  };

  window.copyToClipboard = (text, label) => {
    const onSuccess = () => window.showToast(`${label}已复制到剪贴板`);
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        onSuccess();
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
      return;
    }
    navigator.clipboard.writeText(text).then(onSuccess).catch(err => {
      console.error("Clipboard API copy failed:", err);
    });
  };
});
