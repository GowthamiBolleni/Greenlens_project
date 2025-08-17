import os, json, time
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DATA_FILE = "data.json"

# Load/save helper
def load_data():
    if not os.path.exists(DATA_FILE):
        return {
            "user": {"name": "You", "ecoPoints": 0, "co2Saved": 0, "history": []},
            "leaderboard": []
        }
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# Load YOLO model
MODEL_PATH = "weights/best.pt"
model = YOLO(MODEL_PATH)

# Class info
CLASS_MAP = {
    "plastic":   {"info": "Rinse and dry before recycling.", "co2": 5},
    "glass":     {"info": "Remove labels and lids.", "co2": 8},
    "paper":     {"info": "Break down boxes, keep clean/dry.", "co2": 3},
    "metal":     {"info": "Recycle cans and foils.", "co2": 12},
    "cardboard": {"info": "Flatten before recycling.", "co2": 4},
    "trash":     {"info": "Not recyclable. Dispose responsibly.", "co2": 0},
    "e-waste":   {"info": "Drop off at e-waste centers.", "co2": 20},
}

# --- API ---

@app.route('/api/scan', methods=['POST'])
def scan_item():
    data = load_data()

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        results = model(file_path)
        probs = results[0].probs

        if probs is None:
            return jsonify({"type": "Unknown", "info": "Could not classify item.", "co2": 0})

        class_id = int(probs.top1)
        class_name = model.names[class_id]

        class_info = CLASS_MAP.get(class_name.lower(),
                                   {"info": "Unknown item. Please check manually.", "co2": 0})

        # --- Update user history + points ---
        eco_points = 20  # fixed points per classification
        co2_saved = class_info["co2"]

        data["user"]["ecoPoints"] += eco_points
        data["user"]["co2Saved"] += co2_saved
        data["user"]["history"].append({
            "type": class_name,
            "info": class_info["info"],
            "co2": co2_saved,
            "points": eco_points,
            "timestamp": int(time.time())
        })

        # --- Update leaderboard ---
        user_found = False
        for entry in data["leaderboard"]:
            if entry["name"] == data["user"]["name"]:
                entry["points"] += eco_points
                user_found = True
                break
        if not user_found:
            data["leaderboard"].append({"name": data["user"]["name"], "points": eco_points})

        data["leaderboard"] = sorted(data["leaderboard"], key=lambda x: x["points"], reverse=True)

        save_data(data)

        return jsonify({
            "type": class_name,
            "info": class_info["info"],
            "co2": co2_saved,
            "points": eco_points
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user', methods=['GET'])
def get_user():
    data = load_data()
    return jsonify(data["user"])

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    data = load_data()
    return jsonify(data["leaderboard"])

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
