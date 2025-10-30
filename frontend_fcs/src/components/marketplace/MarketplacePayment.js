import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import axios from "axios";

const MarketplacePayment = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/artifacts/${productId}/`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      }
    };

    fetchProduct();
  }, [productId]);


  const handlePayment = async () => {
    try {
      const res = await api("/auth/pay/", "POST", {
        receiver_username: "admin123",
        amount: product?.price,
      });

      if (res.ok) {
        const otpRes = await api("/auth/send_otp/", "POST", {});
        if (otpRes.ok) {
          alert("OTP sent! Please enter it to confirm payment.");
          setOtpSent(true);
        } else {
          alert("Payment done, but OTP failed to send.");
        }
      } else {
        alert("Payment initiation failed.");
      }
    } catch (err) {
      console.error("Payment error", err);
      alert("Something went wrong while processing payment.");
    }
  };

  const handleValidateOtp = async () => {
    try {
      const res = await api("/auth/validate_otp/", "POST", { otp });
      if (res.ok) {
        alert("OTP Verified! Transaction successful.");
        navigate("/marketplace");
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error("OTP validation failed", err);
      alert("OTP validation failed. Try again.");
    }
  };

  const handleKeyPress = (value) => {
    if (value === "←") {
      setOtp((prev) => prev.slice(0, -1));
    } else if (value === "C") {
      setOtp("");
    } else {
      if (otp.length < 6) {
        setOtp((prev) => prev + value);
      }
    }
  };

  const keypadButtons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "C"];

  if (!product) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Product details not found. Please go back and try again.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Pay ₹{product.price} for {product.name}
      </Typography>

      {!otpSent && (
        <Button variant="contained" color="primary" onClick={handlePayment}>
          Pay ₹{product.price} Now
        </Button>
      )}

      {otpSent && (
        <>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Enter OTP:
          </Typography>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              my: 1,
              textAlign: "center",
              fontSize: "1.5rem",
              letterSpacing: "0.3rem",
              userSelect: "none",
            }}
          >
            {otp.padEnd(6, "•")}
          </Paper>

          <Grid container spacing={1} justifyContent="center">
            {keypadButtons.map((key) => (
              <Grid item xs={4} key={key}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ py: 2 }}
                  onClick={() => handleKeyPress(key)}
                >
                  {key}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={handleValidateOtp}
            disabled={otp.length !== 6}
          >
            Validate OTP
          </Button>
        </>
      )}
    </Container>
  );
};

export default MarketplacePayment;
