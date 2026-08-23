from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
import random
from app.database import get_db
from app.models.school import School
from app.models.class_ import Class
from app.models.student import Student
from app.models.user import User
from app.models.attendance import Attendance
from app.models.mark import Mark
from app.models.subject import Subject
from app.schemas.student import SchoolCreate, ClassCreate, StudentCreate
from app.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/schools")
def create_school(data: SchoolCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    school = School(name=data.name)
    db.add(school)
    db.commit()
    db.refresh(school)
    return {"id": school.id, "name": school.name}

@router.get("/schools")
def list_schools(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(School).all()

@router.post("/classes")
def create_class(data: ClassCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    school = db.query(School).filter(School.id == data.school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    cls = Class(school_id=data.school_id, grade=data.grade, section=data.section)
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return {"id": cls.id, "grade": cls.grade, "section": cls.section}

@router.get("/classes")
def list_classes(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Class).all()

@router.post("/students")
def create_student(data: StudentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cls = db.query(Class).filter(Class.id == data.class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    student = Student(name=data.name, roll_no=data.roll_no, class_id=data.class_id)
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"id": student.id, "name": student.name, "class_id": student.class_id}

@router.post("/seed")
def seed_data(db: Session = Depends(get_db), user=Depends(get_current_user)):
    school = School(name="Greenwood High")
    db.add(school)
    db.commit()
    db.refresh(school)
    
    cls = Class(school_id=school.id, grade="10", section="B")
    db.add(cls)
    db.commit()
    db.refresh(cls)
    
    db_user = db.query(User).filter(User.id == user.id).first()
    if db_user:
        db_user.assigned_class_id = cls.id
        db.commit()
    
    subjects = [
        Subject(name="Mathematics", color="#6366f1"),
        Subject(name="Science", color="#10b981"),
        Subject(name="English", color="#f59e0b"),
        Subject(name="Hindi", color="#ef4444"),
        Subject(name="Social Science", color="#8b5cf6"),
        Subject(name="Computer", color="#3b82f6"),
    ]
    for sub in subjects:
        db.add(sub)
    db.commit()
    
    first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Aarush", "Kabir", "Darsh", "Ananya", "Diya", "Saanvi", "Aadhya", "Navya", "Myra", "Pari", "Kavya", "Sara", "Ira", "Aaradhya", "Meera", "Tara", "Riya", "Jiya"]
    
    students = []
    for i, name in enumerate(first_names, 1):
        s = Student(name=f"{name} Kumar", roll_no=str(i), class_id=cls.id)
        db.add(s)
        students.append(s)
    db.commit()
    
    today = date.today()
    statuses = ["P", "P", "P", "P", "A", "P", "P", "L", "P", "P"]
    
    for s in students:
        db.add(Attendance(student_id=s.id, date=today, status=random.choice(statuses), marked_by=user.id))
        db.add(Mark(student_id=s.id, exam_name="Midterm", score=round(random.uniform(40, 98), 2), max_score=100, term="Term 1"))
        db.add(Mark(student_id=s.id, exam_name="Unit Test 1", score=round(random.uniform(35, 95), 2), max_score=100, term="Term 1"))
    
    db.commit()
    return {"school_id": school.id, "class_id": cls.id, "students_created": len(students)}