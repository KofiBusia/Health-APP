"""
VitalAge Health App — Flask/Python version
Run: python app.py
"""
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, Response
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
import json, os, csv, io

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "vitalage-dev-secret-2026")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///vitalage.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
app.jinja_env.globals["_bp_label"] = lambda s, d: _bp_label(s, d)

# ─── Models ──────────────────────────────────────────────────────────────────

class User(db.Model):
    id              = db.Column(db.Integer, primary_key=True)
    name            = db.Column(db.String(100), nullable=False)
    dob             = db.Column(db.Date, nullable=False)
    gender          = db.Column(db.String(10), nullable=False)
    goals           = db.Column(db.Text, default="[]")
    joined          = db.Column(db.DateTime, default=datetime.utcnow)
    height_cm       = db.Column(db.Float, nullable=True)
    blood_type      = db.Column(db.String(5), default="")
    allergies       = db.Column(db.Text, default="")
    emergency_name  = db.Column(db.String(100), default="")
    emergency_phone = db.Column(db.String(20), default="")
    logs            = db.relationship("DailyLog", backref="user", lazy=True)

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
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    log_date      = db.Column(db.Date, nullable=False, default=date.today)
    water_ml      = db.Column(db.Integer, default=0)
    energy        = db.Column(db.Integer, default=5)
    habits        = db.Column(db.Text, default="{}")
    waist_cm      = db.Column(db.Float, nullable=True)
    weight_kg     = db.Column(db.Float, nullable=True)
    notes         = db.Column(db.Text, default="")
    sleep_hours   = db.Column(db.Float, nullable=True)
    sleep_quality = db.Column(db.Integer, nullable=True)   # 1–5
    mood          = db.Column(db.Integer, nullable=True)   # 1–10
    bp_systolic   = db.Column(db.Integer, nullable=True)
    bp_diastolic  = db.Column(db.Integer, nullable=True)
    heart_rate    = db.Column(db.Integer, nullable=True)
    glucose_mg    = db.Column(db.Float, nullable=True)
    calories_in   = db.Column(db.Integer, default=0)

    @property
    def habits_dict(self):
        return json.loads(self.habits or "{}")

    def health_score(self):
        h = self.habits_dict
        completed  = sum(1 for v in h.values() if v)
        habit_pts  = min(completed * 6, 42)
        water_pts  = min((self.water_ml / 2500) * 18, 18)
        energy_pts = ((self.energy or 5) / 10) * 15
        sleep_hrs  = self.sleep_hours or 0
        sleep_pts  = min((sleep_hrs / 8) * 15, 15) if sleep_hrs else 0
        mood_pts   = (((self.mood or 5) - 1) / 9) * 10
        return min(int(habit_pts + water_pts + energy_pts + sleep_pts + mood_pts), 100)


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


def _bp_label(sys, dia):
    if not sys or not dia:
        return ""
    if sys < 120 and dia < 80:
        return "✅ Normal BP"
    if sys < 130 and dia < 80:
        return "⚠️ Elevated"
    if sys < 140 or dia < 90:
        return "⚠️ High Stage 1"
    return "🔴 High Stage 2 — see a doctor"


def _bmi(weight_kg, height_cm):
    if not weight_kg or not height_cm:
        return None
    h = height_cm / 100
    return round(weight_kg / (h * h), 1)


def _bmi_label(bmi):
    if bmi is None:
        return ""
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Healthy"
    if bmi < 30:
        return "Overweight"
    return "Obese"


