# App Time Tracker

A desktop application that tracks and displays the time spent on different applications and websites. Built with Electron for cross-platform compatibility.

## Features

- Tracks active application usage time
- Displays application-specific statistics
- Shows domain-specific tracking for web browsers
- Scrollable interface for viewing extensive usage data
- Draggable window for easy positioning
- Clean, minimal interface

## Installation

1. Clone the repository:

```bash
git clone https://github.com/niwatoro/app-time-tracker.git
cd app-time-tracker
```

2. Install dependencies:

```bash
npm install
```

## Usage

Start the application:

```bash
npm start
```

The app will display in a compact window showing:

- List of applications with usage time
- Browser domains visited with time spent
- Real-time updates as you switch between applications

## Development

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm (Comes with Node.js)

### Setup Development Environment

1. Install dependencies:

```bash
npm install
```

2. Start the app in development mode:

```bash
npm start
```

### Project Structure

- `main.js` - Main Electron process
- `render.js` - Renderer process handling UI updates
- `index.html` - Application UI structure and styling
