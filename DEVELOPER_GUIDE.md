# 👨‍💻 Developer Guide

Complete guide for developing features in the Calendar App.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Client (React/Next.js)            │
├─────────────────────────────────────────────┤
│  - Calendar Grid Component                  │
│  - Event Dialog Component                   │
│  - Material-UI Theme Provider               │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────┐
│       Next.js API Routes (/api)             │
├─────────────────────────────────────────────┤
│  - /api/events (CRUD)                       │
│  - /api/events/[id] (GET/PUT/DELETE)        │
│  - /api/notifications (POST/GET)            │
└──────────────────┬──────────────────────────┘
                   │ Database Query
┌──────────────────▼──────────────────────────┐
│      Database Layer (MongoDB/PostgreSQL)    │
├─────────────────────────────────────────────┤
│  - Events Collection/Table                  │
│  - Users Collection/Table                   │
│  - Notifications Collection/Table           │
└─────────────────────────────────────────────┘
```

## 📝 File Organization

```
calendar/
├── pages/
│   ├── _app.tsx              ← Theme setup & global providers
│   ├── _document.tsx         ← HTML structure
│   ├── index.tsx             ← Main calendar page
│   └── api/
│       ├── events.ts         ← GET/POST events
│       ├── events/[id].ts    ← GET/PUT/DELETE specific event
│       └── notifications.ts  ← Notification endpoints
│
├── components/
│   ├── CalendarHeader.tsx    ← Weekday labels
│   ├── CalendarGrid.tsx      ← Calendar grid with events
│   ├── EventDialog.tsx       ← Add/edit event form
│   └── NotificationCenter.tsx ← Notification handler
│
├── lib/
│   ├── db/
│   │   └── mongodb.ts        ← MongoDB connection
│   ├── models/
│   │   └── Event.ts          ← Mongoose schema
│   └── firebase.ts           ← Firebase setup
│
├── styles/
│   └── globals.css           ← Global styles
│
└── prisma/
    └── schema.prisma         ← Prisma schema (PostgreSQL)
```

## 🔄 Data Flow

### Creating an Event

```
User Input (EventDialog)
    ↓
POST /api/events
    ↓
Validate data
    ↓
Save to database
    ↓
Send notification (if enabled)
    ↓
Return event data
    ↓
Update UI with new event
```

### Fetching Events

```
Page load or navigation
    ↓
GET /api/events
    ↓
Query database
    ↓
Return events array
    ↓
Render in CalendarGrid
```

## 🛠️ Common Development Tasks

### Add a New Component

1. Create component file in `components/`:
```typescript
// components/MyComponent.tsx
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <Box>
      <Typography>{title}</Typography>
    </Box>
  );
}
```

2. Import and use in page:
```typescript
import MyComponent from '@/components/MyComponent';

export default function Page() {
  return <MyComponent title="Hello" />;
}
```

### Add a New API Route

1. Create file in `pages/api/`:
```typescript
// pages/api/my-endpoint.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Your logic here
      res.status(200).json({ data: 'success' });
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  }
}
```

2. Call from component:
```typescript
const response = await fetch('/api/my-endpoint');
const data = await response.json();
```

### Add Database Connection

#### MongoDB (using Mongoose):

1. Import connection:
```typescript
import dbConnect from '@/lib/db/mongodb';
import { Event } from '@/lib/models/Event';

export default async function handler(req, res) {
  await dbConnect();
  
  const events = await Event.find({});
  res.status(200).json(events);
}
```

#### PostgreSQL (using Prisma):

1. Update schema:
```prisma
model Event {
  id    Int     @id @default(autoincrement())
  title String
}
```

2. Run migration:
```bash
npx prisma migrate dev --name add_events
```

3. Use in API:
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const events = await prisma.event.findMany();
```

### Add Environment Variable

1. Add to `.env.local`:
```env
MY_NEW_VAR="value"
```

2. Use in code:
```typescript
const value = process.env.MY_NEW_VAR;              // Server
const publicValue = process.env.NEXT_PUBLIC_VAR;   // Client
```

### Add New MUI Theme Color

Edit `pages/_app.tsx`:
```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },      // Add this
    warning: { main: '#ed6c02' },      // Add this
    error: { main: '#d32f2f' },
  },
});
```

Use in components:
```typescript
<Button color="success">Success Button</Button>
<Alert severity="warning">Warning message</Alert>
```

## 🧪 Testing

### Unit Testing Setup

```bash
npm install --save-dev jest @testing-library/react
```

Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

Write tests:
```typescript
// __tests__/CalendarGrid.test.tsx
import { render, screen } from '@testing-library/react';
import CalendarGrid from '@/components/CalendarGrid';

describe('CalendarGrid', () => {
  it('renders calendar', () => {
    render(
      <CalendarGrid
        currentDate={new Date()}
        events={[]}
        onDateClick={() => {}}
      />
    );
    expect(screen.getByText(/Sun/i)).toBeInTheDocument();
  });
});
```

Run tests:
```bash
npm test
```

## 🐛 Debugging

### Browser DevTools
- Open F12
- Console tab: Check for errors
- Network tab: Monitor API calls
- Elements tab: Inspect components

### VS Code Debugging
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### Logging Best Practices
```typescript
// Good
console.log('Event saved:', event);

// Bad
console.log('ok');

// For production
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## 📦 Dependencies Management

### Add New Package
```bash
npm install package-name
```

### Update Packages
```bash
npm update                    # Update all
npm update package-name       # Update specific
npm outdated                  # Check outdated
```

### Remove Package
```bash
npm uninstall package-name
```

### Lock Dependencies
```bash
npm ci                        # Use package-lock.json
```

## 🔐 Security Best Practices

1. **Never expose secrets**
   - Use `.env.local` for secrets
   - Never commit `.env.local`

2. **Validate input**
   ```typescript
   if (!title.trim()) {
     return res.status(400).json({ error: 'Invalid title' });
   }
   ```

3. **Sanitize database queries**
   ```typescript
   // Good with parameterized queries
   db.query('SELECT * FROM events WHERE id = ?', [id]);
   
   // Bad - vulnerable to SQL injection
   db.query(`SELECT * FROM events WHERE id = ${id}`);
   ```

4. **Use HTTPS**
   ```typescript
   // Check connection
   if (req.headers['x-forwarded-proto'] !== 'https') {
     return res.status(400).json({ error: 'HTTPS required' });
   }
   ```

## 📈 Performance Tips

1. **Use React.memo for components**
   ```typescript
   export default React.memo(function MyComponent() {
     return <div>Optimized</div>;
   });
   ```

2. **Lazy load components**
   ```typescript
   const LazyComponent = dynamic(() => import('@/components/Heavy'), {
     loading: () => <div>Loading...</div>
   });
   ```

3. **Optimize images**
   ```typescript
   import Image from 'next/image';
   <Image src="/icon.png" width={32} height={32} />
   ```

4. **Use ISR for static generation**
   ```typescript
   export const revalidate = 60; // Revalidate every 60 seconds
   ```

## 🚀 Deployment Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] API rate limiting enabled
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Performance optimized
- [ ] Security headers set
- [ ] HTTPS enabled
- [ ] Backup configured
- [ ] Monitoring set up

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Material-UI](https://mui.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Docs](https://docs.mongodb.com)
- [Prisma Docs](https://www.prisma.io/docs/)

---

Happy coding! 🎉
