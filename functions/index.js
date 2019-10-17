const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

exports.deleteDeliveryMan = functions.https.onRequest((request) => {
    let data = request.body;
    admin.auth().deleteUser(data.id)
        .then(function () {
            //console.log('Successfully deleted user');
            //todo add field to delivery man   ismo isDeleted la valeur ta3o 1
        })
        .catch(function (error) {
            //console.log('Error deleting user:', error);
        });

});
exports.updateDeliveryManEmail = functions.https.onRequest((request) => {
    let data = request.body;
    admin.auth().updateUser(data.id, {
        email: data.email,
    });
});
exports.newOrder = functions.https.onRequest((request, response) => {
    let data = request.body;
    let address = data.shipping_address.address1 + " " +
        data.shipping_address.city + " , " +
        data.shipping_address.zip;
    let client = data.shipping_address.name;
    let phone = data.shipping_address.phone;
    let date_ordered = data.created_at;
    let customer = {
        id: data.customer.id,
        name: data.customer.first_name + " " + data.customer.last_name,
        email: data.customer.email,
    };
    var products = [];
    data.line_items.forEach(function (item, index, arr) {
        db.collection('products').doc("" + item.id).set({
            id: item.id,
            name: item.name,
            title: item.title,
            price: item.price,
            admin_graphql_api_id: item.admin_graphql_api_id
        });
        products.push({
            product_id: "products/" + item.id,
            quantity: item.quantity,
            properties: item.properties,
        });
    });
    var dateordered = new Date(data.date_ordered)
    let order = {
        client_id: data.customer.id,
        id: data.id,
        name: data.name,
        total_price: data.total_price,
        subtotal_price: data.subtotal_price,
        address: address,
        client: client,
        phone: phone,
        date_ordered: admin.firestore.FieldValue.serverTimestamp(),
        shipping_price: data.shipping_lines[0].price,
        products: products,
        status: 'pending'
    };

    let docRef = db.collection('orders').doc(data.number + "");

    let setAda = docRef.set(order).then(
        function () {
            response.send("Hello from Firebase!");
        }
    );
});


exports.onNewOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate((snap, context) => {
        const newValue = snap.data();
        const name = newValue.name;
        const orderId = newValue.id;
        const total = newValue.total_price;
        const topic = 'new_orders';
        let message = {
            data: {
                order_name: name,
                order_id: "" + orderId,
                total: total,
                notif_type: "new_order"
            },
            topic: topic
        };
        sendMessageToTopic(message)
    });


exports.onOrderStatusUpdated = functions.firestore
    .document('orders/{orderId}')
    .onUpdate((change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();
        if (newValue.status === previousValue.status) return;
        const name = newValue.name;
        const status = newValue.status;
        const orderId = newValue.id;
        let message = {
            data: {
                order_name: name,
                order_id: "" + orderId,
                status: status,
                notif_type: "status_change"
            },
        };
        let topic = 'status_change';
        // noinspection EqualityComparisonWithCoercionJS
        if (status != "assigned" || status != "canceled") {
            //sending notif to admins
            message.topic = topic;
            sendMessageToTopic(message, topic)
        } else {
            //sending notif to delivery_mans
            //in case an order is canceled delivery mans must be notified
            // noinspection EqualityComparisonWithCoercionJS
            if (status == "canceled") {
                message.data.notif_type = "order_canceled";
                topic = "order_canceled";
                sendMessageToTopic(message, topic)
            } else {
                const assigned_to = newValue.Assigned_to;
                sendMessageToDeliveryMan(assigned_to);
            }
        }
    });

function sendMessageToDeliveryMan(assigned_to, message) {
    const delivery_men = db.collection('delivery_men/' + assigned_to + "/tokens");
    let registrationTokens = [];
    delivery_men.get().then(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }
        snapshot.forEach(doc => {
            registrationTokens.push(doc.token)
        });
        message.tokens = registrationTokens;
        sendMessageToDevices(message);
    }).catch(err => {
        console.log('Error getting documents', err);
    });
}

function sendMessageToDevices(message) {
    admin.messaging().sendMulticast(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}

function sendMessageToTopic(message) {
// Send a message to devices subscribed to the provided topic.
    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}


