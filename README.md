# Project Summary
RestroSync is a restaurant management system designed to
streamline daily operations, enhance customer experience, and
optimize business performance. By integrating table
management, order processing, menu control, and sales
analytics, RestroSync helps restaurants operate more efficiently
while providing valuable insights for data-driven decision-
making.

# Vision Statement

RestroSync is designed to streamline restaurant operations, enhance customer experiences, and optimize business performance through a centralized and intuitive platform. With RestroSync, restaurant owners, managers, and employees can efficiently handle daily tasks such as table reservations, order management, sales tracking, and menu updates.

The primary users of RestroSync are restaurant businesses seeking to improve efficiency and decision-making. Through its role-based access system, restaurant owners can manage staff permissions, analyze sales data, and make informed business decisions. Managers can optimize menu offerings, oversee reservations, and track restaurant performance. Employees can efficiently take and manage orders, reducing errors and improving customer service.

Customers also benefit from RestroSync's user-friendly booking and ordering system. The integrated table management feature allows customers to make reservations, view availability, and cancel bookings if needed. Additionally, online menu browsing ensures a seamless dining experience by allowing customers to explore dishes before visiting the restaurant.

RestroSync offers a significant improvement over traditional restaurant management methods, which often involve juggling multiple software solutions or manual tracking. By consolidating key restaurant operations into a single platform—reservation management, menu control, order processing, and sales analytics—RestroSync enhances efficiency, reduces operational costs, and improves overall restaurant performance.

The project will be considered successful if restaurant staff and customers prefer using RestroSync over their current management methods. This will be measured through:

The success of RestroSync will be measured by user adoption and satisfaction. The project will be considered successful if restaurant employees report improved efficiency and ease of management, as determined by a survey achieving a satisfaction score of 85% or higher. Additionally, reducing order processing time and reservation conflicts by 30% or more compared to previous manual methods.

# Core Features

## User Account Management

The user account feature ensures a secure and role-based access system for restaurant staff. Each user (owner, manager, employee) has different permissions based on their role. Managers can track sales and menu changes, while employees see only relevant tools for their job.

## Table Management
The table management feature allows customers to book or cancel reservations, and restaurant staff to modify them as needed. Staff can also view available tables in real time to manage seating effectively.

## Order Management

The Order Management feature allows servers to input and manage orders with accuracy. They can update order statuses, marking them as "In Progress," "Completed," for smooth tracking. This feature provides a structured system for handling orders efficiently, reducing errors and improving overall service management.

## Sales Analysis

The Sales Analysis feature provides real-time insights into daily revenue, allowing restaurant owners to monitor sales performance at a glance. It highlights best-selling menu items, enabling decisions to optimize the menu and maximize profitability. Additionally, it tracks customer preferences, helping owners refine their menu offerings.

## Menu Management

The Menu Management feature allows restaurant managers, owners, or head chefs to customize and update the restaurant's menu as needed. Authorized staff members will have view-only access to assist with order-taking, ensuring accuracy and efficiency. Customers can browse the menu online to view available dishes, prices, and descriptions. 

## Non-Functional Feature

The web application can handle 100 concurrent servers, processing up to 1000 orders per minute 

# Technologies

## Block Diagram

![Block Diagram](https://github.com/hetu2344/comp4350-g07/blob/main/Architecture_Diagram_v1.jpeg)

## Tach Stack
This project follows a three-tier architecture, consisting of a Client Tier (View), Business Logic Tier (Controller), and Database Tier (Model). The frontend is built using ReactJS with HTML, CSS, and JavaScript, ensuring a responsive and interactive user experience. The backend is powered by Node.js and Express.js, serving as the application server to handle HTTP requests and process business logic. Data is stored and managed in a PostgreSQL database, which efficiently handles relational data storage.

To ensure seamless deployment and scalability, Docker is used to containerize the entire application, facilitating Continuous Deployment (CD). The project incorporates CI/CD pipelines, leveraging either Jenkins or GitHub Actions to automate builds, testing, and deployments. API testing is streamlined using Postman, allowing for thorough validation of backend services. Performance and load testing are handled using Apache JMeter, ensuring the system can withstand high traffic and maintain optimal performance.

This tech stack ensures a scalable, efficient, and well-tested solution for building robust web applications.

# Group Members

|Name|email|
|----|-----|
|Het Patel| patelh29@myumanitoba.ca|
|Divy Patel| patelda2@myumanitoba.ca|
|Aswin Manoj| manoja@myumanitoba.ca|
|Rishamdeep Singh| singhr50@myumanitoba.ca|
|Seyi Asoga| asogao@myumanitoba.ca|
|Aidan Labossiere|laboss42@myumanitoba.ca|

# TA

|Name|email|
|----|----|
|Xu Yang|yangx4@myumanitoba.ca|
