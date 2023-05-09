from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .frontend import app as frontend_app
from .quantum import app as quantum_app
from .usecases import app as usecase_app

app = FastAPI()

# add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# mount quantum app
app.mount(
    path='/api/quantum',
    app=quantum_app,
    name='Qiskit API'
)

# mount usecase
app.mount(
    path='/api/usecase',
    app=usecase_app,
    name='Usecase API'
)

# mount singlepage application
app.mount(
    path='/',
    app=frontend_app,
    name='Frontend'
)