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
```
{
    "startDate": "2025-03-20",
    "endDate": "2025-03-20",
    "averageOrderValue": 19.14666666666667
}
```

### 5. `/api/sales/dailyTrend`
Provides daily revenue totals within a specified date range. If data range is not provided then provide the analysis for today.

### 6. `/api/sales/dinevstake`
Provides daily revenue of dine and take out orders within a specified date range. If the data range is not provided then provide the analysis for today
```
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

### 7 `/api/sales/weeklySales`
Provides daily revenue for the sales of current week.
```
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

