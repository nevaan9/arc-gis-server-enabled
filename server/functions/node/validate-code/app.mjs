import axios from 'axios'
import qs from 'qs'

const publicAccessHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
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
    const portalUrl = event.body.portalUrl
    const gisTokenEndpoint = `${portalUrl}sharing/rest/oauth2/token/?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUrl}&grant_type=authorization_code`
    var data = qs.stringify({
        'code': code,
        'client_id': clientId,
        'client_secret': clientSecret,
        'redirect_uri': redirectUrl,
        'grant_type': 'authorization_code'
    });
    var config = {
        method: 'post',
        url: gisTokenEndpoint,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };
    console.log(`config >`, JSON.stringify(config, null, 2))
    const { data: responseData } = await axios(config)
    console.log(`response data >`, JSON.stringify(responseData, null, 2))
    return {
        statusCode: 200,
        headers: {
            ...publicAccessHeaders
        },
        body: JSON.stringify(responseData)
    };
};