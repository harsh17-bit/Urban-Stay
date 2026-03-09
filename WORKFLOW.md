# Logic-Wave Real Estate Platform — Complete Workflow & File Structure

---

## 1. PROJECT STRUCTURE OVERVIEW

```
Logic-Wave-Project/
├── api/                          ← Frontend (React + Vite)
│   └── src/
│       ├── main.jsx              ← Entry point — mounts <App /> into DOM
│       ├── App.jsx               ← Root component — BrowserRouter, AuthProvider, all Routes
│       ├── index.css             ← Global base styles
│       ├── assets/               ← Static images/icons
│       │
│       ├── context/
│       │   └── authcontext.jsx   ← Global auth state (user, token, login, logout, register)
│       │
│       ├── services/             ← All API call functions (axios)
│       │   ├── api.js            ← Axios instance — base URL + JWT interceptor + 401 handler
│       │   ├── authservice.js    ← login, register, getMe, forgotPassword, resetPassword
│       │   ├── propertyservice.js← getProperties, getFeatured, getProperty, createProperty...
│       │   ├── dataservice.js    ← Generic data fetching helpers
│       │   ├── projectservice.js ← getProjects, getProjectById
│       │   └── weatherservice.js ← Weather API for property location
│       │
│       ├── components/           ← Reusable UI pieces
│       │   ├── Header.jsx        ← Top nav — logo, search, auth buttons, role-based links
│       │   ├── footer.jsx        ← Bottom links — legal, social, contact
│       │   ├── hero.jsx          ← Homepage hero — main search bar (buy/rent/pg)
│       │   ├── ExploreOptions.jsx← Browse by listing type cards
│       │   ├── TopCities.jsx     ← 6 top cities quick filter
│       │   ├── FeaturedProjects.jsx ← Admin-curated properties (isFeatured=true)
│       │   ├── PopularTools.jsx  ← EMI Calculator, Search shortcuts
│       │   ├── TestimonialsSection.jsx ← User reviews carousel
│       │   ├── PropertyCard.jsx  ← Reusable card shown in grids/lists
│       │   └── CookieConsentBanner.jsx ← GDPR cookie notice
│       │
│       ├── pages/                ← Full page components (each = one route)
│       │   ├── login.jsx         ← /login
│       │   ├── register.jsx      ← /register
│       │   ├── forgotpassword.jsx← /forgot-password
│       │   ├── resetpassword.jsx ← /reset-password
│       │   ├── searchresults.jsx ← /properties  /search
│       │   ├── propertydetails.jsx ← /property/:id
│       │   ├── postproperty.jsx  ← /post-property   [seller/admin only]
│       │   ├── userdashboard.jsx ← /dashboard  (role=user)
│       │   ├── sellerdashboard.jsx ← /dashboard  (role=seller)
│       │   ├── admindashboard.jsx ← /dashboard  (role=admin)
│       │   ├── InquiryDetails.jsx ← /inquiry/:id
│       │   ├── projects.jsx      ← /projects
│       │   ├── EMICalculator.jsx ← /emi-calculator
│       │   ├── AboutUs.jsx       ← /about-us
│       │   ├── faq.jsx           ← /faq
│       │   ├── privacypolicy.jsx ← /privacy-policy
│       │   └── termsofservice.jsx← /terms-of-service
│       │
│       ├── styles/
│       │   └── theme.css         ← CSS variables (colors, spacing, fonts)
│       ├── utils/
│       │   └── imageUtils.js     ← Image URL helpers, fallback handlers
│       └── validators/
│           └── loginschema.js    ← Zod schema for frontend login form validation
│
└── server/                       ← Backend (Node.js + Express + MongoDB)
    ├── server.js                 ← Express app — middleware, routes, health check, port 5000
    ├── seeder.js                 ← Seed dummy data into MongoDB
    │
    ├── config/
    │   └── db.js                 ← MongoDB connection via Mongoose
    │
    ├── middleware/
    │   └── auth.js               ← protect (JWT verify), authorize (role check), optionalAuth
    │
    ├── models/                   ← Mongoose schemas (database shape)
    │   ├── user.js               ← name, email, password(hashed), role, phone, avatar, favorites[]
    │   ├── property.js           ← title, price, type, listingType, location, specs, images, status, isFeatured
    │   ├── inquiry.js            ← property ref, sender, receiver, message, type, status, visitDate
    │   ├── review.js             ← property ref, user, rating, comment
    │   ├── alert.js              ← user saved searches — city, type, priceRange for notifications
    │   └── project.js            ← builder projects — name, developer, city, status, units
    │
    ├── controllers/              ← Business logic for each resource
    │   ├── authcontroller.js     ← register, login, getMe, updateProfile, forgotPassword, resetPassword
    │   ├── propertycontroller.js ← CRUD, search/filter, featured, verify, stats
    │   ├── inquirycontroller.js  ← create, respond, schedule, list by user/seller
    │   ├── reviewcontroller.js   ← create, get by property, delete
    │   ├── alertcontroller.js    ← create, list, delete saved search alerts
    │   └── projectcontroller.js  ← CRUD for builder projects, filter by city/status
    │
    ├── routes/                   ← Express routers — map URL → controller
    │   ├── authroutes.js         ← /api/auth/*
    │   ├── propertyroutes.js     ← /api/properties/*
    │   ├── inquiryroutes.js      ← /api/inquiries/*
    │   ├── reviewroutes.js       ← /api/reviews/*
    │   ├── alertroutes.js        ← /api/alerts/*
    │   └── projectroutes.js      ← /api/projects/*
    │
    ├── utils/
    │   └── email.js              ← Nodemailer — sendWelcomeEmail, sendPasswordResetOtpEmail
    │
    └── uploads/
        └── propertyimages/       ← Multer saves uploaded property images here
```

