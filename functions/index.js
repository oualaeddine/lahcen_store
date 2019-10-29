const functions = require('firebase-functions');
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

/*______ start Section Hiba Work ____________________________________________________________________________ */
exports.createDeliveryMan = functions.https.onRequest((request) => {
    let data = request.body;
    admin.auth().createUser({
        email: data.email,
        password: data.password,
      
      })
        .then(function(userRecord) {
          var userId = userRecord.uid;
          let livreurRef = db.collection('delivery_men');
            livreurRef.doc(""+userId).set({
            name: data.name,
            phone: data.phone,
            email : data.email,
            city : data.city
     });
        })
      
})
exports.deleteDeliveryMan = functions.https.onRequest((request) => {
    let data = request.body;
    admin.auth().deleteUser(data.id)
        .then(function () {
            //console.log('Successfully deleted user');
            
        })
        .catch(function (error) {
            //console.log('Error deleting user:', error);
        });

});
exports.updateDeliveryManEmail = functions.https.onRequest((request) => {
    let data = request.body;
    admin.auth().updateUser(data.id, {
        email: data.email
    });      
});
exports.updateDeliveryManPassword = functions.https.onRequest((request) => {
    let data = request.body;
    admin.auth().updateUser(data.id, {
        password: data.password
    });      
});
exports.incrementOrderCount = functions.firestore
    .document('orders/{orderId}')
    .onCreate((snap, context) => {
        var chainCounterRef = db.collection('admin').doc('MhuEB9k1CsTRSFkJHFO8ign4QIw2');
        chainCounterRef.update({ ordersCount: FieldValue.increment(1) });
        return true;
     
    });
    exports.decrementOrderCount = functions.firestore
    .document('orders/{orderId}')
    .onDelete((snap, context) => {
        var chainCounterRef = db.collection('admin').doc('MhuEB9k1CsTRSFkJHFO8ign4QIw2');
        chainCounterRef.get().then(function (doc){
        var data = doc.data();
        var currentValue = data.ordersCount;
        chainCounterRef.update({ ordersCount: currentValue - 1 });
    });
        return true;
     
    }); 
     //
     exports.incrementProductCount = functions.firestore
    .document('products/{productId}')
    .onCreate((snap, context) => {
        var chainCounterRef = db.collection('admin').doc('MhuEB9k1CsTRSFkJHFO8ign4QIw2');
        chainCounterRef.update({ productsCount: FieldValue.increment(1) });
        return true;
     
    });
    exports.decrementProductCount = functions.firestore
    .document('products/{productId}')
    .onDelete((snap, context) => {
        var chainCounterRef = db.collection('admin').doc('MhuEB9k1CsTRSFkJHFO8ign4QIw2');
        chainCounterRef.get().then(function (doc){
        var data = doc.data();
        var currentValue = data.productsCount;
        chainCounterRef.update({ productsCount: currentValue - 1 });
    });
        return true;
     
    }); 
     //
    function getOrdersCount(){
        const query = db.collection('admin').doc('MhuEB9k1CsTRSFkJHFO8ign4QIw2');
        query.get().then(function (doc){
        var data = doc.data();
        var totalOrders = data.ordersCount;
        return totalOrders;
        });
    }
    function getProductsCount(){
        const query = db.collection('admin').doc('MhuEB9k1CsTRSFkJHFO8ign4QIw2');
        query.get().then(function (doc){
        var data = doc.data();
        var totalProducts = data.productsCount;
        return totalProducts;
        });
    }
