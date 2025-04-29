const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });

exports.handler = async (event) => {
  try {
    // Scan the DynamoDB table to get all users
    const params = {
      TableName: process.env.TABLE_NAME, // Set to user-table-dev via environment variable
    };
    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Extract user names from the items
    const users = data.Items.map(item => item.name.S);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    };
  } catch (error) {
    console.error('Error retrieving users from DynamoDB:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Failed to retrieve users', error: error.message }),
    };
  }
};
