/* ═══════════════════════════════════════════════════════════
   CURESYNC — Landing Page JavaScript
   Scroll-triggered animations, nav state, mobile menu
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Nav Scroll Effect ──────────────────────────────────
    const nav = document.getElementById('nav');
    let ticking = false;

    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 60) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ── Mobile Nav Toggle ──────────────────────────────────
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });

    // ── Scroll Animations ─────────────────────────────────
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || '0', 10);
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px',
        }
    );

    animatedElements.forEach((el) => observer.observe(el));

    // ── Smooth Scroll for anchor links ─────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── Counter Animation for CTA Stats ────────────────────
    function animateCounter(element, target, suffix = '') {
        const duration = 1500;
        const start = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(eased * target);
            element.textContent = current + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    // Observe CTA stats for counter animation
    const statValues = document.querySelectorAll('.cta__stat-value');
    const statsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const text = entry.target.textContent.trim();
                    if (text.endsWith('+')) {
                        const num = parseInt(text, 10);
                        animateCounter(entry.target, num, '+');
                    } else if (text.endsWith('%')) {
                        const num = parseInt(text, 10);
                        animateCounter(entry.target, num, '%');
                    }
                    statsObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    statValues.forEach((el) => statsObserver.observe(el));

    // ── Parallax Effect on Hero Orbs ───────────────────────
    const orbs = document.querySelectorAll('.hero__orb');
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateParallax() {
        orbs.forEach((orb, i) => {
            const speed = (i + 1) * 10;
            const x = mouseX * speed;
            const y = mouseY * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
        requestAnimationFrame(updateParallax);
    }
    updateParallax();
});
