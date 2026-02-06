# Logic Wave Real Estate API - Postman Collection

This folder contains Postman collection and environment files for testing the Logic Wave Real Estate API.

## Files

- **Logic-Wave-API.postman_collection.json** - Complete API collection with all endpoints
- **Logic-Wave-API.postman_environment.json** - Environment variables for the API

## Setup Instructions

### 1. Import Collection

1. Open Postman
2. Click on **Import** button (top left)
3. Select the **Logic-Wave-API.postman_collection.json** file
4. Click **Import**

### 2. Import Environment

1. Click on **Import** button again
2. Select the **Logic-Wave-API.postman_environment.json** file
3. Click **Import**
4. Select the **Logic Wave Environment** from the environment dropdown (top right)

### 3. Configure Environment Variables

The environment includes two variables:

- **BASE_URL**: Default is `http://localhost:5000` (change if your server runs on a different port)
- **TOKEN**: Will be automatically set when you login

### 4. Start Testing

#### First Time Setup

1. Make sure your server is running:
   ```bash
   cd server
   npm start
   ```

2. **Register a new user**:
   - Open `Auth` → `Register User`
   - Click **Send**
   - Note the token in response

3. **Login**:
   - Open `Auth` → `Login User`
   - Update email/password in the request body
   - Click **Send**
   - The TOKEN variable will be automatically set in your environment

4. Now you can access all authenticated endpoints!

## API Endpoints Overview

### Auth (`/api/auth`)
- ✅ POST `/register` - Register new user
- ✅ POST `/login` - Login user (auto-saves token)
- ✅ GET `/me` - Get current user (requires auth)
- ✅ PUT `/updateprofile` - Update user profile
- ✅ PUT `/updatepassword` - Update password
- ✅ POST `/forgotpassword` - Request password reset
- ✅ PUT `/resetpassword/:resettoken` - Reset password
- ✅ PUT `/favorites/:propertyId` - Toggle favorite property
- 🔐 GET `/users` - Get all users (admin only)
- 🔐 PUT `/users/:id/role` - Update user role (admin only)
- 🔐 DELETE `/users/:id` - Delete user (admin only)

### Properties (`/api/properties`)
- ✅ GET `/` - Get all properties (with filters)
- ✅ GET `/featured` - Get featured properties
- ✅ GET `/stats/cities` - Get property count by city
- ✅ GET `/slug/:slug` - Get property by slug
- ✅ GET `/:id` - Get property by ID
- ✅ GET `/:id/similar` - Get similar properties
- 🔒 GET `/user/my` - Get my properties
- 🔒 POST `/` - Create property (seller/admin)
- 🔒 PUT `/:id` - Update property
- 🔒 DELETE `/:id` - Delete property
- 🔐 PUT `/:id/verify` - Verify property (admin only)
- 🔐 PUT `/:id/feature` - Feature property (admin only)
- 🔐 GET `/stats/admin` - Get admin stats (admin only)

### Inquiries (`/api/inquiries`)
- 🔒 POST `/` - Create inquiry
- 🔒 GET `/received` - Get received inquiries
- 🔒 GET `/sent` - Get sent inquiries
- 🔒 GET `/stats` - Get inquiry stats
- 🔒 GET `/:id` - Get inquiry by ID
- 🔒 POST `/:id/respond` - Respond to inquiry
- 🔒 PUT `/:id/status` - Update inquiry status
- 🔒 DELETE `/:id` - Delete inquiry

### Reviews (`/api/reviews`)
- ✅ GET `/property/:propertyId` - Get property reviews
- 🔒 POST `/` - Create review
- 🔒 GET `/my` - Get my reviews
- 🔒 PUT `/:id` - Update review
- 🔒 DELETE `/:id` - Delete review
- 🔒 PUT `/:id/vote` - Vote on review
- 🔒 POST `/:id/respond` - Respond to review
- 🔐 GET `/pending` - Get pending reviews (admin only)
- 🔐 PUT `/:id/moderate` - Moderate review (admin only)

### Alerts (`/api/alerts`)
- 🔒 POST `/` - Create alert
- 🔒 GET `/` - Get my alerts
- 🔒 GET `/:id` - Get alert by ID
- 🔒 PUT `/:id` - Update alert
- 🔒 DELETE `/:id` - Delete alert
- 🔒 PUT `/:id/toggle` - Toggle alert status
- 🔒 GET `/:id/matches` - Get matching properties

### Projects (`/api/projects`)
- ✅ GET `/` - Get all projects
- ✅ GET `/:id` - Get project by ID

## Legend

- ✅ Public endpoint (no authentication required)
- 🔒 Protected endpoint (requires authentication)
- 🔐 Admin-only endpoint (requires admin role)

## Common Request Examples

### Get Properties with Filters

```
GET /api/properties?propertyType=apartment&listingType=buy&city=Mumbai&minPrice=5000000&maxPrice=20000000&bedrooms=3
```

### Create Property

```json
POST /api/properties
{
  "title": "Luxury 3BHK Apartment",
  "description": "Beautiful apartment with sea view",
  "propertyType": "apartment",
  "listingType": "buy",
  "price": 15000000,
  "location": {
    "address": "123 Marine Drive",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "specifications": {
    "bedrooms": 3,
    "bathrooms": 2,
    "carpetArea": 1200
  },
  "amenities": ["swimming-pool", "gym", "parking"]
}
```

## Notes

- The **Login User** request has a test script that automatically saves the token to the environment
- All authenticated requests use `Bearer {{TOKEN}}` authentication
- Query parameters in GET requests can be enabled/disabled as needed
- Replace `:id`, `:propertyId`, etc. with actual IDs when testing

## Troubleshooting

1. **401 Unauthorized**: Make sure you're logged in and the TOKEN is set
2. **404 Not Found**: Check if the server is running and BASE_URL is correct
3. **500 Server Error**: Check server logs for detailed error messages

## Support

For issues or questions, check the main project README or server logs.
