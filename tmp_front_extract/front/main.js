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

});
