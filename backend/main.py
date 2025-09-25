from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os

class Issue(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    assignee: str
    createdAt: datetime
    updatedAt: datetime

class IssueCreate(BaseModel):
    title: str
    description: str
    status: str
    priority: str
    assignee: str

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ISSUES_FILE = "issues.json"

def load_issues():
    if os.path.exists(ISSUES_FILE):
        with open(ISSUES_FILE, "r") as f:
            data = json.load(f)
            return [Issue(**item) for item in data]
    return []

def save_issues(issues: List[Issue]):
    data = [issue.dict() for issue in issues]
    with open(ISSUES_FILE, "w") as f:
        json.dump(data, f, default=str)

issues: List[Issue] = load_issues()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/issues")
def get_issues(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0)
):
    filtered = issues
    if search:
        filtered = [i for i in filtered if search.lower() in i.title.lower()]
    if status:
        filtered = [i for i in filtered if i.status == status]
    if priority:
        filtered = [i for i in filtered if i.priority == priority]
    if assignee:
        filtered = [i for i in filtered if i.assignee == assignee]

    if sort_by:
        reverse = sort_order == "desc"
        try:
            filtered = sorted(filtered, key=lambda x: getattr(x, sort_by), reverse=reverse)
        except AttributeError:
            raise HTTPException(status_code=400, detail="Invalid sort_by field")

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]

    return {
        "issues": [i.dict() for i in paginated],
        "total": total,
        "page": page,
        "page_size": page_size
    }

@app.get("/issues/{issue_id}")
def get_issue(issue_id: int):
    issue = next((i for i in issues if i.id == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue.dict()

@app.post("/issues")
def create_issue(issue_data: IssueCreate):
    new_id = max((i.id for i in issues), default=0) + 1
    now = datetime.now()
    issue = Issue(
        id=new_id,
        title=issue_data.title,
        description=issue_data.description,
        status=issue_data.status,
        priority=issue_data.priority,
        assignee=issue_data.assignee,
        createdAt=now,
        updatedAt=now
    )
    issues.append(issue)
    save_issues(issues)
    return issue.dict()

@app.put("/issues/{issue_id}")
def update_issue(issue_id: int, issue_data: IssueUpdate):
    issue = next((i for i in issues if i.id == issue_id), None)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    update_data = issue_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(issue, key, value)
    issue.updatedAt = datetime.now()
    save_issues(issues)
    return issue.dict()