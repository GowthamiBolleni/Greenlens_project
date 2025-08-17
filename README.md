# 🌱 GreenLens+ – AI Waste Scanner

GreenLens+ is an **AI-powered waste classification system** designed to promote responsible waste disposal and sustainability.  
Users can upload or capture images of waste items, and the system automatically classifies them into categories such as **plastic, glass, paper, cardboard, metal, trash, and e-waste**.  

Beyond classification, the app motivates sustainable behavior through **eco-points**, **leaderboards**, **user history tracking**, and **recycling center suggestions**.  

---

## ✨ Features

- 📷 **AI Classification (YOLOv8)** – Upload/capture waste images and classify them.  
- 🎯 **Eco-Points System** – Earn points + CO₂ savings for every classification.  
- 🏆 **Leaderboard** – Compete with other eco-friendly users.  
- 📜 **User History** – See your past scans, points, and CO₂ saved.  
- 📍 **Recycling Centers** – Find nearby recycling locations.  

---

## 🛠 Tech Stack

### Frontend
- React (Vite + Tailwind CSS)  
- Lucide-react (icons)  

### Backend
- Python Flask (API)  
- YOLOv8 (Ultralytics) – trained on TACO/TrashNet  
- JSON file storage (`data.json`) for user history & leaderboard  

---

## 📂 Project Structure
greenlens-pro/
│
├── greenlens-frontend/ # React frontend
│ ├── src/
│ │ ├── App.jsx # Main React app
│ │ ├── index.css # Tailwind styles
│ │ └── main.jsx # Entry point
│ ├── tailwind.config.js # Tailwind config
│ ├── vite.config.js # Vite config
│ └── package.json
│
├── greenlens-backend/ # Flask backend
│ ├── app.py # Flask app with YOLOv8 integration
│ ├── weights/ # Folder containing best.pt
│ ├── uploads/ # Uploaded user images
│ └── data.json # User history + leaderboard storage
│
└── README.md # Project documentation
## ⚙️ Installation & Execution

### 1. Clone the repo
```bash
git clone https://github.com/your-username/greenlens-pro.git
cd greenlens-pro
###
2. Backend Setup
Create and activate virtual environment
cd greenlens-backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

Install dependencies

Create a requirements.txt with:

flask
flask-cors
ultralytics
opencv-python
pillow


Then install:

pip install -r requirements.txt

Add model weights

Place your trained YOLOv8 model in:

greenlens-backend/weights/best.pt

Run the backend
python app.py


By default it runs at:

http://localhost:5000

3. Frontend Setup
Install dependencies
cd ../greenlens-frontend
npm install

Run frontend
npm run dev


Frontend runs at:

http://localhost:5173

🔗 API Endpoints

POST /api/scan → Upload an image & classify waste

GET /api/user → Get user profile (ecoPoints, CO₂ saved, history)

GET /api/leaderboard → Get leaderboard

📊 Example Workflow

User uploads an image → Backend classifies (e.g., Plastic bottle).

Eco-Points are awarded → User earns +10 points, saves 2kg CO₂.

History updates → Scan details saved in data.json.

Leaderboard updates → User ranking recalculated.

User can view:

Dashboard → Eco points + CO₂

Leaderboard → Compare with others

History → Past scans with details

Recycling Centers → Suggestions

📸 Screenshots (Add Later)

Dashboard view

Scan results

Leaderboard

History page

🏅 Contribution

Fork this repo

Create a new branch (git checkout -b feature/new-feature)

Commit your changes (git commit -m 'Add new feature')

Push the branch (git push origin feature/new-feature)

Open a Pull Request

📜 License

This project is licensed under the MIT License – feel free to use, modify, and share.

💡 GreenLens+ was built for hackathons & real-world sustainability initiatives. 🌍


---

👉 Do you want me to also generate a **sample `data.json`** file (with user profile, leaderboard, and history