const cors = require('cors')({
    origin: true,
});
exports.getDeliveryMan = functions.https.onRequest((request, response) => {
    let mreq = request.body;
    const cors = require('cors')({ origin: true });
    var totalOrders = getOrdersCount();
    let draw = mreq.draw;
    let start = mreq.start;
    let length = 4;
    let search = mreq.search;
    let order = mreq.order;
    let query = null;
    let query2 = null;
  
    if (start != null) {
        
        query = db.collection('delivery_men').limit(parseInt(start));
        if (parseInt(start) == 0) {
            query = db.collection('delivery_men').limit(length);
            console.log("start is ", parseInt(start));
        }
        
    }
    // noinspection EqualityComparisonWithCoercionJS
    if (query != null) {
        query.get().then(function (documentSnapshots) {
            // Get the last visible document
            var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            console.log("last", lastVisible);

            query2 = db.collection("delivery_men")
                .startAfter(lastVisible)
                .limit(length);
                if (parseInt(start) == 0) {
                    query.get().then((querySnapshot) => {

                        let resp = {
                            draw: draw,
                            recordsTotal: 8,//totalOrders,
                            recordsFiltered: 8,// tailleDeQuerySnapshot,
                            data: []
                        };
                        querySnapshot.forEach((doc) => {
                            let mOrder = doc.data();
                            
                            resp.data.push(
                                [
                                    mOrder.name,
                                    mOrder.phone ,
                                    mOrder.email,
                                    mOrder.city,
                                    mOrder.totalUnpaid,
                                    "<button class='btn btn-info  btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+doc.id+" ><i class='fa fa-edit'></i></button> "+
                                    " <button class='btn btn-danger btn-sm' data-book-id='"+doc.id+"'  data-toggle='modal' data-target='#confirmationModal' ><i class='fa fa-trash'></i></button> "+
                                    "<button class='btn btn-success btn-sm' data-book-id='"+doc.id+"' data-toggle='modal' data-target='#addPaymentModal' ><i class='fa fa-usd'></i></button> "+
                                    "<button class='btn btn-primary btn-sm' onclick=loadDetailsPage('"+doc.id+"') ><i class='fa fa-info'></i></button>"
                                ]
                            );
        
                        });
                        return cors(request, response, () => {
                            response.status(200).send(resp);
                        });
                    });
                }
            query2.get().then((querySnapshot) => {

                let resp = {
                    draw: draw,
                    recordsTotal: 8,//totalOrders,
                    recordsFiltered: 8,// tailleDeQuerySnapshot,
                    data: []
                };
                querySnapshot.forEach((doc) => {
                    let mOrder = doc.data();
                    
                    resp.data.push(
                        [
                            mOrder.name,
                            mOrder.phone ,
                            mOrder.email,
                            mOrder.city,
                            mOrder.totalUnpaid,
                            "<button class='btn btn-info  btn-sm' data-toggle='modal' data-target='#exampleModal' data-book-id="+doc.id+" ><i class='fa fa-edit'></i></button> "+
                            " <button class='btn btn-danger btn-sm' data-book-id='"+doc.id+"'  data-toggle='modal' data-target='#confirmationModal' ><i class='fa fa-trash'></i></button> "+
                            "<button class='btn btn-success btn-sm' data-book-id='"+doc.id+"' data-toggle='modal' data-target='#addPaymentModal' ><i class='fa fa-usd'></i></button> "+
                            "<button class='btn btn-primary btn-sm' onclick=loadDetailsPage('"+doc.id+"') ><i class='fa fa-info'></i></button>"
                        ]
                    );

                });
                return cors(request, response, () => {
                    response.status(200).send(resp);
                });
            });

        })

            .catch(err => {
                console.log('Error getting documents', err);
                return cors(request, response, () => {
                    response.status(500).send(err);
                });
            });
    } else {
        return cors(request, response, () => {
            response.status(500).send();
        });
    }

});

