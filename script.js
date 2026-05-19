/**
 * HAN YÖRESEL LEZZETLER - PREMIUM DIGITAL MENU LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const searchInput = document.getElementById('menuSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const noResultsAlert = document.getElementById('noResultsAlert');
    const categorySections = document.querySelectorAll('.menu-category-section');
    const navItems = document.querySelectorAll('.nav-cat-item');
    const categoryNavContainer = document.querySelector('.category-nav-container');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const lightboxModal = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxActiveImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    // --- 1. Turkish Character Normalization Helper ---
    function normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ç/g, 'c')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .trim();
    }

    // --- 2. Live Search Filtering Logic ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = normalizeText(e.target.value);
            
            // Show/hide clear button
            if (query.length > 0) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
            }

            let totalVisibleItems = 0;

            categorySections.forEach(section => {
                const itemCards = section.querySelectorAll('.menu-item-card, .menu-list-row-item, .drink-item-row');
                let visibleItemsInSection = 0;

                itemCards.forEach(item => {
                    const itemName = normalizeText(item.getAttribute('data-name') || '');
                    
                    if (itemName.includes(query)) {
                        item.style.display = ''; // Reset CSS display style (show)
                        visibleItemsInSection++;
                        totalVisibleItems++;
                    } else {
                        item.style.display = 'none'; // Hide
                    }
                });

                // Hide entire category if no items match
                if (visibleItemsInSection === 0 && query.length > 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = ''; // Show section
                }
            });

            // Show 'no results' alert if everything is hidden
            if (totalVisibleItems === 0 && query.length > 0) {
                noResultsAlert.style.display = 'block';
            } else {
                noResultsAlert.style.display = 'none';
            }
        });
    }

    // Clear Search Input Action
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            noResultsAlert.style.display = 'none';
            
            // Restore everything
            categorySections.forEach(section => {
                section.style.display = '';
                const itemCards = section.querySelectorAll('.menu-item-card, .menu-list-row-item, .drink-item-row');
                itemCards.forEach(item => {
                    item.style.display = '';
                });
            });
            searchInput.focus();
        });
    }

    // --- 3. Scroll Spy (Highlight Category in Sticky Bar) ---
    let isClickScrolling = false; // Flag to prevent scroll spy jump when clicking nav links

    function highlightActiveCategory() {
        if (isClickScrolling) return;

        let activeSectionId = '';
        const scrollPosition = window.scrollY + 180; // Offset matches sticky nav spacing

        categorySections.forEach(section => {
            // Check if section is currently active/visible on screen
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSectionId = section.getAttribute('id');
            }
        });

        // If at the very top of the page, activate the first item
        if (window.scrollY < 100) {
            activeSectionId = categorySections[0].getAttribute('id');
        }

        // If we scrolled to the very bottom, activate the contact/info section
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
            activeSectionId = 'iletisim-bilgi';
        }

        if (activeSectionId) {
            navItems.forEach(item => {
                if (item.getAttribute('data-target') === activeSectionId) {
                    if (!item.classList.contains('active')) {
                        item.classList.add('active');
                        // Smoothly scroll the category bar horizontally to keep active item in view
                        item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', highlightActiveCategory);
    highlightActiveCategory(); // Initial run on load

    // --- 4. Smooth Navigation Link Scrolling with Offsets ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                isClickScrolling = true;
                
                // Add active state instantly for visual feedback
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

                // Calculate scroll position with offset for sticky navbar + category nav
                const offset = 135; // navbar height (73px) + categoryNav height (~62px)
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Reset click scrolling flag after scroll completes
                setTimeout(() => {
                    isClickScrolling = false;
                }, 800);
            }
        });
    });

    // --- 5. Scroll To Top Widget ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 6. Lightbox modal handles ---
    window.openLightbox = function(element) {
        if (!lightboxModal || !lightboxImg) return;

        const img = element.querySelector('img');
        if (!img) return;

        // Extract title name from parents/siblings
        let itemTitle = '';
        const cardBody = element.closest('.menu-item-card');
        const rowBody = element.closest('.menu-list-row-item');

        if (cardBody) {
            const nameEl = cardBody.querySelector('.item-name');
            if (nameEl) itemTitle = nameEl.textContent;
        } else if (rowBody) {
            const nameEl = rowBody.querySelector('.row-item-name');
            if (nameEl) itemTitle = nameEl.textContent;
        }

        // Set image source and captions
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Menü Görseli';
        if (lightboxCaption) {
            lightboxCaption.textContent = itemTitle;
        }

        // Open Modal
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Freeze background scrolling
    };

    window.closeLightbox = function() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    };

    // Close lightbox when clicking anywhere except the active image itself
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target !== lightboxImg && e.target !== lightboxCaption) {
                closeLightbox();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

});
