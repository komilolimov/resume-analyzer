import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

from api.schemas import AnalyzeRequest, AnalyzeResponse

load_dotenv()

app = FastAPI(title="Job Fit Analyzer API", version="1.0.0")

# Настройка CORS для будущего Next.js фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Для локальной разработки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация клиента Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

SYSTEM_PROMPT = """
You are an elite, zero-fluff Technical Recruiter and Senior Systems Architect with deep knowledge of Applicant Tracking Systems (ATS). 

YOUR MISSION: Perform a surgical, unbiased match analysis between the Candidate's Resume and the Target Job Description. 

VALIDATION CHECK (CRITICAL):
Before analyzing the match score, verify the types of input:
1. `resume_text` MUST be an actual CV/Resume (work history, skills, education, experience).
2. `job_description` MUST be a Job Vacancy/Description (responsibilities, requirements, tech stack needed).

IF VALIDATION FAILS:
- Set `is_valid_input` to `false`.
- Set `validation_error` to a clear, concise explanation in the requested language. Examples:
  - 'Вы перепутали поля местами: в поле резюме находится вакансия.'
  - 'Поле резюме не содержит информации о вашем опыте/навыках.'
  - 'Оба поля содержат одинаковый или несвязанный текст.'
- Set `match_score` to 0 and leave arrays empty.

IF VALIDATION PASSES:
- Set `is_valid_input` to `true`, `validation_error` to null, and perform the full ATS match analysis as usual.

MAANG RESUME REWRITE INSTRUCTION:
Generate a fully tailored, rewritten version of the candidate's CV optimized specifically for the target job description.

REQUIREMENTS FOR THE REWRITTEN CV:
1. MAANG XYZ FORMULA: Every work experience bullet point MUST strictly follow Google's XYZ formula:
   - 'Accomplished [X] as measured by [Y], by doing [Z]'
   - Example: 'Improved frontend page load performance by 40% (measured via Core Web Vitals) by implementing SSR and image lazy loading in Next.js.'
2. ATS KEYWORD INTEGRATION: Seamlessly weave all `missing_skills` into the experience and skills sections.
3. OUTPUT FORMAT (CRITICAL FOR WORD COPY-PASTE): 
   Return `tailored_resume_html` strictly as clean, semantic HTML string without wrapping <html> or <body> tags. Use only:
   - <h2> for main section headers (SUMMARY, EXPERIENCE, SKILLS, EDUCATION)
   - <h3> for Job Titles & Company Names
   - <ul> and <li> for bullet points
   - <strong> for technologies, keywords, and metric numbers
   - <p> for summary and metadata.

RULES OF ENGAGEMENT (ANTIGRAVITY FRAMEWORK):
1. ZERO FLUFF & WEIGHT: Do not write politeness, introductory text, or corporate fluff. Focus 100% on high-value hard technical skills, tooling, and domain knowledge.
2. 1-PAGE LIMIT (CRITICAL): The generated resume MUST be extremely concise to fit strictly on a single A4 page. Remove unnecessary filler words and avoid long paragraphs.
3. CONTEXTUAL RECOGNITION: Recognize equivalent technologies and tech stacks (e.g., TS = TypeScript, React -> Next.js, Postgres -> Relational DB). Count them as matches if they are functionally equivalent.
4. CRITICAL GAP IDENTIFICATION: In `missing_skills`, list only high-impact keywords, frameworks, or experience gaps that would cause an automated ATS filter to reject this CV.
5. ACTIONABLE ROI ADVICE: Provide max 3 high-leverage recommendations. Tell the user EXACTLY what keywords to add or how to rephrase existing bullet points to instantly raise their match score.
6. STRICT OUTPUT: Output ONLY a JSON object strictly conforming to the requested schema.

--- EXAMPLE OF TARGET HTML STRUCTURE (JAKE'S RESUME PATTERN) ---

<div style="font-family: 'Times New Roman', Times, serif; line-height: 1.2; color: #000; font-size: 11pt;">
  <!-- HEADER -->
  <div style="text-align: center; margin-bottom: 12px;">
    <h1 style="margin: 0; font-size: 24pt; font-weight: normal;">Jake Ryan</h1>
    <p style="margin: 4px 0 0 0; font-size: 11pt;">
      123-456-7890 | <u>jake@su.edu</u> | <u>linkedin.com/in/jake</u> | <u>github.com/jake</u>
    </p>
  </div>

  <!-- EDUCATION -->
  <table width="100%" style="border-collapse: collapse; border: none; margin: 14px 0 8px 0;">
    <tr>
      <td style="border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; margin: 0;">Education</h2>
      </td>
    </tr>
  </table>
  <div style="margin-bottom: 8px;">
    <table width="100%" style="border-collapse: collapse; border: none;">
      <tr>
        <td style="padding: 0; text-align: left;"><strong>Southwestern University</strong></td>
        <td style="padding: 0; text-align: right;">Aug. 2018 – May 2021</td>
      </tr>
      <tr>
        <td style="padding: 0; text-align: left; font-style: italic;">Bachelor of Arts in Computer Science, Minor in Business</td>
        <td style="padding: 0; text-align: right; font-style: italic;">Georgetown, TX</td>
      </tr>
    </table>
  </div>

  <!-- EXPERIENCE -->
  <table width="100%" style="border-collapse: collapse; border: none; margin: 14px 0 8px 0;">
    <tr>
      <td style="border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; margin: 0;">Experience</h2>
      </td>
    </tr>
  </table>
  <div style="margin-bottom: 8px;">
    <table width="100%" style="border-collapse: collapse; border: none;">
      <tr>
        <td style="padding: 0; text-align: left;"><strong>Undergraduate Research Assistant</strong></td>
        <td style="padding: 0; text-align: right;">June 2020 – Present</td>
      </tr>
      <tr>
        <td style="padding: 0; text-align: left; font-style: italic;">Texas A&M University</td>
        <td style="padding: 0; text-align: right; font-style: italic;">College Station, TX</td>
      </tr>
    </table>
    <ul style="margin: 4px 0 0 20px; padding: 0;">
      <li style="margin-bottom: 4px;">Developed a REST API using <strong>FastAPI and PostgreSQL</strong> to store data from learning management systems, reducing response latency by 25%.</li>
      <li style="margin-bottom: 4px;">Developed a full-stack web application using <strong>Flask, React, PostgreSQL, and Docker</strong> to analyze GitHub collaboration metrics across 500+ repositories.</li>
    </ul>
  </div>

  <!-- PROJECTS -->
  <table width="100%" style="border-collapse: collapse; border: none; margin: 14px 0 8px 0;">
    <tr>
      <td style="border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; margin: 0;">Projects</h2>
      </td>
    </tr>
  </table>
  <div style="margin-bottom: 8px;">
    <table width="100%" style="border-collapse: collapse; border: none; margin-bottom: 4px;">
      <tr>
        <td style="padding: 0; text-align: left;"><strong>Gitlytics</strong> | <em>Python, Flask, React, PostgreSQL, Docker</em></td>
        <td style="padding: 0; text-align: right;">June 2020 – Present</td>
      </tr>
    </table>
    <ul style="margin: 0 0 0 20px; padding: 0;">
      <li style="margin-bottom: 4px;">Implemented GitHub OAuth to retrieve user repository data, utilizing <strong>Celery and Redis</strong> for asynchronous processing.</li>
    </ul>
  </div>

  <!-- TECHNICAL SKILLS -->
  <table width="100%" style="border-collapse: collapse; border: none; margin: 14px 0 8px 0;">
    <tr>
      <td style="border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; margin: 0;">Technical Skills</h2>
      </td>
    </tr>
  </table>
  <div style="margin-bottom: 8px;">
    <p style="margin: 0;">
      <strong>Languages:</strong> Java, Python, C/C++, SQL (PostgreSQL), JavaScript, HTML/CSS<br>
      <strong>Frameworks:</strong> React, Next.js, Node.js, FastAPI, Flask<br>
      <strong>Developer Tools:</strong> Git, Docker, GCP, VS Code, PyCharm<br>
      <strong>Libraries:</strong> pandas, NumPy, Matplotlib
    </p>
  </div>
</div>

--- END OF EXAMPLE ---

ИНСТРУКЦИЯ ДЛЯ GEMINI:
Используй приведенный выше HTML-шаблон как ориентир. Перепиши резюме пользователя под целевую вакансию, строго сохраняя эти теги, inline-стили для границы `<h2>`, формат списков `<ul><li>` и правила формулы Google XYZ.
"""

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_job_fit(payload: AnalyzeRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    user_prompt = f"""
    IMPORTANT: You MUST generate all text fields (summary, found_skills, missing_skills, actionable_advice, job_title, tailored_resume_html) strictly in the language specified by the code: {payload.language} (en = English, it = Italian, de = German, ru = Russian, uz = Uzbek).

    --- RESUME ---
    {payload.resume_text}

    --- JOB DESCRIPTION ---
    {payload.job_description}
    """

    models_to_try = ["gemini-3.5-flash", "gemini-3.5-pro", "gemini-3.6-flash", "gemini-3.6-pro"]
    
    last_error = ""
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=AnalyzeResponse,
                    temperature=0.2,
                ),
            )
            
            result = AnalyzeResponse.model_validate_json(response.text)
            return result

        except Exception as e:
            last_error = str(e)
            if any(err in last_error for err in ["404", "429", "503", "NOT_FOUND", "RESOURCE_EXHAUSTED", "UNAVAILABLE", "quota", "high demand"]):
                continue # Try the next model
            else:
                # If it's a different error (e.g. validation error), don't retry
                raise HTTPException(status_code=500, detail=f"Analysis failed: {last_error}")

    # If all models failed
    raise HTTPException(status_code=500, detail=f"Analysis failed after trying all fallback models. Last error: {last_error}")