---

## 2. APPLICATION STARTUP

```
FRONTEND                                    BACKEND
--------                                    -------
npm run dev (Vite)                          npm run dev (nodemon server.js)
      ↓                                           ↓
main.jsx                                    server.js loads
  → <App /> mounted                           → connectDB() — MongoDB connects
  → BrowserRouter wraps app                  → CORS allowed for localhost:5173/5174
  → AuthProvider wraps everything            → Routes mounted:
  → AppContent renders                             /api/auth      → authroutes.js
      → Header (always visible)                    /api/properties→ propertyroutes.js
      → <Routes> (page changes here)               /api/inquiries → inquiryroutes.js
      → Footer (always visible)                    /api/reviews   → reviewroutes.js
      → CookieConsentBanner                        /api/alerts    → alertroutes.js
                                                   /api/projects  → projectroutes.js
                                                   /api/health    → { status: "ok" }
                                              → Listens on PORT 5000
```

---

## 3. AUTH FLOW (FILES INVOLVED)

### 3a. Registration

```
User fills register.jsx form
      ↓
Frontend validates with loginschema.js (Zod)
      ↓
authservice.js → POST /api/auth/register
      ↓
api.js (axios) sends request to http://localhost:5000/api
      ↓
server.js → authroutes.js → authcontroller.js:register()
      ↓
Zod validates: name, email, password (uppercase+lowercase+number+symbol), role
      ↓
User.create() → user.js model → bcrypt hashes password → saved to MongoDB
      ↓
email.js → sendWelcomeEmail() sends email to user
      ↓
generateToken(userId) → JWT signed (7-day expiry)
      ↓
Response: { token, user }
      ↓
authcontext.jsx:register() → setUser(response.user)
      ↓
localStorage.setItem("token") + localStorage.setItem("user")
      ↓
User redirected to /dashboard
```

### 3b. Login

```
User fills login.jsx
      ↓
authservice.js → POST /api/auth/login
      ↓
authcontroller.js:login()
  → Find user by email
  → bcrypt.compare(password, hash)
  → generateToken()
      ↓
Response: { token, user }
      ↓
authcontext.jsx:login()
  → localStorage saves token + user
  → setUser() — all components re-render with auth state
      ↓
Header.jsx shows user name, dashboard link, logout button
```

### 3c. Token Verification on Every Page Load

```
App.jsx mounts → authcontext.jsx useEffect runs
      ↓
Read token + user from localStorage
      ↓
authservice.js → GET /api/auth/me
      ↓
api.js attaches: Authorization: Bearer <token>
      ↓
auth.js middleware: protect()
  → jwt.verify(token, JWT_SECRET)
  → User.findById(decoded.id)
  → req.user = user
      ↓
authcontroller.js:getMe() → returns current user
      ↓
authcontext.jsx → setUser(response.user)  ← session restored
```

### 3d. Forgot Password / OTP Reset

```
forgotpassword.jsx → POST /api/auth/forgot-password
      ↓
authcontroller.js → generates 6-digit OTP
      ↓
email.js:sendPasswordResetOtpEmail() → OTP sent to email
      ↓
resetpassword.jsx → POST /api/auth/reset-password
  → payload: { email, otp, newPassword }
      ↓
authcontroller.js → verify OTP + expiry → hash new password → save
```

