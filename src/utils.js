import isTypedArray from 'lodash/isTypedArray';
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import take from 'lodash/take';

import { imagenetClasses } from './imagenet';

export function imagenetClassesTopK(classProbabilities, k = 5) {
  const probs = isTypedArray(classProbabilities)
    ? Array.prototype.slice.call(classProbabilities)
    : classProbabilities;

  const sorted = reverse(
    sortBy(
      probs.map((prob, index) => [ prob, index ]),
      probIndex => probIndex[0]
    )
  );

  const topK = take(sorted, k).map(probIndex => {
    const iClass = imagenetClasses[probIndex[1]];
    return {
      id: iClass[0],
      name: iClass[1].replace(/_/, ' '),
      probability: probIndex[0]
    };
  });
  return topK;
}
