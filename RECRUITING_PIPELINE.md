# Ambassador Recruiting Pipeline

## Overview
The EMSI Career Center now features a comprehensive recruiting pipeline for managing ambassador applications. This system transforms the simple application process into a full recruitment workflow with multiple stages, interview tracking, and automatic ambassador profile creation.

## Pipeline Stages

### 1. **Pending Review** 
- Initial state when application is submitted
- Admin can view full application details
- Actions available:
  - ✉️ Invite to Interview
  - ❌ Reject

### 2. **Invite to Interview**
- Application marked for interview invitation
- Admin should send interview invitation email
- Actions available:
  - 📤 Confirm Invitation Sent

### 3. **Invited**
- Candidate has been invited and is awaiting interview
- Actions available:
  - ✅ Mark as Interviewed

### 4. **Interviewed**
- Interview has been conducted
- Admin can add:
  - ⭐ Rating (1-5 stars)
  - 📝 Interview notes
- Actions available:
  - ⭐ Add to Shortlist
  - ❌ Reject

### 5. **Shortlisted**
- Top candidates after interview round
- Final review stage
- Actions available:
  - ✅ Validate (Accept as Ambassador)
  - ❌ Reject

### 6. **Validated**
- Candidate accepted into ambassador program
- **Automatic actions:**
  - Creates ambassador profile
  - Adds to active cohort
  - Triggers welcome email (when implemented)

### 7. **Rejected**
- Application declined at any stage
- Triggers rejection email (when implemented)

## Key Features

### Interview Management
- **Rating System**: 1-5 star rating for each interviewed candidate
- **Interview Notes**: Free-text field for qualitative feedback
- **Interview Date**: Automatically tracked when marked as interviewed

### Status History
- Complete audit trail of all status changes
- Tracks who made changes and when
- Previous status preserved for each transition

### Automatic Profile Creation
When an application is validated:
1. New ambassador profile is created automatically
2. Profile includes all application data
3. Ambassador is added to the current active cohort
4. No manual data entry required

### Enhanced Filtering
Applications can be filtered by any status:
- Pending Review
- Invite to Interview
- Invited
- Interviewed
- Shortlisted
- Validated
- Rejected

## Admin Dashboard Updates

### Application Table
- Visual status indicators with color coding
- Star ratings displayed for interviewed candidates
- Context-appropriate action buttons for each status
- Quick actions without page refresh

### Application Details Modal
- Full application information
- Status history timeline
- Interview notes and ratings (when available)
- Status-specific action buttons

### Interview Modal
- Appears when marking candidate as interviewed
- Interactive star rating selector
- Multi-line interview notes field
- Save & mark as interviewed in one action

## Training Management

Cohorts now support comprehensive training programs:

### Training Properties
- **Title**: Name of the training
- **Description**: Detailed training information
- **Date**: When training is scheduled
- **Duration**: Length of training session
- **Mandatory**: Whether attendance is required

### Training API Endpoints
- `POST /api/cohorts/:year/trainings` - Add new training
- `PUT /api/cohorts/:year/trainings/:id` - Update training
- `DELETE /api/cohorts/:year/trainings/:id` - Remove training

## Best Practices

### For Admins
1. **Review applications promptly** - Check pending reviews daily
2. **Use interview notes** - Document key points for final decisions
3. **Be consistent with ratings** - Develop a rating rubric
4. **Communicate status changes** - Follow up with candidates

### For Development
1. **Email notifications** - Implement email triggers for status changes
2. **Bulk actions** - Add ability to process multiple applications
3. **Export functionality** - Generate reports on recruiting metrics
4. **Calendar integration** - Schedule interviews directly from dashboard

## Technical Implementation

### Data Model Enhancement
```javascript
{
  id: 1,
  name: "Candidate Name",
  email: "candidate@emsi.ma",
  // ... basic fields ...
  status: "interviewed", // New status options
  interviewNotes: "Strong communication skills...",
  rating: 4,
  interviewDate: "2024-01-15T10:00:00Z",
  statusHistory: [
    { status: "pending_review", date: "...", updatedBy: "system" },
    { status: "invited", date: "...", updatedBy: "admin" }
  ]
}
```

### Status Constants
```javascript
const APPLICATION_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  INVITE_TO_INTERVIEW: 'invite_to_interview',
  INVITED: 'invited',
  INTERVIEWED: 'interviewed',
  SHORTLISTED: 'shortlisted',
  VALIDATED: 'validated',
  REJECTED: 'rejected'
};
```

## Future Enhancements

1. **Kanban Board View** - Drag-and-drop interface for moving applications between stages
2. **Automated Emails** - Send status update emails automatically
3. **Bulk Operations** - Select multiple applications for status updates
4. **Analytics Dashboard** - Recruiting funnel metrics and conversion rates
5. **Interview Scheduling** - Built-in calendar for interview coordination
6. **Scoring Algorithm** - Automated candidate ranking based on criteria