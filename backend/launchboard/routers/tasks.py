from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from crud import get_tasks, get_task, create_task, update_task, delete_task, get_project

router = APIRouter(tags=["tasks"])


@router.get("/projects/{project_id}/tasks", response_model=TaskListResponse)
def list_project_tasks(
    project_id: int,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    tasks = get_tasks(db, project_id=project_id, status=status, priority=priority, search=search)
    return TaskListResponse(tasks=tasks, total=len(tasks))


@router.post("/projects/{project_id}/tasks", response_model=TaskResponse, status_code=201)
def create_new_task(project_id: int, task: TaskCreate, db: Session = Depends(get_db)):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return create_task(db, project_id, task)


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def retrieve_task(task_id: int, db: Session = Depends(get_db)):
    db_task = get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_existing_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = update_task(db, task_id, task)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_existing_task(task_id: int, db: Session = Depends(get_db)):
    success = delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
