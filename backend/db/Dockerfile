# Use the official PostgreSQL image as the base
FROM postgres:latest

# Define build-time arguments to customize the database
ARG DB_USER=restro_usr
ARG DB_PASSWORD=cs4350
ARG DB_NAME=restro_sync
ARG INIT_SCRIPT=init.sql

# Set environment variables for runtime (used by postgres image)
ENV POSTGRES_USER=$DB_USER
ENV POSTGRES_PASSWORD=$DB_PASSWORD
ENV POSTGRES_DB=$DB_NAME

# Copy the initialization script (path will be passed via ARG)
COPY $INIT_SCRIPT /docker-entrypoint-initdb.d/init.sql
