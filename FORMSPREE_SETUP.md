# Formspree Setup Instructions

To enable the RSVP form to send emails, you need to set up a free Formspree account.

## Steps:

1. **Go to Formspree**: Visit https://formspree.io/

2. **Sign up for free**: Create a free account (allows 50 submissions per month)

3. **Create a new form**:
   - Click "New Form"
   - Name it: "Wedding RSVP"
   - Email address: `andrealynneellis@gmail.com`

4. **Get your form endpoint**:
   - After creating the form, you'll see a form endpoint like: `https://formspree.io/f/xyzabc123`
   - Copy this URL

5. **Update your website**:
   - Open `rsvp.html`
   - Find line 35: `<form id="rsvpForm" class="rsvp-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">`
   - Replace `YOUR_FORM_ID` with your actual form ID (the part after `/f/`)
   - Example: `<form id="rsvpForm" class="rsvp-form" action="https://formspree.io/f/xyzabc123" method="POST">`

6. **Configure form settings in Formspree dashboard**:
   - **Subject**: Set to "RSVP Derrick Ellis Wedding" (this is already in the hidden field)
   - **Auto-response**: Enable it and customize the message to guests (already configured in the form)
   - **Notifications**: You'll receive an email at andrealynneellis@gmail.com for each RSVP

7. **Test it**: Submit a test RSVP to make sure it works!

## What happens when someone RSVPs:

1. **They receive an automatic email** with:
   - Thank you message
   - Wedding date: Friday, May 29, 2026
   - Location: Stouffville Museum address
   - Schedule (5pm arrival, 6:15pm ceremony, reception following)

2. **You receive an email** at andrealynneellis@gmail.com with:
   - Subject: "RSVP Derrick Ellis Wedding"
   - All their form responses (name, email, attendance, guest count, dietary restrictions, song request, special message)
   - Reply-to will be set to their email address so you can reply directly

## Alternative: Manual Setup

If you prefer, the form will work without Formspree, but you'll need to manually check submissions through the Formspree dashboard instead of receiving emails.
