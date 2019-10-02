var db = firebase.firestore();


//let doc = db.collection('cities').doc('SF');

// Get Commands List
db.collection("orders").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr><td>" + data.name + "</td><td>" + data.status + "</td><td>" + data.client + "</td><td>" +
            data.address + "</td><td>" + data.phone + "</td><td>" + data.total_price  + "</td><td>" + data.shipping_price +
            "</td><td>" + 0 + "</td><td>" + data.total_price +
            "</td><td> <button class='btn-info btn'>infos</button></td></tr>";
        console.log(mrow);

        $("#all_tb").append(mrow)

    });
});

// Get products List
db.collection("products").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr><td>" + data.name + "</td><td>" + data.price + "</td><td>" + data.buyPrice + "</td><td>" +
            data.quantity +
            "</td><td> <button class='btn-info btn'>Modifier</button> <button class='btn-danger btn'>Suprimer</button>"
              
            "</td></tr>";
        console.log(mrow);

        $("#all_prod").append(mrow)

    });
});
