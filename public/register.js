var db = firebase.firestore();

  
function addUser(){

    // Get inputs Values
    var UserName= $('#username').val();
    var email= $('#userEmail').val();
    var password1= $('#userPassword1').val();
    var password2= $('#userPassword2').val();
  console.log(email);
    if(password2 == password1){
        // Insert new Firebase User
       firebase.auth().createUserWithEmailAndPassword(email, password1).then(function(data){
        var userId = data.user.uid;
        data.user.updateProfile({
          displayName:""+UserName
        });

        // Insert new data in database
        /*
        let adminRef = db.collection('admin');
        adminRef.doc(""+userId).set({
            name: UserName,
            email: email,
            password : password1
        });
       */
      }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // [START_EXCLUDE]
            if (errorCode == 'auth/weak-password') {
              alert('The password is too weak.');
            } else {
              alert(errorMessage);
            }
            console.log(error);
            // [END_EXCLUDE]
           
           
          });
          
        
       $('#successModal').modal('show');
        }
    
    else alert("Re tapez le mot de passe svp");

    name= $('#username').val("");
    email= $('#userEmail').val("");
    password1= $('#userPassword1').val("");
    password2= $('#userPassword2').val("");
}


