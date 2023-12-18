import React from "react";
import "./App.css";
import "./responsive.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Switch, Route, Routes } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import SingleProduct from "./screens/SingleProduct";
import Login from "./screens/Login";
import Register from "./screens/Register";
import CartScreen from "./screens/CartScreen";
import ShippingScreen from "./screens/ShippingScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PaymentScreen from "./screens/PaymentScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import NotFound from "./screens/NotFound";
import PrivateRouter from "./PrivateRouter";
import PendingScreen from "./screens/PendingScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen/>} exact />
        <Route path="/search/:keyword" element={<HomeScreen/>} exact />
        <Route path="/page/:pagenumber" element={<HomeScreen/>} exact />
        <Route
          path="/search/:keyword/page/:pageNumber"
          element={<HomeScreen/>}
          exact
        />
        <Route path="/products/:id" element={<SingleProduct/>} />
        <Route path="/pending" element={<PendingScreen/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        {/* <Route path="/pending" component={PendingScreen} /> */}
        <Route exact path='/profile' element={<PrivateRouter/>}>
          <Route exact path='/profile' element={<ProfileScreen/>}/>
        </Route>
        {/* <PrivateRouter path="/profile" component={ProfileScreen} /> */}
        <Route path="/cart/:id?" element={<CartScreen/>} />
        <Route exact path='/shipping' element={<PrivateRouter/>}>
          <Route exact path='/shipping' element={<ShippingScreen/>}/>
        </Route>
        <Route exact path='/payment' element={<PrivateRouter/>}>
          <Route exact path='/payment' element={<PaymentScreen/>}/>
        </Route>
        <Route exact path='/placeorder' element={<PrivateRouter/>}>
          <Route exact path='/placeorder' element={<PlaceOrderScreen/>}/>
        </Route>
        <Route exact path='/order/:id' element={<PrivateRouter/>}>
          <Route exact path='/order/:id' element={<OrderScreen/>}/>
        </Route>
        {/* <PrivateRouter path="/shipping" component={ShippingScreen} />
        <PrivateRouter path="/payment" component={PaymentScreen} />
        <PrivateRouter path="/placeorder" component={PlaceOrderScreen} />
        <PrivateRouter path="/order/:id" component={OrderScreen} /> */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  );
};

export default App;
