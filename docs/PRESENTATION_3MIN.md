# Graduation Presentation Script — Website (Frontend & Backend)

**Role:** Website owner (Frontend + Backend)  
**Duration:** ~3 minutes  
**Project:** Industrial Motor Predictive Maintenance Dashboard

---

## English Version (3 minutes)

### 0:00 – 0:20 | Opening

Good evening. I am responsible for the **website** of this project — both the **frontend** and the **backend**.

Our goal was not only to build a machine learning model, but to deliver a **real monitoring system**: a web dashboard that shows the motor condition clearly, in real time, for engineers and decision makers.

---

### 0:20 – 1:10 | What the dashboard shows

This is the predictive maintenance dashboard.

It displays **four live sensor charts**:

- Temperature  
- Vibration  
- Sound  
- Current  

Besides the charts, the system shows the **detected condition** coming from the model — for example `Good100`, `Good50`, `BearingFail`, or `Overheating`.

From that single code, the dashboard automatically shows:

- the **Diagnosis**
- the **Recommended Action**
- and the **severity / fault** guidance

So the user does not only see numbers — they see what the motor status means and what should be done next.

---

### 1:10 – 2:10 | How it works technically

On the frontend, I used **React** with **Vite** to build a fast, responsive dashboard with live charts.

On the backend, I built a **FastAPI** service under `/api/v1`.

When the page opens, the frontend loads:

- `GET /status`
- `GET /history`
- `GET /recommendations`
- `GET /system-info`

For live updates, we use:

- `POST /live`

The Raspberry Pi / ML side sends sensor readings plus one important field: **`detectedCondition`**.

Example:

```json
{
  "detectedCondition": "Good50",
  "temperature": { "timestamp": 1751558400000, "value": 54.9 },
  "vibration": { "value": 0.51 },
  "sound": { "value": 0.20 },
  "current": { "value": 0.33 }
}
```

The frontend maps this code into diagnosis text and recommended action, so the API stays simple and consistent for the whole team.

---

### 2:10 – 2:40 | Deployment & integration

The website is deployed on a **Hostinger VPS**, with the React app served publicly and the FastAPI backend running behind a reverse proxy.

That means the frontend and backend work together in production as one system, ready for integration with the model and Raspberry Pi pipeline.

---

### 2:40 – 3:00 | Closing

In short: I built the bridge between the AI model and the user.

From a model output code → to a full web product that **monitors**, **diagnoses**, and **recommends** maintenance actions.

Thank you.

---

## النسخة العربية (3 دقايق)

### 0:00 – 0:20 | الافتتاح

مساء الخير. أنا مسؤول عن جزء **الويبسايت** في المشروع: الفرونت إند والباك إند.

هدفنا ما كانش بس نعمل موديل Machine Learning، الهدف إننا نطلع **نظام مراقبة حقيقي**: داشبورد ويب يوضح حالة الموتور بشكل واضح ولحظي للدكاترة والمهندسين ومتخذ القرار.

---

### 0:20 – 1:10 | إيه اللي بنشوفه في الداشبورد

ده داشبورد الـ Predictive Maintenance.

بيعرض **4 charts حية** للقراءات:

- Temperature  
- Vibration  
- Sound  
- Current  

غير الـ charts، النظام بيعرض **الحالة المكتشفة** اللي جاية من الموديل — زي `Good100` أو `Good50` أو `BearingFail` أو `Overheating`.

ومن الكود ده لوحده، الداشبورد بيظهر تلقائيًا:

- الـ **Diagnosis**
- الـ **Recommended Action**
- وحالة الـ **fault / severity**

يعني المستخدم مش بيشوف أرقام بس — بيشوف معناها وإيه الإجراء المطلوب.

---

### 1:10 – 2:10 | إزاي الشغل شغال تقنيًا

في الفرونت استخدمت **React** مع **Vite** عشان نعمل داشبورد سريع ومرن مع live charts.

وفي الباك بنيت خدمة **FastAPI** على مسار `/api/v1`.

أول ما الصفحة تفتح، الفرونت بيحمّل:

- `GET /status`
- `GET /history`
- `GET /recommendations`
- `GET /system-info`

وللتحديث الحي بنستخدم:

- `POST /live`

الراسبيري أو الموديل بيبعت قراءات الحساسات ومعاها فيلد مهم جدًا: **`detectedCondition`**.

مثال:

```json
{
  "detectedCondition": "Good50",
  "temperature": { "timestamp": 1751558400000, "value": 54.9 },
  "vibration": { "value": 0.51 },
  "sound": { "value": 0.20 },
  "current": { "value": 0.33 }
}
```

الفرونت بيعمل mapping للكود ده إلى نص التشخيص والإجراء المقترح، فـ الـ API بيفضل بسيط وموحّد للفريق كله.

---

### 2:10 – 2:40 | النشر والتكامل

الموقع متنشر على **Hostinger VPS**: تطبيق React متاح للمستخدم، وFastAPI شغال وراه reverse proxy.

يعني الفرونت والباك شغالين مع بعض في production كنظام واحد، جاهز للتكامل مع الموديل والراسبيري.

---

### 2:40 – 3:00 | الختام

باختصار: أنا بنيت الجسر بين الموديل والمستخدم.

من كود ناتج من الـ AI → لمنتج ويب كامل **يراقب** و**يشخّص** و**يقترح** إجراءات الصيانة.

شكرًا لحضراتكم.

---

## Quick timing card

| Time | English focus | العربي |
|------|---------------|--------|
| 0:00–0:20 | Your role + goal | دورك + الهدف |
| 0:20–1:10 | Demo: charts + diagnosis | عرض الداشبورد |
| 1:10–2:10 | React + FastAPI + `/live` | التقنية + الـ API |
| 2:10–2:40 | Deployment | النشر |
| 2:40–3:00 | Closing line | الخاتمة |

---

## One-line summary (memorize this)

**EN:** I turned the ML output into a real monitoring web product.  
**AR:** حوّلت ناتج الموديل من كود بس → لمنتج ويب مراقبة وتشخيص.

---

## Expected questions (short answers)

| Question | Answer |
|----------|--------|
| Why React? | Fast UI for live charts and clean dashboard components. |
| Why FastAPI? | Lightweight API for Raspberry/ML integration, clear endpoints. |
| How does live update work? | Frontend polls `POST /live` (or shows fixed history for demos). |
| Who sends the label? | Raspberry/model sends `detectedCondition`; website maps diagnosis + action. |
| What was hardest? | Keeping a stable API contract and smooth live chart updates. |
