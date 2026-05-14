document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu on link click
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if(icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(18, 18, 18, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(18, 18, 18, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Scroll reveal animation for service cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(card);
    });

    // =====================
    // CAROUSEL (3-card view: prev | ACTIVE | next)
    // =====================
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots  = document.getElementById('carouselDots');
    const prevCarousel  = document.getElementById('carouselPrev');
    const nextCarousel  = document.getElementById('carouselNext');

    if (carouselTrack) {
        const items = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        const total = items.length;
        let current = 0;

        // Build dots
        items.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goTo(i));
            carouselDots.appendChild(dot);
        });

        function updateClasses() {
            const prev = (current - 1 + total) % total;
            const next = (current + 1) % total;
            items.forEach((item, i) => {
                item.classList.remove('active', 'side');
                if (i === current) item.classList.add('active');
                else if (i === prev || i === next) item.classList.add('side');
            });
            document.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        function goTo(idx) {
            current = (idx + total) % total;
            // Offset so current is centered: shift = current - 1 items
            const itemWidth = carouselTrack.parentElement.offsetWidth * 0.5; // 50% width per item
            const offset = current * itemWidth - (carouselTrack.parentElement.offsetWidth / 2) + (itemWidth / 2);
            carouselTrack.style.transform = `translateX(${-offset}px)`;
            updateClasses();
        }

        // Use pixel-based centering with percentage items
        function goToByPercent(idx) {
            current = (idx + total) % total;
            // We want the current item centered. Each item is 50% width.
            // Center of container = 50%, center of current item = current*50% + 25%
            // Translate needed: center of current item - center of container
            // = current*50% + 25% - 50% = (current - 0.5)*50%
            const translatePercent = (current - 0.5) * 50;
            carouselTrack.style.transform = `translateX(calc(-${translatePercent}%))`;
            updateClasses();
        }

        goToByPercent(0);

        prevCarousel.addEventListener('click', () => goToByPercent(current - 1));
        nextCarousel.addEventListener('click', () => goToByPercent(current + 1));

        // Side card click = navigate to that card
        items.forEach((item, i) => {
            item.addEventListener('click', () => {
                if (item.classList.contains('side')) {
                    goToByPercent(i);
                }
            });
        });

        // Auto-play
        let timer = setInterval(() => goToByPercent(current + 1), 5000);
        carouselTrack.parentElement.addEventListener('mouseenter', () => clearInterval(timer));
        carouselTrack.parentElement.addEventListener('mouseleave', () => {
            timer = setInterval(() => goToByPercent(current + 1), 5000);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !document.getElementById('lightbox').classList.contains('open')) prevCarousel.click();
            if (e.key === 'ArrowRight' && !document.getElementById('lightbox').classList.contains('open')) nextCarousel.click();
        });

        // =====================
        // LIGHTBOX
        // =====================
        const lightbox        = document.getElementById('lightbox');
        const lightboxImg     = document.getElementById('lightboxImg');
        const lightboxClose   = document.getElementById('lightboxClose');
        const lightboxPrev    = document.getElementById('lightboxPrev');
        const lightboxNext    = document.getElementById('lightboxNext');
        const lightboxCounter = document.getElementById('lightboxCounter');
        let lbIndex = 0;

        const imgSrcs = items.map(item => item.querySelector('img').src);

        function openLightbox(idx) {
            lbIndex = idx;
            lightboxImg.src = imgSrcs[lbIndex];
            lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        // Only active card opens lightbox
        items.forEach((item, i) => {
            item.addEventListener('click', () => {
                if (item.classList.contains('active')) openLightbox(i);
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

        lightboxPrev.addEventListener('click', () => {
            lbIndex = (lbIndex - 1 + imgSrcs.length) % imgSrcs.length;
            lightboxImg.src = imgSrcs[lbIndex];
            lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
        });

        lightboxNext.addEventListener('click', () => {
            lbIndex = (lbIndex + 1) % imgSrcs.length;
            lightboxImg.src = imgSrcs[lbIndex];
            lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lightboxPrev.click();
            if (e.key === 'ArrowRight') lightboxNext.click();
        });
    }


    // =====================
    // SCROLL REVEAL
    // =====================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, parseInt(entry.target.dataset.delay) || 0);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.section-title h2, .section-title p').forEach((el, i) => {
        el.classList.add('reveal-el');
        el.dataset.delay = i * 80;
        revealObserver.observe(el);
    });

    document.querySelectorAll('.news-card').forEach((card, i) => {
        card.classList.add('reveal-el');
        card.dataset.delay = i * 100;
        revealObserver.observe(card);
    });

    document.querySelectorAll('.value-item').forEach((item, i) => {
        item.classList.add('reveal-el');
        item.dataset.delay = i * 90;
        revealObserver.observe(item);
    });

    document.querySelectorAll('.info-item').forEach((item, i) => {
        item.classList.add('reveal-el');
        item.dataset.delay = i * 80;
        revealObserver.observe(item);
    });


});
