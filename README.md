## My Block — Volunteer Matching Platform

A community-driven application designed to bridge the gap between local non-profit organizations and volunteers. The platform features two dedicated portals: one for Organizations to create and manage volunteer events, and another for Volunteers to discover and get matched with nearby opportunities based on location, availability, and interests.

Live Application: https://myblock-la1v.onrender.com

## Features

## Organization Portal

**Event Management:** Create, edit, and publish volunteer events with customizable date, time, location, and required skill sets.

**Volunteer Rostering:** View signed-up volunteers for each event, track attendance, and manage capacity limits.

**Organization Profile:** Showcase mission statements, contact details, and past impact.

**Analytics & Dashboard:** Track total volunteer hours generated and event engagement stats.

## Volunteer Portal

**Smart Location Matching:** Find volunteer opportunities locally using geolocation matching and radius filters.

**Personalized Recommendations:** Get event suggestions aligned with personal interests, skills, and availability.

**One-Click Sign Up:** Easily RSVP to events and add shifts directly to personal calendars.

**Volunteer History:** Track completed volunteer hours, upcoming commitments, and badge achievements.

## Tech Stack

Frontend: EJS (Embedded JavaScript Templates), Tailwind CSS, Custom CSS, JavaScript (ES6+)

Backend: Node.js, Express.js

Hosting: Render (https://myblock-la1v.onrender.com)

## Getting Started

Prerequisites

Ensure you have the following installed on your local machine:

Node.js (v16.0 or higher)

npm (Node Package Manager)

Installation & Local Setup

Clone the repository:

` git clone https://github.com/your-username/my-block.git`

`cd my-block`



## Install dependencies:

`npm install`



Set up Environment Variables:
Create a .env file in the root directory and add your required configuration variables:

`PORT=3000`

`SESSION_SECRET=your_secret_key`
# Add your database URI or geolocation API keys here

Build Tailwind CSS (if applicable):

`npm run build:css`



## Start the Application:

`npm start`



The app should now be running at http://localhost:3000.
