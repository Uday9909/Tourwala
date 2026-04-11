# 🌍 TouriSense AI: Tourist Footfall Forecasting System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

TouriSense AI is an intelligent forecasting engine designed to predict and manage tourist footfall at various locations. By leveraging machine learning models (Gradient Boosting & Random Forest), the system provides actionable insights for city administrators and tourists to optimize travel experiences and manage capacity effectively.

---

## 🚀 Key Features

- **Predictive Analytics**: High-accuracy footfall forecasting using historical data and seasonal trends.
- **Surge Alerts**: Automated warnings for predicted overcrowding at specific tourist spots.
- **Risk Assessment**: Categorization of risk levels (Low, Medium, High) based on capacity utilization and visitor counts.
- **City Recommendations**: Smart engine that suggests alternative "Best Cities" to visit and warns about locations to avoid during surges.
- **Interactive Dashboard**: A modern React-based frontend with real-time weather integration and data visualization.

---

## 🛠 Tech Stack

### Backend (AI & API)
- **Language**: Python 3.x
- **Framework**: FastAPI
- **ML Models**: 
  - **Gradient Boosting**: Primary forecasting engine.
  - **Random Forest**: Baseline comparative model.
- **Data Engineering**: Pandas, NumPy, Scikit-learn.

### Frontend
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (Modern, Responsive Design)
- **State Management**: Built-in React Hooks

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js & npm

### Backend Setup
1. Navigate to the root directory.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the API server:
   ```bash
   python api.py
   # or
   uvicorn api:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check API status & readiness |
| `GET` | `/spots` | List all available tourist spots |
| `GET` | `/predict/{spot}` | Get footfall prediction for a specific spot |
| `POST` | `/simulate/{spot}` | Simulate footfall based on custom weather/holiday scenarios |
| `GET` | `/history/{spot}` | Fetch historical visitor data |

---

## 📂 Project Structure

```text
├── api.py           # FastAPI Production Entry Point
├── main.py          # CLI Forecasting Pipeline
├── dataset.csv      # Raw Historical Data
├── models/          # Persistent ML Object Dumps (*.pkl)
├── frontend/        # React Application
└── requirements.txt # Python Dependencies
```

---

## 🤝 Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License
[MIT](https://choosealicense.com/licenses/mit/)
