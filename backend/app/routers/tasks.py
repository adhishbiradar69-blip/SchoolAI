from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.task import Task, TaskCompletion
from app.models.student import Student
from app.schemas.task import TaskCreate, TaskStatusUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/")
def create_task(data: TaskCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    task = Task(
        title=data.title,
        due_date=data.due_date,
        class_id=data.class_id,
        assigned_by=user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"id": task.id, "title": task.title, "class_id": task.class_id}

@router.get("/class/{class_id}")
def get_class_tasks(class_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.class_id == class_id).all()
    students = db.query(Student).filter(Student.class_id == class_id).all()
    
    result = []
    for task in tasks:
        completions = db.query(TaskCompletion).filter(TaskCompletion.task_id == task.id).all()
        comp_map = {c.student_id: c.status for c in completions}
        
        result.append({
            "task_id": task.id,
            "title": task.title,
            "due_date": str(task.due_date) if task.due_date else None,
            "students": [
                {
                    "id": s.id,
                    "name": s.name,
                    "status": comp_map.get(s.id, "pending")
                }
                for s in students
            ]
        })
    return result

@router.post("/status")
def update_task_status(data: TaskStatusUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = db.query(TaskCompletion).filter(
        TaskCompletion.task_id == data.task_id,
        TaskCompletion.student_id == data.student_id
    ).first()
    
    if existing:
        existing.status = data.status
    else:
        db.add(TaskCompletion(
            task_id=data.task_id,
            student_id=data.student_id,
            status=data.status
        ))
    
    db.commit()
    return {"status": "updated"}