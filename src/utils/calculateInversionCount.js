function calculateInversionCount(user1, user2) {
  let inversionCount = 0;

  const arr1 = user1?.orderedList || [];
  const arr2 = user2?.orderedList || [];
  console.log(arr1, arr2);
  
  for (let i = 0; i < arr1.length; i++) {
    for (let j = i + 1; j < arr1.length; j++) {
      const item1 = arr1[i];
      const item2 = arr1[j];

      const index1InArr2 = arr2.indexOf(item1);
      const index2InArr2 = arr2.indexOf(item2);
      if (
        index1InArr2 !== -1 &&
        index2InArr2 !== -1 &&
        index1InArr2 > index2InArr2
      ) {
        inversionCount++;
      }
    }
  }

  return inversionCount;
}

export default calculateInversionCount;
