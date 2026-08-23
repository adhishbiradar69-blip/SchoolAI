from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.mark import Mark
from app.models.student import Student
from app.dependencies import get_current_user

router = APIRouter(prefix="/academics", tags=["academics"])

@router.post("/marks")
def add_mark(student_id: int, exam_name: str, score: float, max_score: float = 100, term: str = "", db: Session = Depends(get_db), user=Depends(get_current_user)):
    mark = Mark(student_id=student_id, exam_name=exam_name, score=score, max_score=max_score, term=term)
    db.add(mark)
    db.commit()
    db.refresh(mark)
    return {"id": mark.id, "student_id": mark.student_id, "score": mark.score}

@router.get("/student/{student_id}")
def get_student_marks(student_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    marks = db.query(Mark).filter(Mark.student_id == student_id).all()
    return [{"exam": m.exam_name, "score": m.score, "max": m.max_score, "term": m.term} for m in marks]

@router.get("/class/{class_id}/report")
def get_class_report(class_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    students = db.query(Student).filter(Student.class_id == class_id).all()
    result = []
    for s in students:
        marks = db.query(Mark).filter(Mark.student_id == s.id).all()
        avg = sum(m.score for m in marks) / len(marks) if marks else 0
        result.append({
            "student_id": s.id,
            "name": s.name,
            "average_score": round(avg, 2),
            "exams": len(marks)
        })
    return result