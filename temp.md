# Sales Analysis API Endpoints

### 1. `/api/sales/totalRevenue`

**Description:** Retrieves the total revenue and order details for a specified date range. If no date range is provided, it defaults to today's data.

**Response:**

* Provides a breakdown of revenue and order counts categorized by `order_status` (e.g., "Active", "Completed").
* Includes overall totals for orders and revenue within the specified date range.
* Returns the `startDate` and `endDate` used for the query.

**Example Response:**

```json
{
    "startDate": "2025-03-20",
    "endDate": "2025-03-20",
    "revenueDetails": {
        "byStatus": [
            {
                "order_status": "Active",
                "total_orders": "4",
                "total_revenue": 112.9
            },
            {
                "order_status": "Completed",
                "total_orders": "3",
                "total_revenue": 57.44
            }
        ],
        "total": {
            "total_orders": "7",
            "total_revenue": 170.34
        }
    }
}
```

### 2. /api/sales/topMenuItems
Description: Returns a list of the top-selling menu items, ranked by the quantity sold, within a specified date range. If no date range is provided, it defaults to today's data.

Response:

Lists item_id, item_name, and quantity_sold for each top-selling item.
Items are ordered by quantity_sold in descending order.
Returns the startDate and endDate used for the query.
Example Response:
```json
{
    "startDate": "2025-03-20",
    "endDate": "2025-03-20",
    "items": [
        {
            "item_id": 3,
            "item_name": "Cheesecake",
            "quantity_sold": "3"
        },
        {
            "item_id": 1,
            "item_name": "Margherita Pizza",
            "quantity_sold": "2"
        },
        {
            "item_id": 2,
            "item_name": "Vegan Buddha Bowl",
            "quantity_sold": "1"
        }
    ]
}
```

### 3. /api/sales/revenueByCategory
Description: Provides a breakdown of revenue generated for each menu item category within a specified date range. If no date range is provided, it defaults to today's data.

Response:

Lists each category and its total revenue.
Includes a detailed itemssold array for each category, showing the itemName, itemPrice, and quantitySold for each item contributing to the category's revenue.
Returns the startDate and endDate used for the query.
Example Response:

```json
{
    "startDate": "2025-03-20",
    "endDate": "2025-03-20",
    "categories": [
        {
            "category": "Dessert",
            "revenue": 19.47,
            "itemssold": [
                {
                    "itemName": "Cheesecake",
                    "itemPrice": 6.49,
                    "quantitySold": 1
                },
                {
                    "itemName": "Cheesecake",
                    "itemPrice": 6.49,
                    "quantitySold": 1
                },
                {
                    "itemName": "Cheesecake",
                    "itemPrice": 6.49,
                    "quantitySold": 1
                }
            ]
        },
        {
            "category": "Main Course",
            "revenue": 37.97,
            "itemssold": [
                {
                    "itemName": "Vegan Buddha Bowl",
                    "itemPrice": 11.99,
                    "quantitySold": 1
                },
                {
                    "itemName": "Margherita Pizza",
                    "itemPrice": 12.99,
                    "quantitySold": 1
                },
                {
                    "itemName": "Margherita Pizza",
                    "itemPrice": 12.99,
                    "quantitySold": 1
                }
            ]
        }
    ]
}
```

### 4. /api/sales/weeklySales
Description: Returns the daily revenue for the current week, along with the total revenue for the week.

Response:

Provides an array of dailySales, each containing the day_name, date, and daily_revenue.
Includes weeklyTotal representing the sum of daily_revenue for the week.
The date range is automatically the current week.
Example Response:

```json
{
    "weeklySalesData": {
        "dailySales": [
            {
                "day_name": "Monday",
                "date": "2025-03-17",
                "daily_revenue": 155
            },
            {
                "day_name": "Tuesday",
                "date": "2025-03-18",
                "daily_revenue": 125
            },
            {
                "day_name": "Wednesday",
                "date": "2025-03-19",
                "daily_revenue": 180
            },
            {
                "day_name": "Thursday",
                "date": "2025-03-20",
                "daily_revenue": 57.44
            }
        ],
        "weeklyTotal": 517.44
    }
}
```


### 5. /api/sales/dinevstake
Description: Provides a breakdown of revenue and order counts for "Dine-In" and "Take-Out" order types within a specified date range. If no date range is provided, it defaults to today's data.

Response:

Provides a breakdown of revenue and order counts categorized by order_type ("Dine-In", "Take-Out").
Includes overall totals for orders and revenue within the specified date range.
Returns the startDate and endDate used for the query.
Example Response:

```json
{
    "startDate": "2025-03-20",
    "endDate": "2025-03-20",
    "dineVsTakeDetails": {
        "byOrderType": [
            {
                "order_type": "Dine-In",
                "total_orders": "2",
                "total_revenue": 38.96
            },
            {
                "order_type": "Take-Out",
                "total_orders": "1",
                "total_revenue": 18.48
            }
        ],
        "overallTotal": {
            "total_orders": "3",
            "total_revenue": 57.44
        }
    }
}
```

