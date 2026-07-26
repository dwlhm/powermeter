# Use official Python 3.12 slim image (stable and lightweight)
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
RUN pip install uv

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies using uv globally in the container
RUN uv pip install --system -r requirements.txt

# Copy the rest of the application
COPY . .

# Copy and setup entrypoints
COPY entrypoint.sh .
COPY entrypoint.reader.sh .
RUN chmod +x entrypoint.sh entrypoint.reader.sh

# Expose the FastAPI port
EXPOSE 8000

# Run entrypoint script
CMD ["sh", "./entrypoint.sh"]
