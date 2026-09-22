# NER-DRISHTI Frontend

**NER-DRISHTI** (North Eastern Region - Decision, Risk, and Insight System for Hazard Tracking and Intelligence) is an AI-powered Landslide Early-Warning and Decision-Support Platform built specifically for the North Eastern Region (NER) of India.

This repository contains the Frontend Command Center application, which delivers real-time situational awareness and actionable decision support for critical national highway corridors (e.g., NH-13, NH-10, and NH-6).

## 🌟 Key Features

1. **Geospatial Mapping & Risk Prediction**: High-resolution interactive GIS map (powered by MapLibre GL JS) overlaying corridor-aligned terrain grids with predictive risk probabilities and severity ratings (Low, Moderate, High, Critical).
2. **Explainable AI (XAI)**: Visualizes the driving factors behind risk predictions for specific grid cells using SHAP-like contribution charts.
3. **Actionable Operations & Routing**: Identifies impacted road segments, suggests safe alternate evacuation routes, and manages incident reports and alerts.
4. **Historical Replay & Rain Simulation**: Allows operators to simulate rain spike conditions and replay past historical landslide events for training and analysis.

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Maps**: [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- **Styling**: Vanilla CSS (with responsive design tokens)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone this repository (if you haven't already).
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server:

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173`. 
*(Note: Ensure your backend is running at `http://localhost:8001` or set the appropriate `VITE_API_BASE_URL` in your `.env` file for live data, otherwise the app will gracefully fall back to mock data.)*

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The optimized assets will be generated in the `dist` folder.

## 📂 Project Structure

- `src/api/`: API client configurations, mock data fallbacks, and service hooks.
- `src/components/`: Reusable UI components (Risk Map, Sidebars, Alerts, etc.).
- `src/context/`: Global React Contexts (e.g., `OperationalContext` for managing global state and data fetching).
- `src/utils/`: Helper functions for geo-processing, risk calculations, and formatting.
- `public/`: Static assets (fonts, icons, raw datasets).
- `docs/` & `*.md`: Extensive architectural and system knowledge documentation.

## 📚 Documentation

For a deeper dive into the system architecture, API schemas, and backend specifications, refer to the included markdown files:
- `PROJECT_KNOWLEDGE.md`
- `NER-DRISHTI_Build_Spec.md`
- `NER-DRISHTI_Frontend_Build_Spec.md`
- `backend_knowledge.md`
