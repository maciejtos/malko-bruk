// =====================
// COOKIE CONSENT SYSTEM
// =====================
(function () {
    const CONSENT_KEY = 'malkobruk_cookie_consent';
    const FB_PAGE_URL = 'https://www.facebook.com/profile.php?id=61573181715064';
    const FB_IFRAME_SRC = 'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61573181715064&tabs=timeline&width=500&height=800&small_header=true&adapt_container_width=false&hide_cover=false&show_facepile=true&appId';

    // --- State ---
    let consent = loadConsent();

    function loadConsent() {
        try {
            const raw = localStorage.getItem(CONSENT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveConsent(analytical, marketing) {
        const data = { necessary: true, analytical: !!analytical, marketing: !!marketing, timestamp: Date.now() };
        try { localStorage.setItem(CONSENT_KEY, JSON.stringify(data)); } catch (e) {}
        consent = data;
    }

    // --- FB Widget ---
    function applyConsent() {
        const wrapper = document.getElementById('fbWidgetWrapper');
        if (!wrapper) return;

        if (consent && consent.marketing) {
            // Inject iframe if not already present
            if (!wrapper.querySelector('iframe')) {
                wrapper.innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.id = 'fbWidget';
                iframe.title = 'Profil MALKO BRUK na Facebooku';
                iframe.src = FB_IFRAME_SRC;
                iframe.setAttribute('width', '100%');
                iframe.setAttribute('height', '100%');
                iframe.setAttribute('scrolling', 'yes');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('loading', 'lazy');
                iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
                iframe.style.cssText = 'border:none;overflow:hidden;display:block;width:100%;height:100%;min-height:500px;';
                wrapper.appendChild(iframe);
            }
        } else {
            // Show placeholder
            if (!wrapper.querySelector('.fb-consent-placeholder')) {
                wrapper.innerHTML = `
                    <div class="fb-consent-placeholder">
                        <div class="fb-placeholder-icon"><i class="fab fa-facebook-f" aria-hidden="true"></i></div>
                        <p class="fb-placeholder-title">Wtyczka społecznościowa Facebook</p>
                        <p class="fb-placeholder-desc">Ten widget wymaga zgody na marketingowe pliki cookies (Meta/Facebook), aby móc się załadować.</p>
                        <button class="fb-placeholder-accept-btn" id="fbPlaceholderAccept"><i class="fas fa-check" aria-hidden="true"></i> Akceptuję ciasteczka marketingowe</button>
                        <button class="fb-placeholder-settings-link" id="fbPlaceholderSettings">Zarządzaj ciasteczkami</button>
                    </div>
                `;
                const acceptBtn = document.getElementById('fbPlaceholderAccept');
                const settingsBtn = document.getElementById('fbPlaceholderSettings');
                if (acceptBtn) acceptBtn.addEventListener('click', function () {
                    saveConsent(consent ? consent.analytical : false, true);
                    applyConsent();
                    hideBanner();
                });
                if (settingsBtn) settingsBtn.addEventListener('click', openModal);
            }
        }
    }

    // --- Banner ---
    function showBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.removeAttribute('aria-hidden');
            // Delay to allow CSS transition to trigger
            setTimeout(() => banner.classList.add('visible'), 50);
        }
    }

    function hideBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('visible');
            banner.setAttribute('aria-hidden', 'true');
        }
    }

    // --- Modal ---
    function openModal() {
        const overlay = document.getElementById('cookieModalOverlay');
        const analyticalChk = document.getElementById('consentAnalytical');
        const marketingChk = document.getElementById('consentMarketing');
        if (!overlay) return;
        // Sync checkboxes to current state
        if (analyticalChk) analyticalChk.checked = !!(consent && consent.analytical);
        if (marketingChk) marketingChk.checked = !!(consent && consent.marketing);
        overlay.removeAttribute('aria-hidden');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const overlay = document.getElementById('cookieModalOverlay');
        if (!overlay) return;
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // --- Event Wiring (runs after DOM is ready) ---
    document.addEventListener('DOMContentLoaded', function () {
        // Initial state
        if (!consent) {
            // First visit — show banner after 800ms
            setTimeout(showBanner, 800);
        }
        applyConsent();

        // Banner buttons
        const acceptAllBtn = document.getElementById('cookieAcceptAll');
        const rejectAllBtn = document.getElementById('cookieRejectAll');
        const openSettingsBtn = document.getElementById('cookieOpenSettings');

        if (acceptAllBtn) acceptAllBtn.addEventListener('click', function () {
            saveConsent(true, true);
            hideBanner();
            applyConsent();
        });

        if (rejectAllBtn) rejectAllBtn.addEventListener('click', function () {
            saveConsent(false, false);
            hideBanner();
            applyConsent();
        });

        if (openSettingsBtn) openSettingsBtn.addEventListener('click', function () {
            hideBanner();
            openModal();
        });

        // Modal buttons
        const modalClose = document.getElementById('cookieModalClose');
        const modalReject = document.getElementById('cookieModalReject');
        const modalSave = document.getElementById('cookieSaveSettings');
        const modalAcceptAll = document.getElementById('cookieModalAcceptAll');

        if (modalClose) modalClose.addEventListener('click', closeModal);

        if (modalReject) modalReject.addEventListener('click', function () {
            saveConsent(false, false);
            closeModal();
            applyConsent();
        });

        if (modalSave) modalSave.addEventListener('click', function () {
            const analyticalChk = document.getElementById('consentAnalytical');
            const marketingChk = document.getElementById('consentMarketing');
            saveConsent(
                analyticalChk ? analyticalChk.checked : false,
                marketingChk ? marketingChk.checked : false
            );
            closeModal();
            applyConsent();
        });

        if (modalAcceptAll) modalAcceptAll.addEventListener('click', function () {
            const analyticalChk = document.getElementById('consentAnalytical');
            const marketingChk = document.getElementById('consentMarketing');
            if (analyticalChk) analyticalChk.checked = true;
            if (marketingChk) marketingChk.checked = true;
            saveConsent(true, true);
            closeModal();
            applyConsent();
        });

        // Close modal on overlay click
        const overlay = document.getElementById('cookieModalOverlay');
        if (overlay) overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const overlay = document.getElementById('cookieModalOverlay');
                if (overlay && overlay.classList.contains('visible')) closeModal();
            }
        });

        // Floating button
        const floatBtn = document.getElementById('cookieFloatBtn');
        if (floatBtn) floatBtn.addEventListener('click', openModal);
    });
})();

