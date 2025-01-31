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

# User Stories

## Feature - 1 - User Account Management Feature

### Title - 1a - User Sign Up

**Description**:

As a restaurant owner, I want to register for an account so that I can integrate the management features available to make my restaurant run efficiently.

* Priority: High
* Time: 1 day

**Acceptance Criteria**:

**Scenario**: Successful Account Registration

Given I am a new restaurant owner
And I am on the registration page
When I fill in my restaurant name, email, password, and other required details
And I click the "Register" button
Then the system should create my account
And I should receive a confirmation email

### Title - 1b - User Login

**Description**:

As a registered user, I want to login to the application and use it to manage customer reservation and process their orders

* Priority: High
* Time: 1 day

**Acceptance Criteria**:

**Scenario**:  Successful Login

Given I am a registered user
And I am on the login page
When I enter my email and password correctly
And I click the "Login" button
Then the system should authenticate my credentials
And I should be redirected to the dashboard

### Title - 1c - User Logout

**Description**:

As a logged-in user, I want to logout of my account so that my account remains secured on public devices.

* Priority: Low
* Time: 1 day

**Acceptance Criteria**:

**Scenario**: Successful Logout

Given I am a logged-in user
And I am on any page within the application
When I click the "Logout" button
Then the system should log me out
And I should be redirected to the login page

### Title - 1d - Adding new user

**Description**:

As a restaurant owner or manager, I want to register my restaurant staff to application so that they can access the features and make restaurant run efficiently.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful Staff Registration

Given I am a restaurant owner or manager
And I am on the Staff Management page
When I enter the staff member’s details (name, email, role)
And I click the "Register" button
Then the system should create a staff account
And the staff member should receive an email with login credentials

### Title - 1e - User Role Management

**Description**:

As a restaurant owner, I want to modify the roles of my restaurant staff so that I can efficiently manage my employees.

* Priority: High
* Time: 1 day

**Acceptance Criteria**:

**Scenario**: Successfully Modify a Staff Member’s Role

Given I am a restaurant owner
And I am on the Staff Management page
When I select a staff member and change their role (e.g., from Employee to Manager)
And I click the "Save Changes" button
Then the system should update their role
And the staff member should receive a notification about their updated permissions

### Title - 1f - Removing user from the application

**Description**:

As a restaurant owner, I want to remove staff from the application, so that my restaurant's data is secure and not accessed by an unauthorized user.

* Priority: High
* Time: 1 day

**Acceptance Criteria**:

**Scenario**: Successfully Remove a Staff Member

Given I am a restaurant owner
And I am on the Staff Management page
When I select a staff member and click the "Remove" button
Then the system should revoke their access to the application
And the staff member should no longer be able to log in


## Feature - 3 - Menu management

### Title - 3a - Add or remove menu items

**Description**:

As a store manager, I want to add or remove menu items so that I can keep the menu updated.

* Priority: High
* Time: 2 days
  
**Acceptance Criteria**

**Scenario**: Dish is added/removed from the menu

Given I am a manager looking at the menu,
When I add a new dish to the menu and click "Update"
The system should show the new dish in the menu and send me a confirmation email.
When I remove a dish and click "Update"
The dish should no longer show up on the menu and the system should send me a confirmation email.  

### Title - 3b - Modify existing menu items 

**Description**:

As a store manager, I want to modify menu items so that I can adjust prices or descriptions.

* Priority: High
* Time: 2 days

**Acceptance Criteria**

**Scenario**: Details are updated on the menu
Given I am a manager making changes to a menu item,
When I change the price or description of the item and click "Save Changes"
The price and description of the item should be updated and the system sends a confirmation email to me. 

### Title - 3c - View the menu for order accuracy

**Description**:

As a store employee, I want to view the menu so that I can provide accurate information to customers.

* Priority: High
* Time: 2 days

**Acceptance Criteria**

**Scenario**: Menu is visible and up to date
Given I am a waiter or front desk employee, I should be able to view the menu for the restaurant with the latest changes. If there is an update pending, An alert should show up.

### Title - 3d - Browse the menu online

**Description**:

As a customer, I want to browse the menu online so that I can see available dishes and prices before ordering.

* Priority: High
* Time: 1 day

**Acceptance Criteria**

**Scenario**: Menu is visible and up to date
Given I am a customer at a restaurant, I should be able to view the menu for the restaurant. 

# Technologies

## Block Diagram

![Block Diagram](https://github.com/hetu2344/comp4350-g07/blob/main/Architecture_Diagram_v1.jpeg)

## Tech Stack
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
