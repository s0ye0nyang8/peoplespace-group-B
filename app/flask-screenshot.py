from firebase import *
# from attentionguage import gauge
from flask import Flask, request, make_response
from flask import render_template
import pyautogui
from time import gmtime, strftime
from threading import Event, Thread
import sys, os
import tempfile
import uuid
from fastai.tabular import *
import numpy as np
import os
import time
import pickle
from models_func import *
from flask import redirect
from models_func import *
from sam_models_func import *
import ntpath
from datetime import datetime, timedelta
cwd = os.getcwd()
path = cwd + '/'
torch.cuda.empty_cache()
model = load_learner(path, 'sam_final_onlyface.pkl')
global userInfo
global curr_file

img_path = cwd + '/captured_image'


def call_repeatedly(interval, func, *args):
    stopped = Event()
    def loop():
        while not stopped.wait(interval): # the first call is in `interval` secs
            func(*args)
    Thread(target=loop).start()
    return stopped.set


app = Flask(__name__)
capture_thread_stop = None


# 로컬 폴더 이미지 프리딕트
def attentiongauge(url):
    bbox, label = predict(img_path, model)
    global userInfo
    for i, lb in enumerate(label):
        front = [i for i in lb if i == "front"]
        gauge = len(front)
        doc_ref = db.collection(u'people-space').document(ntpath.basename(Path(img_path).ls()[i+1]))
        doc_ref.set({
                u"attendance": gauge,
                u"end" :userInfo["end"],
                u"fileID":url,
                u"start":userInfo["start"],
                u"stNum":userInfo["stuNum"],
                u"subject":userInfo["subject"],
                u"teacherID": userInfo["teacherID"],
                u"time": datetime.utcnow(),
            })
    return 0

#actually, there is only one image in the folder

# start 버튼 클릭

# def start_page():
#     #start()
#     attentiongauge()
#     return render_template('capturing.html')
@app.route('/start/')
def start():
    global capture_thread_stop
    if capture_thread_stop:
        return "Already started"
    capture_thread_stop = call_repeatedly(1, capture)
    return render_template('capturing.html')

# stop 버튼 클릭
@app.route('/stop/')
def turn_to_index():
     stop()
     return render_template('index.html')

def stop():
    global capture_thread_stop
    capture_thread_stop()
    capture_thread_stop = None
    return "Stopped"
    if capture_thread_stop:
        capture_thread_stop()
        capture_thread_stop = None
        return "Stopped"
    else:
        return "Not running"


# 기본 idex 페이지
@app.route('/')
def index():
    global userInfo
#     if request.method == 'GET':
#         print()
#     else :
#         values = request.values
#         userInfo = {
#             "end" : values["end"],
#             "subject" : values["subject"],
#             "teacherID" : values["teacherID"],
#             "start" : values["start"],
#             "stuNum" : values["stuNum"]
#         }
    userInfo = {
            "end" : datetime.utcnow()+timedelta(hours=2),
            "subject" : "math",
            "teacherID" : "dlwjddms@cau.ac.kr",
            "start" : datetime.utcnow(),
            "stuNum" : 30
        }
    return render_template('index.html')

# 웹 팀 리다이렉트
@app.route('/web/')
def redirect_web_team():
    # boom-b900b.firebaseapp.com
    return redirect("https://www.naver.com")


def capture():
    global userInfo
    myScreenshot = pyautogui.screenshot()
    filename = strftime("%Y%m%d%H%M%S", gmtime())+'.png'
    # myScreenshot.save(filename)
    filepath = img_path + '/' + filename
    myScreenshot.save(filepath)
    upload(filename, filepath)


def upload(name,path):
    global userInfo
    storage.child(name).put(path)
    url = storage.child(name).get_url(user['idToken'])
    database.child().push({"img": url})
    temp = tempfile.NamedTemporaryFile(delete=False)
    attentiongauge(url)
    # def attentiongauge()
    # : analyze all pics(actually only one pic) in captured img folder. no params
    # img_path <- folder of captured image
    os.remove(img_path + '/' + name)


if __name__ == "__main__":
    app.run()