document.addEventListener('DOMContentLoaded', () => {

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        });
    }

    // Close mobile menu on link click — also updates aria-expanded
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Navbar scroll effect & paving divider reveal with dynamic background fading
    const navbar = document.querySelector('.navbar');
    const pavingDivider = document.querySelector('.paving-divider');
    const heroBg = document.querySelector('.hero-bg');

    let ticking = false;
    const handleScroll = () => {
        const scrollY = window.scrollY;

        // Navbar styling
        if (navbar) {
            if (scrollY > 50) {
                navbar.style.background = 'rgba(14, 14, 14, 0.95)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
            } else {
                navbar.style.background = 'rgba(14, 14, 14, 0.75)';
                navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
            }
        }

        // Paving divider styling
        if (pavingDivider) {
            if (scrollY > 20) {
                pavingDivider.classList.add('visible');
            } else {
                pavingDivider.classList.remove('visible');
            }
        }

        // Dynamic hero fade-out (Method 3)
        if (heroBg && window.innerWidth > 768) {
            // Fade-out starts at 85% at scroll = 0, and becomes sharp (100%) at scroll = 100
            const fadeValue = Math.min(100, 85 + (scrollY / 100) * 15);
            heroBg.style.setProperty('--hero-fade', `${fadeValue}%`);
        }
        
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });
    handleScroll(); // Run initially to set the correct state on load

    // Scroll reveal for service cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Clear inline transition after animation completes so hover transitions work properly
                setTimeout(() => {
                    entry.target.style.transition = '';
                }, 500);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '0px 0px 50px 0px' });

    document.querySelectorAll('.service-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        card.style.transition = `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`;
        observer.observe(card);
    });

    // =====================
    // CAROUSEL — Infinite Loop & Dynamic Load
    // =====================
    const carouselTrack = document.getElementById('carouselTrack');

    if (carouselTrack) {
        initializeDynamicCarousel(carouselTrack);
    }

    function initializeDynamicCarousel(carouselTrack) {
        const carouselDots = document.getElementById('carouselDots');
        const carouselCounter = document.getElementById('carouselCounter');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');

        const folder = 'realizacje/';

        // SEO friendly descriptions for all 36 photos
        const imageAlts = [
            'Kompleksowe usługi brukarskie - MALKO BRUK',
            'Podjazd z kostki brukowej, Śląsk',
            'Nowoczesny taras z kostki betonowej, Tychy',
            'Elegancki chodnik przydomowy, Małopolska',
            'Podjazd z kostki granitowej premium',
            'System odwodnienia liniowego na podjeździe',
            'Trwały podjazd z kostki brukowej przed domem',
            'Nowoczesne ogrodzenie panelowe z bramą',
            'Taras ogrodowy z dużych płyt betonowych',
            'Drenaż opaskowy wokół fundamentów domu',
            'Kostka brukowa przy budynku mieszkalnym, Tychy',
            'Alejka ogrodowa z kostki granitowej',
            'Profesjonalne układanie kostki brukowej',
            'Podjazd z betonowych płyt tarasowych',
            'Odwodnienie terenu posesji - MALKO BRUK',
            'Chodnik z kostki brukowej wzdłuż ogrodzenia',
            'Prace brukarskie - Śląsk i Małopolska',
            'Kostka brukowa pod tarasem',
            'Realizacja odwodnienia liniowego',
            'Brukowanie strefy wejściowej do domu',
            'Podjazd z kostki betonowej o strukturze granitu',
            'Prace ziemne i drenażowe - MALKO BRUK',
            'Kompleksowa realizacja brukarsko-odwodnieniowa',
            'Ułożona kostka brukowa na podjeździe',
            'Taras z dużych płyt betonowych przy domu',
            'Drenaż fundamentów i odwodnienie działki',
            'Schody ogrodowe z kostki granitowej',
            'Realizacja chodnika z kostki brukowej',
            'Profesjonalne brukowanie - efekt końcowy',
            'Zbiornik retencyjny na deszczówkę - montaż',
            'Podjazd z kostki brukowej z obrzeżami',
            'Prace brukarskie na Śląsku - MALKO BRUK S.C.',
            'Kompleksowe odwodnienie posesji',
            'Układanie kostki granitowej - realizacja',
            'Nowoczesny podjazd z kostki betonowej',
            'Chodnik i podjazd z kostki brukowej'
        ];

        // Helper to shuffle array in-place (Fisher-Yates)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // Static image list — eliminates all HTTP probing (was up to 600 requests)
        const allImages = Array.from({ length: 36 }, (_, i) => ({
            src: `${folder}realizacja${i}.webp`,
            index: i,
            alt: imageAlts[i]
        }));

        // realizacja0 always first, shuffle the rest
        const firstImage = allImages[0];
        const restImages = allImages.slice(1);
        shuffleArray(restImages);
        const finalImages = [firstImage, ...restImages];

        // Generate HTML structure for all detected images
        finalImages.forEach((imgData, idx) => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.setAttribute('data-index', idx);
            
            item.innerHTML = `
                <img src="${imgData.src}" width="800" height="600" alt="${imgData.alt}" loading="lazy">
                <div class="carousel-item-overlay"><i class="fas fa-search-plus" aria-hidden="true"></i></div>
            `;
            carouselTrack.appendChild(item);
        });

        // Initialize Carousel Variables
        let originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        let realTotal = originalItems.length;

        // Clone last item and prepend it to the beginning
        const lastItemClone = originalItems[realTotal - 1].cloneNode(true);
        lastItemClone.classList.add('clone');
        carouselTrack.insertBefore(lastItemClone, originalItems[0]);

        // Clone first item and append it to the end
        const firstItemClone = originalItems[0].cloneNode(true);
        firstItemClone.classList.add('clone');
        carouselTrack.appendChild(firstItemClone);
        
        const allItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        const total = allItems.length;
        let current = 1; // Start at the first original item (index 1)
        let isDragging = false;
        let dragStartX = 0;
        let dragCurrentX = 0;
        let dragOffset = 0;

        // Build dots (only for realTotal)
        if (carouselDots) {
            carouselDots.innerHTML = '';
            originalItems.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Zdjęcie ${i + 1}`);
                dot.addEventListener('click', () => goTo(i + 1));
                carouselDots.appendChild(dot);
            });
        }

        function getItemWidth() {
            return allItems[0].offsetWidth;
        }

        function updateUI() {
            let realCurrent = ((current - 1) % realTotal + realTotal) % realTotal;
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
            const dots = document.querySelectorAll('.carousel-dot');
            if (dots.length > 0) {
                const containerWidth = 80; // container width in px
                const dotSpacing = 16;     // dot width (8px) + gap (8px)
                const totalWidth = realTotal * dotSpacing - 8;
                const trackWidth = totalWidth + 16; // dots width including 8px padding on both sides
                const isLarge = trackWidth > containerWidth;
                
                if (!isLarge) {
                    dots.forEach((d, i) => {
                        d.classList.toggle('active', i === realCurrent);
                        d.style.transform = i === realCurrent ? 'scale(1.3)' : 'scale(1.0)';
                        d.style.opacity = i === realCurrent ? '1' : '0.4';
                    });
                    if (carouselDots) {
                        carouselDots.style.transform = `translateX(${(containerWidth - trackWidth) / 2}px)`;
                    }
                } else {
                    dots.forEach((d, i) => {
                        let diff = Math.abs(i - realCurrent);
                        d.classList.toggle('active', i === realCurrent);
                        if (i === realCurrent) {
                            d.style.transform = 'scale(1.3)';
                            d.style.opacity = '1';
                        } else if (diff === 1) {
                            d.style.transform = 'scale(1.0)';
                            d.style.opacity = '0.7';
                        } else if (diff === 2) {
                            d.style.transform = 'scale(0.6)';
                            d.style.opacity = '0.4';
                        } else {
                            d.style.transform = 'scale(0)';
                            d.style.opacity = '0';
                        }
                    });
                    if (carouselDots) {
                        const targetX = -(realCurrent * dotSpacing) + 28; // centers dot: -(realCurrent*16) - 8 + 40 - 4
                        const minX = -(totalWidth - 64); // -(totalWidth + 16 - 80)
                        const maxX = 0;
                        const translateX = Math.max(minX, Math.min(maxX, targetX));
                        carouselDots.style.transform = `translateX(${translateX}px)`;
                    }
                }
            }
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
            if (animate && current >= realTotal + 1) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    current = 1;
                    setPosition();
                    updateUI();
                    void carouselTrack.offsetWidth;
                }, 500);
            } else if (animate && current <= 0) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    current = realTotal;
                    setPosition();
                    updateUI();
                    void carouselTrack.offsetWidth;
                }, 500);
            } else if (!animate) {
                if (current >= realTotal + 1) current = 1;
                else if (current <= 0) current = realTotal;
                setPosition();
                updateUI();
            }
        }

        goTo(1, false);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (current <= 0) {
                    carouselTrack.style.transition = 'none';
                    current = realTotal;
                    setPosition();
                    void carouselTrack.offsetWidth;
                }
                goTo(current - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (current >= realTotal + 1) {
                    carouselTrack.style.transition = 'none';
                    current = 1;
                    setPosition();
                    void carouselTrack.offsetWidth;
                }
                goTo(current + 1);
            });
        }

        // Click handler for lightbox opening using event delegation on the track to be clone-safe
        carouselTrack.addEventListener('click', (e) => {
            if (isDragging) return;
            const item = e.target.closest('.carousel-item');
            if (item) {
                let realIndex = parseInt(item.getAttribute('data-index'));
                if (!isNaN(realIndex)) {
                    openLightbox(realIndex);
                }
            }
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
                if (current >= realTotal + 1) {
                    carouselTrack.style.transition = 'none';
                    current = 1;
                    setPosition();
                    void carouselTrack.offsetWidth;
                }
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

        // Auto-play — safe timer management (no leak on rapid mouseenter/leave)
        let timer = null;
        let isIntersecting = false;

        function startAutoplay() {
            if (!isIntersecting) return;
            if (lightbox && lightbox.classList.contains('open')) return;
            
            clearInterval(timer);
            timer = setInterval(() => {
                goTo(current + 1);
            }, 3500);
        }

        function stopAutoplay() {
            clearInterval(timer);
            timer = null;
        }

        const root = carouselTrack.parentElement;

        // Intersection Observer to run autoplay only when 100% visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isIntersecting = entry.isIntersecting;
                if (isIntersecting) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, { threshold: 1.0 });

        observer.observe(root);

        // Visibility API to pause when user switches browser tabs
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        root.addEventListener('mouseenter', stopAutoplay);
        root.addEventListener('mouseleave', () => {
            startAutoplay();
        });

        // Pause autoplay on touch (mobile)
        carouselTrack.addEventListener('touchstart', stopAutoplay, { passive: true, capture: true });
        carouselTrack.addEventListener('touchend', () => {
            setTimeout(startAutoplay, 1500);
        }, { passive: true });

        // Resize handler
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => goTo(current, false), 100);
        });

        // Unified keyboard handler — carousel + lightbox (single listener, no double-firing)
        document.addEventListener('keydown', (e) => {
            if (lightbox && lightbox.classList.contains('open')) {
                // Lightbox mode
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
                if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
            } else {
                // Carousel mode
                if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
                if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
            }
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

        const imgSrcs = originalItems.map(item => item.querySelector('img').src);

        function openLightbox(idx) {
            lbIndex = idx;
            lightboxImg.src = imgSrcs[lbIndex];
            lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            stopAutoplay();
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
            startAutoplay();
        }

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                lbIndex = (lbIndex - 1 + imgSrcs.length) % imgSrcs.length;
                lightboxImg.src = imgSrcs[lbIndex];
                lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                lbIndex = (lbIndex + 1) % imgSrcs.length;
                lightboxImg.src = imgSrcs[lbIndex];
                lightboxCounter.textContent = `${lbIndex + 1} / ${imgSrcs.length}`;
            });
        }
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
    }, { threshold: 0.01, rootMargin: '0px 0px 50px 0px' });

    // Stagger section title elements locally within their section title block
    document.querySelectorAll('.section-title').forEach((titleContainer) => {
        titleContainer.querySelectorAll('h2, p, .underline').forEach((el, i) => {
            el.classList.add('reveal-el');
            el.dataset.delay = i * 40;
            revealObserver.observe(el);
        });
    });

    // Group other items by layout container so stagger delay resets per container rather than piling up globally
    const groups = new Map();
    document.querySelectorAll('.fb-cta-card, .fb-widget-wrapper, .step-item').forEach((item) => {
        const groupParent = item.closest('section, .news-layout, .contact-modern-wrapper') || item.parentNode;
        if (!groups.has(groupParent)) {
            groups.set(groupParent, []);
        }
        groups.get(groupParent).push(item);
    });

    groups.forEach((items) => {
        items.forEach((item, i) => {
            item.classList.add('reveal-el');
            item.dataset.delay = i * 50;
            revealObserver.observe(item);
        });
    });
});
