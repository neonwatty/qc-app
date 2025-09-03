# QC - Quality Control for Relationships

A modern web application designed to help couples maintain healthy relationships through regular, structured check-ins. Built with Next.js and optimized for mobile devices.

![QC App](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

## 🎯 Overview

QC (Quality Control) is a relationship maintenance tool that facilitates regular check-ins between partners. It provides structure for meaningful conversations, tracks relationship health over time, and helps couples build better communication habits.

### Key Features

- **Structured Check-ins**: Guided conversations across key relationship dimensions
- **Dual Privacy System**: Private notes for personal reflection, shared notes for joint observations  
- **Progress Tracking**: Visual timeline of relationship milestones and growth
- **Action Items**: Convert discussions into concrete, accountable next steps
- **Mobile Optimized**: Full touch support with gesture controls and haptic feedback
- **Streak Tracking**: Gamification to encourage consistent check-in habits

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with localStorage support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/neonwatty/qc-app.git
cd qc-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will auto-login with demo data for "Alex & Jordan" couple.

## 📱 Usage Guide

### Dashboard
The main hub showing:
- Current streak and last check-in
- Activity feed with recent notes
- Quick action buttons
- Relationship statistics

### Starting a Check-in
1. Click "Start Check-in" from dashboard
2. Select 2-5 categories to discuss
3. For each category:
   - Review guided prompts
   - Add private notes (only you see these)
   - Add shared notes (both partners see these)
4. Rate current mood and energy
5. Create action items with assignments
6. Celebrate completion!

### Notes System
- **Private Notes**: Personal reflections and thoughts
- **Shared Notes**: Joint observations and agreements
- **Draft Notes**: Work in progress, not yet shared
- All notes are searchable and filterable by category

### Growth Gallery
- Track relationship milestones with photos
- Visual timeline of your journey together
- Add custom milestones and celebrations

### Settings
- Customize check-in reminders
- Add custom discussion categories
- Adjust privacy preferences
- Export your data
- Reset demo data

## 🛠 Development

### Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui base
- **Animations**: Framer Motion
- **State**: React Context + Local Storage
- **Icons**: Lucide React

### Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── dashboard/       # Main dashboard
│   ├── checkin/         # Check-in flow
│   ├── notes/           # Notes management
│   ├── growth/          # Growth gallery
│   └── settings/        # App settings
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── [feature]/       # Feature-specific components
├── lib/
│   ├── storage.ts       # Local storage utilities
│   ├── mock-data.ts     # Demo data
│   ├── animations.ts    # Animation configs
│   └── demo-reset.ts    # Demo reset utilities
├── hooks/               # Custom React hooks
├── contexts/            # React Context providers
└── types/               # TypeScript definitions
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production build
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
npm run format     # Format with Prettier
```

### Mobile Optimizations

The app includes extensive mobile optimizations:
- **Touch targets**: Minimum 44px for accessibility
- **Gestures**: Swipe navigation and pull-to-refresh
- **Haptic feedback**: Touch feedback on interactions
- **Safe areas**: Support for notched devices
- **Performance**: Hardware acceleration and lazy loading

## 🧪 Testing

### Manual Testing Checklist

- [ ] Complete full check-in flow
- [ ] Test both private and shared notes
- [ ] Verify action item creation
- [ ] Check mobile responsiveness
- [ ] Test offline functionality
- [ ] Verify data persistence
- [ ] Test demo reset function

### Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 8+)

## 🔄 Demo Reset

To reset the demo data:

1. **Via UI**: Settings → Demo Controls → Reset Demo Data
2. **Via Console**: 
```javascript
import { resetDemoData } from '@/lib/demo-reset'
resetDemoData()
```

This restores the initial demo state with sample data for Alex & Jordan.

## 📊 Data Management

### Local Storage
All data is stored locally in the browser using localStorage:
- User profiles
- Check-in history
- Notes (private and shared)
- Milestones
- Settings

### Data Export
Users can export their data as JSON from Settings → Data → Export.

### Privacy
- No data is sent to external servers
- Private notes are clearly marked and separated
- All data remains on the user's device

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Create `.env.local` for environment-specific config:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=QC
```

### Deployment Platforms

Recommended platforms:
- **Vercel**: Optimal for Next.js apps
- **Netlify**: Good alternative with easy setup
- **Railway**: Full-stack deployment option

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain existing code formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)

## 📧 Contact

- GitHub: [@neonwatty](https://github.com/neonwatty)
- Issues: [Report a bug](https://github.com/neonwatty/qc-app/issues)

## 🗺 Roadmap

### Version 1.1 (Planned)
- [ ] Cloud sync with encryption
- [ ] Partner invitations
- [ ] Data visualization charts
- [ ] Notification system
- [ ] PWA support

### Version 2.0 (Future)
- [ ] Native mobile apps
- [ ] Video check-ins
- [ ] Therapist mode
- [ ] Multi-language support
- [ ] AI-powered insights

---

**Made with ❤️ for healthier relationships**