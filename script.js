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
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(14, 14, 14, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(14, 14, 14, 0.75)';
            navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
        }
    });

    // Scroll reveal for service cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.service-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
        observer.observe(card);
    });

    // =====================
    // CAROUSEL — Infinite Loop & Left-aligned
    // =====================
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');
    const carouselCounter = document.getElementById('carouselCounter');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (carouselTrack) {
        let originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        let realTotal = originalItems.length;
        
        // Clone items for infinite loop (clone all items twice to be safe)
        originalItems.forEach(item => {
            let clone = item.cloneNode(true);
            clone.classList.add('clone');
            carouselTrack.appendChild(clone);
        });
        
        const allItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        const total = allItems.length;
        let current = 0; // The leftmost visible item index
        let isDragging = false;
        let dragStartX = 0;
        let dragCurrentX = 0;
        let dragOffset = 0;

        // Build dots (only for realTotal)
        originalItems.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Zdjęcie ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            carouselDots.appendChild(dot);
        });

        function getItemWidth() {
            return allItems[0].offsetWidth;
        }

        function updateUI() {
            let realCurrent = ((current % realTotal) + realTotal) % realTotal;
            allItems.forEach((item, i) => {
                item.classList.remove('active', 'side', 'side-left', 'side-right');
                if (i === current) {
                    item.classList.add('active');
                } else if (i === current - 1) {
                    item.classList.add('side', 'side-left');
                } else if (i === current + 1) {
                    item.classList.add('side', 'side-right');
                }
            });
            document.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === realCurrent);
            });
            if (carouselCounter) {
                carouselCounter.textContent = `${realCurrent + 1} / ${realTotal}`;
            }
        }

        function getContainerWidth() {
            return carouselTrack.parentElement.offsetWidth;
        }

        function setPosition(extraOffset) {
            const itemW = getItemWidth();
            const containerW = getContainerWidth();
            // Center the active item
            let offset = current * itemW - (containerW - itemW) / 2;
            offset -= (extraOffset || 0);
            carouselTrack.style.transform = `translateX(${-offset}px)`;
        }

        function goTo(idx, animate = true) {
            if (animate) {
                carouselTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                carouselTrack.style.transition = 'none';
            }
            
            current = idx;
            setPosition();
            updateUI();

            // Infinite snap logic:
            if (animate && current >= realTotal) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    current = current % realTotal;
                    setPosition();
                    updateUI();
                    void carouselTrack.offsetWidth;
                }, 500);
            } else if (animate && current < 0) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    current = realTotal + (current % realTotal);
                    setPosition();
                    updateUI();
                    void carouselTrack.offsetWidth;
                }, 500);
            } else if (!animate) {
                if (current >= realTotal) current = current % realTotal;
                else if (current < 0) current = realTotal + (current % realTotal);
                setPosition();
                updateUI();
            }
        }

        goTo(0, false);

        prevBtn.addEventListener('click', () => {
            if (current <= 0) {
                carouselTrack.style.transition = 'none';
                current = realTotal;
                setPosition();
                void carouselTrack.offsetWidth;
            }
            goTo(current - 1);
        });

        nextBtn.addEventListener('click', () => goTo(current + 1));

        // Click handler
        allItems.forEach((item, i) => {
            item.addEventListener('click', (e) => {
                if (isDragging) return;
                let realIndex = i % realTotal;
                openLightbox(realIndex);
            });
        });

        // ---- DRAG / SWIPE SUPPORT ----
        function onDragStart(x) {
            isDragging = false;
            dragStartX = x;
            dragCurrentX = x;
            dragOffset = 0;
            carouselTrack.style.transition = 'none';
            carouselTrack.classList.add('dragging');
        }

        function onDragMove(x) {
            dragCurrentX = x;
            dragOffset = dragCurrentX - dragStartX;
            if (Math.abs(dragOffset) > 5) isDragging = true;
            setPosition(-dragOffset);
        }

        function onDragEnd() {
            carouselTrack.classList.remove('dragging');
            const threshold = getItemWidth() * 0.2;
            if (dragOffset < -threshold) {
                goTo(current + 1);
            } else if (dragOffset > threshold) {
                if (current <= 0) {
                    carouselTrack.style.transition = 'none';
                    current = realTotal;
                    setPosition();
                    void carouselTrack.offsetWidth;
                }
                goTo(current - 1);
            } else {
                goTo(current);
            }
            setTimeout(() => { isDragging = false; }, 50);
        }

        carouselTrack.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onDragStart(e.clientX);
            const onMove = (ev) => onDragMove(ev.clientX);
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                onDragEnd();
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        carouselTrack.addEventListener('touchstart', (e) => {
            onDragStart(e.touches[0].clientX);
        }, { passive: true });
        carouselTrack.addEventListener('touchmove', (e) => {
            onDragMove(e.touches[0].clientX);
        }, { passive: true });
        carouselTrack.addEventListener('touchend', () => {
            onDragEnd();
        }, { passive: true });

        // Auto-play
        let timer = setInterval(() => {
            goTo(current + 1);
        }, 3500);
        const root = carouselTrack.parentElement;
        root.addEventListener('mouseenter', () => clearInterval(timer));
        root.addEventListener('mouseleave', () => {
            timer = setInterval(() => {
                goTo(current + 1);
            }, 3500);
        });

        // Resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => goTo(current, false), 100);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            const lb = document.getElementById('lightbox');
            if (lb && lb.classList.contains('open')) return;
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        });

        // =====================
        // LIGHTBOX
        // =====================
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
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

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            lbIndex = (lbIndex - 1 + imgSrcs.length) % imgSrcs.length;
            lightboxImg.src = imgSrcs[lbIndex];
            lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
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

    document.querySelectorAll('.section-title h2, .section-title p, .section-title .underline').forEach((el, i) => {
        el.classList.add('reveal-el');
        el.dataset.delay = i * 60;
        revealObserver.observe(el);
    });

    document.querySelectorAll('.value-item, .info-item, .fb-cta-card, .fb-widget-wrapper, .contact-info-card, .contact-main-card, .step-item, .contact-promise').forEach((item, i) => {
        item.classList.add('reveal-el');
        item.dataset.delay = i * 80;
        revealObserver.observe(item);
    });
});
