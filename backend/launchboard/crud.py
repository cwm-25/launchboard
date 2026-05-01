from sqlalchemy.orm import Session
from models import Project, Task
from schemas import ProjectCreate, ProjectUpdate, TaskCreate, TaskUpdate


# ── Project CRUD ──

def get_projects(
    db: Session,
    search: str = None,
    status: str = None,
    priority: str = None
):
    query = db.query(Project)
    if search:
        query = query.filter(Project.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(Project.status == status)
    if priority:
        query = query.filter(Project.priority == priority)
    # Simple sorting: high first, then medium, then low
    # Using a simple approach compatible with all SQLAlchemy versions
    projects = query.all()
    projects.sort(key=lambda p: (
        {"high": 1, "medium": 2, "low": 3}.get(p.priority, 4),
        -p.created_at.timestamp() if p.created_at else 0
    ))
    return projects


def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(db: Session, project: ProjectCreate):
    db_project = Project(
        title=project.title,
        description=project.description,
        status=project.status or "idea",
        priority=project.priority or "medium",
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, project_id: int, project: ProjectUpdate):
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    update_data = project.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if not db_project:
        return False
    db.delete(db_project)
    db.commit()
    return True


# ── Task CRUD ──

def get_tasks(
    db: Session,
    project_id: int = None,
    status: str = None,
    priority: str = None,
    search: str = None
):
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    tasks = query.all()
    tasks.sort(key=lambda t: (
        {"high": 1, "medium": 2, "low": 3}.get(t.priority, 4),
        -t.created_at.timestamp() if t.created_at else 0
    ))
    return tasks


def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, project_id: int, task: TaskCreate):
    db_task = Task(
        project_id=project_id,
        title=task.title,
        description=task.description,
        status=task.status or "todo",
        priority=task.priority or "medium",
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task: TaskUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    update_data = task.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    db.delete(db_task)
    db.commit()
    return True


# ── Dashboard Stats ──

def get_dashboard_stats(db: Session):
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.status == "active").count()
    completed_projects = db.query(Project).filter(Project.status == "completed").count()
    blocked_tasks = db.query(Task).filter(Task.status == "blocked").count()
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "done").count()

    return {
        "total_projects": total_projects,
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "blocked_tasks": blocked_tasks,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
    }
