import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Message from "../components/LoadingError/Error";
import Loading from "../components/LoadingError/Loading";
import { register } from "../Redux/Actions/userActions";
import Header from "./../components/Header";
import Toast from "../components/LoadingError/Toast";
import { toast } from "react-toastify";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

const Register = () => {
  window.scrollTo(0, 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toastId = React.useRef(null);

  const Toastobjects = {
    pauseOnFocusLoss: false,
    draggable: false,
    pauseOnHover: true,
    autoClose: 2000,
  };

  const [searchParams, setSearchParams] = useSearchParams()
  const {location} = useLocation();
  console.log(`useLocation: ${location}`);
  const dispatch = useDispatch();
  const history = useNavigate();
  const redirect = location?.search ? location?.search.split("=")[1] : "/";

  const userRegister = useSelector((state) => state.userRegister);
  const { error, loading, userInfo } = userRegister;

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [userInfo, history, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const regExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
    if (password !== confirmPassword) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error("Passwords do not match", Toastobjects);
      }
    }
    else if (password === "") {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error("Password cannot be empty", Toastobjects);
      }
    }
    else if (!regExp.test(password)) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error("Password must be 8 characters long with at least one lowercase, one uppercase, and one digit.", Toastobjects);
      }
    }
    else {
      console.log("hi");
      try {
      const registerPromise = dispatch(register(name, email, password));
      console.log(`dispatch(register()) : ${registerPromise}`);
      history(`/pending`);
      // registerPromise.then((result) => {
      //   console.log("Registration result:", result);
      //   history.push(`/pending`)
      //   // if(result) {
      //   // if (result.success) {
      //   //   if (!toast.isActive(toastId.current)) {
      //   //     toastId.current = toast.success(`Verification email sent to ${email}`, Toastobjects);
      //   //   }
      //   // }
      //   // else {
      //   //   // Registration failed, handle accordingly
      //   //   console.error('Registration failed:', result.error);
      //   //   // You might want to show an error message to the user
      //   // }
      //   // }
      // })
      }
      catch (error) {
        console.log(error);
      }
      // if (!toast.isActive(toastId.current)) {
      //   toastId.current = toast.success(`Verification email sent to ${email}`, Toastobjects);
      // }
      // history.push('/');
    }
    
  };

  return (
    <>
      <Toast />
      <Header />
      <div className="container d-flex flex-column justify-content-center align-items-center login-center">
        {error && <Message variant="alert-danger">{error}</Message>}
        {loading && <Loading />}

        <form
          className="Login col-md-8 col-lg-4 col-11"
          onSubmit={submitHandler}
        >
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit">Register</button>
          <p>
            <Link to="/login">
              I Have Account <strong>Login</strong>
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;
