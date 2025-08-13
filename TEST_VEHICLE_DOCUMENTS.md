# Vehicle Documents Fix - Test Guide

## Problem Fixed
- Documents uploaded via vehicle edit form were not visible in the Documents tab
- Fixed by bridging legacy vehicle document URLs with the dedicated vehicle_documents table

## Changes Made

### 1. VehicleDetailView.tsx
- Updated `fetchVehicleData()` to merge documents from both sources:
  - Legacy documents from vehicles table (insurance_document_url, registration_document_url, pollution_certificate_url)
  - New documents from vehicle_documents table
- Prioritizes newer documents from the dedicated table over legacy ones

### 2. VehicleDocumentsTab.tsx
- Updated `handleUpload()` to handle both legacy and new document types
- Updated `handleDelete()` to properly delete from correct table/field
- Added edit/replace functionality for all document types
- Added delete buttons for all document types
- Shows verification option only for non-legacy documents

## How It Works

1. **Display**: Documents from both sources are merged and displayed in the Documents tab
2. **Upload**: New documents are stored in the vehicle_documents table
3. **Replace Legacy**: When replacing a legacy document, it updates both the vehicles table and creates a new record in vehicle_documents table
4. **Delete**: 
   - Legacy documents: Clear the URL from vehicles table
   - New documents: Delete from vehicle_documents table

## Testing Steps

1. Go to Vehicles page
2. Find a vehicle with uploaded documents (should show in first screenshot)
3. Click "View Details" → "Documents" tab
4. Documents should now be visible with View, Replace, Delete buttons
5. Test upload, replace, and delete functionality

## Database Schema

The fix utilizes both:
- `vehicles.insurance_document_url`, `vehicles.registration_document_url`, `vehicles.pollution_certificate_url`
- `vehicle_documents` table with proper document management features

Legacy documents are identified by ID prefix: `legacy-{type}-{vehicleId}`