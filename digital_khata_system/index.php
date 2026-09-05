<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DigiKhata - Smart Business Management System</title>
    <link href="css/style.css" rel="stylesheet">

    <style>
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav>
        <div class="logo">DigiKhata</div>
        <ul class="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="index.php">Dashboard</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="login.php" class="sign-in">Sign in</a></li>
        </ul>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>
                <span class="hero-line-1">Smart Business</span>
                <span class="hero-line-2">Management For Your</span>
                <span class="hero-line-3">Success</span>
            </h1>
            <a href="login.php"> <button class="cta-button">Get Started Free</button> </a> 
        </div>

        <div class="hero-image">
            <div class="hero-placeholder"></div>
            
            <div class="explore-bubble">
                <div>Explore</div>
                <div>All Features</div>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
            </div>
        </div>

        <!-- Stats Container -->
        <div class="stats-container">
            <div class="stat-card yellow">
                <div class="clients-badge"></div>
                <div class="avatar-group">
                    <div class="avatar"></div>
                    <div class="avatar"></div>
                    <div class="avatar-more">+8</div>
                </div>
                <div class="stat-label">Total Customers</div>
                <div class="stat-number">8</div>
            </div>

            <div class="stat-card black">
                <div class="arrow-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                </div>
                <div class="stat-number">11</div>
                <div class="stat-description" style="margin-top: 15px;">Total<br>Transactions</div>
            </div>

            <div class="stat-card gold">
                <div class="stat-number">₨49.7K</div>
                <div class="stat-description" style="margin-top: 15px;">Total Revenue<br>Generated</div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features scroll-animate" id="features">
        <div class="section-title scroll-animate">
            <h2>Powerful Features</h2>
            <p>Everything you need to manage your business efficiently in one place</p>
        </div>
        
        <div class="features-grid">
            <div class="feature-card scroll-animate">
                <div class="feature-icon">📊</div>
                <h3>Sales Management</h3>
                <p>Track all your sales, generate invoices, and manage transactions with ease. Real-time updates and detailed reports.</p>
            </div>
            
            <div class="feature-card scroll-animate">
                <div class="feature-icon">📦</div>
                <h3>Inventory Control</h3>
                <p>Manage products, track stock levels, monitor expiry dates, and get alerts for low inventory automatically.</p>
            </div>
            
            <div class="feature-card scroll-animate">
                <div class="feature-icon">👥</div>
                <h3>Customer Management</h3>
                <p>Maintain detailed customer records, track purchase history, and manage customer credit accounts efficiently.</p>
            </div>
            
            <div class="feature-card scroll-animate">
                <div class="feature-icon">💰</div>
                <h3>Credit/Udhar Tracking</h3>
                <p>Keep track of customer and supplier credit accounts with automated balance calculations and payment reminders.</p>
            </div>
            
            <div class="feature-card scroll-animate">
                <div class="feature-icon">📈</div>
                <h3>Profit Analysis</h3>
                <p>View detailed profit margins, analyze sales trends, and make data-driven decisions to grow your business.</p>
            </div>
            
            <div class="feature-card scroll-animate">
                <div class="feature-icon">🔐</div>
                <h3>Multi-User Access</h3>
                <p>Secure role-based access for admin and cashier accounts with comprehensive user management features.</p>
            </div>
        </div>
    </section>

    <!-- Dashboard Preview -->
    <section class="dashboard-preview scroll-animate" id="dashboard">
        <div class="dashboard-content">
            <div class="dashboard-info scroll-animate">
                <h2>Intuitive Dashboard Interface</h2>
                <p>Get a complete overview of your business at a glance. Our modern dashboard provides real-time insights into sales, inventory, and financial performance.</p>
                
                <ul class="dashboard-features">
                    <li>Real-time sales and revenue tracking</li>
                    <li>Inventory status and alerts</li>
                    <li>Customer and supplier management</li>
                    <li>Purchase order tracking</li>
                    <li>Comprehensive financial reports</li>
                    <li>Mobile-responsive design</li>
                </ul>
                
                <button class="cta-button">Try Dashboard Demo</button>
            </div>
            
            <div class="dashboard-mockup scroll-animate">
                <div class="mockup-header">
                    <div class="mockup-dot red"></div>
                    <div class="mockup-dot yellow"></div>
                    <div class="mockup-dot green"></div>
                </div>
                <div class="mockup-content">
                    
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing scroll-animate" id="pricing">
        <div class="section-title scroll-animate">
            <h2>Simple Pricing</h2>
            <p>Choose the perfect plan for your business needs</p>
        </div>
        
        <div class="pricing-grid">
            <div class="pricing-card scroll-animate">
                <div class="plan-name">Starter</div>
                <div class="plan-price">₨0<span>/mo</span></div>
                <div class="plan-duration">Free Forever</div>
                <ul class="plan-features">
                    <li>Up to 50 products</li>
                    <li>Basic sales tracking</li>
                    <li>1 user account</li>
                    <li>Email support</li>
                    <li>Mobile access</li>
                </ul>
                <button class="plan-button">Start Free</button>
            </div>
            
            <div class="pricing-card featured scroll-animate">
                <div class="popular-badge">Most Popular</div>
                <div class="plan-name">Professional</div>
                <div class="plan-price">₨2,999<span>/mo</span></div>
                <div class="plan-duration">Billed Monthly</div>
                <ul class="plan-features">
                    <li>Unlimited products</li>
                    <li>Advanced analytics</li>
                    <li>5 user accounts</li>
                    <li>Priority support</li>
                    <li>All features included</li>
                    <li>Data backup</li>
                </ul>
                <button class="plan-button">Get Started</button>
            </div>
            
            <div class="pricing-card scroll-animate">
                <div class="plan-name">Enterprise</div>
                <div class="plan-price">₨9,999<span>/mo</span></div>
                <div class="plan-duration">Billed Monthly</div>
                <ul class="plan-features">
                    <li>Unlimited everything</li>
                    <li>Custom integrations</li>
                    <li>Unlimited users</li>
                    <li>24/7 phone support</li>
                    <li>Dedicated manager</li>
                    <li>Custom training</li>
                </ul>
                <button class="plan-button">Contact Sales</button>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section scroll-animate">
        <h2>Ready to Transform Your Business?</h2>
        <p>Join thousands of businesses already using DigiKhata to streamline their operations</p>
        <div class="cta-buttons">
            <button class="cta-btn-primary">Start Free Trial</button>
            <button class="cta-btn-secondary">Schedule Demo</button>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="scroll-animate">
        <div class="footer-content">
            <div class="footer-section">
                <h3>DigiKhata</h3>
                <p style="opacity: 0.7; margin-top: 15px;">Smart business management system designed for modern retailers and wholesalers.</p>
            </div>
            
            <div class="footer-section">
                <h3>Product</h3>
                <ul>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#dashboard">Dashboard</a></li>
                    <li><a href="#">Mobile App</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Company</h3>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Blog</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div>
            
            <div class="footer-section">
                <h3>Support</h3>
                <ul>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">API Reference</a></li>
                    <li><a href="#">Community</a></li>
                </ul>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>&copy; 2025 DigiKhata. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Scroll Animation Observer
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animate dashboard features
                    if (entry.target.classList.contains('dashboard-info')) {
                        const features = entry.target.querySelectorAll('.dashboard-features li');
                        features.forEach(li => li.classList.add('animate-in'));
                    }
                }
            });
        }, observerOptions);

        // Observe all scroll-animate elements
        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });

        // Parallax effect for explore bubble
        document.addEventListener('mousemove', (e) => {
            const bubble = document.querySelector('.explore-bubble');
            if (bubble) {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                bubble.style.transform = `translate(${x}px, ${y}px)`;
            }
        });

        // Counter animation for stats
        function animateCounter(element, target, duration = 2000) {
            let current = 0;
            const increment = target / (duration / 16);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        }

        // Trigger counter animation when stat cards are visible
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    const numberEl = entry.target.querySelector('.stat-number');
                    if (numberEl) {
                        const text = numberEl.textContent.trim();
                        if (text === '8') {
                            animateCounter(numberEl, 8, 1500);
                        } else if (text === '11') {
                            animateCounter(numberEl, 11, 1500);
                        }
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-card').forEach(card => {
            statObserver.observe(card);
        });

        // Add ripple effect to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s ease-out';
                ripple.style.pointerEvents = 'none';
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add CSS for ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Parallax scroll effect for sections (removed dashboard-mockup to fix positioning issue)
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-placeholder');
            
            parallaxElements.forEach(el => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });

        // Add hover sound effect simulation (visual feedback)
        document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
        });

        // Tilt effect for cards
        document.querySelectorAll('.feature-card, .pricing-card:not(.featured)').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px) scale(1.05)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            });
        });
    </script>
</body>
</html>