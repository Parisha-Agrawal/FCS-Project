// // api.js
// export async function getToken() {
//     try {
//         const response = await fetch('http://127.0.0.1:8011/api/token/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 username: 'p1',
//                 password: 'p1',
//             }),
//         });
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Error fetching token:', error);
//         return null;
//     }
// }