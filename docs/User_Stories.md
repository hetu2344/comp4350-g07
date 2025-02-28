# User Stories

## Feature 1 - User Account Management Feature

### 1a - User Sign Up

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

---

### 1b - User Login

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

---

### 1c - User Logout

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

---

### 1d - Adding new user

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

---

### 1e - User Role Management

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

---

### 1f - Removing user from the application

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


## Feature 2 - Table Management Feature

### 2a - Book a table online

**Description**:

As a customer, I want to book a table online so that I can secure my reservation in advance.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful Table Reservation

Given I am a logged in customer 
And I am on the Reserve a Table page
When I enter my reservation time and party size 
And click the reserve button 
Then my table will be reserved for when I arrive with my party at the specified time.

---

### 2b - Cancel a reservation

**Description**:

As a customer, I want to cancel my reservation so that I can free up the table if my plans change.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful Reservation Cancellation

Given that I am a logged in customer 
And I am on the My Reservations Page 
When I choose a listed reservation 
And click the cancel button 
Then my reservation will be canceled and the table will be freed in the restaurant for that time.

---

### 2c - Add reservations for customers

**Description**:

As a restaurant employee, I want to add bookings so that I can manage customer reservations.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful Table Reservation on Behalf of a Customer
 
Given that I am a logged in employee 
And I am on the Reservations page
When I click the Add Reservation button 
And add the customer name, party size, and time
And click the reserve button
Then a table that fits the party will be reserved for the specified time 
And the reservation will be added to the reservations list.

---

### 2d - View available tables in real time

**Description**:

As a store employee, I want to view available tables so that I can seat customers efficiently.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful View of Available Tables

Given that I am a logged in employee 
And I am on the Table Management page 
When I am viewing the tables
Then I am able to determine which ones are open, taken, or reserved.

---

### 2e - Remove Bookings of customer

**Description**:

As a restaurant employee, I want to remove bookings so that I can manage customer reservations.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful Reservation Cancellation as an Employee

Given that I am a logged in employee 
And I am on the Reservations page
When I select a listed reservation 
And click the remove button
Then the reservation will be canceled 
And the table will be freed in the restaurant for that time 
And the reservation will be removed from the list.

---

### 2f - Change Status of Table to Taken

**Description**:

As a store employee, I want to be able to mark that a table has been taken.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful change of table status to taken


Given that I am a logged in employee 
And I am on the Table Management page
When I select an open table 
And click Mark as sat 
Then the table will appear as taken on the Table Management page

---

### 2g - Change Statues of Table to Open

**Description**:

As a store employee, I want to be able to mark that a table has been taken.

* Priority: High
* Time: 2 days

**Acceptance Criteria**:

**Scenario**: Successful change of table status to open

Given that I am a logged in employee 
And I am on the Table Management page
When I select a taken table 
And click Mark as open
Then the table will appear as open on the Table Management page 

## Feature 3 - Menu management

### 3a - Add or remove menu items

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

---

### 3b - Modify existing menu items 

**Description**:

As a store manager, I want to modify menu items so that I can adjust prices or descriptions.

* Priority: High
* Time: 2 days

**Acceptance Criteria**

**Scenario**: Details are updated on the menu
Given I am a manager making changes to a menu item,
When I change the price or description of the item and click "Save Changes"
The price and description of the item should be updated and the system sends a confirmation email to me. 

---

### 3c - View the menu for order accuracy

**Description**:

As a store employee, I want to view the menu so that I can provide accurate information to customers.

* Priority: High
* Time: 2 days

**Acceptance Criteria**

**Scenario**: Menu is visible and up to date
Given I am a waiter or front desk employee, I should be able to view the menu for the restaurant with the latest changes. If there is an update pending, An alert should show up.

---

### 3d - Browse the menu online

**Description**:

As a customer, I want to browse the menu online so that I can see available dishes and prices before ordering.

* Priority: High
* Time: 1 day

**Acceptance Criteria**

**Scenario**: Menu is visible and up to date
Given I am a customer at a restaurant, I should be able to view the menu for the restaurant. 

## Feature 4 - Order Management

### 4a - Take and record customer orders 

**Description**:

As a store employee, I want to take orders from customers so that their requests are recorded properly.

* Priority: High
* Time: 1 Day

**Acceptance Criteria**:

**Scenario**: Successfully Take an In-Person Order

Given I am a logged-in store employee
And I am on the Order Management page
When I select "New Order" and input the customer’s order details
And I click the "Submit" button
Then the system should store the order
And mark it as "In Progress"

---

### 4b - Update the Status of an Order

**Description**:

As an employee, I want to be able to change the status of an order so that it can be properly tracked.

* Priority: Medium
* Time: 1 Day

**Acceptance Criteria**:

**Scenario**: Successfully Update Order Status

Given I am a logged-in store employee
And I am on the Order Management page
When I select an order and change its status
Then the system should update the order status
And reflect the change in real-time

---

### 4c - Viewing Orders

**Description**:

As an employee, I want to be able to view current orders so that I can track their progress.

* Priority: High
* Time: 2 Days

**Acceptance Criteria**:

**Scenario**: View Order Details

Given I am viewing the list of current orders
When I click on an order
Then I should see order details, including items, quantities, special requests, table number, and order time

---

### 4d - Modifying Orders in Progress

**Description**:

As an employee, I want to be able to modify orders that are in progress so that I can add important information or add items.

* Priority: High
* Time: 2 Days

**Acceptance Criteria**:

**Scenario**: Add Items to an Order in Progress

Given I am editing an order that is in progress
When I add additional menu items to the order
And I click "Save Changes"
Then the new items should be added to the order
And the updated order should be reflected in real-time

## Feature - 5 - Sales Analysis

### Feature - 5a - Viewing Sales by Item

**Description**:

As a restaurant owner, I want to be able to see sales information over time for every item on the menu.

* Priority: Medium
* Time: 2 Days

**Acceptance Criteria**:

**Scenario**: View sales information by item

Given that I am logged in as a restaurant owner and I am on the sales dashboard 
or sales report page, when I select an item from the menu, then I should be able 
to see the total sales for that item, including both the quantity sold and the 
total revenue generated.

---

### Feature - 5b - Item Ranking by Sales

**Description**:

As a restaurant owner, I want to be able to view a ranking of all menu items based on sales, over a specified period of time.

* Priority: Low 
* Time: 2 Days

**Acceptance Criteria**:

**Scenario**: View Menu Item Ranking by Sales

Given that I am logged in as a restaurant owner and I am on the sales dashboard 
or item rankings page, when I select a time period (such as daily, weekly, monthly, 
or yearly), then I should be able to see a ranked list of all menu items based on total 
sales (either by revenue or quantity sold) for that period, with the top-selling items
appearing at the top of the list

---

### Feature - 5c - Viewing Gross Sales

**Description**:

As a restaurant owner, I want to be able to view the gross sales of the restaurant, by day, week, month, and year.

* Priority: Medium
* Time: 2 Days

**Acceptance Criteria**: 

**Scenario**: View Gross Sales by Time Period 

Given that I am logged in as a restaurant owner and I am on the sales dashboard or sales report page, when I select a time period (such as day, week, month, or year), then I should be able to see the total gross sales for the restaurant within that selected time period, including both the total revenue and the number of transactions.