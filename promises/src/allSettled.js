const checkPromises = async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7]

    const results = await Promise.allSettled(arr.map(async (item) => new Promise((resolve, reject) => setTimeout(() => {
        if (item % 2 === 0) {
            reject(item)
        }
        resolve(item)
    }, 100))))

    const rejectedPromises = results.filter(result => result.status === 'rejected');

    if (rejectedPromises.length > 0) {
        throw new Error(`Some bonus updates failed: ${JSON.stringify(rejectedPromises)}`);
    }

    console.log(results);

    return results;
}


checkPromises();
