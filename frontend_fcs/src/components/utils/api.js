export const api = async (url, method = "GET", data = null, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
  
    // If token is not passed, fetch from localStorage
    if (!token) {
      token = localStorage.getItem("access");
    }
  
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  
    const options = {
      method,
      headers,
    };
  
    if (data) {
      options.body = JSON.stringify(data);
    }
  
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, options);
    return response;
  };
  