### 3e. Auto-Logout on Server Down

```
App.jsx useEffect → setInterval every 60 seconds
      ↓
fetch("/api/health")
      ↓
If response NOT ok:
  → localStorage.removeItem("token")
  → window.location.href = "/login"
```

---

## 4. PROPERTY FLOW (FILES INVOLVED)

### 4a. Seller Posts a Property

```
Seller navigates to /post-property
      ↓
App.jsx ProtectedRoute — checks role: seller or admin only
      ↓
postproperty.jsx — form: title, desc, price, type, listingType,
                         bedrooms, bathrooms, area, city, address,
                         pincode, amenities, images (up to 10)
      ↓
propertyservice.js → POST /api/properties  (multipart/form-data)
      ↓
propertyroutes.js → multer middleware processes images
  → saves files to server/uploads/propertyimages/
  → file size limit: 5MB each, types: jpg/png/webp/gif
      ↓
auth.js:protect() → auth.js:authorize("seller","admin")
      ↓
propertycontroller.js:createProperty()
  → validates fields
  → auto-generates slug from title
  → Property.create() → property.js model → saved to MongoDB
  → status defaults to "available"
      ↓
Response: { success: true, property }
```

### 4b. Admin Verifies / Features a Property

```
AdminDashboard → admindashboard.jsx
      ↓
propertyservice.js → PUT /api/properties/:id/verify
      ↓
propertyroutes.js → protect + authorize("admin")
      ↓
propertycontroller.js:verifyProperty()
  → property.isVerified = true
  → property.status = "available"

propertyservice.js → PUT /api/properties/:id/feature
      ↓
propertycontroller.js:featureProperty()
  → property.isFeatured = true
  → property.featuredUntil = Date (30 days from now)
```

### 4c. Homepage Featured Properties

```
FeaturedProjects.jsx mounts
      ↓
propertyService.getFeatured()
      ↓
propertyservice.js → GET /api/properties/featured
      ↓
propertyroutes.js → public route (no auth needed)
      ↓
propertycontroller.js:getFeaturedProperties()
  → Property.find({
      status: "available",
      isFeatured: true,
      featuredUntil: { $gte: new Date() }   ← must not be expired
    }).limit(8)
      ↓
Response: { success: true, properties: [...] }
      ↓
FeaturedProjects.jsx → maps each → <PropertyCard property={item} />
```

### 4d. Search / Filter Properties

```
Hero.jsx search bar → user types city, selects buy/rent/pg
      ↓
Navigate to /search?city=Mumbai&listingType=buy&...
      ↓
searchresults.jsx reads URL params
      ↓
propertyservice.getProperties({ city, listingType, page, limit, sort... })
      ↓
GET /api/properties?city=Mumbai&listingType=buy
      ↓
propertycontroller.js:getAllProperties()
  → builds filter object from req.query
  → supports: city, listingType, propertyType, minPrice, maxPrice,
              bedrooms, status, sort (price_low/price_high/newest)
  → Property.find(filter).sort().skip().limit()
      ↓
Response: { properties, total, page, pages }
      ↓
searchresults.jsx renders PropertyCard grid with pagination
```

### 4e. Property Details Page

```
User clicks PropertyCard → navigates to /property/:id
      ↓
propertydetails.jsx reads :id param
      ↓
propertyservice.getProperty(id) → GET /api/properties/:id
      ↓
auth.js:optionalAuth — attaches user if logged in (but does NOT block)
      ↓
propertycontroller.js:getProperty()
  → Property.findById(id).populate("owner","name phone avatar")
  → increments views counter
      ↓
Page shows: images, specs, location map, owner contact,
            reviews, similar properties, inquiry form
```

---

## 5. INQUIRY FLOW (FILES INVOLVED)

```
User on propertydetails.jsx clicks "Send Inquiry"
      ↓
Form: message, inquiryType (general/schedule-visit/price-negotiation/documents)
      optional: preferredVisitDate, preferredVisitTime
      ↓
POST /api/inquiries
      ↓
inquiryroutes.js → protect (must be logged in)
      ↓
inquirycontroller.js:createInquiry()
  → Inquiry.create({
      property, sender: req.user._id,
      receiver: property.owner,
      message, inquiryType, preferredVisitDate
    })
  → status defaults to "pending"
      ↓
Seller sees inquiry in SellerDashboard → sellerdashboard.jsx
      ↓
Seller responds → PUT /api/inquiries/:id/respond
  → status: "pending" → "responded"
      ↓
If visit scheduled → status: "scheduled"
      ↓
After visit → status: "completed"

User can view inquiry thread at /inquiry/:id → InquiryDetails.jsx
```

