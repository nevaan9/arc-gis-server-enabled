const publicAccessHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
}

export async function lambdaHandler(event, context) {
    const responseBody = { message: 'Hello World Lambda!' }
    return {
        statusCode: 200,
        headers: {
            ...publicAccessHeaders,
            'x-custom-header' : 'my custom header value'
        },
        body: JSON.stringify(responseBody)
    };
};