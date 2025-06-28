# 🔄 Unified User System Migration Guide

This guide will help you migrate from the current separate Customer/Barber models to a unified User system that will solve all the onboarding and data association issues.

## 🎯 What This Solves

- ✅ **User Registration Issues**: Single registration flow for all users
- ✅ **Onboarding Problems**: Seamless role selection during onboarding
- ✅ **Data Migration**: Handles customer-to-barber transitions properly
- ✅ **Shop Association**: Proper shop data linking for barber dashboards
- ✅ **Duplicate Prevention**: Prevents duplicate accounts during role changes

## 📋 Prerequisites

Before starting the migration:

1. **Backup your database** - This is critical!
2. **Stop your application** - Both frontend and backend
3. **Verify your current data** - Run the debug script if needed

## 🚀 Migration Steps

### Step 1: Backup Current Data

```bash
# Export your current database
pg_dump your_database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Or if using Docker
docker exec -i your_postgres_container pg_dump -U your_username your_database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Replace Schema

1. **Replace your Prisma schema**:
   ```bash
   # Backup current schema
   cp backend/prisma/schema.prisma backend/prisma/schema-old.prisma
   
   # Replace with unified schema
   cp backend/prisma/schema-unified.prisma backend/prisma/schema.prisma
   ```

2. **Apply new schema** (⚠️ This will reset your database):
   ```bash
   cd backend
   npx prisma db push --force-reset
   npx prisma generate
   ```

### Step 3: Run Data Migration

```bash
# Run the migration script
node migrate-to-unified-users.js
```

The script will:
- ✅ Migrate all customers to Users + CustomerProfiles
- ✅ Migrate all barbers to Users + BarberProfiles  
- ✅ Handle customer-to-barber conversions
- ✅ Update all relationship references
- ✅ Preserve all existing data

### Step 4: Update Backend Controllers

1. **Replace auth controller**:
   ```bash
   # Backup current controller
   cp backend/src/controllers/auth.controller.ts backend/src/controllers/auth.controller-old.ts
   
   # Replace with unified controller
   cp backend/src/controllers/auth-unified.controller.ts backend/src/controllers/auth.controller.ts
   ```

2. **Replace barber controller**:
   ```bash
   # Backup current controller
   cp backend/src/controllers/barber.controller.ts backend/src/controllers/barber.controller-old.ts
   
   # Replace with unified controller
   cp backend/src/controllers/barber-unified.controller.ts backend/src/controllers/barber.controller.ts
   ```

### Step 5: Update Routes (if needed)

The route endpoints remain the same, but the underlying logic now uses the unified system:

- `/api/auth/profile` - Now returns unified user data
- `/api/auth/onboarding/complete` - Now handles role selection
- `/api/barbers/profile` - Now works with barber profiles linked to users

### Step 6: Test the System

1. **Start your servers**:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend  
   npm run dev
   ```

2. **Test key flows**:
   - ✅ User registration
   - ✅ User login
   - ✅ Onboarding as customer
   - ✅ Onboarding as barber (with shop creation)
   - ✅ Barber dashboard with shop data
   - ✅ Role switching (customer becoming barber)

## 🔧 Key Changes in the New System

### Database Structure

```
OLD SYSTEM:
- Customer table (separate)
- Barber table (separate)
- Duplicate data issues

NEW SYSTEM:
- User table (unified base data)
- CustomerProfile table (customer-specific data)
- BarberProfile table (barber-specific data)
- Clean relationships
```

### API Changes

```typescript
// OLD: Separate profile endpoints
GET /api/customers/profile
GET /api/barbers/profile

// NEW: Unified profile endpoint
GET /api/auth/profile
// Returns user with customerProfile OR barberProfile based on role
```

### Onboarding Flow

```typescript
// OLD: Role determined at registration
POST /api/auth/register/customer
POST /api/auth/register/barber

// NEW: Role determined at onboarding
POST /api/auth/register  // Creates user without role
POST /api/auth/onboarding/complete  // Sets role and creates profile
```

## 📊 Data Migration Details

### Customer Migration
- ✅ Customer → User (base data)
- ✅ Customer → CustomerProfile (customer-specific data)
- ✅ Preserves: wallet, bookings, favorites, reviews

### Barber Migration  
- ✅ Barber → User (base data)
- ✅ Barber → BarberProfile (barber-specific data)
- ✅ Preserves: shop associations, bookings, earnings

### Duplicate Handling
- 🔍 Detects email/phone duplicates
- 🔄 Converts existing customers to barbers when onboarding as barber
- 🚫 Prevents data loss during role transitions

## 🎯 Benefits After Migration

### For Users
- ✅ **Single Registration**: One account, multiple roles
- ✅ **Seamless Onboarding**: Choose role after registration
- ✅ **Role Flexibility**: Can switch from customer to barber easily

### For Development
- ✅ **Cleaner Code**: Unified authentication logic
- ✅ **Better Data Integrity**: No duplicate accounts
- ✅ **Easier Maintenance**: Single user management system

### For Barber Dashboard
- ✅ **Proper Shop Data**: Dashboard will show correct barbershop information
- ✅ **Real Associations**: Barber properly linked to shop table
- ✅ **Complete Profile**: All user and barber data available

## 🚨 Troubleshooting

### If Migration Fails

1. **Restore from backup**:
   ```bash
   psql your_database_name < backup_YYYYMMDD_HHMMSS.sql
   ```

2. **Check for constraint violations**:
   - Ensure no duplicate emails/phone numbers
   - Verify all required fields are present

3. **Run migration step by step**:
   - Test with a small subset of data first
   - Check logs for specific error messages

### Common Issues

1. **"User already exists" errors**:
   - Review duplicate detection logic
   - May need to manually merge duplicate accounts

2. **"Shop not found" errors**:
   - Verify shop creation logic in onboarding
   - Check shop ownership relationships

3. **"Profile not found" errors**:
   - Ensure profile creation completed successfully
   - Check foreign key relationships

## ✅ Verification Checklist

After migration, verify:

- [ ] All users can login with existing credentials
- [ ] Customer profiles have wallet and booking data
- [ ] Barber profiles have shop associations
- [ ] Onboarding flow works for new users
- [ ] Barber dashboard shows correct shop information
- [ ] No duplicate user accounts exist
- [ ] All bookings and reviews are preserved
- [ ] Shop ownership is correctly assigned

## 🎉 Success Indicators

You'll know the migration succeeded when:

1. **Barber Dashboard**: Shows actual barbershop name and location
2. **Onboarding**: Users can choose customer or barber role
3. **Role Switching**: Existing customers can become barbers seamlessly
4. **Data Integrity**: All existing bookings, reviews, and shop data preserved
5. **Authentication**: Single login works for all user types

## 📞 Next Steps After Migration

1. **Test thoroughly** - Verify all functionality works
2. **Update frontend** - May need minor adjustments for new data structure
3. **Monitor logs** - Watch for any issues in production
4. **User communication** - Inform users about any changes (minimal impact)

## 🎯 Expected Results

After this migration:
- ✅ Your barber dashboard will display the correct barbershop name and location
- ✅ Onboarding will work smoothly for all user types
- ✅ No more customer/barber table conflicts
- ✅ Clean, maintainable codebase
- ✅ Scalable user management system

---

**Ready to migrate?** Follow the steps above carefully, and you'll have a robust unified user system that solves all your current issues! 🚀
