# API Reference

The `bakery-admin` application is a consumer frontend and does not serve its own APIs. 

It heavily relies on the following backend microservices to function:
* **[Auth Service](https://github.com/amankrmj09/bakery_auth_service/blob/main/API_REFERENCE.md)** (for admin authentication & JWT token management)
* **[Product Service](https://github.com/amankrmj09/bakery_product_service/blob/main/API_REFERENCE.md)** (for managing storefront, categories, and products)
* **[Order Service](https://github.com/amankrmj09/bakery_order_service/blob/main/API_REFERENCE.md)** (for viewing and managing customer orders)
* **[Engagement Service](https://github.com/amankrmj09/bakery_engagement_service/blob/main/API_REFERENCE.md)** (for managing coupons, discounts, and reviews)

Please refer to their respective repositories for detailed endpoint specifications.
