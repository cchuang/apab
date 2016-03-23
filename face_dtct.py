#!/usr/bin/python
#
#   This example program shows how to find frontal human faces in an image.  In
#   particular, it shows how you can take a list of images from the command
#   line and display each on the screen with red boxes overlaid on each human
#   face.
#
#   The examples/faces folder contains some jpg images of people.  You can run
#   this program on them and see the detections by executing the
#   following command:
#       ./face_detector.py ../examples/faces/*.jpg
#

import sys

import dlib
from skimage import io
from skimage.draw import line


predictor_path = "/mnt/data/apab/shape_predictor_68_face_landmarks.dat"

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(predictor_path)
win = dlib.image_window()

for f in sys.argv[1:]:
    print("Processing file: {}".format(f))
    img = io.imread(f)
    # The 1 in the second argument indicates that we should upsample the image
    # 1 time.  This will make everything bigger and allow us to detect more
    # faces.

    win.clear_overlay()
    win.set_image(img)

    dets = detector(img, 3)

    win.add_overlay(dets)
    print("Number of faces detected: {}".format(len(dets)))
    for i, d in enumerate(dets):
        print("Detection {}: Left: {} Top: {} Right: {} Bottom: {}".format(
            i, d.left(), d.top(), d.right(), d.bottom()))
        shape = predictor(img, d)
        print("Part 0: {}, Part 1: {} ...".format(shape.part(0),
                                                  shape.part(1)))
        # Draw the face landmarks on the screen.
        win.add_overlay(shape)

        rr, cc = line(d.top(), d.left(), d.top(), d.right())
        img[rr, cc] = 255
        rr, cc = line(d.top(), d.right(), d.bottom(), d.right())
        img[rr, cc] = 255
        rr, cc = line(d.bottom(), d.right(), d.bottom(), d.left())
        img[rr, cc] = 255
        rr, cc = line(d.bottom(), d.left(), d.top(), d.left())
        img[rr, cc] = 255

    # io.imsave("tryout/{}".format(f), img)
    dlib.hit_enter_to_continue()
