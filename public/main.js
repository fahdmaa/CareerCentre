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

    // --- Enhanced Intersection Observer for Scroll Animations --- //
    const animateOnScrollElements = document.querySelectorAll("[class*='animate-on-scroll'], .animate-on-scroll");

    if (animateOnScrollElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the appropriate animation class based on the element's classes
                    if (entry.target.classList.contains("animate-on-scroll")) {
                        entry.target.classList.add("animate-visible");
                    }

                    if (entry.target.classList.contains("animate-slide-up-on-scroll")) {
                        entry.target.classList.add("animate-slide-up-visible");
                    }

                    if (entry.target.classList.contains("animate-fade-in-on-scroll")) {
                        entry.target.classList.add("animate-fade-in-visible");
                    }

                    if (entry.target.classList.contains("animate-slide-right-on-scroll")) {
                        entry.target.classList.add("animate-slide-right-visible");
                    }

                    // Handle staggered children animations
                    if (entry.target.classList.contains("stagger-children")) {
                        const children = entry.target.children;
                        Array.from(children).forEach((child, index) => {
                            setTimeout(() => {
                                child.style.opacity = "1";
                                child.style.transform = "translateY(0) translateX(0)";
                            }, 100 * index);
                        });
                    }

                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,  // Trigger when 10% of the element is visible
            rootMargin: '0px 0px -50px 0px'  // Slightly before element enters viewport
        });

        animateOnScrollElements.forEach(element => {
            scrollObserver.observe(element);
        });
    }

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

    // --- Form Validation --- //
    const forms = document.querySelectorAll('form:not(#jobSearchForm)');

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