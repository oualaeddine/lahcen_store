var db = firebase.firestore();

var manId = localStorage.getItem("manId");
getHistoPaiement(manId);
getHistoCommand(manId);
//GET COMMAND HISTO


function getHistoPaiement(livreurId) {
    db.collection("paiements").doc(""+livreurId).collection("paiementId").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          var row = "<tr><td>"+data.montant+"</td><td>"+data.date+"</td></tr>";
          $('#paiementList').append(row);
        });});
         
}


function getHistoCommand(livreurId) {
    var docRef = db.collection("delivery_men").doc(""+livreurId);
docRef.get().then(function(doc) {
    var data = doc.data();
    if(data.Assigned_orders != null){
        data.Assigned_orders.forEach(function(element) {
           db.collection("orders").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var orderData = doc.data();
                
                if(orderData.name == element){
                    var date = new Date(Date.parse(orderData.date_ordered.toDate()));
                   var row = "<tr><td>"+element+"</td><td>"+orderData.total_price+"</td><td>"+date.toUTCString()+"</td></tr>";
                   $('#orderList').append(row);
                
           }
        });
    });
        });
}
});
}