# Use the official Python 3.12 slim image as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for psycopg
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install FastAPI and psycopg
RUN pip install --no-cache-dir fastapi uvicorn psycopg2

# Install any needed packages specified in requirements.txt
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

# Make port 8000 available to the world outside this container
EXPOSE 8000
