# Mind Fusion
A full-stack mobile application built with React Native and Node.js + Express, connected to Supabase (PostgreSQL) for gamified alcohol reduction and recovery support. It helps users track sobriety, moods, triggers, daily habits, and progress through a gamified reward system.

## Features

- **User Authentication**: JWT-based login with optional anonymous mode
- **Drink Tracking**: Log alcohol consumption and track sober streaks
- **Mood Tracking**: Monitor emotional patterns and mood scores
- **Trigger Tracking**: Identify and analyze drinking triggers
- **Gamification System**: Points, levels (7 tiers), badges, streak rewards
- **Daily Tasks**: 20+ health, mental, social, and hobby challenges
- **Progress Analytics**: Weekly/monthly reports and dashboards
- **SOS Support**: Emergency contact management
- **Motivational Content**: Quotes, alternatives, and suggestions
- **User Settings**: Themes, notifications, reminders

## Prerequisites
- **Node.js (14+)**
- **npm / yarn**
- **React Native CLI**
- **Android Studio / Xcode**
- **Supabase account**

## Installation
1. Clone Repo:
   ```bash
   git clone https://github.com/dondanu/mind-fusion.git
   
2. Navigate to the project directory:
   ```bash
   cd mind-fusion

3. Backend Setup
   ```bash
   cd Back-end
   npm install
   cp .env.example .env
   npm run dev
   Backend runs at: http://localhost:3000

5. Frontend Setup
   ```bash
   cd Front-end
   npm install
   cp .env.example .env
   npm start

7. Run App
   ```bash
   npm run android
   # or
   npm run ios

## Technologies Used
### Frontend
- **React Native**
- **React Navigation**
- **Axios**
- **AsyncStorage**
- **TypeScript**

### Backend
- **Node.js + Express**
- **JWT Authentication**
- **PostgreSQL**
- **bcryptjs**
- **express-validator**

### Database
- **MySql**
- **14 normalized tables**
- **Row Level Security (RLS)**

## API Overview
- **Auth (Register/Login/Profile)**

- **Drink Tracking**

- **Mood Tracking**

- **Trigger Tracking**

- **Gamification System**

- **Daily Tasks**

- **Progress Reports**

- **SOS Support**

- **Settings**

## Gamification System
- **Points System**: Earn points for sobriety & tasks

- **Levels**: 7 progression stages (Beginner → Sober Hero)

- **Badges**: 15+ achievements

- **Streak Rewards**: Bonus for consistency

## Contributing
- **Fork repo**

- **Create feature branch**

- **Commit changes**

- **Push branch**

- **Open PR**

Built with ❤️ for recovery, wellness & behavior change through gamification.
