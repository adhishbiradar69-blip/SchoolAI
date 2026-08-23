from pydantic import BaseModel
from datetime import date
from typing import List

class AttendanceMark(BaseModel):
    student_id: int
    status: str

class AttendanceBulkCreate(BaseModel):
    class_id: int
    date: date
    marks: List[AttendanceMark]