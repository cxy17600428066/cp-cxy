/* 
   Zhuoxi Group Portal - Interaction Engine v3.1
   Core: Visual Awakening, Staggered Reveals, Smooth Track Control
*/

document.addEventListener('DOMContentLoaded', () => {

    // 1. Visual Awakening - Scroll Observer
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Optional: stop observing once revealed for performance
                // revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Apply reveal to standard blocks and staggered items
    document.querySelectorAll('.reveal, .reveal-item').forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Navbar Shrink & Glass Logic
    const mainNav = document.getElementById('main-nav');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if (mainNav) mainNav.classList.add('shrink');
            if (backToTop) backToTop.classList.add('visible');
        } else {
            if (mainNav) mainNav.classList.remove('shrink');
            if (backToTop) backToTop.classList.remove('visible');
        }
    });

    // 3. Horizontal Timeline - Mouse Wheel Hijack
    const timelineContainer = document.querySelector('.timeline-horizontal-container');
    
    if (timelineContainer) {
        timelineContainer.addEventListener('wheel', (e) => {
            // Only hijack if we are not on mobile (touch handles naturally)
            if (window.innerWidth > 1024) {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    timelineContainer.scrollLeft += e.deltaY;
                }
            }
        }, { passive: false });
    }

    // 4. Back to Top Smooth Logic
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 5. Interactive Cards - Physical Feedback (Soft Scale)
    const cards = document.querySelectorAll('.product-card, .news-card, .culture-card, .btn');
    cards.forEach(card => {
        card.addEventListener('mousedown', () => {
            card.style.transform = 'scale(0.96)';
        });
        card.addEventListener('mouseup', () => {
            card.style.transform = '';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // 6. Navbar Minimize Toggle (Zen Mode)
    document.querySelectorAll('.nav-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            mainNav.classList.toggle('is-minimized');
        });
    });

    // 7. Anchor Link Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = mainNav.offsetHeight + 40;
                const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 8. Hero Carousel Engine (Left-Right Fade)
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        const images = heroCarousel.querySelectorAll('.carousel-img');
        const dots = heroCarousel.querySelectorAll('.dot');
        const prevBtn = heroCarousel.querySelector('.prev');
        const nextBtn = heroCarousel.querySelector('.next');
        let currentIndex = 0;
        let autoPlayTimer;

        const updateCarousel = (index, direction = 'next') => {
            // Remove active status from all
            images.forEach(img => {
                img.classList.remove('active');
                img.style.transform = direction === 'next' ? 'translateX(-20px)' : 'translateX(20px)';
            });
            dots.forEach(dot => dot.classList.remove('active'));

            // Set current
            currentIndex = index;
            const currentImg = images[currentIndex];
            currentImg.classList.add('active');
            dots[currentIndex].classList.add('active');
            
            // Note: the transform: translateX(0) is handled by the .active CSS rule
        };

        const nextSlide = () => {
            let nextIndex = (currentIndex + 1) % images.length;
            updateCarousel(nextIndex, 'next');
        };

        const prevSlide = () => {
            let prevIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel(prevIndex, 'prev');
        };

        // Event Listeners
        nextBtn?.addEventListener('click', () => {
            nextSlide();
            resetTimer();
        });

        prevBtn?.addEventListener('click', () => {
            prevSlide();
            resetTimer();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const direction = index > currentIndex ? 'next' : 'prev';
                updateCarousel(index, direction);
                resetTimer();
            });
        });

        // AutoPlay Logic
        const startTimer = () => {
            autoPlayTimer = setInterval(nextSlide, 5000); // 5 seconds interval
        };

        const resetTimer = () => {
            clearInterval(autoPlayTimer);
            startTimer();
        };

        // Initialize display
        updateCarousel(0);
        startTimer();

        // Pause on hover
        heroCarousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
        heroCarousel.addEventListener('mouseleave', () => startTimer());
    }

    // 9. Contact Interactions: Copy to Clipboard & Toast
    window.showToast = (message) => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.innerHTML = `<span>✓</span> ${message}`;
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('leaving');
            setTimeout(() => {
                toast.remove();
                if (container.childNodes.length === 0) container.remove();
            }, 300);
        }, 2500);
    };

    window.copyToClipboard = (text, label) => {
        if (!navigator.clipboard) {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                window.showToast(`${label}已复制到剪贴板`);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            window.showToast(`${label}已复制到剪贴板`);
        }, (err) => {
            console.error('Async: Could not copy text: ', err);
        });
    };

});

