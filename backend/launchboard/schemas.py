from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List


# ── Shared ──
class ProjectStatus:
    IDEA = "idea"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class TaskStatus:
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    DONE = "done"

class Priority:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ── Project Schemas ──
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field("idea", pattern="^(idea|active|paused|completed)$")
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, pattern="^(idea|active|paused|completed)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    task_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int


# ── Task Schemas ──
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field("todo", pattern="^(todo|in_progress|blocked|done)$")
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|blocked|done)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")


class TaskResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int


# ── Dashboard Schema ──
class DashboardStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    blocked_tasks: int
    total_tasks: int
    completed_tasks: int


# ── Health Schema ──
class HealthResponse(BaseModel):
    status: str
    database: str
