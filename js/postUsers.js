const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });

exports.handler = async (event) => {
  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Name is required and must be a string' }),
      };
    }

    // Generate a unique userId
    const userId = uuidv4();

    // Prepare the item to store in DynamoDB
    const params = {
      TableName: process.env.TABLE_NAME, // Set to user-table-dev via environment variable
      Item: {
        userId: { S: userId },
        name: { S: name },
      },
    };

    // Store the item in DynamoDB
    const command = new PutItemCommand(params);
    await client.send(command);

    console.log('Stored user data:', { userId, name });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'User added successfully', userId }),
    };
  } catch (error) {
    console.error('Error adding user to DynamoDB:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Failed to add user', error: error.message }),
    };
  }
};