exports.getOrders = functions.https.onRequest((request, response) => {
    let mreq = request.body;
    const cors = require('cors')({ origin: true });
    var totalOrders = getOrdersCount();
    let draw = mreq.draw;
    let start = mreq.start;
    let length = 20;
    let search = mreq.search;
    let order = mreq.order;
    let query = null;
    let query2 = null;
   console.log(totalOrders);
    if (start != null) {
        
        query = db.collection('orders').limit(parseInt(start));
        if (parseInt(start) == 0) {
            query = db.collection('orders').limit(length);
            console.log("start is ", parseInt(start));
        }
        
    }
    // noinspection EqualityComparisonWithCoercionJS
    if (query != null) {
        query.get().then(function (documentSnapshots) {
            // Get the last visible document
            var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            console.log("last", lastVisible);

            query2 = db.collection("orders")
                .startAfter(lastVisible)
                .limit(length);
                if (parseInt(start) == 0) {
                    query.get().then((querySnapshot) => {

                        let resp = {
                            draw: draw,
                            recordsTotal: 173,//totalOrders,
                            recordsFiltered: 173,// tailleDeQuerySnapshot,
                            data: []
                        };
                        querySnapshot.forEach((doc) => {
                            let mOrder = doc.data();
                            
                            resp.data.push(
                                [
                                    mOrder.name,
                                    mOrder.status ,
                                    mOrder.client,
                                    mOrder.address,
                                    mOrder.phone,
                                    mOrder.subtotal_price,
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
                    });
                }
            query2.get().then((querySnapshot) => {

                let resp = {
                    draw: draw,
                    recordsTotal: 173,//totalOrders,
                    recordsFiltered: 173,// tailleDeQuerySnapshot,
                    data: []
                };
                querySnapshot.forEach((doc) => {
                    let mOrder = doc.data();
                    
                    resp.data.push(
                        [
                            mOrder.name,
                            mOrder.status ,
                            mOrder.client,
                            mOrder.address,
                            mOrder.phone,
                            mOrder.subtotal_price,
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
            });

        })

            .catch(err => {
                console.log('Error getting documents', err);
                return cors(request, response, () => {
                    response.status(500).send(err);
                });
            });
    } else {
        return cors(request, response, () => {
            response.status(500).send();
        });
    }

});

exports.getProducts = functions.https.onRequest((request, response) => {
    let mreq = request.body;
    const cors = require('cors')({origin: true});
    var totalProducts = getProductsCount();
    let draw = mreq.draw;
    let start = mreq.start;
    let length = 20;
    let query = null;
    let query2 = null;
    if(start != null) {

        query = db.collection('products').limit(parseInt(start));
        if (parseInt(start) == 0) {
            query = db.collection('products').limit(length);
            console.log("start is ", parseInt(start));
        }
    }
    // noinspection EqualityComparisonWithCoercionJS
    if (query != null) {
            query.get().then(function (documentSnapshots) {
                // Get the last visible document
                var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                console.log("last", lastVisible);
                
                query2 = db.collection("products")
                    .startAfter(lastVisible)
                    .limit(length);

                if( parseInt(start) == 0){
                    query.get().then((querySnapshot) => {

                        let resp = {
                            draw: draw,
                            recordsTotal: 172,// totalProducts,
                            recordsFiltered: 172,// tailleDeQuerySnapshot,
                            data: []
                        };
                        querySnapshot.forEach((doc) => {
                            let mOrder = doc.data();
                            resp.data.push(
                                [
                                    mOrder.name,
                                    mOrder.price,
                                    mOrder.buyPrice,
                                    mOrder.quantity,
                                    '<button class=\'btn-info btn btn-sm\' data-toggle=\'modal\' data-target=\'#exampleModal\' data-book-id='+doc.id+'><i class=\'fa fa-edit\'> </i> Edit</button> '+
                                    '<button data-book-id='+doc.id+' data-toggle=\'modal\' data-target=\'#confirmationModal\' class=\'btn-danger btn btn-sm\'><i class=\'fa fa-trash\'> </i> Delete</button>' 
                                ]
                            );
            
                        });
                        return cors(request, response, () => {
                            response.status(200).send(resp);
                        });
                         });
                }
                 query2.get().then((querySnapshot) => {

                    let resp = {
                        draw: draw,
                        recordsTotal: 172,// totalProducts,
                        recordsFiltered: 172,// tailleDeQuerySnapshot,
                        data: []
                    };
                    querySnapshot.forEach((doc) => {
                        let mOrder = doc.data();
                        resp.data.push(
                            [
                                mOrder.name,
                                mOrder.price,
                                mOrder.buyPrice,
                                mOrder.quantity,
                                '<button class=\'btn-info btn btn-sm\' data-toggle=\'modal\' data-target=\'#exampleModal\' data-book-id='+doc.id+'><i class=\'fa fa-edit\'> </i> Edit</button> '+
                                '<button data-book-id='+doc.id+' data-toggle=\'modal\' data-target=\'#confirmationModal\' class=\'btn-danger btn btn-sm\'><i class=\'fa fa-trash\'> </i> Delete</button>' 
                            ]
                        );
        
                    });
                    return cors(request, response, () => {
                        response.status(200).send(resp);
                    });
                     });
                   
        })
    
       .catch(err => {
            console.log('Error getting documents', err);
            return cors(request, response, () => {
                response.status(500).send(err);
            });
        });
     } else {
        return cors(request, response, () => {
            response.status(500).send();
        });
    }

});
exports.totalPriceOrder = functions.firestore
    .document('orders/{orderId}')
    .onWrite((change,context)=> {
    const docId = change.after.id;
    const newValue = change.after.data();
     fee = newValue.fee;
     delivery_price = newValue.shipping_price;
     subTotal = newValue.subtotal_price;
    total =0.00;
    if(fee != null)
        total += parseFloat(subTotal) + parseFloat(fee) + parseFloat(delivery_price);
    else 
    total += parseFloat(subTotal) + parseFloat(delivery_price);
db.collection('orders').doc(""+docId).update({
    total_price: ""+total
}).then(
    function () {
        response.send("total is Successfully updated");
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
        // save notification to admin
        let notfadmin = {
            title: "Order " + newValue.status,
            body: newValue.name + " is " + newValue.status,
            status: newValue.status,
            ordername: newValue.name,
            time: admin.firestore.FieldValue.serverTimestamp(),
        };
        let docRefnotf_admin = db.collection('Notifications').doc('admindoc')
            .collection('AdminNotif').doc();
        let setAdanotf_admin = docRefnotf_admin.set(notfadmin).then(
            function () {
                response.send("notif admin added Successfully");
            });
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

        // adding notif to admin notification
        let notf = {
            title: "Order " + newValue.status,
            body: newValue.name + " is " + newValue.status,
            status: newValue.status,
            ordername: newValue.name,
            time: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (status != "Assigned" && status != "Canceled") {
            if (status != "Confirmed") {
                let docRefnotf_admin = db.collection('Notifications').doc('admindoc')
                    .collection('AdminNotif').doc();
                let setAdanotf_admin = docRefnotf_admin.set(notf).then(
                    function () {
                        response.send("notif admin added Successfully");
                    });
            } else {       
                // adding notif to livreur notification
                let docRefnotf_Liv = db.collection('Notifications').doc(newValue.Assigned_to)
                    .collection('LivNotif').doc();
                let setAdanotf_liv = docRefnotf_Liv.set(notf).then(
                    function () {
                        response.send("notif liv added Successfully");
                    });
            }
        } else {
            // adding notif to livreur notification
            let docRefnotf_Liv = db.collection('Notifications').doc(newValue.Assigned_to)
                .collection('LivNotif').doc();
            let setAdanotf_liv = docRefnotf_Liv.set(notf).then(
                function () {
                    response.send("notif liv added Successfully");
                });
        }

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
