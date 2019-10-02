var db = firebase.firestore();


//let doc = db.collection('cities').doc('SF');

// Get Commands List
db.collection("delivery_men").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
        var data = doc.data();
        var mrow = "<tr><td>" + data.name + "</td><td>" + data.phone + "</td><td>" + data.email + "</td><td>" +
            data.address + "</td><td>" + data.city +
            "</td><td> <button class='btn-info btn'>infos</button></td></tr>";
        console.log(mrow);

        $("#all_livreur").append(mrow)

    });
});

