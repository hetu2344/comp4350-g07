# Technologies

## Block Diagram

![Block Diagram](https://github.com/hetu2344/comp4350-g07/blob/main/Architecture_Diagram_v1.jpeg)

## Tech Stack
This project follows a three-tier architecture, consisting of a Client Tier (View), Business Logic Tier (Controller), and Database Tier (Model). The frontend is built using ReactJS with HTML, CSS, and JavaScript, ensuring a responsive and interactive user experience. The backend is powered by Node.js and Express.js, serving as the application server to handle HTTP requests and process business logic. Data is stored and managed in a PostgreSQL database, which efficiently handles relational data storage.

To ensure seamless deployment and scalability, Docker is used to containerize the entire application, facilitating Continuous Deployment (CD). The project incorporates CI/CD pipelines, leveraging either Jenkins or GitHub Actions to automate builds, testing, and deployments. API testing is streamlined using Postman, allowing for thorough validation of backend services. Performance and load testing are handled using Apache JMeter, ensuring the system can withstand high traffic and maintain optimal performance.

This tech stack ensures a scalable, efficient, and well-tested solution for building robust web applications.