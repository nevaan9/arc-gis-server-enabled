import axios from 'axios'

const publicAccessHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
}

export async function lambdaHandler(event, context) {
    console.log(`event >`, JSON.stringify(event, null, 2))
    if (typeof event?.body == 'string') {
        event.body = JSON.parse(event.body)
    }
    const clientId = event.body.clientId
    const clientSecret = event.body.clientSecret
    const code = event.body.code
    const redirectUrl = event.body.redirectUrl
    const gisOrigin = 'https://www.arcgis.com/sharing/rest/'
    const gisTokenEndpoint = `${gisOrigin}oauth2/token/?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUrl}&grant_type=authorization_code`
    console.log('gisTokenEndpoint', gisTokenEndpoint)
    const { data } = await axios.get(gisTokenEndpoint)
    return {
        statusCode: 200,
        headers: {
            ...publicAccessHeaders,
            'x-veoci-header' : 'arc-gis-token'
        },
        body: JSON.stringify(data)
    };
};