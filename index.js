const CANDIDATE_ID = "d75f230e-89d3-4c40-b125-b9c4c6ea8584";
const BASE_URL = "https://challenge.crossmint.io/api";
const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

const getGoalMap = async () => {
    return fetch(`${BASE_URL}/map/${CANDIDATE_ID}/goal?candidateId=${CANDIDATE_ID}`, { method: "GET" })
        .then(d => d.json())
        .then(res => {
            console.log(res);
            return res.goal;
        }).catch(e => {
            console.log("Error getting goal map", e);
            process.exit(1);
        });
};

const changeTile = async (ROW, COL, TILE_NAME, OPERATION) => {
    const { body, endpoint } = generateParams(ROW, COL, TILE_NAME);

    fetch(`${BASE_URL}/${endpoint}`, {
        method: OPERATION,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ ...body, candidateId: CANDIDATE_ID })
    }).then(data => {
        console.log("STATUS: ", data.status);
        return data.text();
    }).then(res => {
        console.log("RESULT: ", res);
    }).catch(e => console.log("Error when trying to POST to /api/polyanets", e));
}

const generateParams = (ROW, COL, TILE_NAME) => {
    if (TILE_NAME === "POLYANET") {
        return {
            body: {
                row: ROW, //Can probably store this in a variable and reuse but can't test it now with the infinite loading bug after completing the challenge
                column: COL
            },
            endpoint: "polyanets"
        };
    } else if (TILE_NAME.endsWith("COMETH")) {
        const direction = TILE_NAME.split("_")[0].toLocaleLowerCase();
        return {
            body: {
                row: ROW,
                column: COL,
                direction
            },
            endpoint: "comeths"
        };
    } else if (TILE_NAME.endsWith("SOLOON")) {
        const color = TILE_NAME.split("_")[0].toLocaleLowerCase();
        return {
            body: {
                row: ROW,
                column: COL,
                color
            },
            endpoint: "soloons"
        };
    } else {
        console.log("Something went wrong");
    }
}

const solvePolyanetMap = async () => {
    const goalMap = await getGoalMap();
    const rowCount = goalMap.length;
    const colCount = goalMap[0].length;

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
            const tile = goalMap[row][col];
            if (tile !== "SPACE") {
                await changeTile(row, col, tile, "POST");
                await delay(2000); // Wait for 2 seconds to avoid rate limit
            }
        }
    }
}

const resetMap = async () => {
    const goalMap = await getGoalMap();
    const rowCount = goalMap.length;
    const colCount = goalMap[0].length;

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
            const tile = goalMap[row][col];
            console.log("DELETING ROW: ", row, " COL: ", col);
            await changeTile(row, col, tile, "DELETE");
            await delay(2000);
        }
    }
}

(async () => {
    try {
        await solvePolyanetMap();
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();