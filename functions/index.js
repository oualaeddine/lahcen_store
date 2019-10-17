const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

exports.deleteDeliveryMan = functions.https.onRequest((request) => {
   let data = request.body;
    admin.auth().deleteUser(data.id)
  .then(function() {
    console.log('Successfully deleted user');
  })
  .catch(function(error) {
    console.log('Error deleting user:', error);
  });

});


/* Listens for new messages added to /messages/:pushId and sends a notification to subscribed users */
exports.pushNotification = functions.database.ref('/messages/{pushId}').onWrite( event => {
    console.log('Push notification event triggered');
    /* Grab the current value of what was written to the Realtime Database */
        var valueObject = event.data.val();
    /* Create a notification and data payload. They contain the notification information, and message to be sent respectively */ 
        const payload = {
            notification: {
                title: 'App Name',
                body: "New message",
                sound: "default"
            },
            data: {
                title: valueObject.title,
                message: valueObject.message
            }
        };
    /* Create an options object that contains the time to live for the notification and the priority. */
        const options = {
            priority: "high",
            timeToLive: 60 * 60 * 24 //24 hours
        };
    return admin.messaging().sendToTopic("notifications", payload, options);
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
        db.collection('products').doc(""+item.id).set({
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
    var dateordered= new Date(data.date_ordered)
    let order = {
        client_id: data.customer.id,
        id: data.id,
        name: data.name,
        total_price: data.total_price,
        subtotal_price: data.subtotal_price,
        address: address,
        client: client,
        phone: phone,
        date_ordered:  admin.firestore.FieldValue.serverTimestamp(),
        shipping_price: data.shipping_lines[0].price,
        products: products,
        status:'pending'
    };

    let docRef = db.collection('orders').doc(data.number+"");

    let setAda = docRef.set(order).then(
        function () {
            response.send("Hello from Firebase!");
        }
    );
});




exports.getOrders = functions.https.onRequest((request, response) => {
    var data = new Array();
    
    db.collection("orders")
    .orderBy("date_ordered","desc").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var donner = doc.data();
        data.push(Array(donner.name,
            donner.status,
            donner.client,
            donner.address,
            donner.phone,
            donner.total_price,
            donner.shipping_price,
            donner.fee,
            donner.total_price));
    });
    });
   response.send(json(data));
});