import { Handler } from '@netlify/functions';
import { handlePayTRWebhook } from '../../src/integrations/paytr/webhook';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const webhookData = JSON.parse(event.body || '{}');
    const result = await handlePayTRWebhook(webhookData);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('PayTR webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid webhook data' })
    };
  }
};