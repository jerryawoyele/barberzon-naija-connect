# Barberzon Nigeria - Product Requirements Document

## 1. App Overview

### **Vision Statement**
Barberzon Nigeria is a mobile-first booking platform that connects Nigerian customers with local barbershops, offering personalized recommendations, seamless Naira payments, and real-time availability management optimized for Nigerian market conditions.

### **Core Value Proposition**
- **For Customers**: Personalized barber discovery, instant booking with favorite barbers, transparent pricing in Naira, and reliable service
- **For Barbers**: Complete business management dashboard, automated scheduling, customer relationship management, and integrated payment processing

### **Target Market**
- **Primary**: Urban Nigerian men aged 18-45 in Lagos, Abuja, and Port Harcourt
- **Secondary**: Barbers and barbershop owners seeking digital business management tools

### **Key Success Metrics**
- Monthly Active Users (MAU)
- Booking completion rate
- Customer retention rate (monthly)
- Average barber earnings through platform
- Customer satisfaction score (NPS)

---

## 2. Tech Stack

### **Frontend Framework**
**Next.js 14** with App Router
* Best for solo development with Cursor AI
* Full-stack capabilities (no separate backend needed)
* Excellent performance and SEO

### **Styling**
**Tailwind CSS**
* Cursor AI's strongest styling framework
* Fastest development speed
* Built-in responsive design

### **Database & ORM**
**PostgreSQL** with **Prisma ORM**
* Most reliable for financial transactions
* Cursor AI generates excellent Prisma code
* Type-safe database operations

### **Authentication**
**NextAuth.js** (Auth.js v5)
* Industry standard for Next.js
* Cursor AI has extensive knowledge of it
* Handles Nigerian phone number auth

### **Payment Integration**
**Paystack** (Primary choice)
* Nigerian-built, best local support
* Excellent documentation for Cursor AI
* Supports all Nigerian payment methods

### **Real-time Features**
**Pusher**
* Managed service (no server maintenance)
* Simple WebSocket alternative
* Perfect for solo development

### **State Management**
**Zustand**
* Lighter than Redux
* Cursor AI handles it well
* Perfect for booking flows

### **Deployment**
**Vercel** (Complete hosting)
* Zero-config Next.js deployment
* Includes database hosting (Vercel Postgres)
* Edge functions for Nigerian users

### **Additional Tools**
* **Maps**: Google Maps JavaScript API
* **Notifications**: Termii (Nigerian SMS provider)
* **Analytics**: Vercel Analytics
* **Error Tracking**: Sentry

---

## 3. App Architecture

### **Customer App Pages**
```
Customer Navigation: Home | My Bookings | Wallet | Notifications | Profile
```

### **Barber Dashboard Pages**
```
Barber Navigation: Dashboard | Appointments | Customers | Payments | Settings
```

---

## 4. Detailed Page Functionality

### **CUSTOMER APP**

#### **🏠 Home Page**
**Primary Functions:**
- Personalized greeting with customer name
- Real-time favorite shops display with live availability
- Smart booking suggestions based on user patterns
- One-tap booking initiation through modals

**Key Features:**
- Live barber availability status (🟢🟡🔴)
- Distance calculation and travel time
- Favorite barber priority display
- Weekend booking alerts
- Price transparency for usual services

**Technical Requirements:**
- Real-time data sync every 30 seconds
- GPS location services
- Push notification integration
- Caching for offline functionality

#### **📅 My Bookings Page**
**Primary Functions:**
- Upcoming appointments management
- Booking history with detailed receipts
- Reschedule/cancel functionality
- Post-service rating and review system

**Key Features:**
- Appointment countdown timers
- Barber contact information
- Navigation integration to shop location
- Booking modification with availability check
- Digital receipt generation

**Technical Requirements:**
- Calendar integration
- SMS/WhatsApp notifications
- Payment status tracking
- Review submission system

#### **💳 Wallet Page**
**Primary Functions:**
- Naira balance management
- Multiple payment method integration
- Transaction history tracking
- Top-up functionality

**Key Features:**
- Nigerian payment methods (GTBank, First Bank, UBA, etc.)
- USSD payment integration
- Automatic payment for bookings
- Receipt generation and email delivery
- Spending analytics

