// EMSI Marrakech Career Center - main.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("EMSI Career Center scripts initialized.");

    // --- Pill Navigation Bar Functionality --- //
    const navbarItems = document.querySelectorAll('.pill-navbar-item');
    const navbar = document.querySelector('.pill-navbar');

    // Set active navigation item based on current page
    const currentPath = window.location.pathname;

    // Clear any existing active classes
    navbarItems.forEach(item => {
        item.classList.remove('active');
        const label = item.querySelector('.pill-navbar-label');

        // Reset the display property for all labels
        if (label) {
            label.style.display = 'none';
        }
    });

    // Find and set the active navigation item
    navbarItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href) {
            // Check if current path ends with the href
            if (currentPath.endsWith(href) ||
                (currentPath === '/' && href === 'index.html') ||
                (currentPath.endsWith('/') && href === 'index.html')) {

                item.classList.add('active');

                // Show the label for the active item
                const label = item.querySelector('.pill-navbar-label');
                if (label) {
                    label.style.display = 'inline-block';
                }
            }
        }
    });

    // Optional: Theme switching functionality
    function setNavbarTheme(theme) {
        // Remove existing theme classes
        navbar.classList.remove('dark', 'blue', 'light');

        // Add the new theme class
        navbar.classList.add(theme);

        // Store the theme preference if needed
        localStorage.setItem('navbarTheme', theme);
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('navbarTheme');
    if (savedTheme) {
        setNavbarTheme(savedTheme);
    }

    // If you add theme toggle buttons later, you can use this code
    const themeButtons = document.querySelectorAll('.theme-toggle');
    if (themeButtons.length > 0) {
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                setNavbarTheme(theme);
            });
        });
    }

    // --- Hide Navbar on Scroll Functionality --- //
    const hideOnScrollNavbar = document.querySelector('.pill-navbar.hide-on-scroll');
    let lastScrollTop = 0;
    let scrollThreshold = 50; // Minimum amount of scroll before hiding

    if (hideOnScrollNavbar) {
        window.addEventListener('scroll', function() {
            let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            // Check if scrolled more than threshold
            if (Math.abs(lastScrollTop - currentScroll) > scrollThreshold) {
                // Scrolling down
                if (currentScroll > lastScrollTop && currentScroll > 100) {
                    hideOnScrollNavbar.classList.add('hidden');
                }
                // Scrolling up or at the top
                else {
                    hideOnScrollNavbar.classList.remove('hidden');
                }
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
            }
        }, false);
    }

