// ===========================
// SUPABASE INITIALIZATION
// ===========================
// Never throw at parse time: if the CDN or keys fail, the rest of the UI still needs event listeners.
let supabaseClient = null;

(function initSupabaseClient() {
    try {
        if (typeof supabase === 'undefined') {
            console.error(
                '[Wedding site] Supabase JS did not load. Check network/ad blockers. Script order must be: @supabase/supabase-js → config.js → script.js. Prefer opening the site via http://localhost (not file://).'
            );
            return;
        }
        if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
            console.error('[Wedding site] config.js must define SUPABASE_URL and SUPABASE_ANON_KEY.');
            return;
        }
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
        console.error('[Wedding site] Supabase createClient failed:', err);
    }
})();

// ===========================
// RSVP FORM HANDLING
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const rsvpForm = document.getElementById('rsvpForm');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!supabaseClient) {
                alert(
                    'Unable to reach the RSVP service. Check that the page loaded fully (see browser Console), then refresh and try again.'
                );
                return;
            }

            // Get form data
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
            const guestCount = parseInt(document.getElementById('guestCount').value);
            const guestNames = document.getElementById('guestNames').value;
            const dietaryRestrictions = document.getElementById('dietaryRestrictions').value;
            const songRequest = document.getElementById('songRequest').value;
            const specialMessage = document.getElementById('specialMessage').value;
            const shareMessage = document.getElementById('shareMessage').checked;
            
            try {
                // Save to rsvp_submissions table
                const { data: rsvpData, error: rsvpError } = await supabaseClient
                    .from('rsvp_submissions')
                    .insert([{
                        full_name: fullName,
                        email: email,
                        phone: phone,
                        attendance: attendance,
                        guest_count: guestCount,
                        guest_names: guestNames,
                        dietary_restrictions: dietaryRestrictions,
                        song_request: songRequest,
                        special_message: specialMessage,
                        share_message: shareMessage
                    }]);
                
                if (rsvpError) throw rsvpError;
                
                // If user wants to share message and has written one, save to guest_messages
                if (shareMessage && specialMessage.trim()) {
                    const { error: messageError } = await supabaseClient
                        .from('guest_messages')
                        .insert([{
                            name: fullName,
                            message: specialMessage,
                            email: email
                        }]);
                    
                    if (messageError) throw messageError;
                    
                    // Reload messages display
                    await displayMessages();
                }
                
                // Show success message
                rsvpForm.style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
                
                // Scroll to success message
                document.getElementById('successMessage').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
            } catch (error) {
                console.error('Error submitting RSVP:', error);
                alert('Oops! There was a problem submitting your RSVP. Please try again or contact us directly.');
            }
        });
    }
    
    // Load and display messages on page load
    displayMessages();
});

