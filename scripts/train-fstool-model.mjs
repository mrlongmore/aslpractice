import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as tf from '@tensorflow/tfjs';

const datasetPath = new URL('../my_clean_asl_dataset.json', import.meta.url);
const outputDirectory = new URL('../models/fstool/', import.meta.url);
const RANDOM_SEED = 20261102;
const VALIDATION_FRACTION = 0.2;
const AUGMENTATIONS_PER_HAND = 3;
const EXCLUDED_LABELS = new Set(['J', 'R', 'Z']);

function createRandom(seed) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function shuffle(items, random) {
    for (let index = items.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [items[index], items[other]] = [items[other], items[index]];
    }
    return items;
}

function rotatePoint(x, y, z, rotations) {
    const [rotateX, rotateY, rotateZ] = rotations;
    const cosX = Math.cos(rotateX);
    const sinX = Math.sin(rotateX);
    const cosY = Math.cos(rotateY);
    const sinY = Math.sin(rotateY);
    const cosZ = Math.cos(rotateZ);
    const sinZ = Math.sin(rotateZ);

    const afterX = [x, y * cosX - z * sinX, y * sinX + z * cosX];
    const afterY = [
        afterX[0] * cosY + afterX[2] * sinY,
        afterX[1],
        -afterX[0] * sinY + afterX[2] * cosY
    ];

    return [
        afterY[0] * cosZ - afterY[1] * sinZ,
        afterY[0] * sinZ + afterY[1] * cosZ,
        afterY[2]
    ];
}

function augmentFeatures(features, random, mirrored = false) {
    const scale = 0.8 + random() * 0.4;
    const maxRotation = Math.PI / 18;
    const rotations = Array.from({ length: 3 }, () => (random() * 2 - 1) * maxRotation);
    const noise = 0.004;
    const augmented = [];

    for (let index = 0; index < features.length; index += 3) {
        const x = features[index] * (mirrored ? -1 : 1);
        const [rotatedX, rotatedY, rotatedZ] = rotatePoint(x, features[index + 1], features[index + 2], rotations);
        augmented.push(
            rotatedX * scale + (random() * 2 - 1) * noise,
            rotatedY * scale + (random() * 2 - 1) * noise,
            rotatedZ * scale + (random() * 2 - 1) * noise
        );
    }

    return augmented;
}

function splitByLabel(dataset, random) {
    const byLabel = new Map();
    for (const sample of dataset) {
        if (!byLabel.has(sample.label)) byLabel.set(sample.label, []);
        byLabel.get(sample.label).push(sample);
    }

    const training = [];
    const validation = [];
    for (const samples of byLabel.values()) {
        shuffle(samples, random);
        const validationCount = Math.max(1, Math.floor(samples.length * VALIDATION_FRACTION));
        validation.push(...samples.slice(0, validationCount));
        training.push(...samples.slice(validationCount));
    }
    return { training, validation };
}