def _get_achievements(logs_all, streak):
    total = len(logs_all)
    earned = []
    if total >= 1:
        earned.append({"badge": "🌱", "name": "First Log", "desc": "Logged your first day"})
    if streak >= 3:
        earned.append({"badge": "🔥", "name": "3-Day Streak", "desc": "3 consecutive days"})
    if streak >= 7:
        earned.append({"badge": "🔥🔥", "name": "Week Warrior", "desc": "7-day streak"})
    if streak >= 30:
        earned.append({"badge": "🏆", "name": "Iron Will", "desc": "30-day streak"})
    if total >= 30:
        earned.append({"badge": "📊", "name": "Data Nerd", "desc": "30 days tracked"})
    for l in logs_all:
        if sum(1 for v in l.habits_dict.values() if v) == len(HABITS):
            earned.append({"badge": "💪", "name": "Habit Master", "desc": "All habits in one day"})
            break
    if sum(1 for l in logs_all[-7:] if l.water_ml >= 2000) >= 5:
        earned.append({"badge": "💧", "name": "Hydration Hero", "desc": "2L+ water, 5 of last 7 days"})
    if sum(1 for l in logs_all[-7:] if l.sleep_hours and l.sleep_hours >= 7) >= 5:
        earned.append({"badge": "😴", "name": "Sleep Champion", "desc": "7+ hrs sleep, 5 of last 7 days"})
    for l in logs_all:
        if l.health_score() >= 90:
            earned.append({"badge": "⭐", "name": "Perfect Day", "desc": "Health score 90+"})
            break
    return earned


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
    data   = request.get_json()
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
    score    = today_log.health_score() if today_log else 0
    water    = today_log.water_ml if today_log else 0
    energy   = today_log.energy if today_log else 5
    habits   = today_log.habits_dict if today_log else {}
    tips     = tier_data["tips"]

    bmi_val   = _bmi(today_log.weight_kg if today_log else None, user.height_cm)
    bmi_label = _bmi_label(bmi_val)

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
        tip=tips[0],
        food=FOOD_DATA,
        now_hour=datetime.now().hour,
        today_log=today_log,
        bmi_val=bmi_val,
        bmi_label=bmi_label,
    )


@app.route("/api/log", methods=["POST"])
def save_log():
    user = _get_user()
    if not user:
        return jsonify({"ok": False, "error": "Not logged in"}), 401
    data = request.get_json()
    log  = DailyLog.query.filter_by(user_id=user.id, log_date=date.today()).first()
    if not log:
        log = DailyLog(user_id=user.id, log_date=date.today())
        db.session.add(log)
    log.water_ml      = int(data.get("water_ml", 0))
    log.energy        = int(data.get("energy", 5))
    log.habits        = json.dumps(data.get("habits", {}))
    log.waist_cm      = data.get("waist_cm") or None
    log.weight_kg     = data.get("weight_kg") or None
    log.notes         = data.get("notes", "")
    log.sleep_hours   = data.get("sleep_hours") or None
    log.sleep_quality = data.get("sleep_quality") or None
    log.mood          = data.get("mood") or None
    log.bp_systolic   = data.get("bp_systolic") or None
    log.bp_diastolic  = data.get("bp_diastolic") or None
    log.heart_rate    = data.get("heart_rate") or None
    log.glucose_mg    = data.get("glucose_mg") or None
    log.calories_in   = int(data.get("calories_in", 0))
    db.session.commit()

    bmi_val   = _bmi(log.weight_kg, user.height_cm)
    bmi_label = _bmi_label(bmi_val)
    return jsonify({"ok": True, "score": log.health_score(), "bmi": bmi_val, "bmi_label": bmi_label})


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
    log   = _get_or_create_log(user)
    h     = log.habits_dict
    h[habit] = not h.get(habit, False)
    log.habits = json.dumps(h)
    db.session.commit()
    return jsonify({"ok": True, "state": h[habit], "score": log.health_score()})


@app.route("/api/progress")
def progress():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401

    days = []
    for i in range(6, -1, -1):
        d   = date.today() - timedelta(days=i)
        log = DailyLog.query.filter_by(user_id=user.id, log_date=d).first()
        days.append({
            "date":    d.strftime("%d %b"),
            "score":   log.health_score() if log else 0,
            "water":   log.water_ml if log else 0,
            "energy":  log.energy if log else 0,
            "sleep":   log.sleep_hours if log else 0,
            "mood":    log.mood if log else 0,
            "bp_sys":  log.bp_systolic if log else None,
            "bp_dia":  log.bp_diastolic if log else None,
            "hr":      log.heart_rate if log else None,
        })

    streak = 0
    for i in range(365):
        d   = date.today() - timedelta(days=i)
        log = DailyLog.query.filter_by(user_id=user.id, log_date=d).first()
        if log and (log.water_ml > 0 or sum(log.habits_dict.values())):
            streak += 1
        else:
            break

    logs_all    = DailyLog.query.filter_by(user_id=user.id).order_by(DailyLog.log_date).all()
    total_logged = len(logs_all)
    avg_energy  = db.session.query(db.func.avg(DailyLog.energy)).filter_by(user_id=user.id).scalar() or 0
    avg_sleep   = db.session.query(db.func.avg(DailyLog.sleep_hours)).filter_by(user_id=user.id).scalar()

    # Habit consistency (last 30 days)
    habit_counts = {h: 0 for h in HABITS}
    logs_30 = DailyLog.query.filter(
        DailyLog.user_id == user.id,
        DailyLog.log_date >= date.today() - timedelta(days=30)
    ).all()
    for l in logs_30:
        for h, v in l.habits_dict.items():
            if v and h in habit_counts:
                habit_counts[h] += 1
    total_days = max(len(logs_30), 1)
    habit_pct  = {h: round(c / total_days * 100) for h, c in habit_counts.items()}

    # Body metrics
    metrics = []
    for l in DailyLog.query.filter_by(user_id=user.id).order_by(DailyLog.log_date.desc()).limit(10).all():
        if l.waist_cm or l.weight_kg:
            bmi = _bmi(l.weight_kg, user.height_cm)
            metrics.append({
                "date":   l.log_date.strftime("%d %b"),
                "waist":  l.waist_cm,
                "weight": l.weight_kg,
                "bmi":    bmi,
            })

    achievements = _get_achievements(logs_all, streak)

    return jsonify({
        "ok":           True,
        "days":         days,
        "streak":       streak,
        "total_logged": total_logged,
        "avg_energy":   round(float(avg_energy), 1),
        "avg_sleep":    round(float(avg_sleep), 1) if avg_sleep else None,
        "habit_pct":    habit_pct,
        "metrics":      metrics,
        "achievements": achievements,
    })


