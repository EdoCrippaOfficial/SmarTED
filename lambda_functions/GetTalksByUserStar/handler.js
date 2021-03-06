const connectToDB = require('./db');
const talk = require('./Talk');

module.exports.getTalksByUserStar = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('Received event:', JSON.stringify(event, null, 2));
    let body = {};
    if (event.body) {
        body = JSON.parse(event.body);
    }
    
    // Check if username is defined
    if(!body.username) {
        callback(null, {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Could not fetch talks. Username is null.'
        });
    }
    
    // Default page settings
    if (!body.doc_per_page) {
        body.doc_per_page = 10;
    }
    if (!body.page) {
        body.page = 1;
    }
    
    // Connect to DB
    connectToDB().then(() => {
        console.log('=> collecting talks starred by ' + body.username);
        talk.find({users_starred: body.username})
            .skip((body.doc_per_page * body.page) - body.doc_per_page)
            .limit(body.doc_per_page)
            .then(talks => {
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(talks)
                    });
                }
            )
            .catch(err =>
                callback(null, {
                    statusCode: err.statusCode || 500,
                    headers: { 'Content-Type': 'text/plain' },
                    body: 'Could not fetch talks.'
                })
            );
    });
};