# Label Guard 2.0!

## About

Label Guard was inspired by a few simple questions:

- In any restaurant, how much is being wasted and why?
- How many times was the health code violated this quarter?
- How often are these violations occurring?
- etc., etc.

Restaurant leadership often asks these kinds of questions.

Label Guard answers those questions (and many more) with precise data tracking and report compilation.

It supports multi-restaurant administration, meaning that administration can host and track data for multiple restaurants using just one account. That means Label Guard scales seamlessly with any multi-location operation.

Restaurant administration has complete control over how their "location" is configured within the app, allowing them to define custom violations, products, shifts, report compilation settings, etc.

All the restaurant has to do is integrate "finding checks" into their shift, and report the findings through the automatically generated form for their "location."

## Tech Stack

### 2.0

Label Guard versions 2.0+ use this tech stack:

- Node.js
- Express.js
- Next.js
- React.js
- Fauna DB (FQL v10)
- Bootstrap

This specific tech stack is absolutely incredible because it allows the benefits of Next.js, specifically dynamically rendering content, to be coupled with the versatility of Node + Express as a backend. Fauna DB is an incredible fast, serverless, NoSQL relational database.

Various other libraries are used in the app:

- Stripe
- Zustand (State Management)
- react-hook-form
- cryptojs
- Lodash
- etc.

### Back Story

Versions 1.x were unfortunately lacking in design, such that integrating Stripe subscriptions was unnecessarily complicated. The solution was to rebuild the entire app, nearly from the ground up in a sustainable, scalable way so that the source can easily grow with Label Guard as a commercial application.

## Development

This app is developed with the Agile project methodology, using Trello for project organization.
