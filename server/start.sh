#!/bin/bash

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the server
echo "Starting the server..."
npm start 