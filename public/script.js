// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    // Function to apply theme
    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    } else {
        applyTheme(false); // Default to light if no preference or 'light'
    }

    // Event listener for theme toggle in settings modal
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                applyTheme(true);
                localStorage.setItem('theme', 'dark');
            } else {
                applyTheme(false);
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Open settings modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'block';
            // Ensure the toggle reflects current theme when modal opens
            applyTheme(document.body.classList.contains('dark-mode'));
        });
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
        if (event.target === serviceModal) {
            serviceModal.style.display = 'none';
        }
    });

    // --- Smooth Scrolling for Navigation ---
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Service "Learn More" Modals ---
    const serviceModal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const learnMoreBtns = document.querySelectorAll('.learn-more-btn');

    const serviceDescriptions = {
        residential: "Our residential cleaning service covers everything from dusting and vacuuming to kitchen and bathroom sanitization, ensuring your home is a clean and healthy sanctuary. We offer flexible scheduling to fit your lifestyle.",
        commercial: "We provide comprehensive commercial cleaning services for offices, retail spaces, and other businesses. Our team works efficiently to maintain a professional and hygienic environment, contributing to a positive impression for your clients and employees.",
        deep: "For a thorough refresh, our deep cleaning service tackles every nook and cranny, including detailed cleaning of all surfaces, inside cabinets, behind appliances, and extensive scrubbing to eliminate grime and build-up, leaving your space immaculately clean.",
        move: "Moving can be stressful, but cleaning doesn't have to be. Our move-in/move-out cleaning service ensures your old property is spotless for its next occupants or your new home is perfectly clean and ready for you to settle in.",
        pressure: "Specializing in pressure pipe cleaning, we use high-pressure water jets to effectively clear stubborn blockages, remove grease, and clean the interior of your pipes. This service helps prevent future clogs and maintains optimal drainage system performance."
    };

    learnMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const serviceType = btn.dataset.service;
            // Get the service title from the h3 element sibling
            modalTitle.textContent = btn.previousElementSibling.previousElementSibling.textContent; 
            modalDescription.textContent = serviceDescriptions[serviceType];
            serviceModal.style.display = 'block';
        });
    });

    // --- Fetch and Display Public Appointments ---
    const appointmentsList = document.getElementById('appointments-list');

    async function fetchAppointments() {
        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const appointments = await response.json();
            displayAppointments(appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsList.innerHTML = '<p class="error-message">Failed to load appointments. Please try again later.</p>';
        }
    }

    function displayAppointments(appointments) {
        appointmentsList.innerHTML = ''; // Clear previous content
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>No upcoming appointments scheduled.</p>';
            return;
        }

        // Sort appointments by date and then time
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        appointments.forEach(appointment => {
            const appointmentCard = document.createElement('div');
            appointmentCard.classList.add('appointment-card');
            appointmentCard.innerHTML = `
                <h4>${appointment.service}</h4>
                <p><strong>Client:</strong> ${appointment.clientName}</p>
                <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            `;
            appointmentsList.appendChild(appointmentCard);
        });
    }

    fetchAppointments(); // Call on page load to display appointments

    // --- Complaint/Report Form Submission ---
    const complaintReportForm = document.getElementById('complaint-report-form');
    const formMessage = document.getElementById('form-message');

    if (complaintReportForm) {
        complaintReportForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                senderName: document.getElementById('senderName').value,
                senderEmail: document.getElementById('senderEmail').value,
                senderPhone: document.getElementById('senderPhone').value,
                type: document.getElementById('messageType').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/complaints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    formMessage.className = 'success-message';
                    formMessage.textContent = 'Your message has been sent successfully!';
                    complaintReportForm.reset();
                } else {
                    formMessage.className = 'error-message';
                    formMessage.textContent = result.message || 'Failed to send message. Please try again.';
                }
            } catch (error) {
                console.error('Error submitting complaint/report:', error);
                formMessage.className = 'error-message';
                formMessage.textContent = 'An error occurred. Please check your connection and try again.';
            }
        });
    }
});