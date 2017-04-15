var inquirer = require('inquirer');

var mysql = require('mysql');

//create connection to the mySQL database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "Freezeray1!",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  displayAll();
});


// Running this application will first display all of the items available for sale. 
function displayAll() {
  var query = "SELECT * FROM Products";
  connection.query(query, function (err, res) {
    for (var i = 0; i < res.length; i++) {
      // Include the ids, names, and prices of products for sale.
      console.log("id: " + res[i].idProducts + " || Product Name: " + res[i].product_name + " || Price: " + res[i].price);
    }
    // The app should then prompt users with two messages.
    whatDo(res);
  });
}

//function which prompts the user with 2 messages
function whatDo(res) {
  inquirer.prompt([
    {
      //     The first should ask them the ID of the product they would like to buy.
      type: "input",
      name: "whatID",
      message: "What is the ID of the product you would like to buy?"
    },
    //     The second message should ask how many units of the product they would like to buy.
    {
      type: "input",
      name: "howMany",
      message: "How many would you like to buy?"
    }
  ]).then(function (answer) {
    // Once the customer has placed the order, your application should check 
    // if your store has enough of the product to meet the customer's request.
    var query = "SELECT * FROM Products WHERE idProducts = ?"
    connection.query(query, answer.whatID, function (err, res) {
      if (err) console.log(err, 'Invalid Item ID');


      if (res[0].stock_quantity < answer.howMany) {
        // If not, the app should log a phrase like Insufficient quantity!,
        //  and then prevent the order from going through. 
        console.log("Insufficient quantity!");
        connection.end();

      } else if (res[0].stock_quantity >= answer.howMany) {
        // However, if your store does have enough of the product, 
        // you should fulfill the customer's order.
        console.log("\n Successfully purchased " + answer.howMany + " " + res[0].product_name);

        var newQuantity = res[0].stock_quantity - answer.howMany;
        // This means updating the SQL database to reflect the remaining quantity.
        var query = "UPDATE Products SET stock_quantity =" + newQuantity + "WHERE idProducts = " + res[0].idProducts;

        var totalCost = res[0].price * answer.howMany;

        connection.query(query, function (err, res) {
          // Once the update goes through, 
          // show the customer the total cost of their purchase.
          console.log("Total cost = " + totalCost);
        });



      }
    });

  });

}






