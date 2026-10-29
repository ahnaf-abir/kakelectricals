# Quote alert emails + better job photos

## 1. Quote request emails (blocked until a domain is set up)
Quote emails aren't sending because the site has no sender email domain yet. Every quote is still saved and shows on the owner page.
- You set up a domain the business owns (for example kakelectricals.com.au) using the "Set up email domain" button.
- After that, every new quote request sends an email to the "Send quote requests to" address in Settings. The email includes the customer's name, phone, email, suburb and job details.
- The email has a "Call customer" button.

## 2. Multiple photos per job
- Adding a job: choose several photos at once or one at a time. Each photo shows as a thumbnail you can remove before saving.
- Existing jobs: a new "Edit" option lets you add more photos, remove single photos, and change the title, suburb, date and notes.
- Photos are uploaded one by one with a progress count ("Uploading 2 of 5"). Each photo is limited to 10MB.

## Technical details
- Email: create the email templates, then add a `quote-alert` template. Move quote submission into a server function that validates the request, inserts it, reads `owner_settings.quote_alert_email` with the admin client, and sends the email with idempotency key `quote-alert-<id>`. The form then calls that function instead of inserting directly.
- Photos: AddJob keeps a local File[] state with object-URL previews. Add an EditJob dialog in admin that updates `jobs` (title, suburb, job_date, notes, photos), uploads new files to `job-photos`, and removes deleted paths from storage.
