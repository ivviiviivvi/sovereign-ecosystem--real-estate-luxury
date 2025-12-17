# Team Performance & Reporting Features

## Overview

The Sovereign Ecosystem now includes a comprehensive Team Performance Hub that enables you to:

1. **Create and manage teams** with multiple members
2. **Compare team performance** side-by-side with visual charts
3. **Export professional PDF reports** with custom branding
4. **Schedule automated email reports** to team members
5. **Track performance metrics** across multiple teams

## Accessing the Team Performance Hub

### From Agent Dashboard
1. Log in as an agent
2. Click the **"Teams"** button in the top navigation
3. You'll be taken to the Team Performance Hub

The hub has three main sections accessible via tabs:
- **Team Management**: Create teams and manage members
- **Performance Comparison**: Compare multiple teams side-by-side
- **Email Scheduler**: Automate weekly/daily reports

---

## Feature 1: Team Management

### Creating a Team

1. Click **"Create Team"** button
2. Enter team details:
   - **Team Name**: e.g., "Development Team Alpha"
   - **Description**: Optional purpose or focus area
   - **Team Color**: Choose from 6 elegant color options
3. Click **"Create Team"**

### Adding Team Members

1. Find the team card
2. Click **"Add Member"** at the bottom
3. Enter:
   - Member name
   - Member email address
4. Click **"Add"**

### Managing Members

- **Make Team Lead**: Click the crown icon to promote a member to lead
- **Remove Member**: Click the trash icon to remove a member
- **View Member Details**: Each member shows their name, email, and role

### Deleting Teams

1. Click the trash icon in the team card header
2. Confirm deletion

---

## Feature 2: Performance Comparison

### Comparing Teams

1. Navigate to the **"Performance Comparison"** tab
2. Select at least 2 teams by clicking on their cards
3. View comprehensive comparison data:
   - **Executive Summary**: Key insights and highlights
   - **Metric Rankings**: Success rate, average score, completed tests, improvement rate
   - **Performance Trends**: Interactive charts showing progress over time

### Understanding the Metrics

Each team displays:
- **Total Tests**: Number of tests completed
- **Success Rate**: Percentage of passing tests
- **Average Score**: Mean performance score
- **Completed Modules**: Modules finished out of total available
- **Active Members**: Current team size
- **Total Time Spent**: Cumulative time on tests
- **Improvement Rate**: Progress percentage increase

### Performance Charts

Three chart types visualize trends:
- **Tests Completed**: Volume of tests over time
- **Success Rate**: Pass percentage trends
- **Average Score**: Score trends over the period

Each team appears in its designated color for easy identification.

### Rankings

Teams are automatically ranked in each metric:
- 🥇 **1st Place**: Gold medal indicator
- 🥈 **2nd Place**: Silver medal indicator
- 🥉 **3rd Place**: Bronze medal indicator

---

## Feature 3: Export to PDF

### Exporting Comparison Reports

1. Select 2+ teams for comparison
2. Click **"Export to PDF"** button in the top right
3. The system generates a professional PDF with:
   - Custom branding (The Sovereign Ecosystem logo and colors)
   - Executive summary with key insights
   - Performance metrics table with rankings
   - Top performers from each team
   - Embedded performance charts
   - Professional header and footer with timestamp

### PDF Contents

The exported PDF includes:
- **Header**: Company branding with gradient design
- **Report Title**: Team Performance Comparison Report
- **Date**: Current date and time
- **Executive Summary**: Top 4 insights
- **Metrics Comparison**: Visual rankings with medal indicators
- **Performance Cards**: Key metrics for each team
- **Top Performers List**: Best team members by score
- **Charts**: Embedded performance trend visualizations
- **Footer**: Company information and copyright

### Download

The PDF automatically downloads as:
`team-comparison-report-[timestamp].png`

---

## Feature 4: Email Scheduler

### Creating an Email Schedule

1. Navigate to the **"Email Scheduler"** tab
2. Click **"Create Schedule"**
3. Configure the schedule:

#### Basic Information
- **Schedule Name**: e.g., "Weekly Team Report"
- **Email Subject**: Subject line for the email

#### Frequency Options
- **Daily**: Sent every day at specified time
- **Weekly**: Sent on a specific day each week (Monday-Sunday)
- **Monthly**: Sent on a specific date each month

#### Recipients
- Enter email addresses separated by commas
- Example: `john@example.com, jane@example.com, team@example.com`

#### Time
- Set the time for sending (24-hour format)
- Timezone: America/New_York (EST/EDT)

4. Click **"Create Schedule"**

### Managing Schedules

Each schedule card shows:
- **Status Toggle**: Enable/disable the schedule
- **Frequency**: When emails will be sent
- **Next Scheduled**: Next send date and time
- **Recipient Count**: Number of email recipients
- **Last Sent**: When last email was sent (if applicable)

### Schedule Actions

- **Send Test**: Send a test email immediately
- **Enable/Disable**: Toggle the schedule on/off
- **Delete**: Remove the schedule permanently

### Test Emails

Click **"Send Test"** to immediately send a preview email with:
- Current team performance statistics
- Sample performance data
- Professional email template with branding
- Charts and visualizations

