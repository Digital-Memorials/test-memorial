/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_CONDOLENCESTABLE_ARN
	STORAGE_CONDOLENCESTABLE_NAME
	STORAGE_CONDOLENCESTABLE_STREAMARN
	STORAGE_MEMORIESTABLE_ARN
	STORAGE_MEMORIESTABLE_NAME
	STORAGE_MEMORIESTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/**********************
 * Memory endpoints *
**********************/

// Get all memories
app.get('/api/memories', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_MEMORIESTABLE_NAME,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load memories: ' + err.message});
  }
});

// Get single memory
app.get('/api/memories/:id', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_MEMORIESTABLE_NAME,
    Key: {
      id: req.params.id
    }
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    res.json(data.Item);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load memory: ' + err.message});
  }
});

// Create memory
app.post('/api/memories', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_MEMORIESTABLE_NAME,
    Item: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.json({ success: true, data: params.Item });
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not create memory: ' + err.message});
  }
});

// Delete memory
app.delete('/api/memories/:id', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_MEMORIESTABLE_NAME,
    Key: {
      id: req.params.id
    }
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: true });
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not delete memory: ' + err.message});
  }
});

/*************************
 * Condolence endpoints *
*************************/

// Get all condolences
app.get('/api/condolences', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_CONDOLENCESTABLE_NAME,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load condolences: ' + err.message});
  }
});

// Get single condolence
app.get('/api/condolences/:id', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_CONDOLENCESTABLE_NAME,
    Key: {
      id: req.params.id
    }
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    res.json(data.Item);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load condolence: ' + err.message});
  }
});

// Create condolence
app.post('/api/condolences', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_CONDOLENCESTABLE_NAME,
    Item: {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.json({ success: true, data: params.Item });
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not create condolence: ' + err.message});
  }
});

// Delete condolence
app.delete('/api/condolences/:id', async function(req, res) {
  const params = {
    TableName: process.env.STORAGE_CONDOLENCESTABLE_NAME,
    Key: {
      id: req.params.id
    }
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: true });
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not delete condolence: ' + err.message});
  }
});

app.listen(3000, function() {
  console.log("App started")
});

module.exports = app
