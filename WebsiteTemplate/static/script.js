
// Password protection
function checkPassword(type = 'maintenance') {
    const passwordInput = type === 'maintenance' ? 
        document.getElementById('password-input') : 
        document.getElementById('admin-password-input');
    
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    const errorElement = type === 'maintenance' ? 
        document.getElementById('password-error') : 
        document.getElementById('admin-password-error');

    fetch('/verify-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password, type: type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (type === 'admin') {
                localStorage.setItem('isAdminAuthenticated', 'true');
                const adminPasswordScreen = document.getElementById('admin-password-screen');
                if (adminPasswordScreen) {
                    adminPasswordScreen.style.display = 'none';
                    window.location.href = '/active-reports';
                }
            } else {
                localStorage.setItem('isAuthenticated', 'true');
                const passwordScreen = document.getElementById('password-screen');
                if (passwordScreen) {
                    passwordScreen.style.display = 'none';
                }
            }
        } else {
            if (errorElement) {
                errorElement.textContent = 'Invalid password. Please try again.';
            }
        }
    })
    .catch(error => {
        if (errorElement) {
            errorElement.textContent = 'An error occurred. Please try again.';
        }
        console.error('Error:', error);
    });
}

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    const passwordScreen = document.getElementById('password-screen');
    const adminPasswordScreen = document.getElementById('admin-password-screen');
    
    if (isAuthenticated && passwordScreen) {
        passwordScreen.style.display = 'none';
    }
    
    if (isAdminAuthenticated && adminPasswordScreen) {
        adminPasswordScreen.style.display = 'none';
    }

    // Add password input enter key handlers if elements exist
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                checkPassword('maintenance');
            }
        });
    }
    
    const adminPasswordInput = document.getElementById('admin-password-input');
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                checkPassword('admin');
            }
        });
    }

    // Add event listener to modal overlay if it exists
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeSurvey);
    }
});

// Survey modal functionality
function openSurvey(category) {
    const modalOverlay = document.getElementById('modal-overlay');
    const survey = document.getElementById('survey');
    const surveyCategory = document.getElementById('surveyCategory');
    
    if (modalOverlay) modalOverlay.style.display = 'block';
    if (survey) survey.style.display = 'block';
    if (surveyCategory) surveyCategory.textContent = category;
}

function closeSurvey() {
    const modalOverlay = document.getElementById('modal-overlay');
    const survey = document.getElementById('survey');
    
    if (modalOverlay) modalOverlay.style.display = 'none';
    if (survey) survey.style.display = 'none';
}

// Form submission
function submitReport(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const surveyCategory = document.getElementById('surveyCategory');
    
    if (surveyCategory) {
        formData.append('category', surveyCategory.textContent);
    }

    fetch('/submit-report', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Report submitted successfully!');
            closeSurvey();
            form.reset();
        } else {
            alert('Error submitting report: ' + data.message);
        }
    })
    .catch(error => {
        alert('An error occurred while submitting the report.');
        console.error('Error:', error);
    });
}

// Form validation - Only add listeners if elements exist
document.addEventListener('DOMContentLoaded', function() {
    const requiredElements = document.querySelectorAll('form input[required], form select[required], form textarea[required]');
    
    requiredElements.forEach(element => {
        element.addEventListener('invalid', (event) => {
            event.preventDefault();
            element.classList.add('invalid');
        });

        element.addEventListener('input', () => {
            if (element.validity.valid) {
                element.classList.remove('invalid');
            }
        });
    });
});

function viewActiveReports() {
    // Show admin password modal instead of redirecting directly
    const adminPasswordScreen = document.getElementById('admin-password-screen');
    if (adminPasswordScreen) {
        // Clear any previous input first
        const adminPasswordInput = document.getElementById('admin-password-input');
        if (adminPasswordInput) adminPasswordInput.value = '';
        
        adminPasswordScreen.style.display = 'flex';
    }
}

// Add to existing JavaScript
function resolveIssue(index) {
    fetch(`/resolve-issue/${index}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const reportElement = document.getElementById(`report-${index}`);
            if (reportElement) {
                reportElement.style.opacity = '0';
                setTimeout(() => {
                    reportElement.remove();
                    // Check if there are no more reports
                    const reportsContainer = document.querySelector('.reports-container');
                    if (reportsContainer && !reportsContainer.querySelector('.report-card')) {
                        reportsContainer.innerHTML = `
                            <div class="no-reports-message">
                                <i class="fas fa-clipboard-list"></i>
                                <p>All active issues will appear here</p>
                            </div>
                        `;
                    }
                }, 300);
            }
        } else {
            alert('Error resolving issue: ' + data.message);
        }
    })
    .catch(error => {
        alert('An error occurred while resolving the issue.');
        console.error('Error:', error);
    });
}
