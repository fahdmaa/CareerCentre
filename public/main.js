// EMSI Marrakech Career Center - main.js

// Prevent multiple initializations
if (window.emsiCareerCenterInitialized) {
    console.warn("EMSI Career Center already initialized, skipping duplicate initialization");
} else {
    window.emsiCareerCenterInitialized = true;

    document.addEventListener("DOMContentLoaded", () => {
        console.log("EMSI Career Center scripts initialized.");

        // --- Pill Navigation Bar Functionality --- //
        function initializePillNavigation() {
            const navbarItems = document.querySelectorAll('.pill-navbar-item');
            const navbar = document.querySelector('.pill-navbar');

            if (!navbarItems.length || !navbar) return;

            // Set active navigation item based on current page
            const currentPath = window.location.pathname;

            // Clear any existing active classes
            navbarItems.forEach(item => {
                item.classList.remove('active');
                const label = item.querySelector('.pill-navbar-label');
                if (label) {
                    label.style.display = 'none';
                }
            });

            // Find and set the active navigation item
            navbarItems.forEach(item => {
                const href = item.getAttribute('href');
                if (href) {
                    if (currentPath.endsWith(href) ||
                        (currentPath === '/' && href === 'index.html') ||
                        (currentPath.endsWith('/') && href === 'index.html')) {

                        item.classList.add('active');
                        const label = item.querySelector('.pill-navbar-label');
                        if (label) {
                            label.style.display = 'inline-block';
                            label.style.animation = 'fadeIn 0.3s ease-out';
                        }
                    }
                }

                // Enhanced hover effects for navbar items
                item.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('active')) {
                        this.style.transform = 'translateY(-2px) scale(1.05)';
                    }
                });

                item.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('active')) {
                        this.style.transform = 'translateY(0) scale(1)';
                    }
                });
            });

            // Theme switching functionality
            function setNavbarTheme(theme) {
                navbar.classList.remove('dark', 'blue', 'light', 'white-gradient');
                navbar.classList.add(theme);
                localStorage.setItem('navbarTheme', theme);
            }

            // Load saved theme preference
            const savedTheme = localStorage.getItem('navbarTheme');
            if (savedTheme) {
                setNavbarTheme(savedTheme);
            }

            // Theme toggle buttons
            const themeButtons = document.querySelectorAll('.theme-toggle');
            if (themeButtons.length > 0) {
                themeButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const theme = button.dataset.theme;
                        setNavbarTheme(theme);
                    });
                });
            }
        }

        // --- Hide Navbar on Scroll Functionality --- //
        function initializeHideOnScroll() {
            const hideOnScrollNavbar = document.querySelector('.pill-navbar.hide-on-scroll');
            if (!hideOnScrollNavbar) return;

            let lastScrollTop = 0;
            let scrollThreshold = 30;
            let ticking = false;

            function updateNavbarVisibility() {
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

                if (Math.abs(lastScrollTop - currentScroll) > scrollThreshold) {
                    if (currentScroll > lastScrollTop && currentScroll > 80) {
                        hideOnScrollNavbar.classList.add('hidden');
                    } else {
                        hideOnScrollNavbar.classList.remove('hidden');
                    }
                    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
                }
                ticking = false;
            }

            window.addEventListener('scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(updateNavbarVisibility);
                    ticking = true;
                }
            });
        }

        // --- Optimized Intersection Observer for Scroll Animations --- //
        function initializeScrollAnimations() {
            // Check if animations are disabled for this page
            if (window.emsiDisableAnimations) {
                const animateOnScrollElements = document.querySelectorAll("[class*='animate-on-scroll'], .animate-on-scroll");
                animateOnScrollElements.forEach(element => {
                    element.classList.add("visible");
                    element.style.opacity = "1";
                    element.style.transform = "none";
                });
                return;
            }
            
            // Check for reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // Make all elements visible immediately if user prefers reduced motion
                const animateOnScrollElements = document.querySelectorAll("[class*='animate-on-scroll'], .animate-on-scroll");
                animateOnScrollElements.forEach(element => {
                    element.classList.add("visible");
                    element.style.opacity = "1";
                    element.style.transform = "none";
                });
                return;
            }

            const animateOnScrollElements = document.querySelectorAll("[class*='animate-on-scroll'], .animate-on-scroll");
            if (animateOnScrollElements.length === 0) return;

            // Use more efficient intersection observer with batched updates
            let pendingAnimations = [];
            let animationFrameId = null;

            const processPendingAnimations = () => {
                pendingAnimations.forEach(element => {
                    // Use CSS classes instead of inline styles for better performance
                    if (element.classList.contains("animate-on-scroll")) {
                        element.classList.add("visible");
                    }
                    if (element.classList.contains("animate-slide-up-on-scroll")) {
                        element.classList.add("animate-slide-up-visible");
                    }
                    if (element.classList.contains("animate-fade-in-on-scroll")) {
                        element.classList.add("animate-fade-in-visible");
                    }
                    if (element.classList.contains("animate-slide-right-on-scroll")) {
                        element.classList.add("animate-slide-right-visible");
                    }

                    // Optimized staggered children animations
                    if (element.classList.contains("stagger-children")) {
                        const children = Array.from(element.children);
                        children.forEach((child, index) => {
                            child.style.animationDelay = `${index * 80}ms`;
                            child.classList.add('stagger-animate');
                        });
                    }
                });

                pendingAnimations = [];
                animationFrameId = null;
            };

            const scrollObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        pendingAnimations.push(entry.target);
                        observer.unobserve(entry.target);
                        
                        // Batch animation updates in a single frame
                        if (!animationFrameId) {
                            animationFrameId = requestAnimationFrame(processPendingAnimations);
                        }
                    }
                });
            }, {
                threshold: 0.1, // Reduced threshold for earlier trigger
                rootMargin: '50px 0px -50px 0px' // Optimized margins
            });

            animateOnScrollElements.forEach(element => {
                scrollObserver.observe(element);
            });
        }

        // --- Parallax Scrolling Effect --- //
        function initializeParallax() {
            const parallaxElements = document.querySelectorAll('.parallax');
            if (parallaxElements.length === 0) return;

            let parallaxTicking = false;

            function updateParallax() {
                const scrolled = window.pageYOffset;
                parallaxElements.forEach(element => {
                    const rate = scrolled * -0.5;
                    element.style.transform = `translateY(${rate}px)`;
                });
                parallaxTicking = false;
            }

            window.addEventListener('scroll', function() {
                if (!parallaxTicking) {
                    requestAnimationFrame(updateParallax);
                    parallaxTicking = true;
                }
            });
        }

        // --- Floating Elements Animation --- //
        function initializeFloatingElements() {
            const floatingElements = document.querySelectorAll("[class*='animate-float']");

            if (floatingElements.length > 0) {
                floatingElements.forEach((element, index) => {
                    const randomDelay = Math.random() * 3;
                    const randomDuration = 4 + Math.random() * 4;

                    element.style.animationDelay = `${randomDelay}s`;
                    element.style.animationDuration = `${randomDuration}s`;

                    const randomRotation = (Math.random() - 0.5) * 10;
                    element.style.transform = `rotate(${randomRotation}deg)`;
                });
            }
        }

        // --- Testimonial Card Animations --- //
        function initializeTestimonials() {
            const testimonialSlides = document.querySelectorAll('.testimonial-slide');

            if (testimonialSlides.length > 0) {
                testimonialSlides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        slide.classList.add('animate-card');
                    }
                });

                const prevButton = document.getElementById('prev-testimonial');
                const nextButton = document.getElementById('next-testimonial');

                if (prevButton && nextButton) {
                    [prevButton, nextButton].forEach(button => {
                        button.addEventListener('click', () => {
                            button.style.opacity = '0.7';
                            button.style.transform = 'scale(0.95)';

                            setTimeout(() => {
                                testimonialSlides.forEach((slide, index) => {
                                    if (slide.classList.contains('active')) {
                                        slide.classList.add('animate-card');
                                        slide.style.transitionDelay = `${index * 0.1}s`;
                                    } else {
                                        slide.classList.remove('animate-card');
                                        slide.style.transitionDelay = '0s';
                                    }
                                });

                                button.style.opacity = '1';
                                button.style.transform = 'scale(1)';
                            }, 50);
                        });
                    });
                }
            }
        }

        // --- Smooth Scroll for Anchor Links --- //
        function initializeSmoothScroll() {
            const anchorLinks = document.querySelectorAll("a[href^=\"#\"]");
            anchorLinks.forEach(anchor => {
                anchor.addEventListener("click", function(e) {
                    const href = this.getAttribute("href");
                    if (href.length > 1 && document.querySelector(href)) {
                        e.preventDefault();

                        const target = document.querySelector(href);
                        const offsetTop = target.offsetTop - 100;

                        window.scrollTo({
                            top: offsetTop,
                            behavior: "smooth"
                        });

                        target.style.transform = 'scale(1.02)';
                        target.style.transition = 'transform 0.3s ease';

                        setTimeout(() => {
                            target.style.transform = 'scale(1)';
                        }, 300);
                    }
                });
            });
        }

        // --- Job Filters Functionality --- //
        function initializeJobFilters() {
            const jobSearchForm = document.getElementById('jobSearchForm');
            const jobCards = document.querySelectorAll('.job-card');

            if (!jobSearchForm || jobCards.length === 0) return;

            // Debounce function for better performance
            function debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }

            const performSearch = debounce(() => {
                const keyword = document.getElementById('keyword')?.value?.toLowerCase() || '';
                const jobType = document.getElementById('jobType')?.value || '';
                const location = document.getElementById('location')?.value || '';

                let visibleJobs = 0;

                jobCards.forEach((card, index) => {
                    const jobTitle = card.querySelector('.job-title')?.textContent?.toLowerCase() || '';
                    const jobDescription = card.querySelector('.job-description')?.textContent?.toLowerCase() || '';
                    const companyName = card.querySelector('.company-name')?.textContent?.toLowerCase() || '';
                    const metaItems = card.querySelectorAll('.meta-item');

                    let typeMatch = !jobType;
                    let locationMatch = !location;

                    metaItems.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        if (jobType && text.includes(jobType.toLowerCase())) {
                            typeMatch = true;
                        }
                        if (location && text.includes(location.toLowerCase())) {
                            locationMatch = true;
                        }
                    });

                    const keywordMatch = !keyword ||
                        jobTitle.includes(keyword) ||
                        jobDescription.includes(keyword) ||
                        companyName.includes(keyword);

                    if (keywordMatch && typeMatch && locationMatch) {
                        setTimeout(() => {
                            card.style.display = 'flex';
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';

                            requestAnimationFrame(() => {
                                card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            });
                        }, index * 50);

                        visibleJobs++;
                    } else {
                        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-20px)';

                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });

                // Update the results count
                const resultsCount = document.querySelector('.results-count strong');
                if (resultsCount) {
                    resultsCount.style.transform = 'scale(1.1)';
                    resultsCount.textContent = visibleJobs;

                    setTimeout(() => {
                        resultsCount.style.transform = 'scale(1)';
                    }, 200);
                }
            }, 300);

            jobSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                performSearch();
            });

            // Real-time search on input
            const searchInputs = jobSearchForm.querySelectorAll('input, select');
            searchInputs.forEach(input => {
                input.addEventListener('input', performSearch);
            });

            // Reset button functionality
            let resetButton = jobSearchForm.querySelector('.search-reset');
            if (!resetButton) {
                resetButton = document.createElement('button');
                resetButton.type = 'reset';
                resetButton.className = 'btn btn-outline-primary search-reset';
                resetButton.innerHTML = '<i class="fas fa-refresh"></i> Reset';

                resetButton.addEventListener('click', () => {
                    jobCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.display = 'flex';
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';

                            requestAnimationFrame(() => {
                                card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            });
                        }, index * 30);
                    });

                    const resultsCount = document.querySelector('.results-count strong');
                    if (resultsCount) {
                        resultsCount.textContent = jobCards.length;
                    }
                });

                jobSearchForm.appendChild(resetButton);
            }
        }

        // --- Checkbox Filters --- //
        function initializeCheckboxFilters() {
            const filterCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
            const jobCards = document.querySelectorAll('.job-card');

            if (filterCheckboxes.length === 0 || jobCards.length === 0) return;

            filterCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateJobFilters);

                // Enhanced visual feedback
                checkbox.addEventListener('change', function() {
                    const label = this.parentElement;
                    if (this.checked) {
                        label.style.transform = 'scale(1.05)';
                        label.style.color = 'var(--emsi-accent-green)';
                    } else {
                        label.style.transform = 'scale(1)';
                        label.style.color = '';
                    }

                    setTimeout(() => {
                        label.style.transform = 'scale(1)';
                    }, 200);
                });
            });

            function updateJobFilters() {
                const activeFilters = {};

                filterCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        const category = checkbox.name;
                        const value = checkbox.value;

                        if (!activeFilters[category]) {
                            activeFilters[category] = [];
                        }

                        activeFilters[category].push(value);
                    }
                });

                let visibleJobs = 0;

                jobCards.forEach((card, index) => {
                    const jobMeta = card.querySelector('.job-meta')?.textContent?.toLowerCase() || '';
                    const jobContent = card.textContent.toLowerCase();

                    let display = true;

                    for (const category in activeFilters) {
                        const values = activeFilters[category];
                        if (values.length > 0) {
                            const categoryMatch = values.some(value =>
                                jobMeta.includes(value.toLowerCase()) ||
                                jobContent.includes(value.toLowerCase())
                            );

                            if (!categoryMatch) {
                                display = false;
                                break;
                            }
                        }
                    }

                    if (display) {
                        setTimeout(() => {
                            card.style.display = 'flex';
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px) scale(0.95)';

                            requestAnimationFrame(() => {
                                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0) scale(1)';
                            });
                        }, index * 40);

                        visibleJobs++;
                    } else {
                        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-20px) scale(0.95)';

                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });

                const resultsCount = document.querySelector('.results-count strong');
                if (resultsCount) {
                    resultsCount.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    resultsCount.style.transform = 'scale(1.2)';
                    resultsCount.style.color = 'var(--emsi-accent-green)';
                    resultsCount.textContent = visibleJobs;

                    setTimeout(() => {
                        resultsCount.style.transform = 'scale(1)';
                        resultsCount.style.color = '';
                    }, 300);
                }
            }
        }

        // --- Event Tab Switching --- //
        function initializeEventTabs() {
            const eventTabs = document.querySelectorAll('.event-tabs .tab');

            if (eventTabs.length === 0) return;

            eventTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    eventTabs.forEach(t => {
                        t.classList.remove('active');
                        t.style.transform = 'scale(1)';
                    });

                    tab.classList.add('active');
                    tab.style.transform = 'scale(1.05)';

                    setTimeout(() => {
                        tab.style.transform = 'scale(1)';
                    }, 200);

                    const tabId = tab.getAttribute('data-tab');
                    const tabContents = document.querySelectorAll('.event-content');

                    tabContents.forEach(content => {
                        content.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                        content.style.opacity = '0';
                        content.style.transform = 'translateY(20px)';

                        setTimeout(() => {
                            content.style.display = 'none';
                        }, 400);
                    });

                    setTimeout(() => {
                        const selectedContent = document.getElementById(`${tabId}-events`);
                        if (selectedContent) {
                            selectedContent.style.display = 'block';

                            requestAnimationFrame(() => {
                                selectedContent.style.opacity = '1';
                                selectedContent.style.transform = 'translateY(0)';
                            });
                        }
                    }, 450);
                });
            });
        }

        // --- Registration Modal Functionality --- //
        function initializeRegistrationModal() {
            const registrationModal = document.getElementById('registrationModal');
            const successModal = document.getElementById('successModal');
            const registrationForm = document.getElementById('registrationForm');
            const yearOfStudySelect = document.getElementById('yearOfStudy');
            const majorSelect = document.getElementById('major');

            const registerButtons = document.querySelectorAll('.register-btn');
            const closeButtons = document.querySelectorAll('.close-modal');
            const cancelButton = document.querySelector('.cancel-btn');
            const closeSuccessButton = document.querySelector('.close-success-btn');
            const selectedEventTitle = document.getElementById('selectedEventTitle');

            const majorOptions = {
                early: [
                    { value: 'AP', text: 'Appliquée (AP)' },
                    { value: 'IFA', text: 'Informatique et Finance Appliquées (IFA)' },
                    { value: 'GC', text: 'Génie Civil (GC)' }
                ],
                advanced: [
                    { value: 'MIAGE', text: 'Méthodes Informatiques Appliquées à la Gestion des Entreprises (MIAGE)' },
                    { value: 'GC', text: 'Génie Civil (GC)' },
                    { value: 'GESI', text: 'Génie des Systèmes d\'Information (GESI)' },
                    { value: 'GI', text: 'Génie Informatique (GI)' },
                    { value: 'IFA', text: 'Informatique et Finance Appliquées (IFA)' }
                ]
            };

            // Open registration modal
            if (registerButtons.length > 0) {
                registerButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        const eventTitle = button.getAttribute('data-event-title');
                        if (selectedEventTitle) {
                            selectedEventTitle.textContent = eventTitle;
                        }

                        if (registrationModal) {
                            registrationModal.style.display = 'block';
                            registrationModal.classList.add('show');
                            document.body.style.overflow = 'hidden';

                            const modalContent = registrationModal.querySelector('.modal-content');
                            if (modalContent) {
                                modalContent.style.transform = 'scale(0.8) translateY(50px)';
                                modalContent.style.opacity = '0';

                                requestAnimationFrame(() => {
                                    modalContent.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                                    modalContent.style.transform = 'scale(1) translateY(0)';
                                    modalContent.style.opacity = '1';
                                });
                            }
                        }
                    });
                });
            }

            // Close modal functions
            function closeModal(modal) {
                if (!modal) return;

                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    modalContent.style.transform = 'scale(0.9) translateY(20px)';
                    modalContent.style.opacity = '0';
                }

                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';

                    if (modal === registrationModal && registrationForm) {
                        registrationForm.reset();
                        if (majorSelect) {
                            majorSelect.disabled = true;
                            majorSelect.innerHTML = '<option value="">Please select year of study first</option>';
                        }
                    }
                }, 300);
            }

            // Close button event listeners
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modal = button.closest('.modal');
                    closeModal(modal);
                });
            });

            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    closeModal(registrationModal);
                });
            }

            if (closeSuccessButton) {
                closeSuccessButton.addEventListener('click', () => {
                    closeModal(successModal);
                });
            }

            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === registrationModal) {
                    closeModal(registrationModal);
                }
                if (e.target === successModal) {
                    closeModal(successModal);
                }
            });

            // Year of study change handler
            if (yearOfStudySelect && majorSelect) {
                yearOfStudySelect.addEventListener('change', function() {
                    const selectedYear = parseInt(this.value);

                    majorSelect.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    majorSelect.style.opacity = '0.5';
                    majorSelect.style.transform = 'scale(0.95)';

                    setTimeout(() => {
                        majorSelect.innerHTML = '<option value="">Select your major</option>';

                        if (selectedYear) {
                            majorSelect.disabled = false;

                            let options;
                            if (selectedYear <= 2) {
                                options = majorOptions.early;
                            } else {
                                options = majorOptions.advanced;
                            }

                            options.forEach((option, index) => {
                                setTimeout(() => {
                                    const optionElement = document.createElement('option');
                                    optionElement.value = option.value;
                                    optionElement.textContent = option.text;
                                    majorSelect.appendChild(optionElement);
                                }, index * 50);
                            });
                        } else {
                            majorSelect.disabled = true;
                            majorSelect.innerHTML = '<option value="">Please select year of study first</option>';
                        }

                        majorSelect.style.opacity = '1';
                        majorSelect.style.transform = 'scale(1)';
                    }, 150);
                });
            }

            // Form submission
            if (registrationForm) {
                registrationForm.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const formData = new FormData(this);
                    const registrationData = {};

                    for (let [key, value] of formData.entries()) {
                        registrationData[key] = value;
                    }

                    if (selectedEventTitle) {
                        registrationData.eventTitle = selectedEventTitle.textContent;
                    }

                    console.log('Registration Data:', registrationData);

                    const submitButton = this.querySelector('.submit-btn');
                    const originalText = submitButton.textContent;
                    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                    submitButton.disabled = true;
                    submitButton.style.background = '#ccc';

                    setTimeout(() => {
                        closeModal(registrationModal);

                        if (successModal) {
                            successModal.style.display = 'block';
                            successModal.classList.add('show');
                            document.body.style.overflow = 'hidden';

                            const successContent = successModal.querySelector('.modal-content');
                            if (successContent) {
                                successContent.style.transform = 'scale(0.8)';
                                successContent.style.opacity = '0';

                                requestAnimationFrame(() => {
                                    successContent.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                                    successContent.style.transform = 'scale(1)';
                                    successContent.style.opacity = '1';
                                });
                            }
                        }

                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                        submitButton.style.background = '';
                    }, 1500);
                });
            }
        }

        // --- Form Validation --- //
        function initializeFormValidation() {
            const forms = document.querySelectorAll('form:not(#jobSearchForm):not(#registrationForm)');

            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    let valid = true;
                    const requiredFields = form.querySelectorAll('[required]');

                    requiredFields.forEach(field => {
                        field.addEventListener('blur', validateField);
                        field.addEventListener('input', clearValidation);

                        if (!field.value.trim()) {
                            valid = false;
                            showFieldError(field, 'This field is required');
                        } else {
                            clearFieldError(field);
                        }
                    });

                    if (!valid) {
                        e.preventDefault();

                        const firstError = form.querySelector('.invalid');
                        if (firstError) {
                            firstError.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            firstError.focus();
                        }
                    }
                });
            });

            function validateField(e) {
                const field = e.target;
                if (field.hasAttribute('required') && !field.value.trim()) {
                    showFieldError(field, 'This field is required');
                } else {
                    clearFieldError(field);
                }
            }

            function clearValidation(e) {
                const field = e.target;
                if (field.value.trim()) {
                    clearFieldError(field);
                }
            }

            function showFieldError(field, message) {
                field.classList.add('invalid');
                field.style.transform = 'translateX(-5px)';
                field.style.borderColor = '#dc3545';

                setTimeout(() => {
                    field.style.transform = 'translateX(0)';
                }, 200);

                if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = message;
                    errorMessage.style.opacity = '0';
                    errorMessage.style.transform = 'translateY(-10px)';

                    field.parentNode.insertBefore(errorMessage, field.nextElementSibling);

                    requestAnimationFrame(() => {
                        errorMessage.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        errorMessage.style.opacity = '1';
                        errorMessage.style.transform = 'translateY(0)';
                    });
                }
            }

            function clearFieldError(field) {
                field.classList.remove('invalid');
                field.style.borderColor = '';

                if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
                    const errorMessage = field.nextElementSibling;
                    errorMessage.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    errorMessage.style.opacity = '0';
                    errorMessage.style.transform = 'translateY(-10px)';

                    setTimeout(() => {
                        errorMessage.remove();
                    }, 300);
                }
            }
        }

        // --- Add to Favorites Functionality --- //
        function initializeFavorites() {
            const saveButtons = document.querySelectorAll('.save-job');

            if (saveButtons.length === 0) return;

            let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

            saveButtons.forEach((button, index) => {
                const jobCard = button.closest('.job-card');
                const jobId = `job-${index}`;

                jobCard.dataset.jobId = jobId;

                if (savedJobs.includes(jobId)) {
                    button.classList.add('saved');
                    button.innerHTML = '<i class="fas fa-heart"></i>';
                    button.setAttribute('aria-label', 'Remove from saved jobs');
                    button.style.color = '#dc3545';
                } else {
                    button.innerHTML = '<i class="far fa-heart"></i>';
                    button.setAttribute('aria-label', 'Save job');
                    button.style.color = '';
                }

                button.addEventListener('click', (e) => {
                    e.preventDefault();

                    button.style.transform = 'scale(1.3)';

                    setTimeout(() => {
                        if (button.classList.contains('saved')) {
                            savedJobs = savedJobs.filter(id => id !== jobId);
                            button.classList.remove('saved');
                            button.innerHTML = '<i class="far fa-heart"></i>';
                            button.setAttribute('aria-label', 'Save job');
                            button.style.color = '';

                            showNotification('Job removed from favorites', 'info');
                        } else {
                            savedJobs.push(jobId);
                            button.classList.add('saved');
                            button.innerHTML = '<i class="fas fa-heart"></i>';
                            button.setAttribute('aria-label', 'Remove from saved jobs');
                            button.style.color = '#dc3545';

                            showNotification('Job added to favorites', 'success');
                        }

                        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
                        button.style.transform = 'scale(1)';
                    }, 200);
                });

                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1)';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        }

        // --- Notification System --- //
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;

            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#00A651' : type === 'error' ? '#dc3545' : '#004A99'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                transform: translateX(400px);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            `;

            document.body.appendChild(notification);

            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
            });

            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 400);
            }, 3000);

            notification.addEventListener('click', () => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 400);
            });
        }

        // --- Image Preloading --- //
        function preloadImages() {
            const imagesToPreload = document.querySelectorAll('[data-preload]');
            const imagePromises = [];

            imagesToPreload.forEach(img => {
                const src = img.getAttribute('data-preload');
                if (src) {
                    const promise = new Promise((resolve, reject) => {
                        const image = new Image();
                        image.onload = resolve;
                        image.onerror = reject;
                        image.src = src;
                    });
                    imagePromises.push(promise);

                    const preloadLink = document.createElement('link');
                    preloadLink.href = src;
                    preloadLink.rel = 'preload';
                    preloadLink.as = 'image';
                    document.head.appendChild(preloadLink);
                }
            });

            return Promise.allSettled(imagePromises);
        }

        // --- Lazy Loading for Images --- //
        function initializeLazyLoading() {
            if ('IntersectionObserver' in window) {
                const lazyImages = document.querySelectorAll('[data-src]');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;

                            img.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                            img.style.opacity = '0.5';

                            const tempImg = new Image();
                            tempImg.onload = () => {
                                img.src = img.getAttribute('data-src');
                                img.removeAttribute('data-src');
                                img.style.opacity = '1';
                                imageObserver.unobserve(img);
                            };
                            tempImg.src = img.getAttribute('data-src');
                        }
                    });
                }, {
                    rootMargin: '50px 0px'
                });

                lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            }
        }

        // --- Performance Enhancements --- //
        function addGPUAcceleration() {
            // Check for reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }
            
            const animatedElements = document.querySelectorAll('.animate-on-scroll, .btn, .pill-navbar-item, .job-card, .event-list li');
            animatedElements.forEach(element => {
                element.classList.add('gpu-accelerated');
                // Set will-change for better performance
                element.style.willChange = 'transform, opacity';
            });
        }

        // Cleanup will-change after animations complete
        function cleanupWillChange() {
            const elements = document.querySelectorAll('.gpu-accelerated');
            elements.forEach(element => {
                // Reset will-change after a delay to free up GPU resources
                setTimeout(() => {
                    element.style.willChange = 'auto';
                }, 1000);
            });
        }

        // --- Optimized Mouse Movement Parallax --- //
        function initializeMouseParallax() {
            // Skip if user prefers reduced motion
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }

            const floatingElements = document.querySelectorAll("[class*='animate-float']");
            if (floatingElements.length === 0) return;

            let mouseX = 0;
            let mouseY = 0;
            let parallaxMouseTicking = false;
            let lastUpdate = 0;
            const throttleDelay = 16; // ~60fps

            // Debounced mousemove for better performance
            const handleMouseMove = (e) => {
                const now = performance.now();
                if (now - lastUpdate < throttleDelay) return;
                
                mouseX = e.clientX;
                mouseY = e.clientY;
                lastUpdate = now;

                if (!parallaxMouseTicking) {
                    requestAnimationFrame(updateMouseParallax);
                    parallaxMouseTicking = true;
                }
            };

            document.addEventListener('mousemove', handleMouseMove, { passive: true });

            function updateMouseParallax() {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;

                // Reduced movement intensity for smoother performance
                const moveX = (mouseX - centerX) * 0.005;
                const moveY = (mouseY - centerY) * 0.005;

                // Use transform3d for better GPU performance
                floatingElements.forEach(element => {
                    element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${moveX * 0.3}deg)`;
                });

                parallaxMouseTicking = false;
            }
        }

        // --- Error Handling --- //
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
        });

        // --- Performance Monitoring --- //
        function initializePerformanceMonitoring() {
            if ('PerformanceObserver' in window) {
                const perfObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'measure') {
                            console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
                        }
                    });
                });

                perfObserver.observe({ entryTypes: ['measure'] });
            }
        }

        // --- Initialize All Features --- //
        function initializeAllFeatures() {
            // Performance optimizations first
            addGPUAcceleration();
            
            // Core features
            initializePillNavigation();
            initializeHideOnScroll();
            initializeScrollAnimations();
            initializeParallax();
            initializeFloatingElements();
            initializeTestimonials();
            initializeSmoothScroll();

            // Page-specific features
            initializeJobFilters();
            initializeCheckboxFilters();
            initializeEventTabs();
            initializeRegistrationModal();
            initializeFormValidation();
            initializeFavorites();

            // Enhancement features
            initializeLazyLoading();
            initializeMouseParallax();
            initializePerformanceMonitoring();
            initializeModalFunctionality();
            initializeNotificationForm();

            // Cleanup will-change after initialization
            setTimeout(cleanupWillChange, 2000);

            console.log("All EMSI Career Center features initialized successfully with performance optimizations.");
        }

        // --- Modal Functionality --- //
        function initializeModalFunctionality() {
            const modalTriggers = document.querySelectorAll('[data-modal]');
            const modals = document.querySelectorAll('.modal-overlay');
            const modalCloses = document.querySelectorAll('.modal-close');

            // Open modal
            modalTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modalId = trigger.getAttribute('data-modal');
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                        
                        // Focus management for accessibility
                        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (firstFocusable) {
                            setTimeout(() => firstFocusable.focus(), 300);
                        }
                    }
                });
            });

            // Close modal
            modalCloses.forEach(closeBtn => {
                closeBtn.addEventListener('click', closeModal);
            });

            // Close modal on overlay click
            modals.forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal();
                    }
                });
            });

            // Close modal on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });

            function closeModal() {
                modals.forEach(modal => {
                    modal.classList.remove('active');
                });
                document.body.style.overflow = '';
            }
        }

        // --- Notification Form Functionality --- //
        function initializeNotificationForm() {
            const notificationForm = document.getElementById('notification-form');
            const notificationSuccess = document.getElementById('notification-success');
            const cancelButton = document.getElementById('cancel-notification');
            
            if (!notificationForm) return;

            // Form validation functions
            function validateName(name) {
                return name.trim().length >= 2;
            }

            function validateEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            function showError(fieldId, message) {
                const errorElement = document.getElementById(fieldId + '-error');
                const inputElement = document.getElementById(fieldId);
                
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                }
                
                if (inputElement) {
                    inputElement.classList.add('error');
                    inputElement.setAttribute('aria-invalid', 'true');
                }
            }

            function clearError(fieldId) {
                const errorElement = document.getElementById(fieldId + '-error');
                const inputElement = document.getElementById(fieldId);
                
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
                
                if (inputElement) {
                    inputElement.classList.remove('error');
                    inputElement.setAttribute('aria-invalid', 'false');
                }
            }

            function clearAllErrors() {
                ['notify-name', 'notify-email', 'consent'].forEach(clearError);
            }

            // Real-time validation
            const nameInput = document.getElementById('notify-name');
            const emailInput = document.getElementById('notify-email');
            const consentCheckbox = document.getElementById('consent-emails');

            if (nameInput) {
                nameInput.addEventListener('blur', () => {
                    const name = nameInput.value.trim();
                    if (name && !validateName(name)) {
                        showError('notify-name', 'Please enter a valid name (at least 2 characters)');
                    } else if (name) {
                        clearError('notify-name');
                    }
                });
                
                nameInput.addEventListener('input', () => {
                    if (nameInput.classList.contains('error')) {
                        clearError('notify-name');
                    }
                });
            }

            if (emailInput) {
                emailInput.addEventListener('blur', () => {
                    const email = emailInput.value.trim();
                    if (email && !validateEmail(email)) {
                        showError('notify-email', 'Please enter a valid email address');
                    } else if (email) {
                        clearError('notify-email');
                    }
                });
                
                emailInput.addEventListener('input', () => {
                    if (emailInput.classList.contains('error')) {
                        clearError('notify-email');
                    }
                });
            }

            if (consentCheckbox) {
                consentCheckbox.addEventListener('change', () => {
                    if (consentCheckbox.checked) {
                        clearError('consent');
                    }
                });
            }

            // Form submission
            notificationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                clearAllErrors();
                
                const formData = new FormData(notificationForm);
                const name = formData.get('name').trim();
                const email = formData.get('email').trim();
                const major = formData.get('major');
                const year = formData.get('year');
                const consent = formData.get('consent');
                const marketing = formData.get('marketing');
                
                let isValid = true;
                
                // Validate required fields
                if (!validateName(name)) {
                    showError('notify-name', 'Please enter your full name (at least 2 characters)');
                    isValid = false;
                }
                
                if (!validateEmail(email)) {
                    showError('notify-email', 'Please enter a valid email address');
                    isValid = false;
                }
                
                if (!consent) {
                    showError('consent', 'You must consent to receiving notifications to subscribe');
                    isValid = false;
                }
                
                if (!isValid) {
                    // Focus on first error field
                    const firstError = notificationForm.querySelector('.error');
                    if (firstError) {
                        firstError.focus();
                    }
                    return;
                }
                
                // Simulate form submission
                const submitButton = document.getElementById('submit-notification');
                const originalText = submitButton.innerHTML;
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                
                // Simulate API call
                setTimeout(() => {
                    // Hide form and show success message
                    notificationForm.style.display = 'none';
                    notificationSuccess.style.display = 'block';
                    
                    // Store subscription data (in real app, this would be sent to server)
                    const subscriptionData = {
                        name,
                        email,
                        major: major || 'Not specified',
                        year: year || 'Not specified',
                        consent: true,
                        marketing: !!marketing,
                        timestamp: new Date().toISOString()
                    };
                    
                    localStorage.setItem('ambassadorNotification', JSON.stringify(subscriptionData));
                    
                    console.log('Notification subscription saved:', subscriptionData);
                    
                    // Reset button state
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                    
                    // Auto-close modal after 3 seconds
                    setTimeout(() => {
                        const modal = document.getElementById('notification-modal');
                        if (modal && modal.classList.contains('active')) {
                            modal.classList.remove('active');
                            document.body.style.overflow = '';
                        }
                    }, 3000);
                    
                }, 2000);
            });

            // Cancel button functionality
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    const modal = document.getElementById('notification-modal');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            }

            // Reset form when modal is opened
            const modalTrigger = document.querySelector('[data-modal="notification-modal"]');
            if (modalTrigger) {
                modalTrigger.addEventListener('click', () => {
                    setTimeout(() => {
                        // Reset form to initial state
                        notificationForm.reset();
                        notificationForm.style.display = 'block';
                        notificationSuccess.style.display = 'none';
                        clearAllErrors();
                    }, 100);
                });
            }
        }

        // --- Page Load Handler --- //
        window.addEventListener('load', () => {
            document.body.classList.add('page-loaded');

            preloadImages().then(() => {
                console.log('All images preloaded successfully');
            });
        });

        // Initialize all features
        initializeAllFeatures();
    });
}