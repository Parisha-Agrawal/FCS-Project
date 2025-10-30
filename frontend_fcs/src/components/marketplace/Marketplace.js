// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   TextField, IconButton
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import AddProductForm from "./AddProductForm";


// const Marketplace = () => {
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const [showForm, setShowForm] = useState(false);


// useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/artifacts/`);
//         const data = response.data;
//         setProducts(data);
//       } catch (error) {
//         console.error("Error fetching artifacts:", error);
//       }
//     };
  
//     fetchProducts();
//   }, []);

//   const handleBuy = (productId) => {
//     navigate(`/marketplace/payment/${productId}`);
//   };

//   const filteredProducts = products.filter((product) =>
//     `${product.name} ${product.description}`
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );
  

//   return (
//     <>
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Artifact Marketplace
//       </Typography>

//       <TextField
//         label="Search artifacts"
//         variant="outlined"
//         fullWidth
//         margin="normal"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//        <AddProductForm />

//       <Grid container spacing={2}>
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <Grid item xs={12} sm={6} md={4} key={product.id}>
//               <Card>
//                 <CardContent>
//                   <Typography variant="h6">{product.name}</Typography>
//                   <Typography variant="body2">{product.description}</Typography>
//                   <Typography variant="subtitle1">Price: ₹{product.price}</Typography>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={() => handleBuy(product.id)}
//                     sx={{ mt: 1 }}
//                   >
//                     Buy
//                   </Button>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))
//         ) : (
//           <Typography variant="body1" sx={{ m: 2 }}>
//             No artifacts found.
//           </Typography>
//         )}
//       </Grid>
//     </Container>
//     </>
//   );
// };

// export default Marketplace;
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddProductForm from "./AddProductForm";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [allUserProducts, setAllUserProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchArtifacts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/artifacts/`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching artifacts:", error);
    }
  };

  const fetchAllUserProducts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/public-products/`);
      setAllUserProducts(response.data);
    } catch (error) {
      console.error("Error fetching all user products:", error);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/marketplace/my-products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProducts(response.data);
    } catch (error) {
      console.error("Error fetching my products:", error);
    }
  };

  useEffect(() => {
    fetchArtifacts();
    fetchAllUserProducts();
    fetchMyProducts();
  }, []);

  const handleBuy = (productId) => {
    navigate(`/marketplace/payment/${productId}`);
  };

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.description}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Artifact Marketplace</Typography>

      <TextField
        label="Search artifacts"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <AddProductForm onProductAdded={fetchMyProducts} />

      {/* <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Your Listed Products
      </Typography>
      <Grid container spacing={3}>
        {myProducts.length > 0 ? (
          myProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={`my-${product.id}`}>
              <Card sx={{ maxWidth: 345 }}>
                {product.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h6">{product.name}</Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Price: ₹{product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" sx={{ ml: 1 }}>
            You haven’t listed any products yet.
          </Typography>
        )}
      </Grid> */}

      {/* Section 2: Marketplace Artifacts */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Marketplace Artifacts
      </Typography>
      <Grid container spacing={3}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={`market-${product.id}`}>
              <Card sx={{ maxWidth: 345 }}>
                {product.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h6">{product.name}</Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Price: ₹{product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1 }}
                    onClick={() => handleBuy(product.id)}
                  >
                    Buy
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ m: 2 }}>
            No artifacts found.
          </Typography>
        )}
      </Grid>

      {/* Section 3: All User Products */}
      {/* <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Marketplace - All Listed Products
      </Typography>
      <Grid container spacing={3}>
        {allUserProducts.length > 0 ? (
          allUserProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={`user-${product.id}`}>
              <Card sx={{ maxWidth: 345 }}>
                {product.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h6">{product.name}</Typography>
                  <Typography variant="body2">{product.description}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Price: ₹{product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 1 }}
                    onClick={() => handleBuy(product.id)}
                  >
                    Buy
                  </Button>
                </CardContent>
              </Card>
            </Grid> 
           ))
        ) : (
          <Typography variant="body1" sx={{ m: 2 }}>
            No user products found.
          </Typography>
        )}
      </Grid> */}
    </Container>
  );
};

export default Marketplace;
