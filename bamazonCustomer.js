// require necessary npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// create connection info for sql database
var connection = mysql.createConnection({

    // identify host and port
    host: "localhost",
    port: 3306,

    // username
    user: "root",

    // password and database
    password: "gattsu15",
    database: "Bamazon"

});

// connect to database
connection.connect(function (err) {

    // test connection. if connection fails, throw error
    if (err) throw err;

    // console.log("connection established")

});

// create flow control function
var customerStart = function () {

    // initiate prompt
    inquirer.prompt([

        {
            name: "action",
            message: "What action would you like to take?"
        }

        // user answer determines action taken
    ]).then(function (answer) {

        // if user responds with 'view', call viewStock function
        if (answer.action === "view") {

            viewStock();

            // if user responds with 'buy', call buyStock function
        } else if (answer.action === "buy") {

            buyStock();

            // if neither response given, console log message below and call customerStart function
        } else {

            console.log("Please type 'view' or 'buy'");

            customerStart();

        }

    })

}

var viewStock = function () {

    // display items in database
    connection.query("SELECT * FROM products", function (err, res) {

        // test connection. if connection fails, throw error
        if (err) throw err;

        // display all items in product table
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
        }
        console.log("---------------------------------------");

        // call customerStart function
        customerStart();

    });
}

var buyStock = function () {

    // initiate prompt
    inquirer.prompt([

        {
            name: "item",
            message: "Which item would you like to buy (enter ID)?"
        },

        {
            name: "quantity",
            message: "How many do you want?"
        }

        // user answer determines action taken
    ]).then(function (answer) {

        // select user-provided ID from database table
        connection.query("SELECT * FROM products WHERE ?", { item_id: answer.item }, function (err, res) {

            // test connection. if connection fails, throw error
            if (err) throw err;

            // subtract quantity requested from total quantity; store in variable
            var newStock = (parseInt(res[0].stock_quantity) - parseInt(answer.quantity));

            // store item ID in variable
            var tempId = res[0].item_id;

            // multiply quantity requested by unit price; store in variable
            var totalPrice = (parseInt(answer.quantity) * parseInt(res[0].price));

            // if quantity requested exeeds quantity available...
            if (res[0].stock_quantity < answer.quantity) {

                // console log message below
                console.log("Insufficient Quantity");

                // call customerStart function
                customerStart();

            } else {

                // if quantity requested does not exceed quantity available, update stock quantity
                connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newStock, tempId], function (err, res) {

                    // test connection. if connection fails, throw error
                    if (err) throw err;

                })

            }

            // console log total price
            console.log("Total Cost: $" + totalPrice);

            // call customerStart function
            customerStart();

        });

    })

}

// call customerStart function
customerStart();