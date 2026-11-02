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

The trainer augments each sample with a horizontally mirrored feature vector so one model can accept either hand. The dataset does not identify which hand produced each sample, so this is synthetic mirror augmentation—not validation on independently collected examples from both hands.

FStool practice asks for a learner name and a word goal, tracks correctly completed words, and provides a printable certificate when the goal is reached.
