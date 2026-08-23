from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class TaskCreate(BaseModel):
    title: str
    due_date: Optional[date] = None
    class_id: int

class TaskStatusUpdate(BaseModel):
    task_id: int
    student_id: int
    status: str  # completed, pending, late