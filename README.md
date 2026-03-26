
# Simple E-commerce for AWS Elastic Beanstalk (Node.js)

A minimal Express + EJS sample with session cart and a tiny catalog. No `.ebextensions` required.

## Run locally

```bash
npm install
npm start
# open http://localhost:8080
```

## Deploy to Elastic Beanstalk

1. Create an application and **Node.js (AL2) platform** environment (choose Node.js 18 in the Console).
2. Upload this zip as the source bundle.
3. Ensure you **do not set empty tag values** during creation; leave tags blank or provide non-empty values.

**Health check**: `/` (home returns 200), `/health` also available.

## Notes
- Session data is in-memory. Use a database or external store for production.
- Set `SESSION_SECRET` in EB Environment Properties for security.
