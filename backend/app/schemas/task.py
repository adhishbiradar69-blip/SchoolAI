from pydantic import BaseModel
from datetime import date
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    due_date: Optional[date] = None
    class_id: int
    subject_id: int

class TaskStatusUpdate(BaseModel):
    task_id: int
    student_id: int
    status: str