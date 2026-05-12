---
title: "Eye-Tracking Data Collection and Processing"
subtitle: "Technical explanation for the TFM reading comprehension experiment"
author: "Michaela Freire Griffith"
date: "2026-05-02"
---

# Eye-Tracking Data Collection and Processing

This document explains what the experiment records during eye tracking, when recording happens, how raw gaze data is cleaned, how areas of interest are classified, and how the final summary measures are calculated.

## 1. When Eye Tracking Happens

Eye tracking is active only during the two reading experiences:

1. Calibration before Experience A
2. Experience A
3. Break
4. Calibration before Experience B
5. Experience B

The app starts recording gaze data when Experience A or Experience B loads. It stops recording when that experience ends or when the component is unmounted.

The app does not use Pre, Post, Intro, Break, or Calibration as reading gaze data. Calibration is used to improve the estimates collected later during the experience.

## 2. Calibration

Before each experience, participants complete calibration. The purpose of calibration is to help WebGazer map the participant's eye appearance to screen coordinates.

During calibration, the participant looks at target points on the screen. The app then performs a validation step with dots across the screen. During validation, the app compares:

- where the participant was supposed to look
- where WebGazer predicted they were looking

From this comparison, the app calculates an average offset:

```text
xOffset = average(predictedX - targetX)
yOffset = average(predictedY - targetY)
```

During the experience, each prediction is corrected using:

```text
correctedX = rawX - xOffset
correctedY = rawY - yOffset
```

This correction helps when WebGazer is consistently biased in one direction. For example, if WebGazer consistently predicts the gaze point too low on the screen, the correction should move the cleaned `y` coordinate upward.

Calibration does not make WebGazer perfect. It can correct systematic error, but it cannot fully correct noise caused by webcam quality, lighting, head movement, glasses reflections, posture changes, or WebGazer losing the participant's face/eyes.

## 3. Sampling

The app samples gaze every `100ms`.

This means:

```text
1 CSV row = approximately 100ms
10 CSV rows = approximately 1 second
3 consecutive outside rows = approximately 300ms
```

The browser timer is not perfectly exact, so these durations should be interpreted as approximate. However, `100ms` is the intended unit used for the CSV rows and the duration summaries.

The app does not save every raw WebGazer callback directly. WebGazer may produce predictions at its own rhythm. The experiment samples the latest available WebGazer prediction every `100ms`.

## 4. CSV Data

Each row in the CSV represents one sampled gaze point.

| Column | Meaning |
|---|---|
| `task` | Whether the row belongs to Experience A or Experience B. |
| `raw_x` | Original WebGazer x-coordinate before correction/cleaning. |
| `raw_y` | Original WebGazer y-coordinate before correction/cleaning. |
| `x` | Cleaned x-coordinate after calibration correction and smoothing. |
| `y` | Cleaned y-coordinate after calibration correction and smoothing. |
| `t` | Timestamp in milliseconds. |
| `route` | Page route where the gaze sample was recorded, such as `/experiencea` or `/experienceb`. |
| `section_id` | Current reading section/step. |
| `aoi` | Area of interest classification for that sample. |

The most important distinction is:

- `raw_x` and `raw_y` are WebGazer's original predictions.
- `x` and `y` are the processed coordinates used by the app for AOI classification.

So the interpretation is:

```text
raw_x/raw_y = what WebGazer originally estimated
x/y = corrected and smoothed estimate used for analysis
```

## 5. Data Cleaning Pipeline

For each reading step, the app applies several cleaning and processing steps before classifying gaze into areas of interest.

### 5.1 Ignore the first 1000ms after a step change

When a participant moves to a new reading step, the app ignores the first `1000ms`.

This is done because gaze estimates can be unstable immediately after a page or step change. The participant may be moving their eyes, the page may have just scrolled to the top, the layout may have changed, or WebGazer may still be settling.

The sequence is:

```text
new reading step starts
wait 1000ms
begin recording gaze samples for that step
```

This prevents the first second of each step from contaminating the AOI measurements.

### 5.2 Check for a recent usable WebGazer prediction

Every `100ms`, the app checks whether there is a recent usable WebGazer prediction.

If there is no recent prediction, or the latest prediction is too old, the app records:

```text
aoi = missing_prediction
x = blank
y = blank
```

The app only records `missing_prediction` after it has already seen at least one usable prediction for that reading section. This prevents the CSV from filling with missing rows before WebGazer has properly started.

A `missing_prediction` row can happen when:

- WebGazer loses the participant's face or eyes
- the participant looks away
- webcam or lighting conditions make prediction unreliable
- the app rejects a prediction as too jumpy/noisy
- WebGazer does not return a recent enough prediction

