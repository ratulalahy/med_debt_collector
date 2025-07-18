# Incoming Calls Management Feature

## Overview
The new **Incoming Calls** page provides comprehensive tracking and management of incoming calls with advanced customer preference management and alert systems.

## Features

### 📞 Call Tracking
- Real-time incoming call logs
- Call duration and outcome tracking
- Patient information display with balance

### 🚨 Intelligent Alert System
- **Urgent Alerts**: Angry customers, legal threats, no-contact requests
- **Payment Alerts**: Payment promises, payment commitments
- **Dispute Alerts**: Charge disputes and billing issues
- **Contact Preference Alerts**: Customer communication preferences

### 📋 Customer Preferences Management
- **Contact Method Preferences**:
  - SMS preferred customers
  - Email-only customers
  - Phone call preferences
  - No-contact requests

- **Agent Preferences**:
  - Customers who want human agents only
  - AI-assisted customers
  - Escalation requirements

- **Time Restrictions**:
  - No-call time periods (morning, evening, all)
  - Preferred callback times
  - Scheduled callback management

### 💰 Payment & Financial Tracking
- Payment promises with due dates
- Payment plan interests
- Full payment tracking
- Outstanding balance monitoring

### 📝 Notes & Documentation
- Agent notes with categories (urgent, positive, warning)
- Call outcome documentation
- Customer interaction history
- Escalation notes

### 📅 Callback Management
- Scheduled callback tracking
- Callback reasons and status
- Follow-up scheduling
- Calendar integration ready

## Navigation
Access through the sidebar: **Incoming Calls** (phone icon)

## Key Components

### Stats Dashboard
- Total calls today
- Urgent alerts count
- Scheduled callbacks
- Payment-related calls

### Urgent Alerts Panel
- High-priority customer alerts
- Legal threat warnings
- No-contact notifications
- Escalation requirements

### Call Details Table
Comprehensive view with:
- Call time and duration
- Patient information
- Call outcome with icons
- Priority levels
- Active alerts
- Customer preferences
- Action buttons

### Detailed Call Information
Multi-tab dialog showing:
1. **Call Summary**: Basic call information
2. **Customer Preferences**: Contact preferences and restrictions
3. **Alerts & Notes**: Active alerts and agent notes
4. **Scheduled Callbacks**: Upcoming callback schedule

## Alert Types & Meanings

### 🔴 Urgent (Red)
- `angry_customer`: Customer was hostile or upset
- `legal_threat`: Customer mentioned legal action
- `no_contact`: Customer requests no calls/SMS

### ⚠️ Warning (Orange)
- `payment_promise`: Customer promised payment
- `dispute`: Customer disputes the charge

### ✅ Success (Green)
- `payment_received`: Payment was successfully made

### ℹ️ Info (Blue)
- `callback_requested`: Customer requested callback
- General information alerts

## Customer Preference Icons
- 📱 **SMS Icon**: Customer prefers text messages
- 🎧 **Agent Icon**: Customer wants human agent only
- 🚫 **Block Icon**: No calls allowed
- 💳 **Payment Icon**: Interested in payment plans

## Integration Points
- Links to Patient Management for full customer profiles
- Integrates with Call Queue for scheduling
- Export capabilities for reporting
- Real-time notification system

## Future Enhancements
- Calendar integration for callback scheduling
- SMS notification system
- Email template system
- Advanced reporting and analytics
- Integration with external CRM systems
- Voice recording playback
- AI sentiment analysis integration

## Usage Tips
1. **Check Urgent Alerts First**: Always review the red alert panel at the top
2. **Update Customer Preferences**: Use the detailed view to update preferences
3. **Add Notes**: Document important customer interactions
4. **Schedule Callbacks**: Use the callback system for follow-ups
5. **Filter by Outcome**: Use filters to focus on specific call types
