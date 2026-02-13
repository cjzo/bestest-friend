# Features Backlog

## MVP (Current)
- [x] Friend management (CRUD)
- [x] Events/reminders per friend (birthday, anniversary, custom)
- [x] Notes per friend (favorites, gift ideas, general)
- [x] Reciprocity tracking (sent/received gestures)
- [x] Upcoming events feed with urgency indicators
- [x] Chat assistant for gift ideas and message templates
- [x] Dark-mode operational UI

## High Priority
- [ ] **User Authentication** — email/password or OAuth (Google). Multi-user support.
- [ ] **Push Notifications / Email Reminders** — send reminders N days before events (requires background job scheduler)
- [ ] **SMS/Email Integration** — send birthday wishes directly from the app (Twilio / SendGrid)
- [ ] **LLM-powered Chat** — integrate OpenAI or similar for personalized gift/message suggestions based on friend notes
- [ ] **Photo Upload** — allow users to upload friend photos (S3 / local storage)

## Medium Priority
- [ ] **Friend Groups / Tags** — organize friends by group (college, work, family)
- [ ] **Recurring Reminders** — customizable reminder schedules (e.g., remind me 3 days and 1 day before)
- [ ] **Activity Feed** — chronological log of all actions across all friends
- [ ] **Import Contacts** — import from phone contacts or Google Contacts
- [ ] **Calendar Integration** — sync events to Google Calendar / Apple Calendar
- [ ] **Redis Caching** — cache upcoming events, friend lists for fast loading
- [ ] **Data Export** — export all data as JSON/CSV

## Nice to Have
- [ ] **Mobile App** — React Native or PWA
- [ ] **Shared Friends** — collaborative friend management with a partner
- [ ] **Gift Tracking** — track gifts given/received with budgets
- [ ] **Mood / Interaction Quality** — rate how interactions went
- [ ] **Streak Tracking** — visualize how consistently you stay in touch
- [ ] **Birthday Card Designer** — generate/send digital birthday cards
- [ ] **Conversation Starters** — AI-generated topics based on friend interests
- [ ] **Accessibility Audit** — full WCAG AAA compliance pass
- [ ] **i18n / Localization** — multi-language support
- [ ] **Background Job Queue** — Celery/Redis for scheduled tasks
- [ ] **Rate Limiting & Security** — API rate limiting, input sanitization, CSRF protection
- [ ] **Database Migrations** — Alembic setup for schema evolution
- [ ] **Automated Testing** — pytest for backend, Vitest for frontend
- [ ] **CI/CD Pipeline** — GitHub Actions for linting, testing, deployment
- [ ] **Docker Deployment** — Dockerfile + docker-compose for easy deployment
