// public/admin.js

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
    });

    // --- Admin Login Logic ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const adminLoginSection = document.getElementById('admin-login');
    const adminDashboardSection = document.getElementById('admin-dashboard');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Check if admin is already "logged in" (based on session storage for this demo)
    function checkAdminStatus() {
        const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
        if (isAdminLoggedIn === 'true') {
            adminLoginSection.style.display = 'none';
            adminDashboardSection.style.display = 'block';
            adminLogoutBtn.style.display = 'inline-block';
            showSection('view-appointments-section'); // Default to view appointments
            fetchAppointments(); // Load appointments on dashboard entry
            fetchComplaints(); // Load complaints on dashboard entry
        } else {
            adminLoginSection.style.display = 'block';
            adminDashboardSection.style.display = 'none';
            adminLogoutBtn.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    loginMessage.className = 'success-message';
                    loginMessage.textContent = 'Login successful! Redirecting to dashboard...';
                    sessionStorage.setItem('isAdminLoggedIn', 'true'); // Store login status
                    setTimeout(() => {
                        checkAdminStatus();
                    }, 1000);
                } else {
                    loginMessage.className = 'error-message';
                    loginMessage.textContent = result.message || 'Login failed.';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginMessage.className = 'error-message';
                loginMessage.textContent = 'An error occurred during login. Please try again.';
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            checkAdminStatus();
            alert('You have been logged out.');
        });
    }

    // --- Dashboard Navigation ---
    const createAppointmentBtn = document.getElementById('create-appointment-btn');
    const viewAppointmentsBtn = document.getElementById('view-appointments-btn');
    const viewComplaintsBtn = document.getElementById('view-complaints-btn');

    const createAppointmentSection = document.getElementById('create-appointment-section');
    const viewAppointmentsSection = document.getElementById('view-appointments-section');
    const viewComplaintsSection = document.getElementById('view-complaints-section');

    function hideAllSections() {
        createAppointmentSection.style.display = 'none';
        viewAppointmentsSection.style.display = 'none';
        viewComplaintsSection.style.display = 'none';
    }

    function showSection(sectionId) {
        hideAllSections();
        document.getElementById(sectionId).style.display = 'block';
    }

    if (createAppointmentBtn) {
        createAppointmentBtn.addEventListener('click', () => showSection('create-appointment-section'));
    }
    if (viewAppointmentsBtn) {
        viewAppointmentsBtn.addEventListener('click', () => {
            showSection('view-appointments-section');
            fetchAppointments(); // Refresh appointments when viewing
        });
    }
    if (viewComplaintsBtn) {
        viewComplaintsBtn.addEventListener('click', () => {
            showSection('view-complaints-section');
            fetchComplaints(); // Refresh complaints when viewing
        });
    }

    // --- Create Appointment Logic ---
    const createAppointmentForm = document.getElementById('create-appointment-form');
    const appointmentMessage = document.getElementById('appointment-message');

    if (createAppointmentForm) {
        createAppointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                clientName: document.getElementById('clientName').value,
                contactNumber: document.getElementById('contactNumber').value,
                service: document.getElementById('service').value,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                notes: document.getElementById('notes').value
            };

            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    appointmentMessage.className = 'success-message';
                    appointmentMessage.textContent = 'Appointment created successfully!';
                    createAppointmentForm.reset();
                    fetchAppointments(); // Refresh appointments list in admin view
                    // Note: Public page will refresh appointments on its next load or manual refresh.
                } else {
                    appointmentMessage.className = 'error-message';
                    appointmentMessage.textContent = result.message || 'Failed to create appointment.';
                }
            } catch (error) {
                console.error('Error creating appointment:', error);
                appointmentMessage.className = 'error-message';
                appointmentMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // --- Fetch and Display Appointments (Admin) ---
    const appointmentsTableBody = document.querySelector('#appointments-table tbody');
    const noAppointmentsMessage = document.getElementById('no-appointments-message');

    async function fetchAppointments() {
        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const appointments = await response.json();
            displayAdminAppointments(appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            appointmentsTableBody.innerHTML = `<tr><td colspan="7" class="error-message">Failed to load appointments.</td></tr>`;
            noAppointmentsMessage.style.display = 'block';
        }
    }

    function displayAdminAppointments(appointments) {
        appointmentsTableBody.innerHTML = ''; // Clear previous content
        if (appointments.length === 0) {
            noAppointmentsMessage.style.display = 'block';
            return;
        }
        noAppointmentsMessage.style.display = 'none';

        // Sort appointments by date and then time
        appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        appointments.forEach(appointment => {
            const row = appointmentsTableBody.insertRow();
            row.innerHTML = `
                <td>${appointment.clientName}</td>
                <td>${appointment.contactNumber}</td>
                <td>${appointment.service}</td>
                <td>${new Date(appointment.date).toLocaleDateString('en-NZ')}</td>
                <td>${appointment.time}</td>
                <td>${appointment.notes || 'N/A'}</td>
                <td><button class="delete-btn" data-id="${appointment._id}">Delete</button></td>
            `;
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteAppointment);
        });
    }

    async function deleteAppointment(event) {
        const appointmentId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Appointment deleted successfully!');
                fetchAppointments(); // Refresh the list in admin view
                // To reflect changes immediately on the public page, you'd typically use WebSockets.
                // For this setup, the public page will update on its next load or manual refresh.
            } else {
                const result = await response.json();
                alert(result.message || 'Failed to delete appointment.');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('An error occurred while deleting the appointment.');
        }
    }

    // --- Fetch and Display Complaints/Reports (Admin) ---
    const complaintsTableBody = document.querySelector('#complaints-table tbody');
    const noComplaintsMessage = document.getElementById('no-complaints-message');

    async function fetchComplaints() {
        try {
            const response = await fetch('/api/complaints');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const complaints = await response.json();
            displayAdminComplaints(complaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            complaintsTableBody.innerHTML = `<tr><td colspan="6" class="error-message">Failed to load reports/complaints.</td></tr>`;
            noComplaintsMessage.style.display = 'block';
        }
    }

    function displayAdminComplaints(complaints) {
        complaintsTableBody.innerHTML = ''; // Clear previous content
        if (complaints.length === 0) {
            noComplaintsMessage.style.display = 'block';
            return;
        }
        noComplaintsMessage.style.display = 'none';

        complaints.forEach(complaint => {
            const row = complaintsTableBody.insertRow();
            row.innerHTML = `
                <td>${complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</td>
                <td>${complaint.senderName}</td>
                <td>${complaint.senderEmail || 'N/A'}</td>
                <td>${complaint.senderPhone || 'N/A'}</td>
                <td>${complaint.message}</td>
                <td>${new Date(complaint.createdAt).toLocaleDateString('en-NZ')} ${new Date(complaint.createdAt).toLocaleTimeString('en-NZ')}</td>
            `;
        });
    }

    // Initial check on page load to determine if admin dashboard should be shown
    checkAdminStatus();
});