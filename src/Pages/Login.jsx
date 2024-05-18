import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { auth } from "../firebase";
import LoginPhoto from "../assets/BREAKPONIT.png";
import AbacoLogo from "../assets/Abaco_logo.png";
import GFBLogo from "../assets/GFBLogo.png";
import LogosAsociados from "../assets/LogosAsociados.png";

export function Login() {
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
    } catch (error) {
      //console.info('Error de inicio de sesión con Google:', error);
    }
  };

  return (
    <main className="text-[1.25rem] flex flex-col">
      <div className="mx-auto max-w-screen-xl">
        <section id="seccionImagen" className="mb-[100px] ml-14 mr-14">
          <img src={LoginPhoto} alt="LoginPhoto" className="w-screen" />
          <div className="flex place-content-around flex items-center">
            <img src={GFBLogo} alt="LoginPhoto" className="w-[20%] h-[auto]" />
            <p className="text-gris-oscuro font-bold">Plataforma ABACO</p>
            <img
              src={AbacoLogo}
              alt="abacoLogo"
              className="w-[20%] h-[20%]"
            ></img>
          </div>
        </section>
        <section id="seccionContenido" className="flex items-center flex-col">
          <p className="text-gris-oscuro font-bold text-left">Autenticación</p>
          <div id="linea" className="w-[90%] h-[2px] mb-[20px] bg-negro"></div>

          <button
            className="bg-verde-claro h-[100px] w-[300px] rounded-lg"
            onClick={signInWithGoogle}
          >
            Login
          </button>
          <img src={LogosAsociados} alt="logos Asociados"></img>
        </section>
      </div>
    </main>
  );
}
