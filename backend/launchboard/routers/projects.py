from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from crud import get_projects, get_project, create_project, update_project, delete_project

router = APIRouter(prefix="/projects", tags=["projects"])


def _enrich_project(project):
    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        status=project.status,
        priority=project.priority,
        task_count=len(list(project.tasks)),
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.get("", response_model=ProjectListResponse)
def list_projects(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    projects = get_projects(db, search=search, status=status, priority=priority)
    enriched = [_enrich_project(p) for p in projects]
    return ProjectListResponse(projects=enriched, total=len(enriched))


@router.post("", response_model=ProjectResponse, status_code=201)
def create_new_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = create_project(db, project)
    return _enrich_project(db_project)


@router.get("/{project_id}", response_model=ProjectResponse)
def retrieve_project(project_id: int, db: Session = Depends(get_db)):
    db_project = get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _enrich_project(db_project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_existing_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = update_project(db, project_id, project)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _enrich_project(db_project)


@router.delete("/{project_id}", status_code=204)
def delete_existing_project(project_id: int, db: Session = Depends(get_db)):
    success = delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
