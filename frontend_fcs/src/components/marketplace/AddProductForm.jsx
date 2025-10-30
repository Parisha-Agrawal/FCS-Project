import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from 'axios';

const AddProductForm = (onProductAdded ) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
        const token = localStorage.getItem("access");
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/marketplace/products/`, data, {
          headers: {
            "Authorization": `Bearer ${token}`, 
          },
        });
       
        
      alert("Product listed successfully!");
      setOpen(false);
      onProductAdded();
      // window.location.reload(); // Optional: reload the page
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to list the product.");
    }
  };

  return (
    <>
      <div style={{ textAlign: "right", marginBottom: "1rem" }}>
        <IconButton color="primary" onClick={() => setOpen(true)}>
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>List a New Product</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Title"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            margin="normal"
            onChange={handleChange}
          />
          <TextField
            name="price"
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">List</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddProductForm;
