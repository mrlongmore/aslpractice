# aslpractice

Longmore Zone is a responsive directory for the ASL games and practice tools in this repository.

## Updating the directory

Edit [`catalog.js`](catalog.js) to add or update entries in the `games` list. Each entry includes a title, short description, page path, icon, and tags. Add an optional `image: 'game_thumbnails/image.png'` to show a game thumbnail; the icon placeholder remains visible when no image is set or an image cannot be loaded. Use `type: 'tool'` for practice resources; entries without a type are games. Tags are shown on cards and automatically become filters.

Add dated announcements to the `updates` list in [`updates.js`](updates.js). Updates and Roadmap each have their own page linked from the main navigation.

The homepage hero chooses a random sign GIF from the image entries in [`vocab.json`](vocab.json) each time the page opens.

The Practice, Vocabulary, and Word Search navigation items link to `asl_anchor.html` (the original homepage quiz), `buttonboard.html`, and `longbot.html`, respectively. Catalog game pages include a shared back link to the homepage.

The original ASL Anchor quiz is available at [`asl_anchor.html`](asl_anchor.html).

## Fingerspelling model

[`fstool.html`](fstool.html) loads the pre-trained TensorFlow.js model from [`models/fstool/`](models/fstool/), so visitors do not train it in their browser. To regenerate the model after changing [`my_clean_asl_dataset.json`](my_clean_asl_dataset.json), install the dependencies with `npm install` and run `npm run train:fstool`.

The trainer excludes J, R, and Z, and uses a deterministic, label-stratified holdout for validation, balanced class sampling, early stopping, and training-only hand-mirror, scale, small rotation, and coordinate-noise augmentation. The published validation score is measured on held-out records, but the dataset does not identify signers or handedness, so it is not a measure of performance on new signers or independently collected left/right hands. Mirroring is synthetic augmentation. The browser reports the model's held-out score and lets learners adjust the auto-record hold time.

The dataset contains one 63-feature landmark frame per sample, not labeled motion sequences. The model therefore recognizes static handshapes; adding movement-based letters requires labeled sequences from different signers and hands at varied signing speeds. The practice word bank uses only letters in the trained model.

FStool practice asks for a learner name and a word goal, tracks correctly completed words, and provides a printable certificate when the goal is reached.

## Eyebrow practice

[`eyebrowstool.html`](eyebrowstool.html) uses MediaPipe Face Landmarker blendshapes to recognize raised and furrowed eyebrows in the browser. Learners calibrate a neutral expression first, enter their name, and choose a sentence goal. Each sentence stays on screen until the requested expression is held; incorrect movements do not count as a mistake or reduce the score. Reaching the goal earns a printable certificate. Camera frames are processed in the browser and are not uploaded by this page.

[`eyebrow-sentences.js`](eyebrow-sentences.js) is the shared sentence list used by both [`eyebrows.html`](eyebrows.html) and the practice tool. The pretrained MediaPipe model is general facial-expression technology, not an ASL-specific eyebrow dataset; model and library assets are provided by Google MediaPipe.
