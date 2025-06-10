// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyAfASez0BnqEkEMxTLqJuE_bsmagV_IH_Y",
//   authDomain: "helpdesk-smit.firebaseapp.com",
//   projectId: "helpdesk-smit",
//   storageBucket: "helpdesk-smit.firebasestorage.app",
//   messagingSenderId: "516701942489",
//   appId: "1:516701942489:web:b0f487463f5aac641b84c8",
//   measurementId: "G-77BTEXTW14"
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const db = getFirestore(app);






import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDIu7CFFeDXV3CvNHVm9AN_WNTZjLhoh-o",
  authDomain: "olx-clone-by-hassan-duroodwala.firebaseapp.com",
  projectId: "olx-clone-by-hassan-duroodwala",
  storageBucket: "olx-clone-by-hassan-duroodwala.firebasestorage.app",
  messagingSenderId: "739672176986",
  appId: "1:739672176986:web:5dceaa97c16049739f9b63",
  measurementId: "G-54DD6G7LBV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db };
