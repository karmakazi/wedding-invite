// Admin RSVP Dashboard Script
const ADMIN_PASSWORD = 'Andrea&Jeff2026'; // Change this to your desired password

// Supabase client initialization
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allRsvps = [];
let currentFilter = 'all';

// Check if already logged in
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
});

// Login form handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('passwordInput').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('passwordInput').value = '';
    }
});

// Logout handling
document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('passwordInput').value = '';
    document.getElementById('errorMessage').style.display = 'none';
});

// Show dashboard and load data
async function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    await loadRsvps();
}

// Load RSVPs from Supabase
async function loadRsvps() {
    try {
        const { data, error } = await supabaseClient
            .from('rsvp_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allRsvps = data || [];
        updateStats();
        displayRsvps(allRsvps);
    } catch (error) {
        console.error('Error loading RSVPs:', error);
        document.getElementById('tableContent').innerHTML = 
            '<div class="no-rsvps">Error loading RSVPs. Please try again.</div>';
    }
}

// Update statistics
function updateStats() {
    const attending = allRsvps.filter(r => r.attendance === 'attending');
    const notAttending = allRsvps.filter(r => r.attendance === 'not-attending');
    const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count || 0), 0);
    
    document.getElementById('totalRsvps').textContent = allRsvps.length;
    document.getElementById('attendingCount').textContent = attending.length;
    document.getElementById('notAttendingCount').textContent = notAttending.length;
    document.getElementById('totalGuests').textContent = totalGuests;
}

// Display RSVPs in table
function displayRsvps(rsvps) {
    const tableContent = document.getElementById('tableContent');
    
    if (rsvps.length === 0) {
        tableContent.innerHTML = '<div class="no-rsvps">No RSVPs found.</div>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Guests</th>
                    <th>Submitted</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    rsvps.forEach((rsvp, index) => {
        const date = new Date(rsvp.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const attendanceClass = rsvp.attendance === 'attending' ? 'attending' : 'not-attending';
        const attendanceText = rsvp.attendance === 'attending' ? 'Attending' : 'Not Attending';
        
        html += `
            <tr class="expandable" onclick="toggleDetails(${index})">
                <td><strong>${escapeHtml(rsvp.full_name)}</strong></td>
                <td>${escapeHtml(rsvp.email)}</td>
                <td>${escapeHtml(rsvp.phone || 'N/A')}</td>
                <td><span class="attendance-badge ${attendanceClass}">${attendanceText}</span></td>
                <td>${rsvp.guest_count || 1}</td>
                <td>${date}</td>
            </tr>
            <tr class="details-row" id="details-${index}">
                <td colspan="6" class="details-cell">
                    ${generateDetailsHtml(rsvp)}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    tableContent.innerHTML = html;
}

// Generate detailed view HTML
function generateDetailsHtml(rsvp) {
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">';
    
    if (rsvp.guest_names && rsvp.guest_names.trim()) {
        html += `
            <div class="detail-group">
                <div class="detail-label">Guest Names:</div>
                <div class="detail-content">${escapeHtml(rsvp.guest_names)}</div>
            </div>
        `;
    }
    
    if (rsvp.dietary_restrictions && rsvp.dietary_restrictions.trim()) {
        html += `
            <div class="detail-group">
                <div class="detail-label">Dietary Restrictions:</div>
                <div class="detail-content">${escapeHtml(rsvp.dietary_restrictions)}</div>
            </div>
        `;
    }
    
    if (rsvp.song_request && rsvp.song_request.trim()) {
        html += `
            <div class="detail-group">
                <div class="detail-label">Song Request:</div>
                <div class="detail-content">${escapeHtml(rsvp.song_request)}</div>
            </div>
        `;
    }
    
    if (rsvp.special_message && rsvp.special_message.trim()) {
        html += `
            <div class="detail-group">
                <div class="detail-label">Special Message:</div>
                <div class="detail-content">${escapeHtml(rsvp.special_message)}</div>
                ${rsvp.share_message ? '<div style="color: var(--accent-pink); font-size: 0.8rem; margin-top: 0.5rem;">✓ Shared publicly</div>' : ''}
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Toggle details row
function toggleDetails(index) {
    const detailsRow = document.getElementById(`details-${index}`);
    detailsRow.classList.toggle('show');
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        currentFilter = this.dataset.filter;
        applyFilters();
    });
});

// Search functionality
document.getElementById('searchBox').addEventListener('input', function(e) {
    applyFilters();
});

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    
    let filtered = allRsvps;
    
    // Apply attendance filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.attendance === currentFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.full_name.toLowerCase().includes(searchTerm) ||
            r.email.toLowerCase().includes(searchTerm)
        );
    }
    
    displayRsvps(filtered);
}

// Export to CSV
document.getElementById('exportBtn').addEventListener('click', function() {
    if (allRsvps.length === 0) {
        alert('No RSVPs to export.');
        return;
    }
    
    let csv = 'Name,Email,Phone,Attendance,Guest Count,Guest Names,Dietary Restrictions,Song Request,Special Message,Share Message,Submitted Date\n';
    
    allRsvps.forEach(rsvp => {
        const date = new Date(rsvp.created_at).toLocaleString();
        csv += [
            escapeCSV(rsvp.full_name),
            escapeCSV(rsvp.email),
            escapeCSV(rsvp.phone || ''),
            escapeCSV(rsvp.attendance),
            rsvp.guest_count || 1,
            escapeCSV(rsvp.guest_names || ''),
            escapeCSV(rsvp.dietary_restrictions || ''),
            escapeCSV(rsvp.song_request || ''),
            escapeCSV(rsvp.special_message || ''),
            rsvp.share_message ? 'Yes' : 'No',
            date
        ].join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp-list-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to escape CSV
function escapeCSV(text) {
    if (!text) return '""';
    text = text.toString().replace(/"/g, '""');
    return `"${text}"`;
}