**Technical Requirements:**
- Paystack/Flutterwave integration
- Bank API connections
- PCI DSS compliance
- Transaction encryption
- Fraud detection

#### **🔔 Notifications Page**
**Primary Functions:**
- Booking confirmations and reminders
- Availability alerts for favorite barbers
- Promotional offers and discounts
- System updates and announcements

**Key Features:**
- Smart notification timing (30-min reminders)
- SMS backup for critical notifications
- Promotional targeting based on booking history
- Push notification settings management

**Technical Requirements:**
- Firebase Cloud Messaging
- SMS gateway integration
- Notification scheduling system
- User preference management

#### **👤 Profile Page**
**Primary Functions:**
- Personal information management
- Favorite shops and barbers
- Booking preferences and history
- Account settings and privacy controls

**Key Features:**
- Profile photo upload
- Service preference saving
- Privacy settings management
- Account deletion/data export
- Loyalty points tracking

**Technical Requirements:**
- Image upload and compression
- Data privacy compliance
- Account security features
- Backup and recovery systems

### **BARBER DASHBOARD**

#### **📊 Dashboard Page**
**Primary Functions:**
- Daily earnings and performance overview
- Real-time shop status management
- Customer queue monitoring
- Quick business insights

**Key Features:**
- Earnings analytics (daily/weekly/monthly)
- Staff availability management
- Customer waiting queue
- Performance metrics and trends
- Quick status toggles

**Technical Requirements:**
- Real-time data dashboard
- Analytics and reporting engine
- Staff management system
- Business intelligence tools

#### **📅 Appointments Page**
**Primary Functions:**
- Daily/weekly schedule management
- Appointment booking and modification
- Customer information display
- Service tracking and completion

**Key Features:**
- Drag-and-drop scheduling
- Customer history access
- Service notes and preferences
- Time slot management
- No-show tracking

**Technical Requirements:**
- Calendar synchronization
- Customer database integration
- Appointment notification system
- Schedule optimization algorithms

#### **👥 Customers Page**
**Primary Functions:**
- Customer relationship management
- Service history tracking
- Customer segmentation (VIP, new, returning)
- Communication tools

**Key Features:**
- Customer profiles with photos
- Service preferences and notes
- Spending history and loyalty tracking
- Direct messaging capabilities
- Customer retention analytics

**Technical Requirements:**
- CRM database design
- Customer data analytics
- Communication system integration
- Data privacy compliance

#### **💰 Payments Page**
**Primary Functions:**
- Earnings tracking and analytics
- Payout management
- Payment method configuration
- Financial reporting

**Key Features:**
- Daily/weekly/monthly earnings breakdown
- Payment method analytics
- Tip tracking and management
- Tax reporting preparation
- Payout scheduling

**Technical Requirements:**
- Payment processing integration
- Financial reporting system
- Banking API connections
- Tax calculation engine

#### **⚙️ Settings Page**
**Primary Functions:**
- Shop profile management
- Service pricing configuration
- Staff management
- Business settings

**Key Features:**
- Shop information editing
- Service menu management
- Staff role and permission settings
- Business hours configuration
- Notification preferences

**Technical Requirements:**
- Shop data management system
- Role-based access control
- Configuration management
- Image and media handling

---

## 5. Database Requirements

### **User Management**
```sql
-- Customers Table
customers (
  id, phone_number, email, full_name, profile_image,
  location_lat, location_lng, created_at, updated_at,
  favorite_shops[], booking_preferences, loyalty_points
)

-- Barbers Table
barbers (
  id, shop_id, full_name, phone_number, email, profile_image,
  specialties[], hourly_rate, rating, total_reviews,
  is_available, created_at, updated_at
)

-- Shops Table
shops (
  id, owner_id, name, address, phone_number, email,
  location_lat, location_lng, opening_hours, services[],
  rating, total_reviews, images[], created_at, updated_at
)
```

### **Booking System**
```sql
-- Bookings Table
bookings (
  id, customer_id, shop_id, barber_id, booking_date,
  start_time, end_time, services[], total_amount,
  status, payment_status, notes, created_at, updated_at
)

-- Services Table
services (
  id, shop_id, name, description, price, duration_minutes,
  is_active, created_at, updated_at
)

-- Reviews Table
reviews (
  id, booking_id, customer_id, barber_id, rating,
  comment, created_at, updated_at
)
```

