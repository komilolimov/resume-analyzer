from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=50, description="Полный текст резюме")
    job_description: str = Field(..., min_length=50, description="Описание вакансии")
    language: str = Field(default="en", description="Target language code: en, it, de, ru, uz")

class AnalyzeResponse(BaseModel):
    is_valid_input: bool = Field(..., description="True, если резюме — это действительно CV, a вакансия — описание работы.")
    validation_error: Optional[str] = Field(None, description="Сообщение об ошибке на выбранном языке, если валидация не пройдена.")
    match_score: int = Field(0, ge=0, le=100)
    job_title: str = Field(default="")
    company_name: str = Field(default="Unknown")
    found_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    actionable_advice: List[str] = Field(default_factory=list)
    summary: str = Field(default="", description="Краткое резюме по соответствию кандидата (2 предложения)")
    tailored_resume_html: str = Field(default="", description="Переписанное резюме в формате чистого HTML для вставки в Word")
