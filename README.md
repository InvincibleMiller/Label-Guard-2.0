# Label Guard 2.0!

## About

Label Guard is a full stack Web App used to track violations and repeat violations within a restaurant setting. It supports multi-restaurant administration, meaning that administration can host and track data for multiple restaurants using just one account. It obviously supports User Authentication, and it comes with a clean and modern dashboard to view and manage your restaurant's data: inventory, custom violations, and shifts. The app also comes with password protected form generation, on a per-restaurant basis so that restaurant's can perform "Label Checks" during any given shift, and thereby report findings to the app.

## Tech Stack

### 2.0

Label Guard versions 2.0+ use this tech stack:

- Node.js
- Express.js
- Next.js
- React.js
- Fauna DB (FQL v10)
- Bootstrap

This specific tech stack is absolutely incredible because it allows the benefits of Next.js, specifically dynamically rendering content, to be coupled with the versatility of Express.js as a backend. Fauna DB is an incredible fast, serverless, NoSQL relational database.

Various other libraries are used in the app:

- Stripe
- Zustand (State Management)
- react-hook-form
- cryptojs
- etc.

### Back Story

Versions 1.x were unfortunately lacking in design, such that integrating Stripe subscriptions was unnecessarily complicated. The solution was to rebuild the entire app, nearly from the ground up in a sustainable, scalable way so that the source can easily grow with Label Guard as a commercial application.

## Development

This app is developed with the Agile project methodology, using Trello kanbans for project organization.
