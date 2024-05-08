const express = require('express');
const request = require('request-promise');

const app = express();
const port = 5000;
const windowSize = 10;
const testServerUrl = "http://20.244.56.144/test/";
const numbers = new Set();

const getNumberTypeUrl = (numberType) => {
  switch (numberType) {
    case 'p':
      return testServerUrl + "primes";
    case 'f':
      return testServerUrl + "fibonacci";
    case 'e':
      return testServerUrl + "even";
    case 'r':
      return testServerUrl + "random";
    default:
      return null;
  }
};

const getNumbers = async (numberType) => {
  const url = getNumberTypeUrl(numberType);
  if (!url) {
    return [];
  }
  try {
    const response = await request.get(url, { timeout: 500 });
    return JSON.parse(response).numbers;
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return [];
  }
};

const calculateAverage = async (req, res) => {
  const numberType = req.params.numberid;
  if (!['p', 'f', 'e', 'r'].includes(numberType)) {
    return res.status(400).json({ error: "Invalid number type" });
  }

  const receivedNumbers = await getNumbers(numberType);

  numbers.clear();
  receivedNumbers.forEach(num => numbers.add(num));


  if (numbers.size > windowSize) {
    numbers.delete([...numbers][0]);
  }

  const windowPrevState = Array.from(numbers).slice(-windowSize, windowSize - 1);
  const windowCurrState = Array.from(numbers).slice(-windowSize);
  const average = windowCurrState.length > 0 ? windowCurrState.reduce((sum, num) => sum + num, 0) / windowCurrState.length : 0.0;

  res.json({
    numbers: receivedNumbers,
    windowPrevState,
    windowCurrState,
    avg: average,
  });
};

app.get("/numbers/:numberid", calculateAverage);

app.listen(port, () => console.log(`Server listening on port ${port}`));