@app.route("/api/tip")
def next_tip():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401
    idx          = int(request.args.get("idx", 0))
    _, tier_data = get_age_tier(user.age)
    tips         = tier_data["tips"]
    idx          = (idx + 1) % len(tips)
    return jsonify({"ok": True, "tip": tips[idx], "idx": idx})


@app.route("/api/update_medical", methods=["POST"])
def update_medical():
    user = _get_user()
    if not user:
        return jsonify({"ok": False}), 401
    data = request.get_json()
    user.height_cm       = data.get("height_cm") or None
    user.blood_type      = data.get("blood_type", "")
    user.allergies       = data.get("allergies", "")
    user.emergency_name  = data.get("emergency_name", "")
    user.emergency_phone = data.get("emergency_phone", "")
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/export")
def export_csv():
    user = _get_user()
    if not user:
        return redirect(url_for("index"))
    logs   = DailyLog.query.filter_by(user_id=user.id).order_by(DailyLog.log_date).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Health Score", "Water (ml)", "Energy", "Sleep (hrs)", "Sleep Quality",
        "Mood", "BP Systolic", "BP Diastolic", "Heart Rate", "Glucose (mg/dL)",
        "Calories In", "Waist (cm)", "Weight (kg)", "Notes"
    ])
    for l in logs:
        writer.writerow([
            l.log_date, l.health_score(), l.water_ml, l.energy,
            l.sleep_hours, l.sleep_quality, l.mood,
            l.bp_systolic, l.bp_diastolic, l.heart_rate, l.glucose_mg,
            l.calories_in, l.waist_cm, l.weight_kg, l.notes
        ])
    output.seek(0)
    fname = f"vitalage_{user.name.replace(' ','_')}_{date.today()}.csv"
    return Response(output.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": f"attachment;filename={fname}"})


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/api/login", methods=["POST"])
def login():
    data  = request.get_json()
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
    # Migrate existing databases by adding any missing columns
    from sqlalchemy import text, inspect as sa_inspect
    inspector = sa_inspect(db.engine)
    with db.engine.connect() as conn:
        log_cols  = {c["name"] for c in inspector.get_columns("daily_log")}
        user_cols = {c["name"] for c in inspector.get_columns("user")}
        for col, defn in [
            ("sleep_hours",   "FLOAT"),
            ("sleep_quality", "INTEGER"),
            ("mood",          "INTEGER"),
            ("bp_systolic",   "INTEGER"),
            ("bp_diastolic",  "INTEGER"),
            ("heart_rate",    "INTEGER"),
            ("glucose_mg",    "FLOAT"),
            ("calories_in",   "INTEGER DEFAULT 0"),
        ]:
            if col not in log_cols:
                conn.execute(text(f"ALTER TABLE daily_log ADD COLUMN {col} {defn}"))
        for col, defn in [
            ("height_cm",       "FLOAT"),
            ("blood_type",      "VARCHAR(5) DEFAULT ''"),
            ("allergies",       "TEXT DEFAULT ''"),
            ("emergency_name",  "VARCHAR(100) DEFAULT ''"),
            ("emergency_phone", "VARCHAR(20) DEFAULT ''"),
        ]:
            if col not in user_cols:
                conn.execute(text(f"ALTER TABLE user ADD COLUMN {col} {defn}"))
        conn.commit()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
