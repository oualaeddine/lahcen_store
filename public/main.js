var db = firebase.firestore();


let doc = db.collection('cities').doc('SF');

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