### **Payment System**
```sql
-- Wallet Table
wallets (
  id, customer_id, balance, currency, created_at, updated_at
)

-- Transactions Table
transactions (
  id, user_id, type, amount, reference, status,
  payment_method, description, created_at, updated_at
)

-- Payment Methods Table
payment_methods (
  id, customer_id, type, card_last_four, bank_name,
  is_default, created_at, updated_at
)
```

### **Notification System**
```sql
-- Notifications Table
notifications (
  id, user_id, type, title, message, is_read,
  data_payload, created_at, updated_at
)

-- Push Tokens Table
push_tokens (
  id, user_id, device_token, platform, is_active,
  created_at, updated_at
)
```

---

## 6. Design Guidelines

### **Visual Design Principles**
- **Mobile-First**: All interfaces optimized for Nigerian smartphone usage
- **High Contrast**: Readable in bright outdoor lighting conditions
- **Minimal Data Usage**: Optimized images and efficient layouts
- **Fast Loading**: Progressive loading for slow network conditions

### **Color Palette**
```
Primary: #1B5E20 (Nigerian Green)
Secondary: #FFB300 (Golden Yellow)
Accent: #2E7D32 (Success Green)
Warning: #F57C00 (Orange)
Error: #C62828 (Red)
Background: #FAFAFA (Light Gray)
Text: #212121 (Dark Gray)
```

### **Typography**
```
Headers: Roboto Bold
Body Text: Roboto Regular
Captions: Roboto Light
Buttons: Roboto Medium
```

### **Component Library**
- **Cards**: Elevated cards with shadows for shop listings
- **Buttons**: Rounded buttons with clear call-to-action text
- **Modals**: Bottom sheet modals for booking flows
- **Forms**: Clean input fields with validation
- **Navigation**: Tab-based navigation with clear icons

### **Iconography**
- Material Design icons for consistency
- Custom icons for barber-specific actions
- Status indicators (🟢🟡🔴) for availability
- Nigerian flag elements for localization

---

## 7. Development Approach

### **Development Philosophy**
- **Solo Development Optimized**: Leveraging Cursor AI for rapid development
- **Full-Stack Next.js**: Single codebase for faster iteration
- **Managed Services**: Minimize infrastructure complexity
- **Progressive Enhancement**: Core features first, advanced features later

### **Key Development Phases**
1. **Foundation**: Database setup, authentication, core APIs
2. **Customer Core**: Home page, booking system, basic functionality
3. **Customer Complete**: Wallet, notifications, profile management
4. **Barber Dashboard**: Complete barber management system
5. **Advanced Features**: Analytics, reporting, optimization
6. **Launch Preparation**: Testing, localization, deployment

---

## 8. UI/UX Specifications

### **Mobile Responsiveness**
- Minimum screen size: 320px width
- Touch targets minimum 44px
- Thumb-friendly navigation placement
- Swipe gestures for common actions

### **Loading States**
- Skeleton screens for content loading
- Progressive image loading
- Offline mode indicators
- Error state handling

### **Accessibility**
- Screen reader compatibility
- High contrast mode support
- Font size adjustment
- Voice-over navigation

### **Performance Requirements**
- App launch time: <3 seconds
- Page transitions: <500ms
- Image loading: Progressive with placeholders
- Network optimization: API response caching

### **Nigerian-Specific UI Elements**
- Naira (₦) currency symbol throughout
- Nigerian phone number formatting (+234)
- Local time zone handling (WAT)
- Nigerian English terminology
- Local business hours display

---

## 9. Success Criteria

### **Customer Metrics**
- User registration conversion: >40%
- Booking completion rate: >80%
- Monthly customer retention: >60%
- Average session duration: >3 minutes
- Customer satisfaction (NPS): >7.0

### **Business Metrics**
- Barber onboarding rate: 100 shops in first 6 months
- Revenue per booking: ₦500 average commission
- Platform uptime: >99.5%
- Payment success rate: >95%
- Customer support response: <2 hours

### **Technical Metrics**
- App crash rate: <1%
- API response time: <500ms
- Database query performance: <100ms
- Image load time: <2 seconds
- Offline functionality coverage: 70% of features