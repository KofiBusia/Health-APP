"""
VitalAge Health App — Flask/Python version
Run: python app.py
"""
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import json, os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "vitalage-dev-secret-2026")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///vitalage.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ─── Models ──────────────────────────────────────────────────────────────────

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.String(100), nullable=False)
    dob      = db.Column(db.Date, nullable=False)
    gender   = db.Column(db.String(10), nullable=False)
    goals    = db.Column(db.Text, default="[]")   # JSON list
    joined   = db.Column(db.DateTime, default=datetime.utcnow)
    logs     = db.relationship("DailyLog", backref="user", lazy=True)

    @property
    def age(self):
        today = date.today()
        return today.year - self.dob.year - (
            (today.month, today.day) < (self.dob.month, self.dob.day)
        )

    @property
    def goals_list(self):
        return json.loads(self.goals or "[]")


class DailyLog(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    user_id   = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    log_date  = db.Column(db.Date, nullable=False, default=date.today)
    water_ml  = db.Column(db.Integer, default=0)
    energy    = db.Column(db.Integer, default=5)
    habits    = db.Column(db.Text, default="{}")  # JSON {habit: bool}
    waist_cm  = db.Column(db.Float, nullable=True)
    weight_kg = db.Column(db.Float, nullable=True)
    notes     = db.Column(db.Text, default="")

    @property
    def habits_dict(self):
        return json.loads(self.habits or "{}")

    def health_score(self):
        h = self.habits_dict
        completed = sum(1 for v in h.values() if v)
        habit_pts = min(completed * 8.5, 60)
        water_pts = min((self.water_ml / 2500) * 20, 20)
        energy_pts = (self.energy / 10) * 20
        return int(habit_pts + water_pts + energy_pts)

# ─── Health data ─────────────────────────────────────────────────────────────

HABITS = [
    "Intermittent Fasting",
    "Morning Exercise",
    "No Alcohol",
    "Herbal Tea",
    "Vegetables",
    "No Processed Food",
    "10,000 Steps",
]

AGE_DATA = {
    "20s": {
        "range": (13, 29),
        "alert_title": "Build Your Foundation",
        "alert_msg": "Your 20s set the metabolic baseline for life. Prioritise sleep, strength training, and avoiding processed foods.",
        "screenings": ["Blood pressure check", "Dental exam", "Eye test", "STI screening"],
        "tips": [
            "Sleep 7–9 hours — growth hormone peaks during deep sleep in your 20s.",
            "Build bone density now with weight-bearing exercise.",
            "Limit sugar intake to prevent insulin resistance later.",
            "Establish a consistent wake time even on weekends.",
        ],
    },
    "30s": {
        "range": (30, 39),
        "alert_title": "Metabolism Shifts Here",
        "alert_msg": "Metabolism slows ~2% per decade from 30. Strength training preserves muscle mass and keeps your resting burn high.",
        "screenings": ["Cholesterol panel", "Blood glucose", "Blood pressure", "Skin check"],
        "tips": [
            "Resistance training 3×/week counters the natural muscle loss starting in your 30s.",
            "Stress management is critical — cortisol disrupts sleep, weight, and immunity.",
            "Add omega-3s: tilapia, sardines, walnuts twice a week.",
            "Annual fasting blood glucose check — prediabetes is reversible if caught early.",
        ],
    },
    "40s": {
        "range": (40, 49),
        "alert_title": "Your Most Critical Decade",
        "alert_msg": "Cardiovascular risk rises sharply in your 40s. Waist circumference, blood pressure, and fasting glucose are the three numbers to own.",
        "screenings": [
            "Full lipid panel (annually)",
            "Fasting blood glucose (annually)",
            "Blood pressure (every 6 months)",
            "Colonoscopy screening discussion",
            "Eye pressure check (glaucoma risk)",
            "Prostate / cervical screening",
        ],
        "tips": [
            "Keep waist under 94 cm (men) or 80 cm (women) — visceral fat drives inflammation.",
            "Intermittent fasting 16:8 is highly effective for metabolic reset in your 40s.",
            "Cut alcohol to ≤2 drinks/week — liver metabolism slows and cancer risk rises.",
            "Strength train to prevent sarcopenia — you lose 3–8% muscle per decade after 30.",
            "Prioritise magnesium and vitamin D — deficiency is near-universal in Ghana.",
            "Annual eye exam — glaucoma prevalence is highest among West Africans.",
        ],
    },
    "50s": {
        "range": (50, 59),
        "alert_title": "Protect Your Heart & Bones",
        "alert_msg": "Cardiac events and bone fractures peak in the 50s. Manage cholesterol actively and add weight-bearing exercise for bone density.",
        "screenings": [
            "Colonoscopy",
            "Mammogram / prostate PSA",
            "DEXA bone density scan",
            "Cardiac stress test if risk factors",
            "Full metabolic panel",
        ],
        "tips": [
            "Calcium and vitamin D are critical for bone health post-50.",
            "Mediterranean-style eating reduces cardiac events by ~30%.",
            "Social connection is as protective as not smoking — prioritise relationships.",
            "Annual comprehensive blood panel including thyroid function.",
        ],
    },
    "60s": {
        "range": (60, 110),
        "alert_title": "Longevity Mode",
        "alert_msg": "Falls, cognitive decline, and social isolation are the top risks after 60. Balance training, mental stimulation, and community are your medicine.",
        "screenings": [
            "Annual comprehensive metabolic panel",
            "Vision and hearing",
            "Fall-risk assessment",
            "Cognitive screening",
            "Pneumonia & flu vaccines",
        ],
        "tips": [
            "Balance exercises (single-leg stands, tai chi) reduce fall risk by 30–50%.",
            "Protein intake should rise to 1.2–1.6g/kg to prevent muscle wasting.",
            "Mental activity — reading, chess, new skills — delays cognitive decline.",
            "Stay socially active: isolation increases dementia risk as much as heavy smoking.",
        ],
    },
}

FOOD_DATA = {
    "eat": {
        "Proteins": ["Tilapia", "Chicken breast", "Beans & lentils", "Eggs", "Groundnuts"],
        "Vegetables": ["Kontomire (cocoyam leaves)", "Okra", "Garden eggs", "Avocado", "Tomatoes"],
        "Complex Carbs": ["Oats", "Brown rice", "Sweet potato", "Plantain (boiled)", "Yam"],
        "Superfoods": ["Water (3L/day)", "Green tea", "Ginger tea", "Moringa", "Turmeric"],
    },
    "avoid": {
        "Sugary Drinks": ["Fizzy sodas", "Malt drinks", "Fruit juice (bottled)", "Energy drinks"],
        "Alcohol": ["Beer", "Akpeteshie / bitters", "Spirits", "Wine (limit to 1/week)"],
        "Processed Foods": ["Kelewele (fried)", "Chin-chin", "Instant noodles", "Fast food"],
        "Excess Salt": ["Seasoning cubes (Maggi, Royco)", "Salted crackers", "Canned soups"],
    },
    "schedule": [
        {"time": "6:00 AM", "label": "Wake & hydrate", "detail": "2 glasses of warm water + ginger"},
        {"time": "7:00 AM", "label": "Exercise window", "detail": "30–45 min before breaking fast"},
        {"time": "10:00 AM", "label": "Break fast (16:8)", "detail": "High-protein first meal"},
        {"time": "1:00 PM", "label": "Lunch", "detail": "Largest meal of the day"},
        {"time": "5:30 PM", "label": "Last meal", "detail": "Light — finish eating by 6 PM"},
        {"time": "8:00 PM", "label": "Herbal wind-down", "detail": "Ginger or chamomile tea"},
        {"time": "10:00 PM", "label": "Sleep target", "detail": "7–9 hours minimum"},
    ],
    "shopping": [
        "Oats (large bag)", "Brown rice", "Sweet potatoes", "Yam",
        "Tilapia (fresh or frozen)", "Chicken breast", "Eggs (tray)",
        "Beans (dry)", "Groundnuts (unsalted)", "Avocados",
        "Kontomire / spinach", "Okra", "Garden eggs", "Tomatoes", "Onions",
        "Ginger root", "Garlic", "Moringa powder", "Turmeric",
        "Green tea bags", "Extra virgin olive oil",
    ],
}

def get_age_tier(age):
    for tier, data in AGE_DATA.items():
        lo, hi = data["range"]
        if lo <= age <= hi:
            return tier, data
    return "40s", AGE_DATA["40s"]

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    user_id = session.get("user_id")
    if user_id:
        user = db.session.get(User, user_id)
        if user:
            return redirect(url_for("dashboard"))
    return render_template("onboarding.html")


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    name   = (data.get("name") or "").strip()
    dob_s  = data.get("dob", "")
    gender = data.get("gender", "")
    goals  = data.get("goals", [])

    if not name:
        return jsonify({"ok": False, "error": "Name is required"}), 400
    try:
        dob = datetime.strptime(dob_s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify({"ok": False, "error": "Invalid date"}), 400

    age = date.today().year - dob.year - (
        (date.today().month, date.today().day) < (dob.month, dob.day)
    )
    if not (13 <= age <= 110):
        return jsonify({"ok": False, "error": "Age must be 13–110"}), 400
    if gender not in ("Male", "Female"):
        return jsonify({"ok": False, "error": "Select a gender"}), 400

    user = User(name=name, dob=dob, gender=gender, goals=json.dumps(goals))
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify({"ok": True, "redirect": url_for("dashboard")})


@app.route("/dashboard")
def dashboard():
    user = _get_user()
    if not user:
        return redirect(url_for("index"))
    tier, tier_data = get_age_tier(user.age)
    today_log = DailyLog.query.filter_by(user_id=user.id, log_date=date.today()).first()
    score = today_log.health_score() if today_log else 0
    water = today_log.water_ml if today_log else 0
    energy = today_log.energy if today_log else 5
    habits = today_log.habits_dict if today_log else {}
    tip_index = 0
    tips = tier_data["tips"]
    return render_template(
        "dashboard.html",
        user=user,
        tier=tier,
        tier_data=tier_data,
        score=score,
        water=water,
        energy=energy,
        habits=habits,
        all_habits=HABITS,
        tips=tips,
        tip=tips[tip_index],
        food=FOOD_DATA,
        now_hour=datetime.now().hour,
    )


@app.route("/api/log", methods=["POST"])
def save_log():
    user = _get_user()
    if not user:
        return jsonify({"ok": False, "error": "Not logged in"}), 401
    data = request.get_json()
    log = DailyLog.query.filter_by(user_id=user.id, log_date=date.today()).first()
    if not log:
        log = DailyLog(user_id=user.id, log_date=date.today())
        db.session.add(log)
    log.water_ml  = int(data.get("water_ml", 0))
    log.energy    = int(data.get("energy", 5))
    log.habits    = json.dumps(data.get("habits", {}))
    log.waist_cm  = data.get("waist_cm") or None
    log.weight_kg = data.get("weight_kg") or None
    log.notes     = data.get("notes", "")
    db.session.commit()
    return jsonify({"ok": True, "score": log.health_score()})


@app.route("/api/quick_water", methods=["POST"])
def quick_water():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401
    log = _get_or_create_log(user)
    log.water_ml = min(log.water_ml + 250, 5000)
    db.session.commit()
    return jsonify({"ok": True, "water_ml": log.water_ml, "score": log.health_score()})


@app.route("/api/quick_habit", methods=["POST"])
def quick_habit():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401
    habit = request.get_json().get("habit", "")
    log = _get_or_create_log(user)
    h = log.habits_dict
    h[habit] = not h.get(habit, False)
    log.habits = json.dumps(h)
    db.session.commit()
    return jsonify({"ok": True, "state": h[habit], "score": log.health_score()})


@app.route("/api/progress")
def progress():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401
    from datetime import timedelta
    days = []
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        log = DailyLog.query.filter_by(user_id=user.id, log_date=d).first()
        days.append({
            "date": d.strftime("%d %b"),
            "score": log.health_score() if log else 0,
            "water": log.water_ml if log else 0,
            "energy": log.energy if log else 0,
        })
    # streak
    streak = 0
    for i in range(0, 365):
        d = date.today() - timedelta(days=i)
        log = DailyLog.query.filter_by(user_id=user.id, log_date=d).first()
        if log and (log.water_ml > 0 or sum(log.habits_dict.values())):
            streak += 1
        else:
            break
    total_logged = DailyLog.query.filter_by(user_id=user.id).count()
    avg_energy = db.session.query(
        db.func.avg(DailyLog.energy)
    ).filter_by(user_id=user.id).scalar() or 0

    # habit consistency (last 30 days)
    from datetime import timedelta as td
    habit_counts = {h: 0 for h in HABITS}
    logs_30 = DailyLog.query.filter(
        DailyLog.user_id == user.id,
        DailyLog.log_date >= date.today() - td(days=30)
    ).all()
    for l in logs_30:
        for h, v in l.habits_dict.items():
            if v and h in habit_counts:
                habit_counts[h] += 1
    total_days = max(len(logs_30), 1)
    habit_pct = {h: round(c / total_days * 100) for h, c in habit_counts.items()}

    # body metrics
    metrics = []
    for l in DailyLog.query.filter_by(user_id=user.id).order_by(DailyLog.log_date.desc()).limit(10).all():
        if l.waist_cm or l.weight_kg:
            metrics.append({
                "date": l.log_date.strftime("%d %b"),
                "waist": l.waist_cm,
                "weight": l.weight_kg,
            })

    return jsonify({
        "ok": True,
        "days": days,
        "streak": streak,
        "total_logged": total_logged,
        "avg_energy": round(float(avg_energy), 1),
        "habit_pct": habit_pct,
        "metrics": metrics,
    })


@app.route("/api/tip")
def next_tip():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401
    idx  = int(request.args.get("idx", 0))
    _, tier_data = get_age_tier(user.age)
    tips = tier_data["tips"]
    idx  = (idx + 1) % len(tips)
    return jsonify({"ok": True, "tip": tips[idx], "idx": idx})


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    name  = (data.get("name") or "").strip()
    dob_s = data.get("dob", "")
    try:
        dob = datetime.strptime(dob_s, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return jsonify({"ok": False, "error": "Invalid date"}), 400
    user = User.query.filter(
        db.func.lower(User.name) == name.lower(),
        User.dob == dob
    ).first()
    if not user:
        return jsonify({"ok": False, "error": "No account found. Check your name and date of birth."}), 404
    session["user_id"] = user.id
    return jsonify({"ok": True, "redirect": url_for("dashboard")})


@app.route("/api/reset", methods=["POST"])
def reset():
    user = _get_user()
    if user:
        DailyLog.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
    session.clear()
    return jsonify({"ok": True})


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _get_user():
    uid = session.get("user_id")
    return db.session.get(User, uid) if uid else None


def _get_or_create_log(user):
    log = DailyLog.query.filter_by(user_id=user.id, log_date=date.today()).first()
    if not log:
        log = DailyLog(user_id=user.id, log_date=date.today())
        db.session.add(log)
        db.session.flush()
    return log


# ─── Init & run ──────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
