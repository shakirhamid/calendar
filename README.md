# 📅 Calendar App - Notion Style

A full-stack calendar application with responsive design for PC and mobile, featuring event management, push notifications, and multi-database support (MongoDB & PostgreSQL).

## 🎯 Features

- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🗓️ Calendar View**: Monthly calendar view with intuitive event management
- **🔔 Push Notifications**: Real-time notifications for upcoming events
- **🎨 Event Customization**: Add events with title, time, description, and custom colors
- **💾 Multi-Database Support**: MongoDB and PostgreSQL support
- **🎭 Material-UI**: Modern, clean UI built with Material-UI (MUI)
- **⚡ Next.js**: Full-stack framework with API routes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB or PostgreSQL (or both for polyglot setup)

### Installation

1. **Clone or open the project:**
   ```bash
   cd calendar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory (already created with template):
   
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/calendar-app"
   POSTGRES_URL="postgresql://user:password@localhost:5432/calendar"
   
   # Firebase (for notifications)
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"
   
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up MongoDB (optional):**
   
   If using MongoDB locally:
   ```bash
   # On Windows
   mongod
   
   # Or with Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
calendar/
├── pages/
│   ├── _app.tsx              # App wrapper with MUI theme
│   ├── _document.tsx         # HTML document structure
│   ├── index.tsx             # Main calendar page
│   └── api/
│       ├── events.ts         # GET/POST events
│       ├── events/[id].ts    # GET/PUT/DELETE specific event
│       └── notifications.ts  # POST notifications
├── components/
│   ├── CalendarHeader.tsx    # Weekday header
│   ├── CalendarGrid.tsx      # Calendar grid display
│   ├── EventDialog.tsx       # Add/edit event dialog
│   └── NotificationCenter.tsx # Notification handler
├── lib/
│   ├── db/
│   │   └── mongodb.ts        # MongoDB connection
│   ├── models/
│   │   └── Event.ts          # Event schema
│   └── firebase.ts           # Firebase setup
├── .env.local                # Environment variables
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🎨 Responsive Design

The app automatically adapts to different screen sizes:

- **Mobile** (< 600px): Compact view with smaller fonts and spacing
- **Tablet** (600px - 960px): Medium view
- **Desktop** (> 960px): Full-featured view with all options visible

Media queries are handled through Material-UI's `useMediaQuery` hook.

## 🔄 API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get specific event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Notifications
- `POST /api/notifications` - Send push notification
- `GET /api/notifications` - Get notification history

## 📦 Database Models

### Event Schema (MongoDB)
```javascript
{
  title: String (required),
  description: String,
  date: Date (required),
  time: String,
  color: String,
  userId: String (required),
  tags: [String],
  reminders: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔔 Notifications Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Cloud Messaging

2. **Get Credentials:**
   - Download service account key
   - Get web credentials and VAPID key
   - Add to `.env.local`

3. **Request Permission:**
   - User must grant browser notification permission
   - App will automatically register for push notifications

## 🛠️ Development

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

## 🎯 Next Steps

1. **Connect to Database:**
   - Update API routes to use MongoDB/PostgreSQL
   - Implement user authentication
   - Add data validation

2. **Enhance UI:**
   - Add dark mode support
   - Implement drag-and-drop for events
   - Add weekly/daily views
   - Add event search and filtering

3. **Add Features:**
   - User authentication (Google, GitHub)
   - Event sharing and collaboration
   - Recurring events
   - Event attachments
   - Calendar syncing (Google Calendar, Outlook)

4. **Deploy:**
   - Deploy to Vercel (recommended for Next.js)
   - Set up CI/CD pipeline
   - Configure production database
   - Set up monitoring and analytics

## 📱 Responsive Tips

- The app uses Material-UI's `useMediaQuery` for responsive design
- All components have mobile-first breakpoints
- Touch-friendly buttons and spacing on mobile
- Flexible layouts using CSS Grid and Flexbox

## 🐛 Troubleshooting

**Issue**: MongoDB connection fails
- **Solution**: Ensure MongoDB is running on `localhost:27017`

**Issue**: Notifications not working
- **Solution**: Check Firebase credentials and enable notifications in browser

**Issue**: Styling issues on mobile
- **Solution**: Clear browser cache and restart dev server

## 📄 License

MIT

## 🤝 Contributing

Feel free to fork and submit pull requests for any improvements!

---

**Built with ❤️ using Next.js, React, and Material-UI**
