# Medical Debt Collection System - Frontend

A modern, professional React TypeScript frontend for the medical debt collection voice agent system.

## Features

- 📊 **Professional Dashboard** - Real-time metrics and activity monitoring
- 📤 **Excel Data Upload** - Drag & drop file upload with validation
- 👥 **Patient Management** - Comprehensive patient data management
- 📞 **Call Campaigns** - Automated calling campaign management
- 📈 **Reports & Analytics** - Detailed reporting and analytics
- 🎨 **Modern UI/UX** - Material-UI components with professional styling
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔒 **Type Safety** - Full TypeScript implementation

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Material-UI (MUI)** - Professional component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Dropzone** - File upload functionality
- **Chart.js** - Data visualization
- **Socket.IO** - Real-time updates

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── DataUpload.tsx
│   │   ├── PatientManagement.tsx
│   │   ├── CallCampaigns.tsx
│   │   └── Reports.tsx
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Features Overview

### Dashboard
- Real-time metrics display
- Key performance indicators
- Recent activity feed
- Progress tracking

### Data Upload
- Drag & drop Excel file upload
- File validation and processing
- Upload history tracking
- Data preview functionality
- Error reporting and validation results

### Patient Management
- Patient data grid
- Search and filtering
- Patient details view
- Communication history

### Call Campaigns
- Campaign creation and management
- Automated scheduling
- Progress monitoring
- Success rate tracking

### Reports & Analytics
- Collection performance metrics
- Call outcome analysis
- Financial reporting
- Exportable reports

## Styling and Theming

The application uses Material-UI's theming system with a professional healthcare-focused color scheme:

- **Primary Color**: Blue (#1976d2)
- **Secondary Color**: Red (#dc004e)
- **Background**: Light gray (#f5f5f5)
- **Cards**: White with subtle shadows
- **Typography**: Roboto font family

## API Integration

The frontend is designed to integrate with the FastAPI backend. API service files will be created in the `src/services/` directory to handle:

- Patient data management
- Call campaign operations
- File upload processing
- Real-time notifications
- Authentication

## Development Notes

- All components are built with TypeScript for type safety
- Material-UI components are used for consistent styling
- Responsive design ensures mobile compatibility
- Professional color scheme and typography
- Error handling and loading states included

## Future Enhancements

- Real-time dashboard updates with WebSocket
- Advanced data grid with sorting and filtering
- Chart.js integration for analytics
- Export functionality for reports
- User authentication and authorization
- Mobile app support
- Offline capability

## Contributing

This frontend is part of a medical debt collection system. Please ensure all changes maintain HIPAA compliance and professional standards.