`missing_prediction` does not prove exactly what the participant did. It means the app did not have a usable gaze coordinate for that `100ms` sample.

### 5.3 Apply calibration correction

For usable predictions, the app applies the calibration offset:

```text
correctedX = rawX - xOffset
correctedY = rawY - yOffset
```

This is intended to correct systematic bias. It helps if WebGazer is consistently too high, too low, too far left, or too far right.

It helps less if the error changes over time, for example because the participant moves their head or changes posture.

### 5.4 Reject large jumps

The app compares the current corrected prediction with the previous smoothed prediction.

If the new point suddenly jumps too far, it is treated as unreliable. The jump is rejected if it is larger than:

```text
max(280px, elapsedMs * 1.8)
```

In practice, this means very large sudden movements are treated as noise rather than real gaze movement.

When a large jump is rejected, the app records:

```text
aoi = missing_prediction
x = blank
y = blank
```

The coordinate is not trusted enough to classify it as `reading`, `progress`, `screen_tut`, or `outside`.

### 5.5 Apply exponential smoothing

For usable predictions, the app smooths the corrected coordinates.

The smoothing formula is:

```text
smoothedX = previousSmoothedX + 0.35 * (correctedX - previousSmoothedX)
smoothedY = previousSmoothedY + 0.35 * (correctedY - previousSmoothedY)
```

The smoothing alpha is:

```text
0.35
```

This means the cleaned gaze point moves 35% of the way toward the newest prediction each time.

Smoothing reduces jitter. WebGazer can flicker around even when a participant is looking at the same area. Smoothing makes the estimate more stable.

The tradeoff is that smoothing slightly delays fast gaze movements. For this study's main interest, sustained attention and time in area of interest, this is acceptable.

## 6. Area of Interest Classification

After the app has a cleaned `x/y` coordinate, it classifies the point into an area of interest.

The AOIs are responsive. They are not hardcoded pixel boxes. The app measures the actual layout of the page using the browser's current element positions:

- progress area DOM rectangle
- reading area DOM rectangle
- browser viewport

This means that if the participant's screen size changes, or the reading area becomes wider or taller, the AOI boundaries update too.

The classification order is:

```text
1. If x/y is inside the progress area -> progress
2. Else if x/y is inside the reading area -> reading
3. Else if x/y is inside the browser viewport -> screen_tut
4. Else -> outside
```

| AOI | Meaning |
|---|---|
| `reading` | The cleaned gaze coordinate is inside the white reading/content area. |
| `progress` | The cleaned gaze coordinate is inside the light-blue progress/header area. |
| `screen_tut` | The cleaned gaze coordinate is inside the browser window, but outside the reading and progress AOIs. |
| `outside` | WebGazer produced a coordinate outside the browser viewport. |
| `missing_prediction` | The app did not have a usable gaze coordinate for that sample. |

### 6.1 `reading`

`reading` means the cleaned gaze coordinate is inside the white reading/content area. This is the main "on reading area" measure.

### 6.2 `progress`

`progress` means the cleaned gaze coordinate is inside the light-blue progress/header area. This is not reading text, but it is still inside the experiment interface.

### 6.3 `screen_tut`

`screen_tut` means the cleaned gaze coordinate is inside the browser window but outside the reading and progress AOIs.

This includes the surrounding light-blue area or other parts of the experiment screen. It is interpreted as on-screen but not on the reading area.

### 6.4 `outside`

`outside` means WebGazer produced a coordinate outside the browser viewport.

Important: `outside` is not ground truth that the participant looked away from the computer. It means the predicted gaze coordinate landed outside the visible browser window.

This could happen because:

- the participant looked away from the browser
- the participant looked toward another part of the physical screen
- the prediction drifted outside the viewport
- WebGazer was noisy

The best interpretation is:

```text
usable prediction, but outside the browser viewport
```

### 6.5 `missing_prediction`

`missing_prediction` means no usable gaze coordinate was available for that `100ms` sample.

It can happen if:

- WebGazer loses the face or eyes
- the participant looks away
- webcam or lighting conditions make prediction unreliable
- the app rejects a very large jump
- WebGazer does not return a recent enough prediction

It is different from `outside`:

```text
outside = we have a coordinate, but it is outside the browser
missing_prediction = we do not have a usable coordinate
```

## 7. Responsive AOIs

The AOIs are based on live DOM rectangles.

The app observes:

```text
progressAreaRef
readingAreaRef
```

It updates the AOI boundaries when the layout changes, including:

- window resize
- scrolling
- responsive layout changes
- reading area size changes

