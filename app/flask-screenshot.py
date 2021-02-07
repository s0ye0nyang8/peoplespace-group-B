# import pandas as pd
# import numpy as np
# from fastai.core import *
# from PIL import Image
# from fastai.script import *
# from fastai.vision import *
# from fastai.callbacks import *
# from fastai.distributed import *
# from fastprogress import fastprogress
# from torchvision.models import *
import storage as storage
from flask import Flask, request, make_response
from flask import render_template
import pyautogui
from time import gmtime, strftime
from threading import Event, Thread
import firebase_admin
from firebase_admin import credentials
from firebase_admin import initialize_app
from firebase_admin import storage
import sys, os
import tempfile
from uuid import uuid4

PROJECT_ID = "peoplespace-test"

cred = credentials.Certificate('peoplespace-test-firebase-adminsdk-dawk1-a7fad79476.json')
initialize_app(cred, {
    'storageBucket': f'{PROJECT_ID}.appspot.com'
})


def call_repeatedly(interval, func, *args):
    stopped = Event()
    def loop():
        while not stopped.wait(interval): # the first call is in `interval` secs
            func(*args)
    Thread(target=loop).start()
    return stopped.set


app = Flask(__name__)
capture_thread_stop = None


@app.route('/start/')
def start():
    global capture_thread_stop
    if capture_thread_stop:
        return "Already started"
    capture_thread_stop = call_repeatedly(1, capture)
    return "Started"


@app.route('/stop/')
def stop():
    global capture_thread_stop
    if capture_thread_stop:
        capture_thread_stop()
        capture_thread_stop = None
        return "Stopped"
    else:
        return "Not running"


@app.route('/')
def index():
    return render_template('index.html')


def capture():
    myScreenshot = pyautogui.screenshot()
    #filename = fr'C:\Users\sangh\PycharmProjects\flask\{strftime("%Y%m%d%H%M%S", gmtime())}.png'
    filename = strftime("%Y%m%d%H%M%S", gmtime())+'.png'
    myScreenshot.save(filename)
    bucket = storage.bucket()
    blob = bucket.blob(filename)
    blob.upload_from_filename(filename)
    temp = tempfile.NamedTemporaryFile(delete=False)


if __name__ == "__main__":
    app.run()


