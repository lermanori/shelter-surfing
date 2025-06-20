# 🧪 Shelter Surfing - Comprehensive Testing Checklist

## 🔐 Authentication Testing

### ✅ User Registration
- [ ] Register new user with valid email/password
- [ ] Register with invalid email format
- [ ] Register with weak password
- [ ] Register with existing email
- [ ] Role selection (HOST/SEEKER) during registration
- [ ] Form validation messages display correctly

### ✅ User Login
- [ ] Login with valid credentials
- [ ] Login with invalid email
- [ ] Login with wrong password
- [ ] Remember me functionality
- [ ] Redirect to dashboard after successful login
- [ ] Show error messages for failed login

### ✅ User Logout
- [ ] Logout clears session
- [ ] Redirect to home page after logout
- [ ] Cannot access protected routes after logout

## 📍 Location & GPS Testing

### ❌ GPS Location Detection (CRITICAL ISSUE)
- [ ] GPS button appears in location inputs
- [ ] GPS button shows loading state when clicked
- [ ] GPS permission request appears
- [ ] GPS coordinates are obtained successfully
- [ ] GPS coordinates are converted to readable address
- [ ] GPS location is saved to database
- [ ] GPS error handling (permission denied, timeout, etc.)
- [ ] GPS works on mobile devices
- [ ] GPS works on desktop browsers
- [ ] GPS button changes to "Clear GPS" when location is obtained

### ✅ Israeli Locations Autocomplete
- [ ] Search for "תל אביב" shows results
- [ ] Search for "Tel Aviv" shows results
- [ ] Search for "ירושלים" shows results
- [ ] Search for "Jerusalem" shows results
- [ ] Autocomplete dropdown appears
- [ ] Keyboard navigation works (arrow keys, enter, escape)
- [ ] Click outside closes dropdown
- [ ] Location types are displayed (city, neighborhood, etc.)
- [ ] Both Hebrew and English names are shown
- [ ] Selection fills the input field

### ✅ Location Input Forms
- [ ] Profile page location input works
- [ ] Shelter form location input works
- [ ] Request form location input works
- [ ] Location validation works
- [ ] Location is saved to database

## 🏡 Shelter Management Testing

### ✅ Create Shelter Offer
- [ ] Host can access shelter form
- [ ] All form fields work (title, description, location, dates, capacity, tags)
- [ ] Form validation works
- [ ] Shelter is saved to database
- [ ] Success message appears
- [ ] Redirect to dashboard after creation
- [ ] GPS coordinates are included if available

### ✅ View Shelters
- [ ] Host can see their shelters on dashboard
- [ ] Shelter cards display correctly
- [ ] Shelter information is accurate
- [ ] Edit/Delete buttons work
- [ ] Shelter status is correct

### ✅ Edit Shelter
- [ ] Edit button opens edit form
- [ ] Form is pre-filled with current data
- [ ] Changes are saved successfully
- [ ] Success message appears

### ✅ Delete Shelter
- [ ] Delete button shows confirmation
- [ ] Shelter is removed from database
- [ ] Success message appears
- [ ] Shelter no longer appears in list

## 🚪 Request Management Testing

### ✅ Create Shelter Request
- [ ] Seeker can access request form
- [ ] All form fields work (description, location, date, number of people)
- [ ] Form validation works
- [ ] Request is saved to database
- [ ] Success message appears
- [ ] Redirect to dashboard after creation
- [ ] GPS coordinates are included if available

### ✅ View Requests
- [ ] Seeker can see their requests on dashboard
- [ ] Request cards display correctly
- [ ] Request information is accurate
- [ ] Edit/Delete buttons work
- [ ] Request status is correct

### ✅ Edit Request
- [ ] Edit button opens edit form
- [ ] Form is pre-filled with current data
- [ ] Changes are saved successfully
- [ ] Success message appears

### ✅ Delete Request
- [ ] Delete button shows confirmation
- [ ] Request is removed from database
- [ ] Success message appears
- [ ] Request no longer appears in list

## 🔗 Matching Logic Testing

### ❌ Nearby Shelters (CRITICAL ISSUE)
- [ ] Seeker can access matches page
- [ ] Matches page shows shelters near request location
- [ ] Distance calculation works correctly
- [ ] Distance is displayed on shelter cards
- [ ] Distance color coding works (green/yellow/red)
- [ ] Filters work (distance, capacity, tags)
- [ ] No matches message appears when no shelters nearby
- [ ] Matches update when request location changes
- [ ] GPS coordinates are used for distance calculation
- [ ] Manual location input works for distance calculation

### ✅ Matching Algorithm
- [ ] Haversine distance calculation is accurate
- [ ] Default radius (30km) is applied
- [ ] Date matching works (shelter available during request date)
- [ ] Capacity matching works (shelter can accommodate request)
- [ ] Tags matching works (optional)

## 💬 Messaging Testing

### ✅ Send Messages
- [ ] Message button appears on shelter/request cards
- [ ] Clicking message button opens conversation
- [ ] Messages can be sent successfully
- [ ] Message appears in conversation
- [ ] Real-time updates work
- [ ] Error handling for failed messages

