const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

/*______ start Section Hiba Work ____________________________________________________________________________ */

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

const cors = require('cors')({
    origin: true,
});
exports.getOrders = functions.https.onRequest((request, response) => {
    let mreq = request.body;
    const cors = require('cors')({ origin: true });

    let draw = mreq.draw;
    let start = mreq.start;
    let length = mreq.length;
    let search = mreq.search;
    let order = mreq.order;

    db.collection("orders")
        .orderBy("date_ordered", "desc").get().then((querySnapshot) => {
            let resp = {
                draw: draw,
                recordsTotal: 100,// ordersCount,
                recordsFiltered: 80,// tailleDeQuerySnapshot,
                data: []
            };

            querySnapshot.forEach((doc) => {
                let mOrder = doc.data();
                resp.data.push(
                    [
                        mOrder.name,
                        mOrder.status,
                        mOrder.client,
                        mOrder.address,
                        mOrder.phone,
                        mOrder.total_price,
                        mOrder.shipping_price,
                        mOrder.fee,
                        mOrder.total_price,
                        '<button class=\'btn-primary btn btn-sm\' data-toggle=\'modal\' data-target=\'#updateCommandModal\' data-book-id=' + doc.id + ' ><i class=\'fa fa-edit\'></i></button> ' +
                        '<button class=\'btn btn-primary btn-sm\' data-toggle=\'modal\' data-book-id=' + doc.id + ' data-target=\'#statusModal\'><i class=\'fa fa-shopping-cart\'></i></button> ' +
                        '<button onclick=\'loadOrderPage(' + doc.id + ')\'  class=\' btn btn-primary btn-sm orderLink\' data-id=' + doc.id + '><i class=\'fa fa-info\'></i></button>'
                    ]
                );

            });
            return cors(request, response, () => {
                response.status(200).send(resp);
            });

        }).catch(err => {
            console.log('Error getting documents', err);
        });

    // Pagination Query
    var first = db.collection("orders")
        .orderBy("date_ordered", "desc").limit(length);

    return first.get().then((querySnapshot) => {
        let resp = {
            draw: draw,
            recordsTotal: 100,// ordersCount,
            recordsFiltered: 80,// tailleDeQuerySnapshot,
            data: []
        };
        querySnapshot.forEach((doc) => {
            var lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            let mOrder = doc.data();
            resp.data.push(
                [
                    mOrder.name,
                    mOrder.status,
                    mOrder.client,
                    mOrder.address,
                    mOrder.phone,
                    mOrder.total_price,
                    mOrder.shipping_price,
                    mOrder.fee,
                    mOrder.total_price,
                    '<button class=\'btn-primary btn btn-sm\' data-toggle=\'modal\' data-target=\'#updateCommandModal\' data-book-id=' + doc.id + ' ><i class=\'fa fa-edit\'></i></button> ' +
                    '<button class=\'btn btn-primary btn-sm\' data-toggle=\'modal\' data-book-id=' + doc.id + ' data-target=\'#statusModal\'><i class=\'fa fa-shopping-cart\'></i></button> ' +
                    '<button onclick=\'loadOrderPage(' + doc.id + ')\'  class=\' btn btn-primary btn-sm orderLink\' data-id=' + doc.id + '><i class=\'fa fa-info\'></i></button>'
                ]
            );
            var next = db.collection("orders")
                .orderBy("date_ordered", "desc")
                .startAfter(lastVisible)
                .limit(10);

        });

    }).catch(err => {
        console.log('Error getting documents', err);
    });

});

/*______ start Section Djamila Work ___________________________________________________________________________ */
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
    // adding log on new order came
    let log = {
        order_id: data.id,
        order_name: data.name,
        date: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    };
    let docReff = db.collection('Logs').doc();
    let setAdaa = docReff.set(log).then(
        function () {
            response.send("log added Successfully");
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
                order_id: orderId,
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
            notification: {
                title: "Order " + status,
                body: name + " is " + status
            },
            data: {
                order_name: name,
                order_id: " " + orderId,
                status: status,
                notif_type: "status_change",
                "click_action": "FLUTTER_NOTIFICATION_CLICK"

            },
        };
        let topic = 'status_change';
        // noinspection EqualityComparisonWithCoercionJS
        if (status != "Assigned" || status != "Canceled") {
            //sending notif to admins
            message.topic = topic;
            sendMessageToTopic(message, topic)
        } else {
            //sending notif to delivery_mans
            //in case an order is canceled delivery mans must be notified
            // noinspection EqualityComparisonWithCoercionJS
            if (status == "Canceled") {
                message.data.notif_type = "order_canceled";
                topic = "order_canceled";
                sendMessageToTopic(message, topic)
            } else {
                const assigned_to = newValue.Assigned_to;
                sendMessageToDeliveryMan(assigned_to);
            }
        };
        // saving notification on update order        
        let notf = {
                title: "Order " + newValue.status,
                body: newValue.name + " is " + newValue.status,
                time:admin.firestore.FieldValue.serverTimestamp(),
            };
        // adding notif to livreur notification
        let docRefnotf_Liv = db.collection('Notifications').doc(newValue.Assigned_to)
            .collection('LivNotif').doc();
            let setAdanotf_liv = docRefnotf_Liv.set(notf).then(
            function () {
                response.send("notif liv added Successfully");
            });
        // adding notif to admin notification
        let docRefnotf_admin = db.collection('Notifications').doc('admindoc')
            .collection('AdminNotif').doc();
            let setAdanotf_admin = docRefnotf_admin.set(notf).then(
            function () {
                response.send("notif admin added Successfully");
            });
        
        // adding logs on update order
        let log = {
            order_id: orderId,
            order_name: name,
            date: admin.firestore.FieldValue.serverTimestamp(),
            status: status
        };
        let docRef = db.collection('Logs').doc();
        let setAda = docRef.set(log).then(
            function () {
                response.send("log added Successfully");
            }
        );

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

/*______ end  Section Djamila Work __________________________________________________________________________ */
