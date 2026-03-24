import React, { useState } from 'react';
import ClothingStore from "./components/ClothingStore";
import AdminPanel from "./components/AdminPanel";


   function App() {
     const [isAdmin, setIsAdmin] = useState(false);

     return (
       <div>
         {/* Add a toggle or routing here */}
         {isAdmin ? <AdminPanel /> : <ClothingStore />}
       </div>
     );
   }

   export default App;