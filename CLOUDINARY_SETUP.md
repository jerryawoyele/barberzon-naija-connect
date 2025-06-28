# Cloudinary Setup for Avatar Upload

This document explains how to set up Cloudinary for avatar image upload in the Barberzon Naija Connect app.

## Features Implemented

1. **Search Bar on Explore Page** - ✅ Already implemented
2. **Edit Icon on Profile Page** - ✅ Added edit icon at top right of profile details card
3. **Scrollable Modal for Profile Editing** - ✅ Created `EditProfileModal` component
4. **Cloudinary Avatar Upload** - ✅ Integrated with secure image upload
5. **Always Rounded Avatars** - ✅ Using Radix UI Avatar component
6. **Default Avatar Icon** - ✅ Shows user initials or user icon when no avatar
7. **Phone Number Display** - ✅ Fixed backend to include phone field
8. **Location Display** - ✅ Shows state and country instead of lat/lng

## Cloudinary Setup

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Once logged in, go to your Dashboard
3. Note down your:
   - Cloud Name
   - API Key  
   - API Secret

### 2. Create an Upload Preset

1. In your Cloudinary console, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `barberzon_avatars` (or any name you prefer)
   - **Signing Mode**: `Unsigned` (for frontend uploads)
   - **Folder**: `barberzon/avatars`
   - **Resource Type**: `Image`
   - **Format**: `Auto`
   - **Quality**: `Auto`
   - **Transformation**: 
     - Width: 400px
     - Height: 400px
     - Crop: Fill
     - Gravity: Face (for better cropping)
5. Save the preset

### 3. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=barberzon_avatars

# Other variables...
VITE_API_BASE_URL=http://localhost:3001/api
```

Replace `your-cloud-name` with your actual Cloudinary cloud name.

### 4. Security Considerations

- The upload preset is set to "unsigned" for frontend uploads
- Images are uploaded to a specific folder: `barberzon/avatars`
- File type validation is done on the frontend
- File size is limited to 5MB
- Consider implementing server-side validation for production

## Component Features

### EditProfileModal Component

- **Scrollable content** for mobile-friendly editing
- **Cloudinary integration** for avatar upload
- **Real-time preview** of uploaded avatars
- **Location services** with reverse geocoding
- **Form validation** with user feedback
- **Loading states** during upload and save

### Profile Page Updates

- **Edit icon** in top-right corner of profile card
- **Rounded avatars** using Radix UI Avatar component
- **Default fallback** showing user initials or icon
- **Improved location display** showing readable address
- **Removed redundant** edit profile menu item

### Backend Updates

- **Phone field support** in profile update endpoint
- **Location fields** properly handled in database

## Usage

1. Users can click the edit icon on their profile page
2. The modal opens with current profile information
3. Users can upload a new avatar by clicking the camera icon
4. Images are uploaded to Cloudinary and URLs are saved to the database
5. Location can be updated using the "Use Current Location" button
6. All changes are saved with proper validation

## File Structure

```
src/
├── components/
│   ├── EditProfileModal.tsx       # New scrollable modal component
│   └── ui/
│       └── avatar.tsx             # Radix UI Avatar component
├── pages/
│   ├── explore.tsx                # Search bar already implemented
│   └── profile.tsx                # Updated with edit icon and modal
└── services/
    └── customer.service.ts        # Profile management service
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Cloudinary credentials
3. Restart your development server

## Testing

1. Open the profile page
2. Click the edit icon in the top-right corner
3. Try uploading an avatar image
4. Update other profile fields
5. Verify the location shows as "State, Country" format
6. Check that phone numbers are properly displayed and editable

## Production Considerations

1. **Image Optimization**: Cloudinary automatically optimizes images
2. **Security**: Consider server-side upload validation
3. **Rate Limiting**: Implement upload rate limits
4. **Storage**: Monitor Cloudinary usage and costs
5. **Backup**: Consider backup strategies for user avatars
