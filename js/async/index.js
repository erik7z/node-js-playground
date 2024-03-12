// async function processAsyncResults(someArray) {
//     const success = [];
//     const errors  = [];
//
//     await Promise.all(someArray.map(async (value) => {
//         try {
//             const result = await randomResult(value);
//             success.push(result)
//         } catch (error) {
//             errors.push(error);
//         }
//     }));
//     return JSON.stringify({success, errors});
// }
//
// async function randomResult(value) {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             if (value % 2 === 0) {
//                 resolve(value);
//             } else {
//                 reject(value);
//             }
//         }, Math.random() * 1000);
//     })
// }
//
// const arr = [1, 2, 3, 4, 5];
//
// processAsyncResults(arr).then(console.log);

// helper function
const randomResult = value => new Promise((resolve, reject) => setTimeout(value % 2 === 0 ? resolve : reject, Math.random() * 1000, value));

// function to be fixed
async function processAsyncResults(valuesArr) {
    let results = [];
    let errors = [];

    valuesArr.forEach((value) => {
        randomResult(value)
            .then((response) => results.push(response))
            .catch((error) => errors.push(error));
    });

    return { results, errors };
}

const arr = [1, 2, 3, 4, 5];
processAsyncResults(arr).then(console.log);


// async function processAsyncResults(valuesArr) {
//     // Use Promise.allSettled to wait for all promises to settle
//     const settledPromises = await Promise.allSettled(valuesArr.map(value => randomResult(value)));
//
//     // Initialize results and errors arrays
//     let results = [];
//     let errors = [];
//
//     // Separate settled promises into results and errors based on their status
//     settledPromises.forEach(promise => {
//         if (promise.status === 'fulfilled') {
//             results.push(promise.value);
//         } else {
//             errors.push(promise.reason);
//         }
//     });
//
//     return { results, errors };
// }
//
// const arr = [1, 2, 3, 4, 5];
// processAsyncResults(arr).then(console.log);
