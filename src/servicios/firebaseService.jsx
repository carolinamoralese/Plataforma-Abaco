import { db } from "../firebase"; // Importa db (Firebase Firestore)

// Función para obtener la información del usuario por correo electrónico
export const getUserInfoByEmail = async (userEmail) => {
  try {
    const userRef = db.collection("usuarios");
    const snapshot = await userRef.where("mail", "==", userEmail).get();

    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      return userData;
    } else {
      return null; // El usuario no se encontró en la base de datos
    }
  } catch (error) {
    throw error;
  }
};
