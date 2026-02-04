import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

await tf.ready();
console.log('TensorFlow ready');
const a = tf.tensor([1, 2, 3, 4]);
a.print();
