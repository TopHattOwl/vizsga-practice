
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (validateForm(this)) {
        alert('Form submitted successfully!');
        this.reset();
        updateSubmitButton();
    }
}

function updateSubmitButton() {
    const form = document.getElementById('signup-form');
    const submitBtn = form.querySelector('.submit-btn');
    const requiredFields = form.querySelectorAll('[required]');
    
    let allValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    submitBtn.disabled = !allValid;
}



// --- Validation ---
function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('input, select');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^0\d{10}$/;
    return phoneRegex.test(phone);
}

function validateNumberOfPeople(number) {
    const num = parseInt(number);
    return !isNaN(num) && num >= 1 && num <= 10;
}

function validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${field.id}-error`);
    
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (value) {
        switch (field.type) {
            case 'email':
                if (!validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'tel':
                if (!validatePhone(value)) {
                    isValid = false;
                    errorMessage = 'Phone number must be 11 digits starting with 0 (e.g., 06304678942)';
                }
                break;
            case 'number':
                if (field.id === 'num-of-people' && !validateNumberOfPeople(value)) {
                    isValid = false;
                    errorMessage = 'Number of participants must be between 1 and 10';
                }
                break;
        }
        
        if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Please select an event';
        }
    }

    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    field.setAttribute('aria-invalid', !isValid);
    
    return isValid;
}



// --- Initialization ---
function init() {
    initMenu();
    initSignupForm();
}


function initMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}


function initSignupForm() {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        const formGroups = signupForm.querySelectorAll('.form-group');

        // error labels
        formGroups.forEach(group => {
            const input = group.querySelector('input, select');
            if (input) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.id = `${input.id}-error`;
                input.parentNode.insertBefore(errorElement, input);
            }
        });

        const formFields = signupForm.querySelectorAll('input, select');
        formFields.forEach(field => {
            field.addEventListener('input', () => {
                validateField(field);
                updateSubmitButton();
            });
            
            // blur event (input field looses focus)
            field.addEventListener('blur', () => {
                validateField(field);
                updateSubmitButton();
            });
        });

        updateSubmitButton();
        
        signupForm.addEventListener('submit', handleFormSubmit);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}