FORMAT_PROMPT = """
You are an elite Technical Resume Writer specializing in ATS (Applicant Tracking System) optimization and FAANG-style formatting.

YOUR MISSION: Take the user's raw resume text and rewrite it strictly into a clean, highly professional, ATS-friendly format. 

VALIDATION CHECK (CRITICAL):
1. `resume_text` MUST contain actual work history, skills, education, or professional experience.
2. If it's just random text or gibberish, set `is_valid_input` to `false` and provide a `validation_error`.
3. If it is valid, set `is_valid_input` to `true`.

REQUIREMENTS FOR THE REWRITTEN CV:
1. FORMATTING FIXES: Fix spelling, grammar, and ensure a professional tone. 
2. MAANG XYZ FORMULA: Rephrase work experience bullet points to follow Google's XYZ formula where possible ('Accomplished [X] as measured by [Y], by doing [Z]').
3. NO HALLUCINATIONS: Do NOT invent skills, jobs, or degrees the user didn't mention.
4. STRICT HTML OUTPUT: Return `tailored_resume_html` strictly as a clean HTML string conforming to the exact Jake's Resume pattern below.

RULES OF ENGAGEMENT:
1. ZERO FLUFF: Remove objective statements, references, or corporate fluff.
2. 1-PAGE LIMIT (CRITICAL): The generated resume MUST be extremely concise to fit strictly on a single A4 page.

--- EXAMPLE OF TARGET HTML STRUCTURE (JAKE'S RESUME PATTERN) ---

<div style="font-family: 'Times New Roman', Times, serif; line-height: 1.2; color: #000; font-size: 11pt;">
  <!-- HEADER -->
  <div style="text-align: center; margin-bottom: 12px;">
    <h1 style="margin: 0; font-size: 24pt; font-weight: normal;">Jake Ryan</h1>
    <p style="margin: 4px 0 0 0; font-size: 11pt;">
      123-456-7890 | <u>jake@su.edu</u> | <u>linkedin.com/in/jake</u> | <u>github.com/jake</u>
    </p>
  </div>

  <!-- EDUCATION -->
  <table width="100%" style="border-collapse: collapse; border: none; margin: 14px 0 8px 0;">
    <tr>
      <td style="border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; margin: 0;">Education</h2>
      </td>
    </tr>
  </table>
  <div style="margin-bottom: 8px;">
    <table width="100%" style="border-collapse: collapse; border: none;">
      <tr>
        <td style="padding: 0; text-align: left;"><strong>Southwestern University</strong></td>
        <td style="padding: 0; text-align: right;">Aug. 2018 – May 2021</td>
      </tr>
      <tr>
        <td style="padding: 0; text-align: left; font-style: italic;">Bachelor of Arts in Computer Science, Minor in Business</td>
        <td style="padding: 0; text-align: right; font-style: italic;">Georgetown, TX</td>
      </tr>
    </table>
  </div>

  <!-- EXPERIENCE -->
  <table width="100%" style="border-collapse: collapse; border: none; margin: 14px 0 8px 0;">
    <tr>
      <td style="border-bottom: 1px solid #000; padding-bottom: 5px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; font-weight: bold; margin: 0;">Experience</h2>
      </td>
    </tr>
  </table>
  <div style="margin-bottom: 8px;">
    <table width="100%" style="border-collapse: collapse; border: none;">
      <tr>
        <td style="padding: 0; text-align: left;"><strong>Undergraduate Research Assistant</strong></td>
        <td style="padding: 0; text-align: right;">June 2020 – Present</td>
      </tr>
      <tr>
        <td style="padding: 0; text-align: left; font-style: italic;">Texas A&M University</td>
        <td style="padding: 0; text-align: right; font-style: italic;">College Station, TX</td>
      </tr>
    </table>
    <ul style="margin: 4px 0 0 20px; padding: 0;">
      <li style="margin-bottom: 4px;">Developed a REST API using <strong>FastAPI and PostgreSQL</strong> to store data from learning management systems, reducing response latency by 25%.</li>
      <li style="margin-bottom: 4px;">Developed a full-stack web application using <strong>Flask, React, PostgreSQL, and Docker</strong> to analyze GitHub collaboration metrics across 500+ repositories.</li>
    </ul>
  </div>
</div>
--- END OF EXAMPLE ---
"""

from api.schemas import FormatRequest, FormatResponse

@app.post("/api/format", response_model=FormatResponse)
async def format_resume(payload: FormatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    user_prompt = f"""
    IMPORTANT: You MUST generate all text fields (summary, job_title, tailored_resume_html) strictly in the language specified by the code: {payload.language}.

    --- RESUME ---
    {payload.resume_text}
    """

    models_to_try = ["gemini-3.5-flash", "gemini-3.5-pro", "gemini-3.6-flash", "gemini-3.6-pro"]
    
    last_error = ""
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=FORMAT_PROMPT,
                    response_mime_type="application/json",
                    response_schema=FormatResponse,
                    temperature=0.1,
                ),
            )
            result = FormatResponse.model_validate_json(response.text)
            return result

        except Exception as e:
            last_error = str(e)
            if any(err in last_error for err in ["404", "429", "503", "NOT_FOUND", "RESOURCE_EXHAUSTED", "UNAVAILABLE", "quota", "high demand"]):
                continue # Try the next model
            else:
                raise HTTPException(status_code=500, detail=f"Formatting failed: {last_error}")

    raise HTTPException(status_code=500, detail=f"Formatting failed after trying all fallback models. Last error: {last_error}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