// Function to display guest messages from Supabase
async function displayMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    const noMessagesText = document.getElementById('noMessages');
    
    if (!messagesContainer || !supabaseClient) return;
    
    try {
        // Fetch messages from Supabase
        const { data: messages, error } = await supabaseClient
            .from('guest_messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Clear existing messages (except sample ones)
        const dynamicMessages = messagesContainer.querySelectorAll('.message-card.dynamic');
        dynamicMessages.forEach(card => card.remove());
        
        // Add messages from database
        if (messages && messages.length > 0) {
            messages.forEach(msg => {
                const messageCard = document.createElement('div');
                messageCard.className = 'message-card dynamic';
                messageCard.innerHTML = `
                    <p class="message-text">"${escapeHtml(msg.message)}"</p>
                    <p class="message-author">— ${escapeHtml(msg.name)}</p>
                `;
                messagesContainer.appendChild(messageCard);
            });
            
            if (noMessagesText) {
                noMessagesText.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

const MAX_PHOTO_BYTES = 12 * 1024 * 1024; // 12 MB per file (adjust in Supabase project if needed)
const GUEST_PHOTO_PREFIX = 'guest';

function sanitizePhotoFileName(name) {
    const base = name.replace(/^.*[\\/]/, '');
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    return cleaned.slice(0, 120) || 'photo.jpg';
}

function makeGuestPhotoPath(fileName) {
    const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    return `${GUEST_PHOTO_PREFIX}/${id}-${sanitizePhotoFileName(fileName)}`;
}

async function loadGuestPhotoGallery() {
    const gallery = document.getElementById('photoGallery');
    const note = document.getElementById('galleryNote');
    if (!gallery || !supabaseClient || typeof SUPABASE_PHOTOS_BUCKET === 'undefined') return;

    try {
        const { data: files, error } = await supabaseClient.storage
            .from(SUPABASE_PHOTOS_BUCKET)
            .list(GUEST_PHOTO_PREFIX, { limit: 200 });

        if (error) throw error;

        const imageFiles = (files || []).filter(
            (f) => f.metadata && typeof f.metadata.size === 'number' && f.metadata.size > 0
        );

        if (imageFiles.length === 0) return;

        gallery.replaceChildren();
        imageFiles.forEach((f) => {
            const path = `${GUEST_PHOTO_PREFIX}/${f.name}`;
            const { data: pub } = supabaseClient.storage
                .from(SUPABASE_PHOTOS_BUCKET)
                .getPublicUrl(path);
            const wrap = document.createElement('div');
            wrap.className = 'gallery-item';
            const img = document.createElement('img');
            img.src = pub.publicUrl;
            img.alt = `Wedding guest photo: ${f.name}`;
            img.loading = 'lazy';
            wrap.appendChild(img);
            gallery.appendChild(wrap);
        });
        if (note) note.style.display = 'none';
    } catch (err) {
        console.warn('Could not load guest photo gallery:', err);
    }
}

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
    const uploadError = document.getElementById('uploadError');
    
    let selectedFiles = [];
    const submitDefaultLabel = submitPhotos ? submitPhotos.textContent : 'Upload Photos';

    function hideUploadError() {
        if (uploadError) {
            uploadError.style.display = 'none';
            uploadError.textContent = '';
        }
    }

    function showUploadError(message) {
        if (uploadError) {
            uploadError.textContent = message;
            uploadError.style.display = 'block';
        } else {
            alert(message);
        }
    }

    if (uploadBtn && photoUpload) {
        // Click upload button (stopPropagation so the upload-box handler does not open a second dialog)
        uploadBtn.addEventListener('click', function(e) {
            e.stopPropagation();
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
                hideUploadError();
            });
        }
        
        // Submit photos → Supabase Storage
        if (submitPhotos) {
            submitPhotos.addEventListener('click', async function() {
                hideUploadError();

                if (!selectedFiles.length) {
                    showUploadError('Please choose at least one photo to upload.');
                    return;
                }

                if (!supabaseClient) {
                    showUploadError(
                        'Photo upload could not start (connection not ready). Open DevTools → Console for errors, confirm script order on this page is Supabase → config.js → script.js, then refresh.'
                    );
                    return;
                }

                if (typeof SUPABASE_PHOTOS_BUCKET === 'undefined') {
                    showUploadError('Photo uploads are not configured. Please try again later.');
                    return;
                }

                const oversized = selectedFiles.filter((f) => f.size > MAX_PHOTO_BYTES);
                if (oversized.length) {
                    showUploadError(
                        `Each photo must be under ${Math.round(MAX_PHOTO_BYTES / (1024 * 1024))} MB. Please resize or remove: ${oversized.map((f) => f.name).join(', ')}`
                    );
                    return;
                }

                if (!previewGrid || !uploadPreview || !uploadSuccess) {
                    showUploadError('Page is missing upload elements. Refresh and try again.');
                    return;
                }

                submitPhotos.disabled = true;
                submitPhotos.textContent = 'Uploading…';

                const failures = [];
                let firstErrorMessage = null;

                try {
                    for (const file of selectedFiles) {
                        const path = makeGuestPhotoPath(file.name);
                        const { error } = await supabaseClient.storage
                            .from(SUPABASE_PHOTOS_BUCKET)
                            .upload(path, file, {
                                cacheControl: '3600',
                                upsert: false,
                                contentType: file.type || 'application/octet-stream'
                            });

                        if (error) {
                            console.error('Upload failed:', path, error);
                            failures.push(file.name);
                            if (!firstErrorMessage) {
                                firstErrorMessage = error.message || String(error);
                            }
                        }
                    }
                } catch (unexpected) {
                    console.error('Upload exception:', unexpected);
                    submitPhotos.disabled = false;
                    submitPhotos.textContent = submitDefaultLabel;
                    showUploadError(
                        unexpected && unexpected.message
                            ? `Upload failed: ${unexpected.message}`
                            : 'Something went wrong while uploading. Check the browser Console or try again.'
                    );
                    return;
                }

                submitPhotos.disabled = false;
                submitPhotos.textContent = submitDefaultLabel;

                if (failures.length === selectedFiles.length) {
                    showUploadError(
                        firstErrorMessage
                            ? `Upload failed: ${firstErrorMessage} If this mentions “row-level security” or “bucket”, complete the Storage bucket and policies in Supabase (see DATABASE_SETUP.md).`
                            : 'Your photos could not be uploaded. Please check your connection and try again, or contact us if this keeps happening.'
                    );
                    return;
                }

                if (failures.length) {
                    showUploadError(
                        `Some files could not be uploaded (${failures.join(', ')}). The rest were saved successfully.`
                    );
                }

                uploadPreview.style.display = 'none';
                uploadSuccess.style.display = 'block';

                selectedFiles = [];
                previewGrid.innerHTML = '';
                photoUpload.value = '';

                await loadGuestPhotoGallery();

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
                hideUploadError();
            });
        }

        loadGuestPhotoGallery();

        if (!supabaseClient) {
            showUploadError(
                'Photo uploads are offline (Supabase did not initialize). Open DevTools → Console, fix any errors, then refresh. Use http://localhost if opening as a file does not load scripts.'
            );
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
        
        // Filter for images only (HEIC often has empty MIME type in the browser)
        const imageFiles = filesArray.filter(
            (file) =>
                file.type.startsWith('image/') ||
                /\.(jpe?g|png|gif|webp|heic|heif|bmp|tif{1,2})$/i.test(file.name)
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
        if (!previewGrid || !uploadBox || !uploadPreview) {
            console.error('[Wedding site] Missing preview DOM nodes.');
            return;
        }
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
