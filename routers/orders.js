const express = require("express");
const router = express.Router();

const { Order } = require("../models/order");
const { User } = require("../models/user");

const { OrderItem } = require("../models/order-item");

//submit an order

router.post(`/`, async (req, res) => {
  let orderArr = Promise.all(
    req.body.orderItems.map(async (item) => {
      let newItem = new OrderItem({
        product: item.product,
        quantity: item.quantity,
      });


      let newOrder = await newItem.save();

      return newOrder;
    })
  );


  const arrayOfOrders = await orderArr;
  console.log(arrayOfOrders);

  const totalPrice = Promise.all(
    arrayOfOrders.map(async (orderItem) => {
      const oneItem = await OrderItem.findById(orderItem._id).populate(
        "product",
        "price"
      );

      const itemTotalPrice = oneItem.product.price * oneItem.quantity;

      return itemTotalPrice;
    })
  );

  const resolvertotalprice = await totalPrice;

  const payment = resolvertotalprice.reduce((a, b) => a + b, 0);

  const order = new Order({
    orderItems: arrayOfOrders,
    quantity: req.body.quantity,
    product: req.body.product,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: payment,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });
  // console.log(newProduct);

  await order.save();

  if (!order) {
    res.status(500).send("order cannot be created");
  }

  res.send(order);
});

//get orders

router.get(`/`, async (req, res) => {
  const ordersList = await Order.find()
    .populate("user","name").sort({ dateOrdered: -1 })

    // .populate("orderItems")
    // .populate({
    //   path: "orderItems",
    //   populate: {
    //     path: "product",
    //     populate: "category",
    //   },
    // });
  //sort from newer to older
  if (!ordersList) {
    res.status(401).json("not found");
  }
  res.status(200).send(ordersList);
});

//get order

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({ path: "orderItems", populate:
    {path: "product", populate: "category"}});
  if (!order) {
    res.status(401).json("not found");
  }
  res.status(200).send(order);
});

//update order status

router.put(`/:id`, async (req, res) => {

  console.log(req.body)
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      "status": req.body.status,
    },
    {
      new: true,
    }
  );

console.log(order)
  if (!order) {
    return res.status(404).send('not found');}

res.send(order)
});

//delete order

router.delete(`/:id`, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (item) => {
          await OrderItem.findOneAndDelete(item.id);
        });
        return res.status(200).json({ success: true, message: "order was deleted" });

      } else {
        return res.status(404).json({ success: false, message: "order is not found" });
      }
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
});


//get total sales
router.get(`/get/totalsales`, async (req, res) => {

  const totalSales = await Order.aggregate([
    {
    $group : {_id: null, totalSales : {$sum : '$totalPrice'}}
    }
  ])

  console.log(totalSales)
  //sort from newer to older
  if (!totalSales) {
    res.status(401).json("not found");
  }
  res.send({totalsales : totalSales.pop().totalSales});
});


//get orders count

router.get(`/get/count`, async (req,res)=>{

  const orderCount = await Order.countDocuments();

    if(!orderCount){
    res.status(500).json({success:false})
    }

    else{
   res.send({orderCount : orderCount})
    }

  })


  //get user's orders

  router.get(`/getuserorders/:userid`, async (req, res) => {


    const order = await Order.find({user : req.params.userid})
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });
    if (!order) {
      res.status(401).json("not found");
    }
    res.status(200).send(order);
  });

module.exports = router;
