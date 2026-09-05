<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ڈیجی کھاتہ سسٹم - لاگ ان</title>
    <link href="fonts/notonastaliqurdudraft.css" rel="stylesheet">
	<link href="css/style2.css" rel="stylesheet">
    <style>
    </style>
</head>
<body>
    <!-- Background Decorations -->
    <div class="bg-decoration bg-circle-1"></div>
    <div class="bg-decoration bg-circle-2"></div>
    <div class="bg-decoration bg-circle-3"></div>

    <!-- Login Container -->
    <div class="login-container">
        <div class="login-card">
            <!-- Decorative Elements -->
            <div class="card-decoration decoration-1"></div>
            <div class="card-decoration decoration-2"></div>

            <!-- Logo/Title -->
            <div class="logo-container">
                <div class="logo-circle">ڈ</div>
                <h1 class="logo-title">ڈیجی کھاتہ سسٹم</h1>
                <p class="logo-subtitle">Smart Business Management</p>
            </div>

            <!-- Error Message (Hidden by default) -->
            <div class="error-message" style="display: none;" id="errorMessage">
                غلط صارف نام یا پاس ورڈ
            </div>

            <!-- Login Form -->
            <form action="login1.php" method="post" id="loginForm">
                <!-- Username Input -->
                <div class="form-group">
                    <div class="input-wrapper">
                        <input 
                            type="text" 
                            name="username" 
                            class="form-input" 
                            placeholder="صارف نام" 
                            required
                        >
                        <div class="input-icon">
                            <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Password Input -->
                <div class="form-group">
                    <div class="input-wrapper">
                        <input 
                            type="password" 
                            name="password" 
                            class="form-input" 
                            placeholder="پاس ورڈ" 
                            required
                        >
                        <div class="input-icon">
                            <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Remember Me -->
                <div class="remember-me">
                    <label for="remember">مجھے یاد رکھیں</label>
                    <input type="checkbox" id="remember" name="remember">
                </div>

                <!-- Login Button -->
                <button type="submit" class="login-button">
                    <span class="button-text">
                        <span class="button-icon">←</span>
                        لاگ ان
                    </span>
                    <div class="loading"></div>
                </button>
            </form>

            <!-- Footer Links -->
            <div class="login-footer">
                <div class="footer-links">
                    <a href="#" class="index.php">واپس ہوم پہ جائیں</a>
                    
                </div>
            </div>
        </div>
    </div>

    <script>
        // Form submission with loading state
        const form = document.getElementById('loginForm');
        const submitButton = form.querySelector('.login-button');

        form.addEventListener('submit', function(e) {
            // Add loading state
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            // In a real application, this would be handled by the server
            // For demo purposes, we'll just show the loading state
        });

        // Show error message if exists (from PHP session)
        <?php if (isset($_SESSION['ERRMSG_ARR']) && !empty($_SESSION['ERRMSG_ARR'])): ?>
        document.getElementById('errorMessage').style.display = 'block';
        <?php endif; ?>

        // Add input focus animations
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });

            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Ripple effect on button click
        submitButton.addEventListener('click', function(e) {
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
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
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

        // Parallax mouse move effect
        document.addEventListener('mousemove', (e) => {
            const decorations = document.querySelectorAll('.bg-decoration');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            decorations.forEach((decoration, index) => {
                const speed = (index + 1) * 20;
                const xMove = (x - 0.5) * speed;
                const yMove = (y - 0.5) * speed;
                decoration.style.transform = `translate(${xMove}px, ${yMove}px)`;
            });
        });

        // Prevent form resubmission on page refresh
        if (window.history.replaceState) {
            window.history.replaceState(null, null, window.location.href);
        }
    </script>
</body>
</html>