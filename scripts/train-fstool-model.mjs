import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as tf from '@tensorflow/tfjs';

const datasetPath = new URL('../my_clean_asl_dataset.json', import.meta.url);
const outputDirectory = new URL('../models/fstool/', import.meta.url);

function mirrorFeatures(features) {
    return features.map((value, index) => index % 3 === 0 ? -value : value);
}

async function main() {
    await tf.setBackend('cpu');
    await tf.ready();

    const dataset = JSON.parse(await readFile(datasetPath, 'utf8'));
    const labels = [...new Set(dataset.map(sample => sample.label))].sort();
    const features = [];
    const targets = [];

    for (const sample of dataset) {
        if (!Array.isArray(sample.features) || sample.features.length !== 63 ||
            !sample.features.every(Number.isFinite) || !labels.includes(sample.label)) {
            throw new Error(`Invalid dataset sample for label ${sample.label}.`);
        }

        const labelIndex = labels.indexOf(sample.label);
        features.push(sample.features, mirrorFeatures(sample.features));
        targets.push(labelIndex, labelIndex);
    }

    if (features.length === 0 || labels.length === 0) {
        throw new Error('Dataset contains no usable training samples.');
    }

    const xs = tf.tensor2d(features);
    const labelTensor = tf.tensor1d(targets, 'int32');
    const ys = tf.oneHot(labelTensor, labels.length);
    labelTensor.dispose();

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [63], units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: labels.length, activation: 'softmax' }));
    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    try {
        console.log(`Training one shared model on ${features.length} samples across ${labels.length} labels...`);
        await model.fit(xs, ys, { epochs: 50, batchSize: 32, shuffle: true });

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
                inputFeatures: 63,
                trainingSamples: features.length,
                mirroredAugmentation: true
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
        model.dispose();
    }
}

main().catch(error => {
    console.error('Could not train the fstool model:', error);
    process.exitCode = 1;
});
