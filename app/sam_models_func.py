import warnings
warnings.filterwarnings('ignore')

from fastai import *
from fastai.vision import *
from fastai.callbacks import *

from object_detection_fastai.helper.object_detection_helper import *
from object_detection_fastai.loss.RetinaNetFocalLoss import RetinaNetFocalLoss
from object_detection_fastai.models.RetinaNet import RetinaNet
from object_detection_fastai.callbacks.callbacks import BBLossMetrics, BBMetrics, PascalVOCMetric

get_y_func_test = lambda o:[[[128, 148, 290, 217.5], [152, 162, 170.5, 178]], ['4', 'eye_open']]
size = 512

def show_results_predict(img, bbox_pred, preds, scores, classes, figsize=(5,5)
                 , titleB: str=""):
    label = []
    b_box = []

    _, ax = plt.subplots(nrows=1, ncols=1, figsize=figsize)
    ax.set_title(titleB)

    img.show(ax=ax)
    if bbox_pred is not None:
        for bbox, c, scr in zip(bbox_pred, preds, scores):
            txt = str(c.item()) if classes is None else classes[c.item()]
            draw_rect(ax, [bbox[1],bbox[0],bbox[3],bbox[2]], text=f'{txt} {scr:.2f}')
            label.append(txt)
            #순서대로 x, y ,w ,h
            b_box.append([ (bbox[1],bbox[0] + bbox[2]), (bbox[1] + bbox[3],bbox[0] + bbox[2]) ,(bbox[1] + bbox[3],bbox[0]), (bbox[1] ,bbox[0]) ])
    return b_box, label


anchors = create_anchors(sizes=[(32,32),(16,16),(8,8),(4,4)], ratios=[0.5, 1, 2], scales=[0.35, 0.5, 0.6, 1, 1.25, 1.6])


def predict(x, learn: Learner):
    #이미지 파일 경로
    path_test = Path(x)
    
    #이미지 파일을 dataloader로 만들기.
    predict_data = (ObjectItemList.from_folder(path_test)
    #Where are the images? -> in coco
    .split_none()
    #.split_by_files(val_images)
    #How to split in train/valid? -> randomly with the default 20% in valid
    .label_from_func(get_y_func_test)
    #How to find the labels? -> use get_y_func
    .transform(size=size,resize_method=ResizeMethod.SQUISH) #get_transforms(), tfm_y=False
    #Data augmentation? -> Standard transforms with tfm_y=True
    .databunch(bs=1, collate_fn=bb_pad_collate))
    #Finally we convert to a DataBunch and we use bb_pad_collate
    #data = data.normalize()

    #기본 값 ( 바꿔주면 prediction도 달라짐 )
    detect_thresh = 0.25
    nms_thresh = 0.1
    image_count = 1

    #class들
    #새로운 데이터에서는 모두 통일돼있어서 front, up, down, left, right, eye_open, eye_close 만 따로 넣어주면 됨.
    #에러가 자꾸 나길래 보니깐 데이터마다 classes 에 있는 원소가 달랐음.
    predict_data.train_ds.classes = ['background', 'down', 'eye_close', 'eye_open', 'front', 'left', 'right', 'up']
    learn.data = predict_data

    #predict 과정.
    with torch.no_grad():
        img_batch, target_batch = learn.data.one_batch(DatasetType.Train, False, False, False)
        
        prediction_batch = learn.model(img_batch[:image_count])
        class_pred_batch, bbox_pred_batch = prediction_batch[:2]

        for img, clas_pred, bbox_pred in list(
                zip(img_batch, class_pred_batch, bbox_pred_batch)):
            if hasattr(learn.data, 'stats'):
                img = Image(learn.data.denorm(img))
            else:
                img = Image(img)

            bbox_pred, scores, preds = process_output(clas_pred, bbox_pred, anchors, detect_thresh)
            if bbox_pred is not None:
                to_keep = nms(bbox_pred, scores, nms_thresh)
                bbox_pred, preds, scores = bbox_pred[to_keep].cpu(), preds[to_keep].cpu(), scores[to_keep].cpu()

            t_sz = torch.Tensor([*img.size])[None].cpu()
          
            if bbox_pred is not None:
                bbox_pred = to_np(rescale_boxes(bbox_pred, t_sz))
                # change from center to top left
                bbox_pred[:, :2] = bbox_pred[:, :2] - bbox_pred[:, 2:] / 2

            bbox, label = show_results_predict(img, bbox_pred, preds, scores, learn.data.train_ds.classes[1:] , (10, 10), titleB="Prediction")
    return bbox, label