---

## Email Report Contents

### Email Template Features

Every automated email includes:
- **Elegant Header**: Gradient design with company branding
- **Greeting**: Personalized message
- **Statistics Grid**: 4 key metrics with large numbers
  - Total Tests
  - Success Rate
  - Completed Modules
  - Active Teams
- **Performance Charts**: Embedded visualizations
- **Highlights Summary**: Notable achievements
- **Call-to-Action Button**: Link to full dashboard
- **Professional Footer**: Company information and copyright

### Email Styles

The email template features:
- Responsive design (mobile-friendly)
- Custom brand colors (Rose Blush primary, Lavender accent)
- Serif headings (Cormorant)
- Sans-serif body text (Outfit)
- Rounded cards with shadows
- Gradient backgrounds

---

## Performance Data

### Mock Data Generation

The system automatically generates realistic performance data for demonstration:
- **12 weeks** of historical data
- **Weekly trends**: Tests completed, success rates, scores
- **Team metrics**: Calculated from members and activities
- **Top performers**: Ranked by score
- **Weak areas**: Modules needing improvement

### Metrics Calculation

- **Success Rate**: (Passed Tests / Total Tests) × 100
- **Average Score**: Mean of all test scores
- **Improvement Rate**: Change percentage vs. previous period
- **Rankings**: Sorted by metric value, highest first

---

## Best Practices

### Team Organization

1. **Create teams by department** or project
2. **Assign clear team leads** for accountability
3. **Use descriptive names** that indicate team purpose
4. **Choose distinct colors** for easy visual identification

### Performance Tracking

1. **Compare 2-4 teams** at once for clarity
2. **Review weekly trends** to identify patterns
3. **Focus on improvement rates** not just absolute numbers
4. **Celebrate top performers** to motivate teams

### Email Reporting

1. **Schedule weekly reports** for consistent updates
2. **Send to relevant stakeholders** only
3. **Use test emails** before activating schedules
4. **Review next scheduled time** to ensure accuracy

### PDF Reports

1. **Export after comparing teams** for complete data
2. **Share with leadership** for decision-making
3. **Archive reports** for historical tracking
4. **Use for team reviews** and performance discussions

---

## Quick Actions Dashboard

The hub includes 4 quick action buttons:

1. **Create Team**: Jump to team creation
2. **Compare Teams**: Go to comparison view (requires 2+ teams)
3. **Schedule Report**: Open email scheduler
4. **Export PDF**: Jump to comparison and export (requires teams)

---

## Statistics Overview

The top of the hub shows:
- **Total Teams**: Count of all teams
- **Total Members**: Sum of all team members
- **Team Leads**: Count of members with lead role

---

## Technical Details

### Data Persistence

- All team data stored using `useKV` hook (persists between sessions)
- Email schedules saved locally
- Performance data generated on-demand
- Export operations use HTML5 Canvas API

### PDF Generation

- Canvas-based rendering
- 2100×2970px resolution (A4 at 300 DPI)
- Professional gradients and typography
- Embedded charts and visualizations
- Custom branding support

### Email System

- HTML email templates
- Responsive design
- Inline CSS for compatibility
- Preview/test functionality
- Simulated sending (console log preview)

---

## Tips & Tricks

### Team Colors

The 6 available colors are:
- **Rose** (#E088AA): Soft pink
- **Lavender** (#BA94DA): Purple tone
- **Sky** (#A7C7E7): Light blue
- **Mint** (#98D8C8): Turquoise
- **Peach** (#FFB7C5): Warm pink
- **Gold** (#F7E7CE): Champagne

Choose colors that don't conflict for easy distinction in charts.

### Email Timing

- **Daily reports**: Best for high-activity teams
- **Weekly reports**: Ideal for most teams (Monday 9 AM recommended)
- **Monthly reports**: Good for executive summaries

### Comparison Insights

The system automatically generates insights like:
- Which team leads in success rate
- Average improvement across all teams
- Total tests completed
- Most active team

---

## Troubleshooting

### No Teams Available
- Create at least one team before comparing
- Add members to teams for more realistic data

### Cannot Export PDF
- Select at least 2 teams first
- Wait for chart data to load
- Check browser console for errors

### Email Not Sending
- Currently simulated (check console for preview)
- Future: integrate with real email service
- Test emails generate preview data

### Charts Not Showing
- Ensure teams are selected
- Check that performance data loaded
- Try refreshing the comparison view

---

## Future Enhancements

Potential additions:
- Real email API integration (SendGrid, AWS SES)
- Custom chart types and metrics
- Historical report archiving
- Team member performance drill-down
- Export to Excel/CSV
- Custom branding upload
- Advanced filtering and sorting
- Real-time collaboration features
- Mobile app integration

---

## Summary

The Team Performance Hub provides a complete solution for:
✅ Team organization and member management  
✅ Multi-team performance comparison  
✅ Professional PDF report generation  
✅ Automated email scheduling  
✅ Visual performance analytics  
✅ Custom branding support  

Access it from the Agent Dashboard by clicking the **"Teams"** button!
