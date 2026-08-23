from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceBulkCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("/mark")
def mark_attendance(data: AttendanceBulkCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    student_ids = [m.student_id for m in data.marks]
    students = db.query(Student).filter(Student.id.in_(student_ids), Student.class_id == data.class_id).all()
    if len(students) != len(student_ids):
        raise HTTPException(status_code=400, detail="Invalid student IDs for this class")
    
    for mark in data.marks:
        existing = db.query(Attendance).filter(
            Attendance.student_id == mark.student_id,
            Attendance.date == data.date
        ).first()
        
        if existing:
            existing.status = mark.status
            existing.marked_by = user.id
        else:
            db.add(Attendance(
                student_id=mark.student_id,
                date=data.date,
                status=mark.status,
                marked_by=user.id
            ))
    
    db.commit()
    return {"status": "saved", "date": str(data.date), "count": len(data.marks)}

@router.get("/class/{class_id}")
def get_class_attendance(class_id: int, date: date, db: Session = Depends(get_db), user=Depends(get_current_user)):
    students = db.query(Student).filter(Student.class_id == class_id).all()
    records = db.query(Attendance).filter(
        Attendance.date == date,
        Attendance.student_id.in_([s.id for s in students])
    ).all()
    
    att_map = {a.student_id: a.status for a in records}
    
    return {
        "date": str(date),
        "students": [
            {"id": s.id, "name": s.name, "status": att_map.get(s.id, "Not Marked")}
            for s in students
        ]
    }