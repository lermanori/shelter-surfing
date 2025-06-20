# 🏗️ Shelter Surfing – Architecture Document

## Project Summary

Shelter Surfing is a web app that connects individuals offering temporary shelter with people seeking a place to stay. It includes onboarding, matching logic, messaging, and moderation tools.

## 1. Tech Stack Overview

Frontend (React):

- React (Vite or CRA)

- Tailwind CSS or Material UI

- React Context or Redux

- React Router

- React Hook Form / Formik



Backend (Express):

- Express.js

- PostgreSQL (via Prisma or Sequelize)

- JWT Auth (Passport.js optional)

- Email: Resend / Nodemailer

- Cloud: Supabase or Firebase

## 2. API & Routes (Express Backend)

Base URL: /api



Auth Routes:

- POST /auth/register – Register a new user

- POST /auth/login – Login

- GET /auth/me – Get current user profile



User Routes:

- GET /users – List users

- GET /users/:id – Get by ID

- PUT /users/:id – Update user

- DELETE /users/:id – Delete (admin only)



Shelter Listings:

- POST /shelters – Create shelter offer

- GET /shelters – List shelters

- GET /shelters/:id – View shelter

- PUT /shelters/:id – Update

- DELETE /shelters/:id – Delete



Requests / Matches:

- POST /requests – Submit request

- GET /requests – List requests

- GET /matches – View matches



Messages (Optional):

- POST /messages – Send message

- GET /messages/:conversationId – Get thread

## 3. Frontend UI Components (React)

Pages:

- Home, Register/Login

- Dashboard (for Host/Seeker)

- Shelter Form / Request Form

- Matches Page, Inbox, Admin Panel



Key Components:

- Navbar, Footer, AuthForm

- ShelterCard, RequestCard

- ProfilePage, MatchList

- ChatBox (optional)

## 4. Matching Logic

Matching criteria:

- Location proximity

- Dates, capacity, tags



Pseudocode:

function matchUserToShelters(userRequest, allShelters) {

  return allShelters.filter(shelter =>

    shelter.location === userRequest.location &&

    shelter.availableFrom <= userRequest.date &&

    shelter.capacity >= userRequest.numberOfPeople

  );

}

## 5. File Structure

Frontend (/client):

- public/

- src/components, pages, services, context

- App.jsx, main.jsx



Backend (/server):

- controllers, routes, models, middlewares, utils

- index.js, prisma/

## 6. Authentication Flow

- JWT stored in HTTP-only cookie or localStorage

- verifyToken middleware

- Role-based access: host, seeker, admin

## 7. Database Schema (Basic)

User:

- id, name, email, password, role

- locationInput, latitude, longitude



Shelter:

- id, hostId, location, availableFrom, capacity

- latitude, longitude, tags, description



Request:

- id, seekerId, location, date, numberOfPeople, status

## 8. MVP Feature List

- Register/Login

- Offer/request shelter

- Matching logic

- Browse/match UI

- Messaging (Phase 2)

- Admin moderation (Phase 2)

## 9. Deployment Suggestions

- Frontend: Vercel / Netlify

- Backend: Railway / Fly.io

- DB: Supabase or Railway (Postgres)

- Storage: Supabase Storage or Firebase

## 📍 Location Matching Without Live Tracking

How It Works:

- Users manually enter location

- Location is geocoded once (lat/lng)

- Matching is based on distance (Haversine)



Fields Added:

User/Shelter/Request:

- locationInput: String

- latitude: Float

- longitude: Float



Haversine Distance Formula (km):

function haversineDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = deg2rad(lat2 - lat1);

  const dLon = deg2rad(lon2 - lon1);

  const a = Math.sin(dLat/2)**2 +

            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *

            Math.sin(dLon/2)**2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;

}



Frontend:

- Location input with autocomplete (Mapbox, Google Places)

- No continuous tracking needed

- Approximate locations for privacy

