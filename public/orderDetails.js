var db = firebase.firestore();
var statut=["date_pending","date_Annuled","date_Delivred","date_Confirmed","date_Assigned","date_NoToBuy","date_NRP1","date_NRP2","date_NRP3"];

var idOrder = localStorage.getItem("orderId");
getOrderStatu(idOrder);
getDeliveryMenList();
$('#assignButton').attr('onClick', 'assignDeliveryMan("'+idOrder+'");');
$('#productList').attr('class', "productList"+idOrder);
getProductList(idOrder);
getTotalPrice(idOrder);
getOrderDates(idOrder);




function getTotalPrice(idOrder){
    db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        $('.total').append(data.total_price);
    });
}
function getProductList(idOrder) {
    var docRef = db.collection("orders").doc(""+idOrder);
    docRef.get().then(function(doc) {
        var data = doc.data();
        //Get product id
        var prod = data.products
        prod.forEach(function(element) {
            var productId = element.product_id.replace('products/', '');
            
            //Get product name/quantity/price by id
            
            db.collection("products").doc(""+productId+"").get().then(function(doc) {
                var productData = doc.data();

                var row = "<tr><td>"+productData.name+"</td><td>"+element.quantity+"</td><td>"+productData.price+"</td><tr>";
                $('#productList').append(row);
            });
         });
    });
}
function enableBox() {
    $('#assignementBox').attr("disabled",false);
}
function getOrderStatu(idOrder) {
    db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        //Test status classes
        var statusClass = data.status;
        if(statusClass == "No want to buy") {
            statusClass = "NoToBuy";
        }
        if( (statusClass == "Ne repond pas 1 fois") || (statusClass == "Ne repond pas 2 fois") || (statusClass == "Ne repond pas 3 fois")) {
            statusClass = "Npr";
        }
        var rowS =  "<button  class='btn orderStateButton btn-"+statusClass+"'>"+data.status+"</button>";
        if(data.status == "No want to buy"){
            var row = "No want to buy on : <br> "+data.date_NoToBuy.toDate();
        }
        if(data.status == "Confirmed" || data.status == "confirmed") {
            var row = " Confirmed on : <br>"+data.date_Confirmed.toDate();
        }
        if(data.status == "Canceled" || data.status == "canceled") {
            var row = "Canceled on : <br>"+data.date_Canceled.toDate();
        }
        
       if(data.status == "assigned" || data.status == "Assigned") {
           var row = "Assigned on : <br>"+data.date_Assigned.toDate();
           var manId= data.Assigned_to;
        db.collection("delivery_men").doc(""+manId).get().then(function(doc) {
            var manData = doc.data();
             name = manData.name;
             city = manData.city;
             var rowText = "Assigned to : "+manData.name+" | "+manData.city;
             $('.orderMan').append(rowText);
        });
           
       }
       if(data.status == "Delivered") {
           var row ="Delivered on : <br>"+data.date_Delivered.toDate();
       }

        $('.orderStatut').append(rowS);
        $('.orderDate').append(row);
        $('.orderName').append(data.name);
        $('.clientName').append(data.client);
        $('.clientAddress').append(data.address);
        
    });
}

function getDeliveryMenList() {

      //Get delivery men List
   db.collection("delivery_men").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        var delivery_men = doc.data();

        var row= "<option value='"+doc.id+"'>"+delivery_men.name+ "  |  " + delivery_men.city + "</option>";
        $('#assignementBox').append(row);
    });
});
}
function assignDeliveryMan(idOrder){
    var menAssigned = document.getElementById("assignementBox").value;
    
    // Update Order 
   document = db.collection('orders').doc(""+idOrder).update({
        Assigned_to: menAssigned,
        date_Assigned: firebase.firestore.Timestamp.now().toDate(),
        status: "Assigned"
        });
        db.collection("orders").doc(""+idOrder).get().then(function(doc) {
            
            var data = doc.data();
            var assigned_orders = new Array();
            //test if Man has already assigned orders
            db.collection("delivery_men").doc(""+menAssigned).get().then(function(doc) {
                var manData = doc.data();
            if(manData.Assigned_orders != null) {
                assigned_orders= manData.Assigned_orders;
                assigned_orders.push(data.name);
            } else assigned_orders.push(data.name);

            //Update Delivery Man Doc
            db.collection('delivery_men').doc(""+menAssigned).update({
                Assigned_orders: assigned_orders
                });
        });
    });
        $('.orderStateButton').attr('class','btn orderStateButton btn-Assigned');
        $('.orderStateButton').html('Assigned');
        $('.orderDate').html(firebase.firestore.Timestamp.now().toDate());
        db.collection("delivery_men").doc(""+menAssigned).get().then(function(doc) {
            var data = doc.data();
            $('.orderMan').html(data.name+" | "+data.city);
        });
}

function getOrderDates(idOrder){
    db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        statut.forEach(function(e){
            if(data[e] != null){
                
                var row = "<tr><td>"+e+": </td><td>"+data[e].toDate()+"</td></tr>";
                 
            $('#orderDatesList').append(row);
                
            }
          
    });
    });

}