So if the reading box is larger on one screen, the `reading` AOI is larger too. This matters because participants may use different screen sizes.

## 8. Experience A and Experience B

Experience A and Experience B use the same eye-tracking logic.

At the end of Experience A:

- summary rows are saved to Supabase
- raw gaze rows are stored locally in the browser so they can later be included in the final CSV

At the end of Experience B:

- summary rows are saved to Supabase
- Experience A raw gaze rows are loaded from local storage
- Experience B raw gaze rows are added
- one CSV is exported containing both A and B

The final CSV should include both experiences, assuming Experience A completed and local storage was not cleared.

## 9. Supabase Summary Data

For each reading step, the app saves summary measures to the `eye_tracking` table.

The AOI duration fields are:

```text
progress_aoi_duration_ms
reading_aoi_duration_ms
screen_tut_aoi_duration_ms
outside_aoi_duration_ms
missing_prediction_duration_ms
off_reading_duration_ms
```

The AOI percentage fields are:

```text
progress_aoi_percent
reading_aoi_percent
screen_tut_aoi_percent
outside_aoi_percent
missing_prediction_percent
off_reading_percent
```

Duration fields are calculated as:

```text
number of samples in category * 100ms
```

For example:

```text
12 reading samples * 100ms = 1200ms reading duration
```

Percent fields are calculated as:

```text
samples in category / total samples for that reading step * 100
```

The denominator includes all timeline samples for that step, including `missing_prediction`.

Therefore, these categories should approximately sum to 100%:

```text
reading
+ progress
+ screen_tut
+ outside
+ missing_prediction
≈ 100%
```

Small differences can happen because percentages are rounded.

## 10. Off-Reading Measure

The key sustained-attention measure is:

```text
off_reading_duration_ms =
screen_tut_aoi_duration_ms
+ outside_aoi_duration_ms
+ missing_prediction_duration_ms
```

And:

```text
off_reading_percent =
(screen_tut samples + outside samples + missing_prediction samples)
/
total samples for that reading step
* 100
```

So higher `off_reading_duration_ms` or `off_reading_percent` means more time not confidently classified as reading.

This is still a proxy. It does not prove that the participant was distracted. It means their gaze was not measured inside the reading AOI.

Currently, `progress` is not included in `off_reading_duration_ms`. Looking at the progress bar is treated separately, not as off-reading.

## 11. Interpretation for Sustained Attention

The strongest evidence that the participant was looking at the reading material is:

```text
reading
```

The participant is still on the experiment screen, but not in the reading area, when the AOI is:

```text
progress
screen_tut
```

The participant may be looking away, or the gaze estimate may be noisy, when the AOI is:

```text
outside
missing_prediction
```

The main off-reading/distraction proxy is:

```text
screen_tut + outside + missing_prediction
```

## 12. Why 100ms Is Appropriate for This Study

At `100ms`, the app collects 10 samples per second.

For sustained attention, this is usually enough because the main interest is not a single tiny eye movement. The meaningful measures are:

- how much of the reading step was spent in the reading AOI
- how much was spent off-reading
- whether participants had repeated or extended off-reading periods

At `100ms`:

```text
1 sample = 100ms
5 samples = 500ms
10 samples = 1 second
30 samples = 3 seconds
```

This keeps the CSV interpretable and makes the summary measures less sensitive to tiny gaze flickers.

## 13. Important Limitations

This is webcam-based gaze tracking, not lab-grade eye tracking. The data should be interpreted as approximate screen-region attention, not exact fixation data.

Precision can be reduced by:

- poor lighting
- webcam angle
- participant head movement
- posture changes
- glasses or screen reflections
- small laptop camera quality
- participant sitting too close or too far away
- WebGazer losing face landmarks
- calibration drift over time

Also:

- `missing_prediction` does not always mean the participant looked away.
- `outside` does not always mean the participant looked outside the physical screen.

They are best treated as evidence that gaze was not confidently measured inside the reading AOI.

## 14. Complete Pipeline in Plain Terms

The current pipeline is:

```text
Participant reaches reading step
wait 1000ms
every 100ms:
  get latest WebGazer prediction
  if no usable prediction:
    record missing_prediction
  otherwise:
    save raw_x/raw_y
    apply calibration correction
    reject very large jumps
    smooth x/y
    classify x/y into AOI
    save row to CSV data

At end of each reading step/experience:
  count samples in each AOI
  convert counts to milliseconds
  convert counts to percentages
  save summary to Supabase
```

The key interpretation is:

```text
reading_aoi_duration_ms = time likely spent looking at reading area

off_reading_duration_ms =
time looking elsewhere on screen
+ time predicted outside browser
+ time with no usable gaze prediction
```

