# Sales Analysis API Endpoints

### 1. `/api/sales/totalRevenue`
Returns total revenue from completed orders within a specified date range. If date range is not provided then provide the analysis for today.

```
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

### 2. `/api/sales/topMenuItems`
Returns the top-selling menu items ordered by quantity within a specified date range. If date range is not provided then provide the analysis for today.
```
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

### 3. `/api/sales/revenueByCategory`
Provides revenue generated per category within a specified date range. If data range is not provided then provide the analysis for today.
```
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

### 4. `/api/sales/averageOrderValue`
Calculates average value per completed order within a specified date range. If data range is not provided then provide the analysis for today.

### 5. `/api/sales/dailyTrend`
Provides daily revenue totals within a specified date range. If data range is not provided then provide the analysis for today.

### 6. `/api/sales/dinevstake`
Provides daily revenue of dine and take out orders within a specified date range. If the data range is not provided then provide the analysis for today

### 7 `/api/sales/weeklySales`
Provides daily revenue for the sales of current week.

