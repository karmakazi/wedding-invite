# Andrea & Jeff Wedding Website

A beautiful, elegant wedding invitation website featuring minimal floral design with zinnias and dahlias in sophisticated red and pink tones.

## Wedding Details

- **Date:** Friday, May 29, 2026
- **Location:** Stouffville Museum, Whitchurch-Stouffville, ON
- **Time:** 5:00 PM arrival, 6:15 PM ceremony

## Website Features

### Pages

1. **Home (index.html)** - Landing page with hero section featuring the couple's names and wedding details
2. **Our Story (story.html)** - Information about Andrea and Jeff
3. **Details (details.html)** - Venue location, hotel accommodations, and general information
4. **Schedule (schedule.html)** - Timeline of the wedding day events
5. **RSVP (rsvp.html)** - Form for guests to respond, request songs, and note dietary restrictions
6. **Photos (photos.html)** - Photo upload functionality for guests to share pictures from the event

### Design Elements

- **Color Palette:** Sophisticated burgundy red (#8B2635) and blush pink (#F4DDD4)
- **Typography:** 
  - Headings: Cormorant Garamond (elegant serif)
  - Body: Montserrat (clean sans-serif)
- **Style:** Minimal, elegant design with subtle floral accents
- **Responsive:** Mobile-friendly layout that works on all devices

## How to Use

### Viewing Locally

1. Open `index.html` in a web browser
2. Navigate through the site using the top navigation menu
3. All pages are interconnected and fully functional

### Hosting Online

To make the website accessible to your guests:

#### Option 1: GitHub Pages (Free & Easy)
1. Create a GitHub account if you don't have one
2. Create a new repository named `wedding-website`
3. Upload all files to the repository
4. Go to Settings > Pages
5. Select main branch as source
6. Your site will be live at `https://yourusername.github.io/wedding-website/`

#### Option 2: Netlify (Free & Simple)
1. Create a Netlify account at netlify.com
2. Drag and drop the entire folder to Netlify
3. Your site will be live instantly with a custom URL
4. You can connect a custom domain if desired

#### Option 3: Traditional Web Hosting
1. Purchase hosting from providers like Bluehost, SiteGround, or HostGator
2. Upload files via FTP to your hosting account
3. Configure your domain name

## Important Notes

### RSVP and Photo Upload Functionality

**Current Implementation:**
- The RSVP form and photo upload currently store data in the browser's localStorage
- This is for demonstration purposes only and **will not persist across devices**
- Data is logged to the browser console for testing

**For Production Use:**
You'll need to implement a backend solution. Here are some options:

#### Easy Solutions (No Coding Required):
1. **Google Forms** - Replace RSVP form with embedded Google Form
2. **Formspree** (formspree.io) - Free form backend service
3. **Typeform** - Beautiful forms with responses collected
4. **Cloudinary** - For photo uploads with free tier

#### Technical Solutions (Require Development):
1. **Backend API** - Build with Node.js, Python (Flask/Django), or PHP
2. **Firebase** - Google's backend service with database and storage
3. **Supabase** - Open-source Firebase alternative
4. **AWS** - S3 for photos, Lambda + API Gateway for forms

### Recommended Next Steps

1. **Test the website** - Open in different browsers and devices
2. **Customize content** - Update the "Our Story" page with personal information
3. **Add photos** - Replace placeholder elements with actual photos of Andrea and Jeff
4. **Set up backend** - Implement one of the solutions above for RSVP and photo uploads
5. **Configure email** - Set up email notifications when RSVPs are received
6. **Test thoroughly** - Have friends test the RSVP and upload features
7. **Deploy** - Choose a hosting option and make it live
8. **Share** - Send the URL to your guests!

## File Structure

```
wedding-website/
├── index.html          # Home page
├── story.html          # About the couple
├── details.html        # Wedding details and hotels
├── schedule.html       # Day-of timeline
├── rsvp.html          # RSVP form
├── photos.html        # Photo upload and gallery
├── styles.css         # All styling
├── script.js          # JavaScript functionality
└── README.md          # This file
```

## Customization Tips

### Colors
Edit the CSS variables in `styles.css` (lines 11-20) to change the color scheme:
```css
--primary-red: #8B2635;
--accent-pink: #D98B8E;
--blush-pink: #F4DDD4;
```

### Fonts
Change fonts by editing the Google Fonts link in each HTML file's `<head>` section

### Content
Update text content directly in each HTML file

### Illustrations

**Current Design:**
The website now uses beautiful, elegant SVG illustrations in your red and pink color palette. These include:
- Hand-crafted floral illustrations (dahlias and zinnias)
- Elegant monogram circles for Andrea and Jeff
- Minimalist venue and date illustrations
- Abstract geometric patterns in the gallery
- Decorative floral dividers on all pages

**SVG Benefits:**
- Infinitely scalable (looks perfect on any screen size)
- Super lightweight (fast loading)
- Color-coordinated with your theme
- Elegant and sophisticated aesthetic
- No image hosting needed

**To replace with custom illustrations or photos:**
1. Create an `images` folder in the project directory
2. Add your photos to the folder (e.g., `andrea.jpg`, `jeff.jpg`, `venue.jpg`, `floral-decoration.png`)
3. Replace the placeholder URLs with your local images:

**Locations to update:**
- `index.html` - Hero section floral accents (lines with `placehold.co`)
- `story.html` - Andrea and Jeff profile photos
- `details.html` - Venue images
- `photos.html` - Gallery sample images
- All pages - Floral divider decorations

**Example:**
```html
<!-- Replace this: -->
<img src="https://placehold.co/400x400/..." alt="Andrea">

<!-- With this: -->
<img src="images/andrea.jpg" alt="Andrea">
```

**Recommended Image Sizes:**
- Profile photos (Andrea & Jeff): 400x400px (square, will be cropped to circle)
- Venue photos: 600x300px (2:1 ratio)
- Floral decorations: 150x150px to 400x400px
- Gallery photos: 400x400px minimum
- Hero floral accents: 400x400px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

Created with love for Andrea and Jeff's special day 💕

---

For questions or technical support, please refer to the hosting provider's documentation or consult with a web developer.
