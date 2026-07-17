# Khmer DateTime Web App

This is a web application demonstrating the capabilities of the [`@pphatdev/format-datetime`](https://github.com/pphatdev/format-datetime) library. It provides interactive tools for working with Cambodian date and time formats, including a fully synchronized Khmer Lunar Calendar.

## Features

- **Khmer Lunar Calendar**: A fully interactive calendar synchronized with the Khmer lunar cycle.
- **Date/Time Formatting**: Demonstrates various formatting options for Cambodian dates, times, and numbers.
- **Dark/Light Mode**: Full support for system and user-toggled themes.
- **Responsive Design**: Built with modern web practices, responsive on mobile devices and desktops.

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Lucide React](https://lucide.dev) - Icons
- [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support
- [@pphatdev/format-datetime](https://github.com/pphatdev/format-datetime) - Core library for Khmer date/time manipulation

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

The main entry points are:
- `src/app/page.tsx`: The home page for date/time formatting.
- `src/app/calendar/page.tsx`: The Khmer Lunar Calendar page.
- `src/components/`: Reusable React components including the calendar widgets.

## Deployment

This app can be deployed anywhere Next.js is supported, such as [Vercel](https://vercel.com).