---

## 6. REVIEW FLOW

```
User on propertydetails.jsx (after completed inquiry)
      ↓
Fills review form: rating (1-5 stars), comment
      ↓
POST /api/reviews
      ↓
reviewroutes.js → protect
      ↓
reviewcontroller.js:createReview()
  → Review.create({ property, user, rating, comment })
  → Updates property avgRating field
      ↓
Reviews displayed on property details page
Also shown in TestimonialsSection.jsx on homepage
```

---

## 7. ALERT (SAVED SEARCH) FLOW

```
User on searchresults.jsx clicks "Save Search / Set Alert"
      ↓
POST /api/alerts
  → payload: { city, listingType, propertyType, minPrice, maxPrice }
      ↓
alertroutes.js → protect
      ↓
alertcontroller.js:createAlert()
  → Alert.create({ user: req.user._id, ...criteria })
      ↓
User can manage alerts in UserDashboard → userdashboard.jsx
  → GET /api/alerts → list all saved alerts
  → DELETE /api/alerts/:id → remove alert
```

---

## 8. DASHBOARD ROUTING (FILES INVOLVED)

```
User navigates to /dashboard
      ↓
App.jsx ProtectedRoute → checks isAuthenticated
  → if not logged in → redirect to /login
      ↓
DashboardRouter (in App.jsx) reads user.role:
  ├── role = "admin"  → admindashboard.jsx
  │     Features: manage all properties, verify listings,
  │               feature properties, manage users,
  │               view all inquiries, platform stats
  │
  ├── role = "seller" → sellerdashboard.jsx
  │     Features: my listed properties, received inquiries,
  │               post new property, edit/delete own listings
  │
  └── role = "user"   → userdashboard.jsx
        Features: saved/favorite properties, sent inquiries,
                  saved search alerts, profile settings
```

---

## 9. REQUEST LIFECYCLE — END TO END

```
User Action (click/form submit)
          ↓
React Component (pages/ or components/)
          ↓
Service Function (services/propertyservice.js etc.)
          ↓
api.js (axios instance)
  → Attaches: Authorization: Bearer <JWT from localStorage>
  → Sends to: http://localhost:5000/api/...
          ↓
server.js
  → CORS check (allows localhost:5173)
  → express.json() parses body
          ↓
Route File (routes/propertyroutes.js etc.)
  → Matches method + path
          ↓
Middleware Chain:
  → protect()        — jwt.verify() → User.findById() → req.user
  → authorize()      — checks req.user.role against allowed roles
  → multer (uploads) — only on file upload routes
          ↓
Controller Function (controllers/propertycontroller.js etc.)
  → Business logic
  → MongoDB query via Mongoose model
  → Optional: send email via email.js
          ↓
MongoDB (Atlas or local)
  → Returns documents
          ↓
Controller sends: res.json({ success: true, data })
          ↓
api.js response interceptor:
  → If 401 → clear localStorage → redirect to /login
  → else → return response
          ↓
Service function returns response.data
          ↓
React component updates state → UI re-renders
```

---

## 10. ROLES & PERMISSION MATRIX

| Action                     | user | seller | admin |
| -------------------------- | ---- | ------ | ----- |
| Browse / Search properties | ✅   | ✅     | ✅    |
| View property details      | ✅   | ✅     | ✅    |
| Save favorites             | ✅   | ✅     | ✅    |
| Send inquiry               | ✅   | ✅     | ✅    |
| Post property              | ❌   | ✅     | ✅    |
| Edit own property          | ❌   | ✅     | ✅    |
| Respond to inquiry         | ❌   | ✅     | ✅    |
| Verify property            | ❌   | ❌     | ✅    |
| Feature property           | ❌   | ❌     | ✅    |
| Delete any property        | ❌   | ❌     | ✅    |
| View admin stats           | ❌   | ❌     | ✅    |
| Manage all users           | ❌   | ❌     | ✅    |

---

## 11. KEY ENV VARIABLES NEEDED

```
# server/.env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/logicwave
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password

# api/.env
VITE_API_URL=http://localhost:5000/api
```

---

## 12. START THE PROJECT

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev          # nodemon server.js → port 5000

# Terminal 2 — Frontend
cd api
npm install
npm run dev          # Vite → port 5173

# Open browser
http://localhost:5173
```
