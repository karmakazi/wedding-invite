// ===========================
// RSVP FORM HANDLING
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const rsvpForm = document.getElementById('rsvpForm');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(rsvpForm);
            
            // Set the replyto field to the guest's email
            const guestEmail = document.getElementById('email').value;
            formData.set('_replyto', guestEmail);
            
            try {
                // Submit to Formspree
                const response = await fetch(rsvpForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Show success message
                    rsvpForm.style.display = 'none';
                    document.getElementById('successMessage').style.display = 'block';
                    
                    // Scroll to success message
                    document.getElementById('successMessage').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                } else {
                    alert('Oops! There was a problem submitting your RSVP. Please try again or contact us directly.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Oops! There was a problem submitting your RSVP. Please try again or contact us directly.');
            }
        });
    }
});

// ===========================
// PHOTO UPLOAD HANDLING
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    const uploadBtn = document.getElementById('uploadBtn');
    const photoUpload = document.getElementById('photoUpload');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewGrid = document.getElementById('previewGrid');
    const submitPhotos = document.getElementById('submitPhotos');
    const cancelUpload = document.getElementById('cancelUpload');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const uploadMore = document.getElementById('uploadMore');
    
    let selectedFiles = [];
    
    if (uploadBtn && photoUpload) {
        // Click upload button
        uploadBtn.addEventListener('click', function() {
            photoUpload.click();
        });
        
        // Click upload box
        uploadBox.addEventListener('click', function(e) {
            if (e.target === uploadBox || e.target.closest('.upload-box')) {
                photoUpload.click();
            }
        });
        
        // File selection
        photoUpload.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });
        
        // Drag and drop
        uploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadBox.style.borderColor = 'var(--primary-red)';
            uploadBox.style.backgroundColor = 'var(--pale-pink)';
        });
        
        uploadBox.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadBox.style.borderColor = 'var(--accent-pink)';
            uploadBox.style.backgroundColor = 'transparent';
        });
        
        uploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadBox.style.borderColor = 'var(--accent-pink)';
            uploadBox.style.backgroundColor = 'transparent';
            handleFiles(e.dataTransfer.files);
        });
        
        // Cancel upload
        if (cancelUpload) {
            cancelUpload.addEventListener('click', function() {
                selectedFiles = [];
                previewGrid.innerHTML = '';
                uploadBox.style.display = 'block';
                uploadPreview.style.display = 'none';
                photoUpload.value = '';
            });
        }
        
        // Submit photos
        if (submitPhotos) {
            submitPhotos.addEventListener('click', function() {
                // In a real application, this would upload to a server
                console.log('Uploading photos:', selectedFiles);
                console.log('Note: In production, these would be uploaded to a server or cloud storage.');
                
                // Store file info in localStorage (not the actual files, just metadata)
                const photoMetadata = selectedFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    timestamp: new Date().toISOString()
                }));
                
                const existingPhotos = JSON.parse(localStorage.getItem('uploadedPhotos') || '[]');
                existingPhotos.push(...photoMetadata);
                localStorage.setItem('uploadedPhotos', JSON.stringify(existingPhotos));
                
                // Show success
                uploadPreview.style.display = 'none';
                uploadSuccess.style.display = 'block';
                
                // Reset
                selectedFiles = [];
                previewGrid.innerHTML = '';
                photoUpload.value = '';
                
                // Scroll to success
                uploadSuccess.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
        }
        
        // Upload more button
        if (uploadMore) {
            uploadMore.addEventListener('click', function() {
                uploadSuccess.style.display = 'none';
                uploadBox.style.display = 'block';
            });
        }
    }
    
    // Handle files function
    function handleFiles(files) {
        const maxFiles = 10;
        const filesArray = Array.from(files);
        
        // Limit to 10 files
        if (filesArray.length > maxFiles) {
            alert(`Please select no more than ${maxFiles} photos at a time.`);
            return;
        }
        
        // Filter for images only
        const imageFiles = filesArray.filter(file => 
            file.type.startsWith('image/')
        );
        
        if (imageFiles.length === 0) {
            alert('Please select valid image files (JPG, PNG, HEIC, etc.)');
            return;
        }
        
        if (imageFiles.length !== filesArray.length) {
            alert('Some files were not images and have been excluded.');
        }
        
        selectedFiles = imageFiles;
        displayPreview();
    }
    
    // Display preview function
    function displayPreview() {
        previewGrid.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-btn" data-index="${index}">×</button>
                `;
                
                // Remove button
                previewItem.querySelector('.remove-btn').addEventListener('click', function() {
                    removeFile(index);
                });
                
                previewGrid.appendChild(previewItem);
            };
            
            reader.readAsDataURL(file);
        });
        
        // Show preview, hide upload box
        uploadBox.style.display = 'none';
        uploadPreview.style.display = 'block';
    }
    
    // Remove file function
    function removeFile(index) {
        selectedFiles.splice(index, 1);
        
        if (selectedFiles.length === 0) {
            uploadBox.style.display = 'block';
            uploadPreview.style.display = 'none';
            photoUpload.value = '';
        } else {
            displayPreview();
        }
    }
});

// ===========================
// SMOOTH SCROLL FOR NAVIGATION
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===========================
// NAVIGATION ACTIVE STATE
// ===========================
window.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// ===========================
// SCROLL ANIMATIONS (Optional)
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.detail-card, .story-card, .timeline-item, .hotel-card, .note-card, .tip-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
