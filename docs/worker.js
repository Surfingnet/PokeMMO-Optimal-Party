const worker_function = async () => {

    var go = false;

    /**
     * Generates a chunk of `chunkSize` unique combinations of `k` elements out of `arr`, starting from index `startIndex`.
     * The function is meant to be executed in a worker, and it will post a message to the main thread with the progress every 10000 iterations.
     * The function also posts a message when the computation is finished, with the progress set to 1.0.
     * If an error occurs, the function posts a message with the error and the property `abort` set to 1.
     * @param {number} id - an identifier for the computation
     * @param {Array} arr - the array of elements to generate combinations from
     * @param {number} k - the number of elements to generate combinations of
     * @param {number} startIndex - the index at which to start generating combinations
     * @param {number} totalCombinations - the total number of combinations to generate
     * @param {number} chunkSize - the number of combinations to generate in this chunk
     * @returns {Promise<Array>} - a promise that resolves to the array of combinations
     */
    async function makeChunk(id, arr, k, startIndex, totalCombinations, chunkSize) {
        try {
            const result = new Array(Math.min(chunkSize, totalCombinations - startIndex));
            var resultCrawler = 0;

            var counter = 0;

            async function helper(start, current) {
                if (current.length === k) {
                    if (counter >= startIndex) {
                        result[resultCrawler++] = [...current]; // Ajouter une copie du tableau courant
                    }
                    counter++;
                    return;
                }

                for (var i = start; i < arr.length && counter < (startIndex + chunkSize); i++) {
                    current.push(arr[i]); // Ajouter l'élément courant
                    await helper(i + 1, current); // Recurse avec l'élément suivant
                    current.pop(); // Retirer l'élément pour revenir à l'état précédent

                    if (counter % 10000 === 0) {
                        if (counter / totalCombinations !== 1.0) {
                            self.postMessage({ id: id, progress: Math.min(0.99, Math.max(0, counter / (startIndex + chunkSize))) });
                        }
                    }
                }
            }

            await helper(0, []);

            self.postMessage({ id: id, progress: 1.0 });

            return result;

        } catch (error) {
            self.postMessage({ abort: 1, error: error });
        }
    }

    /**
     * Computes the best party out of a given chunk of parties, where the best party is the one with the highest score.
     * The score is calculated by taking geometric average of the edges of each monster of the party against each monster of the pool.
     * The edge of the monster in the party with the maximum edge against a monster from the pool is twice as important.
     * Meaning it's as important as the edges of the other monsters of the party against this monster from the pool.
     * It means it's relevant even if you can only play the best monster half the time. (opponent spam switching etc.)
     * The edges are already stored in the cache `typeEdgeByNormalizedStatDiffCache`.
     * The function posts a message to the main thread with the progress every iteration, and with the result at the end.
     * If an error occurs, the function posts a message with the error and the property `abort` set to 1.
     * @param {number} id - an identifier for the computation
     * @param {Array} chunk - the chunk of parties to compute the best party from
     * @param {Array} monsters - the array of all monsters in the pool
     * @param {Object} typeEdgeByNormalizedStatDiffCache - the cache of type edges by normalized stat difference
     * @returns {Promise<void>}
     */
    let compute = async (id, chunk, monsters, typeEdgeByNormalizedStatDiffCache) => {

        // cached number to do only 1 Math.pow()
        const powCache = (1 / 7) * (1 / monsters.length);

        const matrix = new Array(6);
        for (var i = 0; i < 6; i++) { matrix[i] = new Array(monsters.length) };

        var scoreAcc;// buffer
        var partyScore;// total

        let calculatePartyScore = (party) => {

            party.forEach((monster1, i) => {
                monsters.forEach((monster2, j) => {
                    matrix[i][j] = typeEdgeByNormalizedStatDiffCache[monster1.id + '-' + monster2.id];//cache access
                });
            });

            partyScore = 1;

            for (var i = 0; i < monsters.length; i++) {

                scoreAcc = 0;
                for (var j = 0; j < 6; j++) {
                    if (matrix[j][i] > scoreAcc) { scoreAcc = matrix[j][i] };
                }

                // at this point scoreAcc is the max of the 6 edges for this monster

                for (var j = 0; j < 6; j++) { scoreAcc *= matrix[j][i] };

                // at this point scoreAcc is the product of the 6 edges and the max edge
                // so that it counts/weights twice as much in the score
                // or in other words, the max weights as much as the rest
                // because you're more likely to play against a monster with your best counter in your party at least half of the time

                //scoreAcc = Math.pow(scoreAcc, 0.1428571428571429); //power 1/7
                // ^^^^ nope, we skip double power using cache above instead
                partyScore *= Math.pow(scoreAcc, powCache);
            }

            return partyScore;
        };

        var currentBestParty = chunk[0];
        var currentBestPartyScore = 0;
        var currentPartyScore = 0;

        try {

            for (var i = 0; i < chunk.length; i++) {

                currentPartyScore = calculatePartyScore(chunk[i]);

                if (currentPartyScore > currentBestPartyScore) {
                    currentBestParty = chunk[i];
                    currentBestPartyScore = currentPartyScore;
                }

                self.postMessage({ id: id, progress: i / chunk.length });
                // don't sleep(1) here
                // future me better trust me

            }

            self.postMessage({ id: id, progress: 1.0, party: currentBestParty, score: currentBestPartyScore });

        } catch (error) {
            self.postMessage({ abort: 1, error: error });
        }
    }

    self.onmessage = async (event) => {

        if (event.data.hasOwnProperty("go")) { go = true; return };

        // Process data in the Web Worker
        // Return results to the main thread
        const chunk = await makeChunk(
            event.data.id,
            event.data.monsters,
            6,
            event.data.id * event.data.chunkSize,
            event.data.totalCombinations,
            event.data.chunkSize
        );

        // wait until main thread says go
        while (!go) { await new Promise(r => setTimeout(r, 200)); };

        await compute(
            event.data.id,
            chunk,
            event.data.monsters,
            event.data.typeEdgeByNormalizedStatDiffCache);
    };
};