// EMSI Marrakech Career Center - Enhanced main.js

    document.addEventListener("DOMContentLoaded", () => {
        console.log("EMSI Career Center scripts initialized with enhanced animations.");

        // --- Enhanced Performance Optimizations --- //
        // Add GPU acceleration to animated elements
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .btn, .pill-navbar-item, .job-card, .event-list li');
        animatedElements.forEach(element => {
            element.classList.add('gpu-accelerated');
        });

        // --- Enhanced Pill Navigation Bar Functionality --- //
        const navbarItems = document.querySelectorAll('.pill-navbar-item');
        const navbar = document.querySelector('.pill-navbar');

        // Set active navigation item based on current page
        const currentPath = window.location.pathname;

        // Clear any existing active classes
        navbarItems.forEach(item => {
            item.classList.remove('active');
            const label = item.querySelector('.pill-navbar-label');

            // Reset the display property for all labels
            if (label) {
                label.style.display = 'none';
            }
        });

        // Find and set the active navigation item with enhanced animation
        navbarItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href) {
                // Check if current path ends with the href
                if (currentPath.endsWith(href) ||
                    (currentPath === '/' && href === 'index.html') ||
                    (currentPath.endsWith('/') && href === 'index.html')) {

                    item.classList.add('active');

                    // Show the label for the active item with animation
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

        // Optional: Theme switching functionality
        function setNavbarTheme(theme) {
            // Remove existing theme classes
            navbar.classList.remove('dark', 'blue', 'light', 'white-gradient');

            // Add the new theme class
            navbar.classList.add(theme);

            // Store the theme preference
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

        // --- Enhanced Hide Navbar on Scroll Functionality --- //
        const hideOnScrollNavbar = document.querySelector('.pill-navbar.hide-on-scroll');
        let lastScrollTop = 0;
        let scrollThreshold = 30; // Reduced threshold for more responsive hiding
        let ticking = false;

        function updateNavbarVisibility() {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (Math.abs(lastScrollTop - currentScroll) > scrollThreshold) {
                if (currentScroll > lastScrollTop && currentScroll > 80) {
                    // Scrolling down
                    hideOnScrollNavbar.classList.add('hidden');
                } else {
                    // Scrolling up or at the top
                    hideOnScrollNavbar.classList.remove('hidden');
                }
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
            }
            ticking = false;
        }

        if (hideOnScrollNavbar) {
            window.addEventListener('scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(updateNavbarVisibility);
                    ticking = true;
                }
            });
        }

        // --- Enhanced Intersection Observer for Scroll Animations --- //
        const animateOnScrollElements = document.querySelectorAll("[class*='animate-on-scroll'], .animate-on-scroll");

        if (animateOnScrollElements.length > 0) {
            const scrollObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;

                        // Add the appropriate animation class based on the element's classes
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

                        // Handle staggered children animations with enhanced timing
                        if (element.classList.contains("stagger-children")) {
                            const children = element.children;
                            Array.from(children).forEach((child, index) => {
                                setTimeout(() => {
                                    child.style.opacity = "1";
                                    child.style.transform = "translateY(0) translateX(0)";
                                    child.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
                                }, 80 * index); // Reduced delay for smoother staggering
                            });
                        }

                        // Stop observing once animated
                        observer.unobserve(element);
                    }
                });
            }, {
                threshold: 0.15,  // Slightly increased threshold
                rootMargin: '0px 0px -30px 0px'  // Trigger slightly earlier
            });

            animateOnScrollElements.forEach(element => {
                scrollObserver.observe(element);
            });
        }

        // --- Enhanced Parallax Scrolling Effect --- //
        const parallaxElements = document.querySelectorAll('.parallax');
        let parallaxTicking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });

            parallaxTicking = false;
        }

        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', function() {
                if (!parallaxTicking) {
                    requestAnimationFrame(updateParallax);
                    parallaxTicking = true;
                }
            });
        }

        // --- Enhanced Floating Elements Animation --- //
        const floatingElements = document.querySelectorAll("[class*='animate-float']");

        if (floatingElements.length > 0) {
            floatingElements.forEach((element, index) => {
                // Random initial position and timing for more natural movement
                const randomDelay = Math.random() * 3;
                const randomDuration = 4 + Math.random() * 4; // 4-8 seconds

                element.style.animationDelay = `${randomDelay}s`;
                element.style.animationDuration = `${randomDuration}s`;

                // Add slight random rotation
                const randomRotation = (Math.random() - 0.5) * 10;
                element.style.transform = `rotate(${randomRotation}deg)`;
            });
        }

        // --- Enhanced Testimonial Card Animations --- //
        const testimonialSlides = document.querySelectorAll('.testimonial-slide');

        if (testimonialSlides.length > 0) {
            testimonialSlides.forEach(slide => {
                if (slide.classList.contains('active')) {
                    slide.classList.add('animate-card');
                }
            });

            // Enhanced slide transition
            const prevButton = document.getElementById('prev-testimonial');
            const nextButton = document.getElementById('next-testimonial');

            if (prevButton && nextButton) {
                [prevButton, nextButton].forEach(button => {
                    button.addEventListener('click', () => {
                        // Add loading state
                        button.style.opacity = '0.7';
                        button.style.transform = 'scale(0.95)';

                        setTimeout(() => {
                            testimonialSlides.forEach((slide, index) => {
                                if (slide.classList.contains('active')) {
                                    slide.classList.add('animate-card');
                                    // Stagger the animation based on index
                                    slide.style.transitionDelay = `${index * 0.1}s`;
                                } else {
                                    slide.classList.remove('animate-card');
                                    slide.style.transitionDelay = '0s';
                                }
                            });

                            // Reset button state
                            button.style.opacity = '1';
                            button.style.transform = 'scale(1)';
                        }, 50);
                    });
                });
            }
        }

        // --- Enhanced Smooth Scroll for Anchor Links --- //
        const anchorLinks = document.querySelectorAll("a[href^=\"#\"]");
        anchorLinks.forEach(anchor => {
            anchor.addEventListener("click", function(e) {
                const href = this.getAttribute("href");

                // Ensure it's a valid internal link
                if (href.length > 1 && document.querySelector(href)) {
                    e.preventDefault();

                    const target = document.querySelector(href);
                    const offsetTop = target.offsetTop - 100; // Account for fixed navbar

                    // Add smooth scroll with easing
                    window.scrollTo({
                        top: offsetTop,
                        behavior: "smooth"
                    });

                    // Add a visual indication of the scroll
                    target.style.transform = 'scale(1.02)';
                    target.style.transition = 'transform 0.3s ease';

                    setTimeout(() => {
                        target.style.transform = 'scale(1)';
                    }, 300);
                }
            });
        });

        // --- Enhanced Job Filters Functionality --- //
        const jobSearchForm = document.getElementById('jobSearchForm');
        const jobCards = document.querySelectorAll('.job-card');

        if (jobSearchForm && jobCards.length > 0) {
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
                const keyword = document.getElementById('keyword').value.toLowerCase();
                const jobType = document.getElementById('jobType').value;
                const location = document.getElementById('location').value;

                let visibleJobs = 0;

                jobCards.forEach((card, index) => {
                    const jobTitle = card.querySelector('.job-title').textContent.toLowerCase();
                    const jobDescription = card.querySelector('.job-description').textContent.toLowerCase();
                    const companyName = card.querySelector('.company-name').textContent.toLowerCase();
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
                        // Enhanced show animation
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
                        // Enhanced hide animation
                        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-20px)';

                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });

                // Update the results count with animation
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

            // Enhanced reset button functionality
            const resetButton = document.createElement('button');
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

        // --- Enhanced Mouse Movement Parallax --- //
        let mouseX = 0;
        let mouseY = 0;
        let parallaxMouseTicking = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!parallaxMouseTicking) {
                requestAnimationFrame(updateMouseParallax);
                parallaxMouseTicking = true;
            }
        });

        function updateMouseParallax() {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const moveX = (mouseX - centerX) * 0.01;
            const moveY = (mouseY - centerY) * 0.01;

            // Apply subtle parallax to floating elements
            floatingElements.forEach(element => {
                element.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.5}deg)`;
            });

            parallaxMouseTicking = false;
        }

        // Continue with existing functions but enhanced...

        // --- Enhanced Checkbox Filters (for jobs.html) --- //
        const filterCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');

        if (filterCheckboxes.length > 0 && jobCards.length > 0) {
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

                // Collect all active filters by category
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

                // Apply filters to job cards with enhanced animations
                jobCards.forEach((card, index) => {
                    const jobMeta = card.querySelector('.job-meta').textContent.toLowerCase();
                    const jobContent = card.textContent.toLowerCase();

                    // Check if card meets all filter criteria
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

                // Update results count with enhanced animation
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

        // --- Enhanced Event Tab Switching (for events.html) --- //
        const eventTabs = document.querySelectorAll('.event-tabs .tab');

        if (eventTabs.length > 0) {
            eventTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Enhanced tab switching with animations
                    eventTabs.forEach(t => {
                        t.classList.remove('active');
                        t.style.transform = 'scale(1)';
                    });

                    tab.classList.add('active');
                    tab.style.transform = 'scale(1.05)';

                    setTimeout(() => {
                        tab.style.transform = 'scale(1)';
                    }, 200);

                    // Enhanced content switching
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

        // --- Enhanced Registration Modal Functionality --- //
        const registrationModal = document.getElementById('registrationModal');
        const successModal = document.getElementById('successModal');
        const registrationForm = document.getElementById('registrationForm');
        const yearOfStudySelect = document.getElementById('yearOfStudy');
        const majorSelect = document.getElementById('major');

        // Modal elements
        const registerButtons = document.querySelectorAll('.register-btn');
        const closeButtons = document.querySelectorAll('.close-modal');
        const cancelButton = document.querySelector('.cancel-btn');
        const closeSuccessButton = document.querySelector('.close-success-btn');
        const selectedEventTitle = document.getElementById('selectedEventTitle');

        // Major options based on year of study
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

        // Enhanced modal opening
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

                    // Enhanced entrance animation
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

        // Enhanced close modal functions
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

        // Enhanced close button event listeners
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                closeModal(modal);
            });
        });

        // Enhanced cancel and success button handlers
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

        // Enhanced outside click handling
        window.addEventListener('click', (e) => {
            if (e.target === registrationModal) {
                closeModal(registrationModal);
            }
            if (e.target === successModal) {
                closeModal(successModal);
            }
        });

        // Enhanced year of study change handler
        if (yearOfStudySelect && majorSelect) {
            yearOfStudySelect.addEventListener('change', function() {
                const selectedYear = parseInt(this.value);

                // Enhanced dropdown animation
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

        // Enhanced form submission
        if (registrationForm) {
            registrationForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // Collect form data
                const formData = new FormData(this);
                const registrationData = {};

                for (let [key, value] of formData.entries()) {
                    registrationData[key] = value;
                }

                // Add event title to the data
                if (selectedEventTitle) {
                    registrationData.eventTitle = selectedEventTitle.textContent;
                }

                console.log('Registration Data:', registrationData);

                // Enhanced submission animation
                const submitButton = this.querySelector('.submit-btn');
                const originalText = submitButton.textContent;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitButton.disabled = true;
                submitButton.style.background = '#ccc';

                setTimeout(() => {
                    closeModal(registrationModal);

                    // Enhanced success modal
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

                    // Reset submit button
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 1500);
            });
        }

        // Continue with remaining enhanced functions...

        // --- Enhanced Form Validation --- //
        const forms = document.querySelectorAll('form:not(#jobSearchForm):not(#registrationForm)');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                let valid = true;
                const requiredFields = form.querySelectorAll('[required]');

                requiredFields.forEach(field => {
                    // Enhanced validation with smooth animations
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

                    // Smooth scroll to first error
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

        // --- Enhanced Add to Favorites Functionality --- //
        const saveButtons = document.querySelectorAll('.save-job');

        if (saveButtons.length > 0) {
            let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

            saveButtons.forEach((button, index) => {
                const jobCard = button.closest('.job-card');
                const jobId = `job-${index}`;

                jobCard.dataset.jobId = jobId;

                // Enhanced initial state
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

                // Enhanced toggle functionality
                button.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Enhanced animation
                    button.style.transform = 'scale(1.3)';

                    setTimeout(() => {
                        if (button.classList.contains('saved')) {
                            // Remove from saved jobs
                            savedJobs = savedJobs.filter(id => id !== jobId);
                            button.classList.remove('saved');
                            button.innerHTML = '<i class="far fa-heart"></i>';
                            button.setAttribute('aria-label', 'Save job');
                            button.style.color = '';

                            // Show notification
                            showNotification('Job removed from favorites', 'info');
                        } else {
                            // Add to saved jobs
                            savedJobs.push(jobId);
                            button.classList.add('saved');
                            button.innerHTML = '<i class="fas fa-heart"></i>';
                            button.setAttribute('aria-label', 'Remove from saved jobs');
                            button.style.color = '#dc3545';

                            // Show notification
                            showNotification('Job added to favorites', 'success');
                        }

                        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
                        button.style.transform = 'scale(1)';
                    }, 200);
                });

                // Enhanced hover effects
                button.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1)';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        }

        // --- Enhanced Notification System --- //
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

            // Notification styles
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

            // Animate in
            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
            });

            // Auto remove
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 400);
            }, 3000);

            // Click to dismiss
            notification.addEventListener('click', () => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 400);
            });
        }

        // --- Enhanced Image Preloading --- //
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

                    // Create preload link
                    const preloadLink = document.createElement('link');
                    preloadLink.href = src;
                    preloadLink.rel = 'preload';
                    preloadLink.as = 'image';
                    document.head.appendChild(preloadLink);
                }
            });

            return Promise.allSettled(imagePromises);
        }

        // --- Enhanced Lazy Loading for Images --- //
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        // Enhanced loading animation
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

        // --- Enhanced Page Loading Performance --- //
        window.addEventListener('load', () => {
            // Mark page as fully loaded
            document.body.classList.add('page-loaded');

            // Preload images after page load
            preloadImages().then(() => {
                console.log('All images preloaded successfully');
            });

            // Initialize advanced features after page load
            setTimeout(() => {
                initializeAdvancedFeatures();
            }, 100);
        });

        function initializeAdvancedFeatures() {
            // Add any additional features that should load after the page is ready
            console.log('Advanced features initialized');

            // Example: Initialize any third-party libraries here
            // initializeCharts();
            // initializeAnimations();
        }

        // --- Enhanced Error Handling --- //
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            // Optionally show user-friendly error message
            // showNotification('An error occurred. Please refresh the page.', 'error');
        });

        // --- Enhanced Performance Monitoring --- //
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

        console.log("Enhanced EMSI Career Center scripts fully initialized.");

    });

    // --- Floating Elements Animation --- //
    const floatingElements = document.querySelectorAll("[class*='animate-float']");

    if (floatingElements.length > 0) {
        floatingElements.forEach(element => {
            // Random initial position for more natural movement
            const randomDelay = Math.random() * 2;
            element.style.animationDelay = `${randomDelay}s`;
        });
    }

    // --- Testimonial Card Animations --- //
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');

    if (testimonialSlides.length > 0) {
        testimonialSlides.forEach(slide => {
            if (slide.classList.contains('active')) {
                slide.classList.add('animate-card');
            }
        });

        // Add animation when changing slides
        const prevButton = document.getElementById('prev-testimonial');
        const nextButton = document.getElementById('next-testimonial');

        if (prevButton && nextButton) {
            [prevButton, nextButton].forEach(button => {
                button.addEventListener('click', () => {
                    setTimeout(() => {
                        testimonialSlides.forEach(slide => {
                            if (slide.classList.contains('active')) {
                                slide.classList.add('animate-card');
                            } else {
                                slide.classList.remove('animate-card');
                            }
                        });
                    }, 50);
                });
            });
        }
    }

    // --- Smooth Scroll for Anchor Links --- //
    const anchorLinks = document.querySelectorAll("a[href^=\"#\"]");
    anchorLinks.forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            // Ensure it's a valid internal link and not just "#" or for JS-driven components
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Job Filters Functionality (for jobs.html) --- //
    const jobSearchForm = document.getElementById('jobSearchForm');
    const jobCards = document.querySelectorAll('.job-card');

    if (jobSearchForm && jobCards.length > 0) {
        jobSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const keyword = document.getElementById('keyword').value.toLowerCase();
            const jobType = document.getElementById('jobType').value;
            const location = document.getElementById('location').value;

            let visibleJobs = 0;

            jobCards.forEach(card => {
                const jobTitle = card.querySelector('.job-title').textContent.toLowerCase();
                const jobDescription = card.querySelector('.job-description').textContent.toLowerCase();
                const companyName = card.querySelector('.company-name').textContent.toLowerCase();
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
                    card.style.display = 'flex';
                    visibleJobs++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update the results count
            const resultsCount = document.querySelector('.results-count strong');
            if (resultsCount) {
                resultsCount.textContent = visibleJobs;
            }
        });

        // Reset button functionality
        const resetButton = document.createElement('button');
        resetButton.type = 'reset';
        resetButton.className = 'btn btn-outline-primary search-reset';
        resetButton.textContent = 'Reset';

        resetButton.addEventListener('click', () => {
            jobCards.forEach(card => {
                card.style.display = 'flex';
            });

            const resultsCount = document.querySelector('.results-count strong');
            if (resultsCount) {
                resultsCount.textContent = jobCards.length;
            }
        });

        jobSearchForm.appendChild(resetButton);
    }

    // --- Checkbox Filters (for jobs.html) --- //
    const filterCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');

    if (filterCheckboxes.length > 0 && jobCards.length > 0) {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateJobFilters);
        });

        function updateJobFilters() {
            const activeFilters = {};

            // Collect all active filters by category
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

            // Apply filters to job cards
            jobCards.forEach(card => {
                const jobMeta = card.querySelector('.job-meta').textContent.toLowerCase();
                const jobContent = card.textContent.toLowerCase();

                // Check if card meets all filter criteria
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
                    card.style.display = 'flex';
                    visibleJobs++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update results count
            const resultsCount = document.querySelector('.results-count strong');
            if (resultsCount) {
                resultsCount.textContent = visibleJobs;
            }
        }
    }

    // --- Event Tab Switching (for events.html) --- //
    const eventTabs = document.querySelectorAll('.event-tabs .tab');

    if (eventTabs.length > 0) {
        eventTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                eventTabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                tab.classList.add('active');

                // Show corresponding content
                const tabId = tab.getAttribute('data-tab');
                const tabContents = document.querySelectorAll('.event-content');

                tabContents.forEach(content => {
                    content.style.display = 'none';
                });

                document.getElementById(`${tabId}-events`).style.display = 'block';
            });
        });
    }

    // --- Registration Modal Functionality --- //
    const registrationModal = document.getElementById('registrationModal');
    const successModal = document.getElementById('successModal');
    const registrationForm = document.getElementById('registrationForm');
    const yearOfStudySelect = document.getElementById('yearOfStudy');
    const majorSelect = document.getElementById('major');

    // Modal elements
    const registerButtons = document.querySelectorAll('.register-btn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButton = document.querySelector('.cancel-btn');
    const closeSuccessButton = document.querySelector('.close-success-btn');
    const selectedEventTitle = document.getElementById('selectedEventTitle');

    // Major options based on year of study
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
    registerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const eventTitle = button.getAttribute('data-event-title');
            selectedEventTitle.textContent = eventTitle;
            registrationModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close modal functions
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
        if (modal === registrationModal) {
            registrationForm.reset();
            majorSelect.disabled = true;
            majorSelect.innerHTML = '<option value="">Please select year of study first</option>';
        }
    }

    // Close button event listeners
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // Cancel button
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            closeModal(registrationModal);
        });
    }

    // Close success button
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

    // Handle year of study change to update major options
    if (yearOfStudySelect && majorSelect) {
        yearOfStudySelect.addEventListener('change', function() {
            const selectedYear = parseInt(this.value);
            majorSelect.innerHTML = '<option value="">Select your major</option>';

            if (selectedYear) {
                majorSelect.disabled = false;

                let options;
                if (selectedYear <= 2) {
                    options = majorOptions.early;
                } else {
                    options = majorOptions.advanced;
                }

                options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    majorSelect.appendChild(optionElement);
                });
            } else {
                majorSelect.disabled = true;
                majorSelect.innerHTML = '<option value="">Please select year of study first</option>';
            }
        });
    }

    // Handle form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(this);
            const registrationData = {};

            for (let [key, value] of formData.entries()) {
                registrationData[key] = value;
            }

            // Add event title to the data
            registrationData.eventTitle = selectedEventTitle.textContent;

            // Here you would typically send the data to your server
            console.log('Registration Data:', registrationData);

            // Simulate form submission delay
            const submitButton = this.querySelector('.submit-btn');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;

            setTimeout(() => {
                // Close registration modal
                closeModal(registrationModal);

                // Show success modal
                successModal.style.display = 'block';
                document.body.style.overflow = 'hidden';

                // Reset submit button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }

    // --- Form Validation --- //
    const forms = document.querySelectorAll('form:not(#jobSearchForm):not(#registrationForm)');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let valid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.classList.add('invalid');

                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.textContent = 'This field is required';
                        field.parentNode.insertBefore(errorMessage, field.nextElementSibling);
                    }
                } else {
                    field.classList.remove('invalid');
                    if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
                        field.nextElementSibling.remove();
                    }
                }
            });

            if (!valid) {
                e.preventDefault();
            }
        });
    });

    // --- Add to Favorites Functionality --- //
    const saveButtons = document.querySelectorAll('.save-job');

    if (saveButtons.length > 0) {
        // Get saved jobs from localStorage
        let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

        // Update buttons to reflect saved status
        saveButtons.forEach((button, index) => {
            const jobCard = button.closest('.job-card');
            const jobId = `job-${index}`; // Simple job ID

            // Add job ID as a data attribute
            jobCard.dataset.jobId = jobId;

            // Check if job is already saved
            if (savedJobs.includes(jobId)) {
                button.classList.add('saved');
                button.innerHTML = '<i class="fas fa-heart"></i>';
                button.setAttribute('aria-label', 'Remove from saved jobs');
            } else {
                button.innerHTML = '<i class="far fa-heart"></i>';
                button.setAttribute('aria-label', 'Save job');
            }

            // Toggle saved status
            button.addEventListener('click', () => {
                if (button.classList.contains('saved')) {
                    // Remove from saved jobs
                    savedJobs = savedJobs.filter(id => id !== jobId);
                    button.classList.remove('saved');
                    button.innerHTML = '<i class="far fa-heart"></i>';
                    button.setAttribute('aria-label', 'Save job');
                } else {
                    // Add to saved jobs
                    savedJobs.push(jobId);
                    button.classList.add('saved');
                    button.innerHTML = '<i class="fas fa-heart"></i>';
                    button.setAttribute('aria-label', 'Remove from saved jobs');
                }

                // Update localStorage
                localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            });
        });
    }

    // --- Preload Images for Better Performance --- //
    function preloadImages() {
        const imagesToPreload = document.querySelectorAll('[data-preload]');
        imagesToPreload.forEach(img => {
            const src = img.getAttribute('data-preload');
            if (src) {
                const preloadLink = document.createElement('link');
                preloadLink.href = src;
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                document.head.appendChild(preloadLink);
            }
        });
    }

    // Call preload function
    preloadImages();

    // --- Lazy Loading for Images --- //
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
});