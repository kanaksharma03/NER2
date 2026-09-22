# NER-DRISHTI

### Landslide Early Warning & Decision-Support Platform for the North Eastern Region

NER-DRISHTI is a software-based landslide risk monitoring and decision-support prototype designed for the North Eastern Region of India.

The platform combines environmental indicators, terrain context, historical information and risk analytics to help authorities understand:

**What is the risk? → Where is it? → Why is it happening? → What action should be taken?**

---

## Key Capabilities

* 🗺️ **GIS-based Risk Visualization**

  * Interactive MapLibre-based risk map
  * Region-wise risk visualization
  * Risk severity classification

* 📊 **Landslide Risk Assessment**

  * Risk probability and severity
  * Location-specific risk details
  * Contributing-factor explanation

* 🌧️ **Weather & Environmental Monitoring**

  * Rainfall telemetry
  * Soil-moisture information
  * Weather-driven risk context

* 🚨 **Alert & Priority Management**

  * Risk-based alerts
  * Severity filtering
  * Alert acknowledgement workflow

* 🛣️ **Infrastructure Impact**

  * Impacted road identification
  * Risk-aware route information
  * Infrastructure-focused decision support

* 📸 **Citizen Reporting**

  * Geo-tagged field reports
  * Photo-based reporting workflow
  * Reports available for authority review

* 🔄 **Historical Risk Replay**

  * Historical risk visualization
  * Timeline-based replay for analysis

* 🌧️ **Rainfall Simulation**

  * Authority-side rainfall scenario simulation
  * Supports what-if risk assessment

---

## System Workflow

```text
Environmental & Historical Data
              ↓
       Risk Assessment
              ↓
      Explain Risk Factors
              ↓
       Verify Information
              ↓
      Prioritise Locations
              ↓
        Recommend Action
```

The prototype follows a:

**Predict → Explain → Verify → Prioritise → Act**

decision-support workflow.

---

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* MapLibre GL
* HTML/CSS

### Backend

* Python
* FastAPI
* Uvicorn
* SQLAlchemy
* SQLite
* JWT-based authentication

### Data & Analytics

* Rainfall and weather information
* Soil-moisture information
* Terrain/contextual information
* Historical landslide information
* Risk-analysis heuristics
* Explainability-oriented risk factors

---

## Project Structure

```text
NER2/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── services/
│   ├── nerdrishti.db
│   └── ...
│
├── demo/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   ├── public/
│   └── ...
│
└── ...
```

---

## API

The backend exposes REST APIs used by the frontend, including:

```text
/api/v1/regions
/api/v1/risk/grid
/api/v1/risk
/api/v1/weather/current
/api/v1/alerts
/api/v1/roads-impacted
/api/v1/reports
/api/v1/reports/submit
/api/v1/routes/safe
/api/v1/history/replay
/api/v1/simulate/rain
/api/v1/token
```

Interactive API documentation is available through FastAPI Swagger UI when the backend is running:

```text
http://localhost:8000/docs
```

---

## Local Development

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd NER2
```

### 2. Run the Backend

```bash
cd backend
```

Create and activate a Python virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

## 3. Run the Frontend

Open another terminal:

```bash
cd demo
```

Install dependencies:

```bash
npm install
```

Create a `.env` file if required:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The Vite terminal will display the local frontend URL.

---

## Environment Variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL=sqlite+aiosqlite:///./nerdrishti.db
FRONTEND_URL=http://localhost:5173
SECRET_KEY=replace-with-a-random-secret
```

### Frontend

Create:

```text
demo/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Never commit real secrets or `.env` files to GitHub.**

---

## Deployment Architecture

The prototype is structured for separate frontend and backend deployment from the same repository.

```text
                    NER2 GitHub Repository
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        backend/                         demo/
              │                             │
              ▼                             ▼
          Railway                        Render
         FastAPI API                  React/Vite UI
              │                             │
              └────────── HTTPS ────────────┘
```

### Backend

Deployment target:

**Railway**

Root directory:

```text
/backend
```

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend

Deployment target:

**Render**

Root directory:

```text
/demo
```

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
dist
```

Frontend environment variable:

```env
VITE_API_BASE_URL=<RAILWAY_BACKEND_URL>
```

Backend environment variable:

```env
FRONTEND_URL=<RENDER_FRONTEND_URL>
```

---

## Prototype Scope

NER-DRISHTI is currently a **software prototype** intended to demonstrate the end-to-end decision-support workflow.

The prototype demonstrates:

* Risk visualization
* Environmental telemetry
* Risk explanation
* Alerts
* Infrastructure impact
* Citizen reporting
* Historical replay
* Scenario simulation
* Safe-route information
* Authority-oriented decision support

Some components are represented through prototype/heuristic logic and are intended for further validation, calibration and integration with authoritative operational datasets in a production deployment.

---

## Future Scope

Potential future development includes:

* Integration with additional authoritative government datasets
* Higher-resolution terrain and satellite data
* Improved model training and validation
* Real-time sensor integration
* Advanced landslide forecasting
* Automated alert dissemination
* Scalable geospatial infrastructure
* Production-grade persistent databases and object storage
* Wider deployment across North Eastern states

---

## Team

**NER-DRISHTI**

Developed as a Smart India Hackathon software prototype.

---

## Disclaimer

NER-DRISHTI is a prototype decision-support system developed for demonstration and evaluation purposes.

Risk outputs and simulated scenarios should not be treated as official disaster warnings or operational forecasts without appropriate validation, calibration and integration with authorized disaster-management systems.

---

## License

This project is currently developed as an academic/hackathon prototype.

Licensing and reuse terms may be added as the project moves beyond the prototype stage.