### ✅ View Conversations
- [ ] Conversations list loads correctly
- [ ] Conversation preview shows last message
- [ ] Unread count is displayed
- [ ] Clicking conversation opens it
- [ ] Messages are displayed in chronological order
- [ ] Auto-scroll to latest message works

### ✅ Message Features
- [ ] Messages are marked as read when viewed
- [ ] Message timestamps are displayed
- [ ] Sender/recipient information is correct
- [ ] Message input validation works
- [ ] Loading states work correctly

## 👤 Profile Management Testing

### ✅ View Profile
- [ ] Profile page loads user information
- [ ] All user data is displayed correctly
- [ ] Role-specific information is shown
- [ ] Account creation date is displayed

### ✅ Edit Profile
- [ ] Edit button enables form
- [ ] All fields are editable
- [ ] Form validation works
- [ ] Changes are saved successfully
- [ ] Success message appears
- [ ] User context is updated
- [ ] GPS coordinates are included if available

### ✅ Role Switching
- [ ] User can change from SEEKER to HOST
- [ ] User can change from HOST to SEEKER
- [ ] Role change is saved to database
- [ ] UI updates to reflect new role
- [ ] Appropriate features become available

## 🧭 Navigation & UI Testing

### ✅ Navigation
- [ ] Navbar displays correctly
- [ ] All navigation links work
- [ ] Role-based navigation items appear
- [ ] Active page is highlighted
- [ ] Back buttons work correctly

### ✅ Responsive Design
- [ ] App works on desktop
- [ ] App works on tablet
- [ ] App works on mobile
- [ ] Forms are usable on all screen sizes
- [ ] Navigation is accessible on mobile

### ✅ Loading States
- [ ] Loading spinners appear during API calls
- [ ] Buttons show loading state
- [ ] Forms are disabled during submission
- [ ] Loading states are cleared after completion

### ✅ Error Handling
- [ ] Network errors are handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Form validation errors are displayed
- [ ] 404 pages work correctly
- [ ] Server errors don't crash the app

## 🔧 Technical Testing

### ✅ API Endpoints
- [ ] All API endpoints respond correctly
- [ ] Authentication headers are sent
- [ ] CORS is configured properly
- [ ] API errors return proper status codes
- [ ] API responses are in correct format

### ✅ Database
- [ ] User data is saved correctly
- [ ] Shelter data is saved correctly
- [ ] Request data is saved correctly
- [ ] Message data is saved correctly
- [ ] Relationships between tables work
- [ ] Data is retrieved correctly

### ✅ Security
- [ ] JWT tokens are validated
- [ ] Protected routes require authentication
- [ ] User can only access their own data
- [ ] Passwords are hashed
- [ ] No sensitive data is exposed

## 🐛 Known Issues to Fix

### ❌ GPS Location Issues
1. **GPS button not working** - Check browser permissions and geolocation API
2. **GPS coordinates not saving** - Verify backend handles latitude/longitude
3. **GPS permission denied** - Test permission handling
4. **GPS timeout** - Test timeout scenarios

### ❌ Nearby Shelters Issues
1. **Distance calculation not working** - Check Haversine formula implementation
2. **No shelters showing** - Verify matching logic and radius
3. **Distance display issues** - Check frontend distance formatting
4. **GPS coordinates not used** - Verify GPS data is passed to matching

### ❌ General Issues
1. **Form validation errors** - Check all form validations
2. **API connection issues** - Verify server is running and accessible
3. **Database connection issues** - Check PostgreSQL connection
4. **CORS issues** - Verify CORS configuration

## 📱 Mobile Testing Checklist

### ✅ Mobile-Specific Features
- [ ] GPS works on mobile browsers
- [ ] Touch interactions work correctly
- [ ] Forms are mobile-friendly
- [ ] Navigation works on mobile
- [ ] Messages work on mobile
- [ ] Location autocomplete works on mobile

## 🚀 Performance Testing

### ✅ Performance
- [ ] App loads quickly
- [ ] API responses are fast
- [ ] No memory leaks
- [ ] Images load properly
- [ ] No console errors
- [ ] Smooth scrolling and interactions

## 📊 Data Validation Testing

### ✅ Data Integrity
- [ ] All required fields are validated
- [ ] Data types are correct
- [ ] No duplicate entries
- [ ] Foreign key relationships work
- [ ] Data is consistent across tables

---

## 🎯 Testing Priority

### 🔴 HIGH PRIORITY (Fix First)
1. GPS location detection
2. Nearby shelters matching
3. Distance calculation
4. Basic form functionality

### 🟡 MEDIUM PRIORITY
1. Messaging system
2. Profile management
3. Role switching
4. Error handling

### 🟢 LOW PRIORITY
1. UI polish
2. Performance optimization
3. Additional features
4. Mobile optimization

---

## 📝 Testing Notes

- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on multiple devices (desktop, tablet, mobile)
- Test with different user roles (HOST, SEEKER)
- Test with and without GPS enabled
- Test with various location inputs (GPS, manual, autocomplete)
- Document any bugs found with steps to reproduce 