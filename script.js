
// --- Events ---

let allEvents = [];
let currentFilters = new Set();

async function loadEvents() {
    try {
        const response = await fetch('events_data.json');
        const data = await response.json();
        
        allEvents = data.events.map((event, index) => ({
            ...event,
            id: index + 1
        }));
        
        displayEvents(allEvents);
        setupSearch();
        displayFilterTags();
        setupTagFilters();
        
    } catch (error) {
        console.error('Error loading events:', error);
        document.querySelector('.event-list').innerHTML = '<p>Error loading events. Please try again later.</p>';
    }
}


function displayEvents(events) {
    const eventList = document.querySelector('.event-list');

    if (!eventList) {
        return;
    }
    
    if (events.length === 0) {
        eventList.innerHTML = '<p>No events found matching your criteria.</p>';
        return;
    }
    
    eventList.innerHTML = events.map(event => `
        <div class="event-card" data-tags="${event.tags.join(' ')}" id="${event.id}">
            <h2 class="roboto-bold">${event.name}</h2>
            <p><strong>Date:</strong> ${event.date} | ${event.time}</p>
            <p>${event.description}</p>
            <div class="event-tags">
                ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
            </div>
            <a href="contact.html?eventId=${event.id}" class="cta-button">Sign Up</a>
        </div>
    `).join('');
}


function displayFilterTags() {
    const filterContainer = document.querySelector('.filter-container');

    if (!filterContainer) {
        return;
    }
    
    const allTags = [...new Set(allEvents.flatMap(event => event.tags))];
    
    filterContainer.innerHTML = `
        <div class="filter-tags">
            ${allTags.map(tag => `
                <button class="filter-tag" data-tag="${tag}">${tag}</button>
            `).join('')}
        </div>
    `;
}

function setupTagFilters() {
    document.querySelectorAll('.filter-tag').forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.getAttribute('data-tag');
            
            if (currentFilters.has(tag)) {
                currentFilters.delete(tag);
                this.classList.remove('active');
            } else {
                currentFilters.add(tag);
                this.classList.add('active');
            }
            
            filterEvents();
        });
    });
}

function setupSearch() {
    const searchBar = document.getElementById('search-bar');

    if (!searchBar) {
        return;
    }
    
    searchBar.addEventListener('input', function() {
        filterEvents();
    });
}


function filterEvents() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    
    let filteredEvents = allEvents.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm) || 
                             event.description.toLowerCase().includes(searchTerm);
        
        const matchesTags = currentFilters.size === 0 || 
                           event.tags.some(tag => currentFilters.has(tag));
        
        return matchesSearch && matchesTags;
    });
    
    displayEvents(filteredEvents);
}


function populateEventDropdown() {
    const eventSelect = document.getElementById('event');
    
    eventSelect.innerHTML = '<option value="">Choose an event...</option>';
    
    allEvents.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        eventSelect.appendChild(option);
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    if (eventId) {
        eventSelect.value = eventId;
    }
}


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

    if (document.querySelector('.event-list')) {
        loadEvents();
    }
    
    if (document.getElementById('signup-form')) {
        initSignupForm();
        loadEvents().then(populateEventDropdown);
    }
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