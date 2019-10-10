var db = firebase.firestore();

var idOrder = localStorage.getItem("orderId");

getDeliveryMenList(idOrder);
$('#assignButton').attr('onClick', 'assignDeliveryMan("'+idOrder+'");');
$('#productList').attr('class', "productList"+idOrder);
getProductList(idOrder);

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
function getDeliveryMenList(idOrder) {

    //Test if order already assigned
   var ref = db.collection("orders").doc(""+idOrder).get().then(function(doc) {
        var data = doc.data();
        if(doc.get('Assigned_to') != null){
              //Man exists || Get delivery men List
              //document.getElementById("assignementBox").val();
              var editButton = "<button class='btn' onclick='enableBox()' type='button'><i class='fa fa-edit'></i></button>";
              $('.assignButton').append(editButton);
              $('#assignementBox').attr("disabled",'true');
        }
        
    });
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
        date_Assigned: firebase.firestore.Timestamp.now().toDate()
    
        });
        db.collection("orders").doc(""+idOrder).get().then(function(doc) {
            
            var data = doc.data();
            //Update Delivery Man Doc
            db.collection('delivery_men').doc(""+menAssigned).update({
                Assigned_orders: data.name
                });
        });
   
}