async function main() {
    await tf.setBackend('cpu');
    await tf.ready();

    const dataset = JSON.parse(await readFile(datasetPath, 'utf8'));
    if (!Array.isArray(dataset) || dataset.length === 0) {
        throw new Error('Dataset must be a non-empty array.');
    }
    for (const sample of dataset) {
        if (!Array.isArray(sample.features) || sample.features.length !== 63 ||
            !sample.features.every(Number.isFinite) ||
            typeof sample.label !== 'string' || !/^[A-Z]$/.test(sample.label)) {
            throw new Error(`Invalid dataset sample for label ${sample.label}.`);
        }
    }

    const filteredDataset = dataset.filter(sample => !EXCLUDED_LABELS.has(sample.label));
    const labels = [...new Set(filteredDataset.map(sample => sample.label))].sort();
    const random = createRandom(RANDOM_SEED);
    const { training, validation } = splitByLabel(filteredDataset, random);
    if (labels.length < 2 || training.length === 0 || validation.length === 0) {
        throw new Error('Dataset needs at least two labels and enough samples for training and validation.');
    }

    const labelIndices = new Map(labels.map((label, index) => [label, index]));
    const trainingByLabel = new Map(labels.map(label => [label, []]));
    for (const sample of training) trainingByLabel.get(sample.label).push(sample);
    const samplesPerLabel = Math.round(training.length / labels.length);
    const balancedTraining = labels.flatMap(label => {
        const samples = shuffle(trainingByLabel.get(label), random);
        return Array.from({ length: samplesPerLabel }, (_, index) => samples[index % samples.length]);
    });
    const trainingFeatures = [];
    const trainingTargets = [];
    const validationFeatures = validation.map(sample => sample.features);
    const validationTargets = validation.map(sample => labelIndices.get(sample.label));

    for (const sample of balancedTraining) {
        const labelIndex = labelIndices.get(sample.label);
        trainingFeatures.push(sample.features);
        trainingTargets.push(labelIndex);
        trainingFeatures.push(augmentFeatures(sample.features, random, true));
        trainingTargets.push(labelIndex);

        for (let augmentation = 0; augmentation < AUGMENTATIONS_PER_HAND; augmentation++) {
            trainingFeatures.push(augmentFeatures(sample.features, random));
            trainingTargets.push(labelIndex);
            trainingFeatures.push(augmentFeatures(sample.features, random, true));
            trainingTargets.push(labelIndex);
        }
    }

    const trainingLabelTensor = tf.tensor1d(trainingTargets, 'int32');
    const validationLabelTensor = tf.tensor1d(validationTargets, 'int32');
    const ys = tf.oneHot(trainingLabelTensor, labels.length);
    const validationYs = tf.oneHot(validationLabelTensor, labels.length);
    trainingLabelTensor.dispose();
    validationLabelTensor.dispose();

    const xs = tf.tensor2d(trainingFeatures);
    const validationXs = tf.tensor2d(validationFeatures);

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [63], units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }));
    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    let bestValidationLoss = Infinity;
    let bestEpoch = 0;
    let epochsWithoutImprovement = 0;
    let bestWeights = [];

    try {
        console.log(`Training on ${training.length} source samples (${dataset.length - filteredDataset.length} excluded); validating on ${validation.length} held-out samples across ${labels.length} labels...`);
        await model.fit(xs, ys, {
            epochs: 60,
            batchSize: 32,
            shuffle: true,
            validationData: [validationXs, validationYs],
            callbacks: {
                onEpochEnd: async (epoch, logs) => {
                    if (logs.val_loss < bestValidationLoss) {
                        bestWeights.forEach(weight => weight.dispose());
                        bestWeights = model.getWeights().map(weight => weight.clone());
                        bestValidationLoss = logs.val_loss;
                        bestEpoch = epoch + 1;
                        epochsWithoutImprovement = 0;
                    } else {
                        epochsWithoutImprovement++;
                    }

                    if ((epoch + 1) % 10 === 0 || epoch === 0) {
                        console.log(`Epoch ${epoch + 1}: accuracy ${(logs.acc * 100).toFixed(1)}%, validation accuracy ${(logs.val_acc * 100).toFixed(1)}%`);
                    }
                    if (epochsWithoutImprovement >= 8) model.stopTraining = true;
                }
            }
        });
        model.setWeights(bestWeights);
        const evaluation = model.evaluate(validationXs, validationYs);
        const validationLoss = (await evaluation[0].data())[0];
        const validationAccuracy = (await evaluation[1].data())[0];
        evaluation.forEach(tensor => tensor.dispose());

        await mkdir(outputDirectory, { recursive: true });
        await model.save(tf.io.withSaveHandler(async artifacts => {
            const weightData = Buffer.from(new Uint8Array(artifacts.weightData));
            const modelJson = {
                format: 'layers-model',
                generatedBy: `TensorFlow.js tfjs-layers v${tf.version.tfjs}`,
                convertedBy: null,
                modelTopology: artifacts.modelTopology,
                weightsManifest: [{ paths: ['weights.bin'], weights: artifacts.weightSpecs }]
            };
            const metadata = {
                labels,
                excludedLabels: [...EXCLUDED_LABELS],
                inputFeatures: 63,
                trainingSamples: training.length,
                balancedTrainingSamples: balancedTraining.length,
                augmentedTrainingSamples: trainingFeatures.length,
                validationSamples: validation.length,
                validationAccuracy,
                validationLoss,
                bestEpoch,
                mirroredAugmentation: true,
                scaleAugmentation: [0.8, 1.2],
                rotationAugmentationDegrees: 10,
                coordinateNoise: 0.004,
                validationSplitByLabel: VALIDATION_FRACTION,
                datasetHasHandednessLabels: false,
                temporalAugmentation: false
            };

            await Promise.all([
                writeFile(new URL('model.json', outputDirectory), JSON.stringify(modelJson, null, 2)),
                writeFile(new URL('weights.bin', outputDirectory), weightData),
                writeFile(new URL('metadata.json', outputDirectory), JSON.stringify(metadata, null, 2))
            ]);

            return {
                modelArtifactsInfo: {
                    dateSaved: new Date(),
                    modelTopologyType: 'JSON',
                    modelTopologyBytes: Buffer.byteLength(JSON.stringify(artifacts.modelTopology)),
                    weightSpecsBytes: Buffer.byteLength(JSON.stringify(artifacts.weightSpecs)),
                    weightDataBytes: weightData.byteLength
                }
            };
        }));

        console.log(`Saved shared left/right model to ${path.resolve(new URL('../models/fstool/', import.meta.url).pathname)}.`);
    } finally {
        xs.dispose();
        ys.dispose();
        validationXs.dispose();
        validationYs.dispose();
        bestWeights.forEach(weight => weight.dispose());
        model.dispose();
    }
}

main().catch(error => {
    console.error('Could not train the fstool model:', error);
    process.exitCode = 1;
});
