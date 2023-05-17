import dotenv

dotenv.load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .frontend import app as frontend_app
from .quantum import build as build_quantum_app
from .usecases import set_endpoints as set_usecase_endpoints

app = FastAPI()

# add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# add endpoints
build_quantum_app(app, '/api/quantum')
set_usecase_endpoints(app, '/api/usecase')

# mount singlepage application
app.mount(
    path='/',
    app=frontend_app,
    name='Frontend'
)
